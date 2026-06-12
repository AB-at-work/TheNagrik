/**
 * The Nagrik — Drizzle ORM schema (single source of truth).
 *
 * Mirrors BackendSchema_TheNagrik.md §4 (table design) and §23 (Drizzle source)
 * EXACTLY. 18 tables across Auth, Content, Media, Forms, and System modules.
 *
 * Conventions (BackendSchema §22):
 *  - snake_case table & column names, plural tables.
 *  - UUID PKs via gen_random_uuid() (Drizzle .defaultRandom()).
 *  - TIMESTAMPTZ everywhere; created_at immutable, updated_at trigger-managed.
 *  - status/role stored as VARCHAR + CHECK (not native enums) so values can be
 *    added without a type migration.
 *  - search_vector (tsvector) populated by DB triggers, not the app.
 */

import { sql } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  date,
  inet,
  jsonb,
  index,
  check,
  customType,
} from 'drizzle-orm/pg-core';

import {
  USER_ROLES,
  USER_STATUSES,
  CONTENT_STATUSES,
  PROJECT_STATUSES,
  SETTING_TYPES,
} from '@thenagrik/shared';

// ── Custom column types ───────────────────────────────────────

const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector';
  },
});

const textArray = customType<{ data: string[]; driverData: string }>({
  dataType() {
    return 'text[]';
  },
});

/**
 * Builds a `CHECK (col IN ('a','b',...))` clause from a const array.
 * Values are inlined as quoted SQL string literals (with single-quote escaping)
 * because CHECK constraints live in DDL and cannot use bind parameters.
 */
function inList(column: string, values: readonly string[]): ReturnType<typeof sql.raw> {
  const list = values.map((v) => `'${v.replace(/'/g, "''")}'`).join(', ');
  return sql.raw(`${column} IN (${list})`);
}

// ══════════════════════════════════════════════════════════════
// AUTH MODULE
// ══════════════════════════════════════════════════════════════

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    name: varchar('name', { length: 200 }).notNull(),
    role: varchar('role', { length: 20 }).notNull().default('editor'),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    failedLoginAttempts: integer('failed_login_attempts').notNull().default(0),
    lockedUntil: timestamp('locked_until', { withTimezone: true }),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('users_role_status_idx').on(table.role, table.status),
    check('users_role_check', inList('role', USER_ROLES)),
    check('users_status_check', inList('status', USER_STATUSES)),
    check('users_failed_attempts_check', sql`failed_login_attempts >= 0`),
  ],
);

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: varchar('token_hash', { length: 128 }).notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
  },
  (table) => [
    index('refresh_tokens_user_id_idx').on(table.userId),
    index('refresh_tokens_expires_at_idx').on(table.expiresAt),
  ],
);

export const passwordResets = pgTable(
  'password_resets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: varchar('token_hash', { length: 128 }).notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('password_resets_user_id_idx').on(table.userId)],
);

// ══════════════════════════════════════════════════════════════
// CONTENT MODULE
// ══════════════════════════════════════════════════════════════

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    slug: varchar('slug', { length: 120 }).notNull().unique(),
    description: text('description'),
    iconUrl: text('icon_url'),
    sortOrder: integer('sort_order').notNull().default(0),
    metaTitle: varchar('meta_title', { length: 120 }),
    metaDescription: varchar('meta_description', { length: 320 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('categories_sort_order_idx').on(table.sortOrder)],
);

export const articles = pgTable(
  'articles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    title: varchar('title', { length: 300 }).notNull(),
    slug: varchar('slug', { length: 320 }).notNull().unique(),
    excerpt: varchar('excerpt', { length: 500 }),
    body: text('body').notNull(),
    featuredImageUrl: text('featured_image_url'),
    featuredImageAlt: varchar('featured_image_alt', { length: 300 }),
    status: varchar('status', { length: 20 }).notNull().default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    metaTitle: varchar('meta_title', { length: 120 }),
    metaDescription: varchar('meta_description', { length: 320 }),
    ogImageUrl: text('og_image_url'),
    searchVector: tsvector('search_vector'),
    readingTimeMinutes: integer('reading_time_minutes'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('articles_category_status_idx').on(table.categoryId, table.status),
    index('articles_status_published_idx').on(table.status, table.publishedAt),
    index('articles_author_id_idx').on(table.authorId),
    index('articles_search_vector_idx').using('gin', table.searchVector),
    check('articles_status_check', inList('status', CONTENT_STATUSES)),
  ],
);

