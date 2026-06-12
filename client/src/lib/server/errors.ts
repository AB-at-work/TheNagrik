/**
 * Maps any thrown error into the standard error envelope, porting the Express
 * global error handler (server/src/middleware/errorHandler.ts) one-to-one:
 *  - AppError            → its statusCode + code (+ details)
 *  - ZodError            → 422 VALIDATION_ERROR with field details
 *  - PG unique violation → 409 CONFLICT
 *  - anything else       → 500 INTERNAL_ERROR (message hidden in prod)
 */
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { AppError } from '@/server/utils/errors';
import { logger } from '@/server/config/logger';
import { isProd } from '@/server/config/env';

function isPgUniqueViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && (err as { code: unknown }).code === '23505';
}

function triggerErrorWebhook(err: unknown, path: string) {
  if (!isProd || !process.env.PROCESS_ALERT_WEBHOOK_URL) return;
  
  // Non-blocking fire and forget webhook payload
  fetch(process.env.PROCESS_ALERT_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `🚨 **Unhandled API Crash**\nPath: \`${path}\`\nError: \`${String((err as Error)?.message ?? err)}\``
    }),
  }).catch((e) => logger.error({ e }, 'Failed to send error webhook'));
}

export function toErrorResponse(err: unknown, path = ''): NextResponse {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) logger.error({ err, path }, err.message);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: err.code,
          message: err.message,
          ...(err.details ? { details: err.details } : {}),
        },
      },
      { status: err.statusCode },
    );
  }

  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
        },
      },
      { status: 422 },
    );
  }

  if (isPgUniqueViolation(err)) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'CONFLICT', message: 'A record with these details already exists' },
      },
      { status: 409 },
    );
  }

  logger.error({ err, path }, 'Unhandled error');
  triggerErrorWebhook(err, path);
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: isProd ? 'Internal server error' : String((err as Error)?.message ?? err),
      },
    },
    { status: 500 },
  );
}
