import { withApi } from '@/lib/server/withApi';
import { ok } from '@/lib/server/respond';
import { setRefreshCookie, REFRESH_COOKIE_NAME } from '@/lib/server/cookies';
import * as authService from '@/server/modules/auth/auth.service';
import { AppError } from '@/server/utils/errors';

export const runtime = 'nodejs';

// POST /api/v1/auth/refresh  (public) — envelope
export const POST = withApi(async ({ req }) => {
  const rawToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
  if (!rawToken) {
    throw AppError.unauthorized('No refresh token provided');
  }

  const result = await authService.refresh(rawToken);
  const res = ok({ accessToken: result.accessToken });
  setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);

  return res;
});
