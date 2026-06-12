/**
 * Auth service (BackendSchema §8). Owns password hashing, JWT issuance,
 * refresh-token rotation, account-lockout logic, and password resets.
 */
import bcrypt from 'bcryptjs';
import { and, eq, isNull } from 'drizzle-orm';

import { db } from '../../../db/index';
import { users, refreshTokens, passwordResets } from '../../../db/schema';
import { env } from '../../config/env';
import {
  ACCOUNT_LOCK_MINUTES,
  MAX_FAILED_LOGIN_ATTEMPTS,
  PASSWORD_RESET_TTL_MINUTES,
  REFRESH_TOKEN_TTL_DAYS,
} from '../../config/constants';
import { AppError } from '../../utils/errors';
import { signAccessToken } from '../../utils/jwt';
import { generateOpaqueToken, sha256 } from '../../utils/crypto';
import type { User } from '../../../db/schema';
import type { AuthUser, UserRole } from '@thenagrik/shared';

function toAuthUser(user: User): AuthUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role as UserRole };
}

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
function minutesFromNow(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
  user: AuthUser;
}

/**
 * Authenticates a user and issues tokens. Enforces the lockout state machine
 * from BackendSchema §8.3.
 */
export async function login(email: string, password: string): Promise<LoginResult> {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  // Avoid leaking which part was wrong, but still run a hash to equalize timing.
  if (!user) {
    await bcrypt.compare(password, '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva');
    throw AppError.unauthorized('Incorrect email or password');
  }

  if (user.status !== 'active') {
    throw AppError.forbidden('This account is inactive');
  }

  // Active lock?
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    throw AppError.locked(`Account locked. Try again in ${mins} minute(s).`);
  }

  // Expired lock → clear and proceed.
  if (user.lockedUntil && user.lockedUntil <= new Date()) {
    await db
      .update(users)
      .set({ lockedUntil: null, failedLoginAttempts: 0 })
      .where(eq(users.id, user.id));
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const attempts = user.failedLoginAttempts + 1;
    const shouldLock = attempts >= MAX_FAILED_LOGIN_ATTEMPTS;
    await db
      .update(users)
      .set({
        failedLoginAttempts: attempts,
        lockedUntil: shouldLock ? minutesFromNow(ACCOUNT_LOCK_MINUTES) : null,
      })
      .where(eq(users.id, user.id));
    if (shouldLock) {
      throw AppError.locked(
        `Too many failed attempts. Account locked for ${ACCOUNT_LOCK_MINUTES} minutes.`,
      );
    }
    throw AppError.unauthorized('Incorrect email or password');
  }

  // Success: reset counters, stamp last login.
  await db
    .update(users)
    .set({ failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() })
    .where(eq(users.id, user.id));

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role as UserRole,
  });
  const { token: refreshToken, expiresAt } = await issueRefreshToken(user.id);

  return { accessToken, refreshToken, refreshExpiresAt: expiresAt, user: toAuthUser(user) };
}

/** Creates and persists a new refresh token (stores only its SHA-256 hash). */
async function issueRefreshToken(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = generateOpaqueToken();
  const expiresAt = daysFromNow(REFRESH_TOKEN_TTL_DAYS);
  await db.insert(refreshTokens).values({ userId, tokenHash: sha256(token), expiresAt });
  return { token, expiresAt };
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
}

/**
 * Rotates a refresh token: validates the presented token, revokes it, and
 * issues a fresh access + refresh token pair (BackendSchema §8.2).
 */
export async function refresh(rawToken: string): Promise<RefreshResult> {
  const tokenHash = sha256(rawToken);
  const [record] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.tokenHash, tokenHash))
    .limit(1);

  if (!record || record.revokedAt || record.expiresAt <= new Date()) {
    throw AppError.unauthorized('Invalid or expired refresh token');
  }

  const [user] = await db.select().from(users).where(eq(users.id, record.userId)).limit(1);
  if (!user || user.status !== 'active') {
    throw AppError.unauthorized('Invalid session');
  }

  // Revoke the presented token (rotation) and issue a new pair.
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.id, record.id));

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role as UserRole,
  });
  const { token: refreshToken, expiresAt } = await issueRefreshToken(user.id);
  return { accessToken, refreshToken, refreshExpiresAt: expiresAt };
}

/** Revokes a refresh token on logout (no error if it's already gone). */
export async function logout(rawToken: string | undefined): Promise<void> {
  if (!rawToken) return;
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.tokenHash, sha256(rawToken)));
}

/**
 * Begins a password reset. Always succeeds from the caller's perspective (no
 * account enumeration). Returns the raw token + user when an active account
 * exists so the controller can send the email.
 */
export async function requestPasswordReset(
  email: string,
): Promise<{ rawToken: string; userEmail: string } | null> {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || user.status !== 'active') return null;

  // Invalidate previous unused tokens.
  await db
    .update(passwordResets)
    .set({ usedAt: new Date() })
    .where(and(eq(passwordResets.userId, user.id), isNull(passwordResets.usedAt)));

  const rawToken = generateOpaqueToken();
  await db.insert(passwordResets).values({
    userId: user.id,
    tokenHash: sha256(rawToken),
    expiresAt: minutesFromNow(PASSWORD_RESET_TTL_MINUTES),
  });
  return { rawToken, userEmail: user.email };
}

/** Completes a password reset using a single-use token. */
export async function resetPassword(rawToken: string, newPassword: string): Promise<void> {
  const tokenHash = sha256(rawToken);
  const [record] = await db
    .select()
    .from(passwordResets)
    .where(eq(passwordResets.tokenHash, tokenHash))
    .limit(1);

  if (!record || record.usedAt || record.expiresAt <= new Date()) {
    throw AppError.badRequest('This reset link is invalid or has expired');
  }

  const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);
  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ passwordHash, failedLoginAttempts: 0, lockedUntil: null })
      .where(eq(users.id, record.userId));
    await tx
      .update(passwordResets)
      .set({ usedAt: new Date() })
      .where(eq(passwordResets.id, record.id));
    // Revoke all active sessions for this user.
    await tx
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(refreshTokens.userId, record.userId), isNull(refreshTokens.revokedAt)));
  });
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw AppError.notFound('User not found');
  }

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) {
    throw AppError.badRequest('Incorrect current password');
  }

  const newHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ passwordHash: newHash, failedLoginAttempts: 0, lockedUntil: null })
      .where(eq(users.id, userId));

    // Revoke all active sessions for this user (force re-login for security)
    await tx
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));
  });
}
