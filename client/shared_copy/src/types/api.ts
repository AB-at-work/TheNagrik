/**
 * API envelope types — the contract between client and server.
 *
 * Source of truth: APIContract_TheNagrik.md and TRD §7.3.
 * Every successful response is `{ success: true, data, meta? }`.
 * Every error response is `{ success: false, error: { code, message, details? } }`.
 */

import type { ApiErrorCode } from './enums.js';

export interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
  message?: string;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiError {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: ApiFieldError[];
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/** Standard list query parameters accepted by paginated endpoints. */
export interface ListQuery {
  page?: number;
  per_page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// ── Auth payloads (APIContract §1) ────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: import('./enums.js').UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseData {
  accessToken: string;
  user: AuthUser;
}

export interface RefreshResponseData {
  accessToken: string;
}
