/**
 * Handler factory for API route handlers. Centralises the cross-cutting concerns
 * the Express middleware chain used to provide:
 *  - try/catch that maps any thrown error to the standard envelope (errorHandler)
 *  - optional Bearer-JWT authentication (authenticate)
 *  - optional RBAC role check (authorize)
 *
 * Each route exports thin method handlers that call `withApi`:
 *
 *   export const GET = withApi(async ({ req }) => raw(await service.list()));
 *   export const POST = withApi(
 *     async ({ req, user }) => raw(await service.create(...), 201),
 *     { auth: true, roles: ['admin', 'super_admin'] },
 *   );
 */
import { NextResponse, type NextRequest } from 'next/server';
import type { UserRole } from '@thenagrik/shared';

import { requireUser, assertRole, type RequestUser } from './auth';
import { toErrorResponse } from './errors';

/** Next 15 passes a context whose `params` is a Promise. */
export interface RouteContext<P = Record<string, string>> {
  params: Promise<P>;
}

export interface HandlerArgs<P> {
  req: NextRequest;
  /** Resolved route params (awaited for you). */
  params: P;
  /** Present only when `auth: true`. */
  user: RequestUser;
}

interface WithApiOptions {
  /** Require a valid Bearer access token. */
  auth?: boolean;
  /** Allowed roles (implies auth). Empty/undefined → any authenticated user. */
  roles?: UserRole[];
}

// Simple in-memory rate limiter for serverless warm instances
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 100; // max requests per window
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return true;
  }

  record.count += 1;
  return false;
}

export function withApi<P = Record<string, string>>(
  handler: (args: HandlerArgs<P>) => Promise<NextResponse> | NextResponse,
  options: WithApiOptions = {},
): (req: NextRequest, ctx: RouteContext<P>) => Promise<NextResponse> {
  const needsAuth = options.auth || (options.roles?.length ?? 0) > 0;

  return async (req, ctx) => {
    try {
      // 1. Rate Limiting Check
      // Fallback to 'unknown' if IP is missing (e.g. local dev)
      const ip = req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown';
      if (ip !== 'unknown' && isRateLimited(ip)) {
        return new NextResponse(
          JSON.stringify({ error: 'Too Many Requests', message: 'Rate limit exceeded' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const params = (ctx?.params ? await ctx.params : ({} as P)) as P;

      // `user` is only meaningfully populated when auth is required; when it is
      // not, handlers must not read it (typed as RequestUser to keep call sites
      // simple, mirroring how the old controllers assumed req.user when guarded).
      let user = undefined as unknown as RequestUser;
      if (needsAuth) {
        user = requireUser(req);
        if (options.roles && options.roles.length > 0) {
          assertRole(user, ...options.roles);
        }
      }

      return await handler({ req, params, user });
    } catch (err) {
      // Send async webhook for crash alerts
      if (process.env.PROCESS_ALERT_WEBHOOK_URL) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        const stack = err instanceof Error ? err.stack : undefined;
        
        // Non-blocking fetch
        fetch(process.env.PROCESS_ALERT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `🚨 **API Crash Alert**\n**Route:** \`${req.nextUrl?.pathname}\`\n**Error:** ${errorMsg}\n**Time:** ${new Date().toISOString()}\n\`\`\`\n${stack?.substring(0, 1000) ?? 'No stack trace'}\n\`\`\``
          })
        }).catch(() => { /* fail silently if webhook fails */ });
      }

      return toErrorResponse(err, req.nextUrl?.pathname ?? '');
    }
  };
}
