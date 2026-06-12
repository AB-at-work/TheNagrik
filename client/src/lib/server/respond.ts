/**
 * Response builders for API route handlers.
 *
 * The codebase intentionally uses two response shapes (preserved from the
 * Express backend so the client keeps working unchanged):
 *  - `ok` / `message` → the `{ success, data | message, meta? }` envelope
 *    (used by auth, categories, …).
 *  - `raw` / `noContent` → bare JSON / 204 (used by blog, projects, schools,
 *    team, faq, forms, settings, search, dashboard, audit, media).
 */
import { NextResponse } from 'next/server';
import type { PaginationMeta } from '@thenagrik/shared';

/** `{ success: true, data, meta? }` envelope (mirrors utils/http.ts sendSuccess). */
export function ok<T>(
  data: T,
  opts: { status?: number; meta?: PaginationMeta; message?: string; headers?: Record<string, string> } = {},
): NextResponse {
  const body: Record<string, unknown> = { success: true, data };
  if (opts.meta) body.meta = opts.meta;
  if (opts.message) body.message = opts.message;
  return NextResponse.json(body, { status: opts.status ?? 200, headers: opts.headers });
}

/** `{ success: true, message }` envelope (mirrors utils/http.ts sendMessage). */
export function message(msg: string, status = 200, headers?: Record<string, string>): NextResponse {
  return NextResponse.json({ success: true, message: msg }, { status, headers });
}

/** Bare JSON body, exactly as the raw-shape Express controllers returned. */
export function raw<T>(data: T, status = 200, headers?: Record<string, string>): NextResponse {
  return NextResponse.json(data, { status, headers });
}

/** 204 No Content. */
export function noContent(headers?: Record<string, string>): NextResponse {
  return new NextResponse(null, { status: 204, headers });
}
