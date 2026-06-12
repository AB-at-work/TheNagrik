import { withApi } from '@/lib/server/withApi';
import { ok } from '@/lib/server/respond';
import { parse } from '@/lib/server/validate';
import { clientIp, userAgent } from '@/lib/server/request';
import { setRefreshCookie } from '@/lib/server/cookies';
import * as authService from '@/server/modules/auth/auth.service';
import { loginSchema } from '@/server/modules/auth/auth.validation';
import { logAction } from '@/server/services/auditLog';

export const runtime = 'nodejs';

// POST /api/v1/auth/login  (public) — rate limited, envelope
export const POST = withApi(async ({ req }) => {
  const body = parse(loginSchema, await req.json());
  const result = await authService.login(body.email, body.password);

  const res = ok({ accessToken: result.accessToken, user: result.user });
  setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);

  await logAction({
    userId: result.user.id,
    userEmail: result.user.email,
    action: 'login',
    entityType: 'user',
    entityId: result.user.id,
    ipAddress: clientIp(req),
    userAgent: userAgent(req),
  });

  return res;
});
