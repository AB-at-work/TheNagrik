import { withApi } from '@/lib/server/withApi';
import { message } from '@/lib/server/respond';
import { clientIp, userAgent } from '@/lib/server/request';
import { clearRefreshCookie, REFRESH_COOKIE_NAME } from '@/lib/server/cookies';
import * as authService from '@/server/modules/auth/auth.service';
import { logAction } from '@/server/services/auditLog';

export const runtime = 'nodejs';

// POST /api/v1/auth/logout  (authenticated) — envelope message
export const POST = withApi(
  async ({ req, user }) => {
    const rawToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
    await authService.logout(rawToken);

    const res = message('Logged out successfully');
    clearRefreshCookie(res);

    if (user) {
      await logAction({
        userId: user.id,
        userEmail: user.email,
        action: 'logout',
        entityType: 'user',
        entityId: user.id,
        ipAddress: clientIp(req),
        userAgent: userAgent(req),
      });
    }

    return res;
  },
  { auth: true },
);