export const blogPosts = pgTable(
  'blog_posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    categoryId: uuid('category_id').references(() => categories.id, {
      onDelete: 'set null',
    }),
    title: varchar('title', { length: 300 }).notNull(),
    slug: varchar('slug', { length: 320 }).notNull().unique(),
    excerpt: varchar('excerpt', { length: 500 }),
    body: text('body').notNull(),
    featuredImageUrl: text('featured_image_url'),
    featuredImageAlt: varchar('featured_image_alt', { length: 300 }),
    tags: textArray('tags').default(sql`'{}'`),
    status: varchar('status', { length: 20 }).notNull().default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    metaTitle: varchar('meta_title', { length: 120 }),
    metaDescription: varchar('meta_description', { length: 320 }),
    ogImageUrl: text('og_image_url'),
    searchVector: tsvector('search_vector'),
    readingTimeMinutes: integer('reading_time_minutes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('blog_posts_status_published_idx').on(table.status, table.publishedAt),
    index('blog_posts_category_id_idx').on(table.categoryId),
    index('blog_posts_tags_idx').using('gin', table.tags),
    index('blog_posts_search_vector_idx').using('gin', table.searchVector),
    check('blog_posts_status_check', inList('status', CONTENT_STATUSES)),
  ],
);

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 300 }).notNull(),
    slug: varchar('slug', { length: 320 }).notNull().unique(),
    description: text('description').notNull(),
    shortDescription: varchar('short_description', { length: 500 }),
    featuredImageUrl: text('featured_image_url'),
    featuredImageAlt: varchar('featured_image_alt', { length: 300 }),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    ctaText: varchar('cta_text', { length: 100 }),
    ctaUrl: text('cta_url'),
    startDate: date('start_date'),
    endDate: date('end_date'),
    sortOrder: integer('sort_order').notNull().default(0),
    metaTitle: varchar('meta_title', { length: 120 }),
    metaDescription: varchar('meta_description', { length: 320 }),
    searchVector: tsvector('search_vector'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('projects_status_sort_idx').on(table.status, table.sortOrder),
    index('projects_search_vector_idx').using('gin', table.searchVector),
    check('projects_status_check', inList('status', PROJECT_STATUSES)),
  ],
);

export const schoolSessions = pgTable(
  'school_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 300 }).notNull(),
    slug: varchar('slug', { length: 320 }).notNull().unique(),
    schoolName: varchar('school_name', { length: 300 }).notNull(),
    sessionDate: date('session_date').notNull(),
    description: text('description'),
    studentCount: integer('student_count'),
    city: varchar('city', { length: 100 }),
    state: varchar('state', { length: 100 }),
    status: varchar('status', { length: 20 }).notNull().default('draft'),
    sortOrder: integer('sort_order').notNull().default(0),
    searchVector: tsvector('search_vector'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('school_sessions_status_date_idx').on(table.status, table.sessionDate),
    index('school_sessions_search_vector_idx').using('gin', table.searchVector),
    check('school_sessions_status_check', inList('status', CONTENT_STATUSES)),
    check('school_sessions_student_count_check', sql`student_count >= 0`),
  ],
);

export const sessionPhotos = pgTable(
  'session_photos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => schoolSessions.id, { onDelete: 'cascade' }),
    imageUrl: text('image_url').notNull(),
    thumbnailUrl: text('thumbnail_url'),
    altText: varchar('alt_text', { length: 300 }).default(''),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('session_photos_session_sort_idx').on(table.sessionId, table.sortOrder)],
);

