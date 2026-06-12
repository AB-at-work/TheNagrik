/**
 * Request authentication + authorization for route handlers.
 * Ports server/src/middleware/{authenticate,authorize}.ts.
 *
 *  - `requireUser(req)` verifies the `Authorization: Bearer <token>` access
 *    token and returns the principal, throwing AppError.unauthorized otherwise.
 *  - `assertRole` / `assertMinRole` enforce RBAC (BackendSchema §8.4).
 */
import type { NextRequest } from 'next/server';
import { ROLE_RANK, type UserRole } from '@thenagrik/shared';

import { verifyAccessToken } from '@/server/utils/jwt';
import { AppError } from '@/server/utils/errors';

export interface RequestUser {
  id: string;
  email: string;
  role: UserRole;
}

/** Verifies the Bearer access token and returns the authenticated principal. */
export function requireUser(req: NextRequest): RequestUser {
  const header = req.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) {
    throw AppError.unauthorized('Missing or malformed Authorization header');
  }
  const token = header.slice('Bearer '.length).trim();
  try {
    const payload = verifyAccessToken(token);
    return { id: payload.sub, email: payload.email, role: payload.role };
  } catch {
    throw AppError.unauthorized('Invalid or expired access token');
  }
}

/** Throws 403 unless the user's role is 'super_admin'. */
export function assertRole(user: RequestUser, ...allowedRoles: UserRole[]): void {
  if (user.role !== 'super_admin') {
    throw AppError.forbidden('You do not have permission to perform this action');
  }
}

/** Throws 403 unless the user's role is 'super_admin'. */
export function assertMinRole(user: RequestUser, minRole: UserRole): void {
  if (user.role !== 'super_admin') {
    throw AppError.forbidden('You do not have permission to perform this action');
  }
}
