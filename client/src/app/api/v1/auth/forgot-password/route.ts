import { withApi } from '@/lib/server/withApi';
import { message } from '@/lib/server/respond';
import { parse } from '@/lib/server/validate';
import { env } from '@/server/config/env';
import * as authService from '@/server/modules/auth/auth.service';
import { forgotPasswordSchema } from '@/server/modules/auth/auth.validation';
import { sendPasswordResetEmail } from '@/server/services/email';

export const runtime = 'nodejs';

// POST /api/v1/auth/forgot-password  (public) — rate limited, envelope message
export const POST = withApi(async ({ req }) => {
  const body = parse(forgotPasswordSchema, await req.json());
  const result = await authService.requestPasswordReset(body.email);

  if (result) {
    const resetUrl = `${env.NEXT_PUBLIC_SITE_URL}/admin/reset-password?token=${result.rawToken}`;
    await sendPasswordResetEmail(result.userEmail, resetUrl);
  }

  return message('If an account exists for that email, a reset link has been sent.');
});
