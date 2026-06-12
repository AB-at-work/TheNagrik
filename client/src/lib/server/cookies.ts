/**
 * Refresh-token cookie helpers (BackendSchema §8.2). The cookie is HTTP-only and
 * scoped to the auth route path so it is only sent to /api/v1/auth/* — exactly
 * as the Express controller set it. Now that the API is same-origin, the
 * `sameSite: 'strict'` attribute is fully effective.
 */
import type { NextResponse } from 'next/server';

import { isProd } from '@/server/config/env';
import { REFRESH_COOKIE_NAME } from '@/server/config/constants';

const COOKIE_PATH = '/';

/** Sets the refresh-token cookie on a response. */
export function setRefreshCookie(res: NextResponse, token: string, expires: Date): void {
  res.cookies.set(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: COOKIE_PATH,
    expires,
  });
}

/** Clears the refresh-token cookie (must repeat path or the browser won't clear it). */
export function clearRefreshCookie(res: NextResponse): void {
  res.cookies.set(REFRESH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: COOKIE_PATH,
    maxAge: 0,
  });
}

export { REFRESH_COOKIE_NAME };
