import { withApi } from '@/lib/server/withApi';
import { message } from '@/lib/server/respond';
import { parse } from '@/lib/server/validate';
import * as authService from '@/server/modules/auth/auth.service';
import { resetPasswordSchema } from '@/server/modules/auth/auth.validation';

export const runtime = 'nodejs';

// POST /api/v1/auth/reset-password  (public) — rate limited, envelope message
export const POST = withApi(async ({ req }) => {
  const body = parse(resetPasswordSchema, await req.json());
  await authService.resetPassword(body.token, body.password);
  return message('Password reset successfully. You can now sign in.');
});
