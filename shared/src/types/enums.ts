/**
 * Shared enums for The Nagrik.
 *
 * These mirror the VARCHAR + CHECK constraints defined in the Backend Schema
 * (BackendSchema_TheNagrik.md §4 / §23). We use string-literal unions plus
 * `const` value arrays so the same definitions can drive Zod validation,
 * Drizzle column checks, and frontend UI without drift.
 */

// ── Auth / users ──────────────────────────────────────────────

export const USER_ROLES = ['editor', 'admin', 'super_admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Role privilege order, lowest → highest. Used by RBAC checks. */
export const ROLE_RANK: Record<UserRole, number> = {
  editor: 1,
  admin: 2,
  super_admin: 3,
};

export const USER_STATUSES = ['active', 'inactive'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

// ── Content lifecycle ─────────────────────────────────────────

export const CONTENT_STATUSES = ['draft', 'published', 'archived'] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const PROJECT_STATUSES = ['draft', 'active', 'completed', 'upcoming'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

// ── Forms ─────────────────────────────────────────────────────

export const CONTACT_SUBJECTS = [
  'general',
  'partnership',
  'volunteer',
  'media',
  'other',
] as const;
export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

export const CONTACT_STATUSES = ['new', 'read', 'replied', 'archived'] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export const VOLUNTEER_STATUSES = [
  'new',
  'contacted',
  'accepted',
  'rejected',
  'inactive',
] as const;
export type VolunteerStatus = (typeof VOLUNTEER_STATUSES)[number];

export const VOLUNTEER_OCCUPATIONS = [
  'student',
  'educator',
  'professional',
  'other',
] as const;
export type VolunteerOccupation = (typeof VOLUNTEER_OCCUPATIONS)[number];

export const VOLUNTEER_INTERESTS = [
  'content',
  'research',
  'social_media',
  'outreach',
  'design',
  'technology',
  'other',
] as const;
export type VolunteerInterest = (typeof VOLUNTEER_INTERESTS)[number];

export const NEWSLETTER_STATUSES = ['active', 'unsubscribed'] as const;
export type NewsletterStatus = (typeof NEWSLETTER_STATUSES)[number];

// ── Settings ──────────────────────────────────────────────────

export const SETTING_TYPES = ['string', 'number', 'boolean', 'json', 'url'] as const;
export type SettingType = (typeof SETTING_TYPES)[number];

export const SETTING_GROUPS = [
  'general',
  'seo',
  'social',
  'contact',
  'analytics',
] as const;
export type SettingGroup = (typeof SETTING_GROUPS)[number];

// ── Audit ─────────────────────────────────────────────────────

export const AUDIT_ACTIONS = [
  'create',
  'update',
  'delete',
  'publish',
  'unpublish',
  'archive',
  'restore',
  'status_change',
  'login',
  'logout',
  'login_failed',
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

// ── Search ────────────────────────────────────────────────────

export const SEARCH_RESULT_TYPES = [
  'article',
  'blog_post',
  'project',
  'faq',
  'school_session',
] as const;
export type SearchResultType = (typeof SEARCH_RESULT_TYPES)[number];

// ── API error codes (TRD §7) ──────────────────────────────────

export const API_ERROR_CODES = [
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'RATE_LIMITED',
  'PAYLOAD_TOO_LARGE',
  'UNSUPPORTED_MEDIA_TYPE',
  'ACCOUNT_LOCKED',
  'INTERNAL_ERROR',
] as const;
export type ApiErrorCode = (typeof API_ERROR_CODES)[number];
