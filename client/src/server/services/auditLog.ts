/**
 * Audit logging (BackendSchema §14). Append-only record of every admin
 * mutation. Failures here are logged but never block the primary operation —
 * an audit write must not fail a content change.
 */
import { db } from '../../db/index';
import { auditLogs } from '../../db/schema';
import { logger } from '../config/logger';
import type { AuditAction } from '@thenagrik/shared';

export type FieldDiff = Record<string, { old: unknown; new: unknown }>;

export interface LogActionParams {
  userId: string | null;
  userEmail: string;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  entityTitle?: string | null;
  changes?: FieldDiff | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

const TRUNCATE_FIELDS = new Set(['body', 'description', 'answer', 'message', 'bio']);
const MAX_DIFF_CHARS = 200;

/** Truncates large text diffs and strips password fields (BackendSchema §14.3). */
function sanitizeChanges(changes: FieldDiff | null | undefined): FieldDiff | null {
  if (!changes) return null;
  const out: FieldDiff = {};
  for (const [field, diff] of Object.entries(changes)) {
    if (field.toLowerCase().includes('password')) continue;
    if (TRUNCATE_FIELDS.has(field)) {
      out[field] = { old: truncate(diff.old), new: truncate(diff.new) };
    } else {
      out[field] = diff;
    }
  }
  return Object.keys(out).length > 0 ? out : null;
}

function truncate(value: unknown): string {
  const s = typeof value === 'string' ? value : JSON.stringify(value ?? '');
  return s.length > MAX_DIFF_CHARS ? `${s.slice(0, MAX_DIFF_CHARS)}…` : s;
}

export async function logAction(params: LogActionParams): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      userId: params.userId,
      userEmail: params.userEmail,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      entityTitle: params.entityTitle ?? null,
      changes: sanitizeChanges(params.changes),
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    });
  } catch (err) {
    logger.error({ err, action: params.action, entityType: params.entityType }, 'Audit log failed');
  }
}

/** Computes a field-level diff between two plain objects for the given keys. */
export function computeDiff<T extends Record<string, unknown>>(
  before: T,
  after: Partial<T>,
  keys: (keyof T)[],
): FieldDiff {
  const diff: FieldDiff = {};
  for (const key of keys) {
    if (key in after && after[key] !== before[key]) {
      diff[String(key)] = { old: before[key], new: after[key] };
    }
  }
  return diff;
}
