/**
 * Email via Resend (BackendSchema §13). Fire-and-forget: a failed send never
 * fails the originating request. When Resend is not configured (local dev),
 * emails are logged instead of sent.
 */
import { Resend } from 'resend';

import { env, isEmailConfigured } from '../config/env';
import { logger } from '../config/logger';

const resend = isEmailConfigured ? new Resend(env.RESEND_API_KEY) : null;

interface SendArgs {
  to: string | string[];
  subject: string;
  html: string;
}

async function send({ to, subject, html }: SendArgs): Promise<void> {
  if (!resend) {
    logger.info({ to, subject }, '[email:dev] (Resend not configured — logging instead of sending)');
    return;
  }
  try {
    await resend.emails.send({ from: env.EMAIL_FROM, to: Array.isArray(to) ? to : [to], subject, html });
  } catch (err) {
    logger.error({ err, subject }, 'Email send failed');
  }
}

const wrap = (title: string, body: string): string => `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'DM Sans',sans-serif;max-width:560px;margin:0 auto;color:#1A2332;">
    <h2 style="font-family:Georgia,serif;color:#1A2332;">${title}</h2>
    ${body}
    <hr style="border:none;border-top:1px solid #D4D0C8;margin:24px 0;" />
    <p style="font-size:12px;color:#4A5568;">The Nagrik — Student-Led Civic Literacy Initiative</p>
  </div>`;

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  await send({
    to,
    subject: 'Reset your Nagrik admin password',
    html: wrap(
      'Password reset requested',
      `<p>We received a request to reset your password. This link is valid for 1 hour.</p>
       <p><a href="${resetUrl}" style="display:inline-block;background:#C45C3C;color:#F5F5F0;padding:12px 20px;border-radius:4px;text-decoration:none;">Reset password</a></p>
       <p style="font-size:14px;color:#4A5568;">If you didn't request this, you can safely ignore this email.</p>`,
    ),
  });
}

export async function sendContactNotification(args: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  await send({
    to: env.ADMIN_EMAIL,
    subject: `New contact: ${args.subject} — ${args.name}`,
    html: wrap(
      'New contact submission',
      `<p><strong>From:</strong> ${args.name} (${args.email})</p>
       <p><strong>Subject:</strong> ${args.subject}</p>
       <p><strong>Message:</strong></p><p>${escapeHtml(args.message)}</p>`,
    ),
  });
}

export async function sendVolunteerNotification(args: {
  name: string;
  email: string;
  city: string;
  occupation: string;
}): Promise<void> {
  await send({
    to: env.ADMIN_EMAIL,
    subject: `New volunteer: ${args.name}`,
    html: wrap(
      'New volunteer registration',
      `<p><strong>Name:</strong> ${args.name}</p>
       <p><strong>Email:</strong> ${args.email}</p>
       <p><strong>City:</strong> ${args.city}</p>
       <p><strong>Occupation:</strong> ${args.occupation}</p>`,
    ),
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');
}
