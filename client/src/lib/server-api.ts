/**
 * Server-side data fetching for public pages (React Server Components).
 * Uses ISR (default 60s revalidation, BackendSchema §17.1). Returns the parsed
 * envelope; on failure returns a typed fallback so pages can render gracefully.
 */
import type { ApiResponse, PaginationMeta } from '@thenagrik/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
const DEFAULT_REVALIDATE = 60;

export interface FetchResult<T> {
  data: T | null;
  meta: PaginationMeta | null;
  ok: boolean;
}

export async function fetchPublic<T>(
  path: string,
  opts: { revalidate?: number; tags?: string[] } = {},
): Promise<FetchResult<T>> {
  try {
    const cleanPath = path.startsWith('/v1/') ? path.substring(3) : path;
    const res = await fetch(`${API_URL}${cleanPath}`, {
      next: { revalidate: opts.revalidate ?? DEFAULT_REVALIDATE, tags: opts.tags ?? [] },
    });
    const json = await res.json();
    if (json && typeof json === 'object' && 'success' in json) {
      const envelope = json as ApiResponse<T>;
      if (!envelope.success) return { data: null, meta: null, ok: false };
      return { data: envelope.data, meta: envelope.meta ?? null, ok: true };
    }
    return { data: json as T, meta: null, ok: true };
  } catch (err) {
    console.error('Server-side fetch error on path:', path, err);
    return { data: null, meta: null, ok: false };
  }
}
