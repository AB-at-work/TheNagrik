import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';

import { env } from '../config/env';
import type { UserRole } from '@thenagrik/shared';

/** Access-token payload (BackendSchema §8.2: { sub, role, iat, exp }). */
export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const opts = {
    expiresIn: env.JWT_ACCESS_EXPIRY,
    algorithm: 'HS256',
  } as SignOptions;
  return jwt.sign(payload, env.JWT_SECRET, opts);
}

/** Verifies an access token, returning its payload or throwing on failure. */
export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
  if (typeof decoded === 'string') {
    throw new Error('Malformed token payload');
  }
  return decoded as AccessTokenPayload;
}
