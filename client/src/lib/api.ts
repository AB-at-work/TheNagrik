/**
 * Typed API client for the Express backend.
 *
 * - Public reads use plain fetch (server components call these directly).
 * - Authenticated admin calls attach the in-memory access token and transparently
 *   refresh it once on a 401 (refresh token lives in an HTTP-only cookie).
 *
 * The access token is held in module memory (never localStorage) per
 * BackendSchema §8.2.
 */
import type { ApiResponse, ApiError } from '@thenagrik/shared';

const isServer = typeof window === 'undefined';
const API_URL = isServer
  ? (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1')
  : '/api/v1';

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}
export function getAccessToken(): string | null {
  return accessToken;
}

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ApiError['error']['details'];
  constructor(status: number, error: ApiError['error']) {
    super(error.message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = error.code;
    this.details = error.details;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  /** Attach Authorization header + enable refresh-on-401. */
  auth?: boolean;
  /** Next.js fetch cache/revalidate options for server components. */
  next?: { revalidate?: number; tags?: string[] };
  signal?: AbortSignal;
  /** Pass multipart FormData directly (skips JSON encoding). */
  formData?: FormData;
}

async function rawRequest<T>(path: string, opts: RequestOptions): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {};
  let body: BodyInit | undefined;

  if (opts.formData) {
    body = opts.formData;
  } else if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.body);
  }

  if (opts.auth !== false && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const cleanPath = path.startsWith('/api/v1')
    ? path.substring(7)
    : path.startsWith('/v1')
      ? path.substring(3)
      : path;
  const res = await fetch(`${API_URL}${cleanPath}`, {
    method: opts.method ?? 'GET',
    headers,
    ...(body !== undefined ? { body } : {}),
    credentials: 'include',
    ...(opts.next ? { next: opts.next } : {}),
    ...(opts.signal ? { signal: opts.signal } : {}),
  });

  // 204 No Content
  if (res.status === 204) return { success: true, data: undefined as T };

  const json = await res.json();
  if (json && typeof json === 'object' && 'success' in json) {
    return json as ApiResponse<T>;
  }
  return { success: true, data: json as T };
}

let refreshPromise: Promise<boolean> | null = null;

export async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) return false;
      const json = (await res.json()) as ApiResponse<{ accessToken: string }>;
      if (json.success) {
        accessToken = json.data.accessToken;
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  let response = await rawRequest<T>(path, opts);

  // Transparent single refresh attempt for authenticated requests.
  if (!response.success && opts.auth !== false && response.error.code === 'UNAUTHORIZED') {
    const refreshed = await tryRefresh();
    if (refreshed) {
      response = await rawRequest<T>(path, opts);
    }
  }

  if (!response.success) {
    // 401/403 status isn't carried in the body; infer a reasonable status.
    const status = statusFromCode(response.error.code);
    throw new ApiRequestError(status, response.error);
  }
  return response.data;
}

function statusFromCode(code: string): number {
  switch (code) {
    case 'VALIDATION_ERROR':
      return 422;
    case 'UNAUTHORIZED':
      return 401;
    case 'FORBIDDEN':
      return 403;
    case 'NOT_FOUND':
      return 404;
    case 'CONFLICT':
      return 409;
    case 'RATE_LIMITED':
      return 429;
    default:
      return 500;
  }
}

export const api = {
  get: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...opts, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...opts, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...opts, method: 'PATCH', body }),
  delete: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...opts, method: 'DELETE' }),
  /** Raw access to the full envelope including pagination meta. */
  raw: rawRequest,
};
