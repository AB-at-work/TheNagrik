/**
 * Application-wide constants derived from the source documents.
 * Numbers here come from BackendSchema (§1.5, §8), TRD (§13 rate limits),
 * and APIContract (§4.3 media limits).
 */

// ── Auth ──────────────────────────────────────────────────────
export const MAX_FAILED_LOGIN_ATTEMPTS = 5;
export const ACCOUNT_LOCK_MINUTES = 15;
export const REFRESH_TOKEN_BYTES = 64; // hex-encoded → 128 chars
export const REFRESH_TOKEN_TTL_DAYS = 7;
export const PASSWORD_RESET_TTL_MINUTES = 60;
export const REFRESH_COOKIE_NAME = 'refreshToken';

// ── Pagination ────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// ── Content ───────────────────────────────────────────────────
export const WORDS_PER_MINUTE = 200;
export const MAX_SLUG_LENGTH = 220;
export const RELATED_CONTENT_LIMIT = 3;
export const MAX_SESSION_PHOTOS = 10;

/** Route segments a slug may never collide with (BackendSchema §9.2). */
export const RESERVED_SLUGS = [
  'admin',
  'api',
  'search',
  'join',
  'about',
  'learn',
  'blog',
  'projects',
  'schools',
  'contact',
  'faq',
  'privacy',
  'terms',
  'sitemap.xml',
  'robots.txt',
  'feed.xml',
] as const;

// ── Media (APIContract §4.3, BackendSchema §11) ───────────────
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB
export const THUMBNAIL_WIDTH = 400;
export const MAX_IMAGE_DIMENSION = 4096;
export const ALLOWED_UPLOAD_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
] as const;

// ── Rate limits (TRD §13 / BackendSchema §18.1) ───────────────
export const RATE_LIMITS = {
  general: { windowMs: 60_000, max: 100 },
  auth: { windowMs: 15 * 60_000, max: 5 },
  forms: { windowMs: 60 * 60_000, max: 3 },
  adminApi: { windowMs: 60_000, max: 200 },
  mediaUpload: { windowMs: 60_000, max: 10 },
} as const;

// ── Audit retention ───────────────────────────────────────────
export const AUDIT_RETENTION_MONTHS = 12;
