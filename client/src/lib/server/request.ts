/**
 * Request metadata helpers for route handlers (replaces server/src/utils/request.ts,
 * which read Express's `req.ip`). Behind Vercel/Cloudflare the client IP arrives
 * in `x-forwarded-for` (first hop) or `x-real-ip`.
 */
import type { NextRequest } from 'next/server';

export function clientIp(req: NextRequest): string | null {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]?.trim() ?? null;
  return req.headers.get('x-real-ip');
}

export function userAgent(req: NextRequest): string | null {
  return req.headers.get('user-agent');
}
