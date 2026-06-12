import { withApi } from '@/lib/server/withApi';
import { message } from '@/lib/server/respond';
import { parse } from '@/lib/server/validate';
import { clientIp, userAgent } from '@/lib/server/request';
import * as authService from '@/server/modules/auth/auth.service';
import { changePasswordSchema } from '@/server/modules/auth/auth.validation';
import { logAction } from '@/server/services/auditLog';

export const runtime = 'nodejs';

// POST /api/v1/auth/change-password  (authenticated)
export const POST = withApi(async ({ req, user }) => {
  const body = parse(changePasswordSchema, await req.json());
  
  await authService.changePassword(user.id, body.currentPassword, body.newPassword);

  await logAction({
    userId: user.id,
    userEmail: user.email,
    action: 'update',
    entityType: 'user',
    entityId: user.id,
    ipAddress: clientIp(req),
    userAgent: userAgent(req),
  });

  return message('Password updated successfully.');
}, { auth: true });