export const teamMembers = pgTable(
  'team_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 200 }).notNull(),
    roleTitle: varchar('role_title', { length: 200 }).notNull(),
    bio: text('bio'),
    photoUrl: text('photo_url'),
    linkedinUrl: text('linkedin_url'),
    instagramUrl: text('instagram_url'),
    email: varchar('email', { length: 255 }),
    isActive: boolean('is_active').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('team_members_active_sort_idx').on(table.isActive, table.sortOrder)],
);

export const corePrinciples = pgTable('core_principles', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  iconName: varchar('icon_name', { length: 50 }),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const faqEntries = pgTable(
  'faq_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    question: varchar('question', { length: 500 }).notNull(),
    answer: text('answer').notNull(),
    category: varchar('category', { length: 100 }).default('general'),
    isActive: boolean('is_active').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    searchVector: tsvector('search_vector'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('faq_entries_active_sort_idx').on(table.isActive, table.category, table.sortOrder),
    index('faq_entries_search_vector_idx').using('gin', table.searchVector),
  ],
);

// ══════════════════════════════════════════════════════════════
// MEDIA MODULE
// ══════════════════════════════════════════════════════════════

export const mediaFiles = pgTable(
  'media_files',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    uploadedBy: uuid('uploaded_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    filename: varchar('filename', { length: 500 }).notNull(),
    storageKey: varchar('storage_key', { length: 500 }).notNull().unique(),
    url: text('url').notNull(),
    thumbnailUrl: text('thumbnail_url'),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    fileSize: integer('file_size').notNull(),
    width: integer('width'),
    height: integer('height'),
    altText: varchar('alt_text', { length: 300 }).default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('media_files_uploaded_by_idx').on(table.uploadedBy),
    index('media_files_mime_type_idx').on(table.mimeType),
    index('media_files_created_at_idx').on(table.createdAt),
    check('media_files_size_check', sql`file_size > 0`),
  ],
);

// Forms Module removed (visitors redirected to external Google Forms)

// ══════════════════════════════════════════════════════════════
// SYSTEM MODULE
// ══════════════════════════════════════════════════════════════

export const settings = pgTable(
  'settings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    key: varchar('key', { length: 100 }).notNull().unique(),
    value: text('value').notNull(),
    type: varchar('type', { length: 20 }).notNull().default('string'),
    group: varchar('group', { length: 50 }).notNull().default('general'),
    label: varchar('label', { length: 200 }),
    description: varchar('description', { length: 500 }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
  },
  (table) => [
    index('settings_group_idx').on(table.group),
    check('settings_type_check', inList('type', SETTING_TYPES)),
  ],
);

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    userEmail: varchar('user_email', { length: 255 }).notNull(),
    action: varchar('action', { length: 50 }).notNull(),
    entityType: varchar('entity_type', { length: 50 }).notNull(),
    entityId: uuid('entity_id'),
    entityTitle: varchar('entity_title', { length: 300 }),
    changes: jsonb('changes'),
    ipAddress: inet('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('audit_logs_user_id_idx').on(table.userId),
    index('audit_logs_entity_idx').on(table.entityType, table.entityId),
    index('audit_logs_action_idx').on(table.action),
    index('audit_logs_created_at_idx').on(table.createdAt),
  ],
);

// ── Inferred row types (server-internal) ──────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type SchoolSession = typeof schoolSessions.$inferSelect;
export type SessionPhoto = typeof sessionPhotos.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type CorePrinciple = typeof corePrinciples.$inferSelect;
export type FaqEntry = typeof faqEntries.$inferSelect;
export type MediaFile = typeof mediaFiles.$inferSelect;
// Removed ContactSubmission, VolunteerRegistration, NewsletterSubscriber types
export type Setting = typeof settings.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

export const faqs = pgTable(
  'faqs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    question: text('question').notNull(),
    answer: text('answer').notNull(),
    category: varchar('category', { length: 50 }).notNull().default('general'),
    isActive: boolean('is_active').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [index('faqs_category_idx').on(table.category), index('faqs_sort_order_idx').on(table.sortOrder)]
);

