# Backend Schema Architecture
## **THE NAGRIK** — Civic Literacy Initiative
### Database & Data Model Specification v1.0

| Field | Value |
|---|---|
| **Document Version** | 1.0 |
| **Date** | June 7, 2026 |
| **Source Documents** | PRD v1.0, TRD v1.0, AFD v1.0, DesignBrief v1.0 |
| **Database Engine** | PostgreSQL 16 |
| **ORM** | Drizzle ORM (TypeScript) |
| **Classification** | Internal — Backend Engineering |

---

# 1. Backend Architecture Summary

## 1.1 Database Philosophy

**"Explicit over magical. Typed over stringly. Auditable over convenient."**

Every table has a clear purpose. Every column has a type constraint. Every mutation is logged. No catch-all JSON blobs storing critical business data. No polymorphic God tables.

The schema is designed for a **content-driven CRUD platform** — not an event-sourced system, not a graph database, not a document store. PostgreSQL relational modeling is the right fit because:

- All entities have well-defined structures and stable schemas
- Relationships are explicit and queryable (categories → articles, users → content)
- Full-text search is native (`tsvector`)
- JSON columns are used ONLY for semi-structured metadata (settings values, audit diffs)
- The dataset will remain modest (< 10K rows across most tables for years)

## 1.2 Storage Strategy

| Data Type | Storage | Rationale |
|---|---|---|
| **Relational data** | PostgreSQL 16 (Railway) | Primary datastore. All entities, auth, audit. |
| **Media files** | Cloudflare R2 (S3-compatible) | Images, documents. URL references stored in DB. |
| **Session tokens** | HTTP-only cookies + in-memory (Express) | Refresh tokens in DB, access tokens never persisted. |
| **Cache** | Next.js ISR + Node.js in-memory LRU | No Redis in V1. ISR handles public page caching. |
| **Search index** | PostgreSQL `tsvector` columns | No external search engine in V1. Native full-text search. |

## 1.3 Entity Strategy

- **18 tables** in V1.0
- **8 additional tables** planned for V2.0+ (donations, members, quizzes, events, i18n)
- **UUID v7** primary keys (time-sortable, globally unique)
- **Soft deletes** on all content tables (`deleted_at` column)
- **Hard deletes** on session/token tables (no value in retaining expired tokens)
- **Audit logging** via a dedicated `audit_logs` table (immutable append-only)

## 1.4 Scalability Goals

| Phase | Scale | Architecture |
|---|---|---|
| **V1.0 (MVP)** | < 1K daily visitors, 2–3 admin users, < 500 content items | Single PostgreSQL instance, no replication |
| **V1.5 (Growth)** | < 10K daily visitors, 5–10 admin users, < 2K content items | Connection pooling (PgBouncer), query optimization |
| **V2.0 (Scale)** | < 100K daily visitors, member accounts, donations | Read replica, Redis cache, background job queue |

## 1.5 Security Goals

- Passwords: bcrypt (cost factor 12)
- Tokens: cryptographically random (64 bytes, hex-encoded)
- SQL: Parameterized queries only (Drizzle prevents injection by design)
- Files: Validated MIME types, max 10MB, sanitized filenames
- Audit: Every admin mutation logged with actor, action, entity, old/new values
- RBAC: Role-based access enforced at middleware level, not application logic
- Data retention: Audit logs retained 12 months, then purged

---

# 2. Database Technology Recommendation

## 2.1 Technology Matrix

| Component | Choice | Alternatives Considered | Why This Choice |
|---|---|---|---|
| **Database** | PostgreSQL 16 | MySQL 8, SQLite, MongoDB | Best full-text search (tsvector), JSON support, free, Railway-native, industry standard |
| **ORM** | Drizzle ORM | Prisma, TypeORM, Knex, raw SQL | TypeScript-first, SQL-like API (no magic), 10x lighter than Prisma, schema-as-code, push-based migrations |
| **Migration** | Drizzle Kit (`drizzle-kit push`) | Prisma Migrate, node-pg-migrate | Integrated with Drizzle, generates SQL from schema diff, zero config |
| **Connection Pooling** | Built-in (`pg` pool, max 10) | PgBouncer (V2.0) | Sufficient for < 10 concurrent connections in V1. Add PgBouncer at scale. |
| **Caching** | Next.js ISR + LRU cache (lru-cache npm) | Redis, Memcached | No additional infrastructure cost. ISR handles 95% of caching needs. Add Redis in V2.0. |
| **Search** | PostgreSQL `tsvector` + `ts_rank` | Meilisearch, Elasticsearch, Algolia | Zero infrastructure cost. Native to PostgreSQL. Sufficient for < 5K searchable documents. |
| **File Storage** | Cloudflare R2 via S3 SDK | AWS S3, Supabase Storage, local disk | S3-compatible, zero egress fees, $0.015/GB/month, global CDN via R2 |
| **Email** | Resend SDK | SendGrid, Mailgun, AWS SES | Developer-first API, generous free tier (100 emails/day), React email templates |

## 2.2 Why NOT Prisma

Prisma was the initial consideration but Drizzle was selected because:

1. **Bundle size**: Prisma Client is ~8MB. Drizzle is ~50KB. For a Railway deployment with cold starts, this matters.
2. **SQL transparency**: Drizzle's query builder reads like SQL. `db.select().from(articles).where(eq(articles.status, 'published'))` vs Prisma's `prisma.article.findMany({where: {status: 'PUBLISHED'}})`. When debugging, the Drizzle developer knows exactly what SQL is generated.
3. **Migration model**: Drizzle Kit generates SQL migrations from schema diffs and can also `push` directly (useful for rapid development). Prisma requires `prisma migrate dev` which creates a migration history directory.
4. **No engine dependency**: Prisma requires a query engine binary (Rust-compiled). Drizzle runs pure JS/TS.

---

# 3. Entity Discovery

## 3.1 V1.0 Entities (18 tables)

| # | Entity | Module | Purpose |
|---|---|---|---|
| 1 | `users` | Auth | Admin panel users (editors, admins, super admins) |
| 2 | `refresh_tokens` | Auth | JWT refresh token rotation tracking |
| 3 | `password_resets` | Auth | Time-limited password reset tokens |
| 4 | `categories` | Content | Topic categories for the Learn section (Constitution, Rights, etc.) |
| 5 | `articles` | Content | Educational articles under categories (Learn section) |
| 6 | `blog_posts` | Content | Blog/news posts (Blog section) |
| 7 | `projects` | Content | Initiative/project entries (Projects section) |
| 8 | `school_sessions` | Content | School outreach session records (Schools section) |
| 9 | `session_photos` | Content | Photo gallery for each school session |
| 10 | `team_members` | Content | Team member profiles (About section) |
| 11 | `core_principles` | Content | Core values/principles displayed on About page |
| 12 | `faq_entries` | Content | FAQ question-answer pairs |
| 13 | `media_files` | Media | Uploaded images/documents metadata (URLs point to R2) |
| 14 | `contact_submissions` | Forms | Public contact form submissions |
| 15 | `volunteer_registrations` | Forms | Public volunteer application submissions |
| 16 | `newsletter_subscribers` | Forms | Email newsletter subscriptions |
| 17 | `settings` | System | Key-value configuration store (site title, social URLs, etc.) |
| 18 | `audit_logs` | System | Immutable log of all admin mutations |

## 3.2 V2.0+ Future Entities (8 tables — NOT built in V1)

| # | Entity | Module | Purpose |
|---|---|---|---|
| 19 | `donations` | Donations | Donation transaction records (Razorpay) |
| 20 | `members` | Members | Public user accounts (student/educator) |
| 21 | `member_sessions` | Members | Public user auth sessions |
| 22 | `bookmarks` | Members | Saved articles per member |
| 23 | `quizzes` | Engagement | Quiz definitions per category |
| 24 | `quiz_attempts` | Engagement | Individual quiz attempt records |
| 25 | `events` | Events | Event/webinar listings |
| 26 | `translations` | i18n | Content translations (Hindi, etc.) |

---

# 4. Table Design

## 4.1 `users` — Admin Panel Users

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK | UUID v7 preferred (time-sortable) |
| `email` | VARCHAR(255) | NO | — | UNIQUE | Lowercase enforced at application layer |
| `password_hash` | TEXT | NO | — | — | bcrypt hash (60 chars) |
| `name` | VARCHAR(200) | NO | — | — | Full display name |
| `role` | VARCHAR(20) | NO | `'editor'` | CHECK IN ('editor','admin','super_admin') | RBAC role |
| `status` | VARCHAR(20) | NO | `'active'` | CHECK IN ('active','inactive') | Account status |
| `failed_login_attempts` | INTEGER | NO | `0` | CHECK >= 0 | Reset to 0 on successful login |
| `locked_until` | TIMESTAMPTZ | YES | NULL | — | Non-null = account locked until this time |
| `last_login_at` | TIMESTAMPTZ | YES | NULL | — | Updated on each successful login |
| `created_at` | TIMESTAMPTZ | NO | `now()` | — | |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | — | Auto-updated via trigger |

**Indexes:**
| Name | Columns | Type | Purpose |
|---|---|---|---|
| `users_pkey` | `id` | PRIMARY | PK lookup |
| `users_email_unique` | `email` | UNIQUE | Login lookup, duplicate prevention |
| `users_role_status_idx` | `role, status` | BTREE | Admin user listing with filters |

---

## 4.2 `refresh_tokens` — JWT Refresh Token Store

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK | |
| `user_id` | UUID | NO | — | FK → users.id ON DELETE CASCADE | |
| `token_hash` | VARCHAR(128) | NO | — | UNIQUE | SHA-256 hash of the actual token |
| `expires_at` | TIMESTAMPTZ | NO | — | — | 7 days from creation |
| `created_at` | TIMESTAMPTZ | NO | `now()` | — | |
| `revoked_at` | TIMESTAMPTZ | YES | NULL | — | Non-null = token is revoked |

**Indexes:**
| Name | Columns | Type | Purpose |
|---|---|---|---|
| `refresh_tokens_token_hash_unique` | `token_hash` | UNIQUE | Token lookup during refresh |
| `refresh_tokens_user_id_idx` | `user_id` | BTREE | Revoke all tokens for a user |
| `refresh_tokens_expires_at_idx` | `expires_at` | BTREE | Periodic cleanup of expired tokens |

**Cleanup:** A scheduled job (daily) deletes rows where `expires_at < now() - INTERVAL '1 day'` or `revoked_at IS NOT NULL AND revoked_at < now() - INTERVAL '1 day'`. This is a hard delete — expired tokens have no audit value.

---

## 4.3 `password_resets` — Password Reset Tokens

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK | |
| `user_id` | UUID | NO | — | FK → users.id ON DELETE CASCADE | |
| `token_hash` | VARCHAR(128) | NO | — | UNIQUE | SHA-256 of token sent via email |
| `expires_at` | TIMESTAMPTZ | NO | — | — | 1 hour from creation |
| `used_at` | TIMESTAMPTZ | YES | NULL | — | Non-null = token has been consumed |
| `created_at` | TIMESTAMPTZ | NO | `now()` | — | |

**Indexes:**
| Name | Columns | Type | Purpose |
|---|---|---|---|
| `password_resets_token_hash_unique` | `token_hash` | UNIQUE | Token lookup during reset |
| `password_resets_user_id_idx` | `user_id` | BTREE | Invalidate previous reset requests |

**Rules:**
- When a new reset is requested, all previous unused tokens for that user are invalidated (`used_at = now()`)
- Token is single-use: once consumed, `used_at` is set and the token cannot be reused
- Hard delete expired tokens daily

---

## 4.4 `categories` — Content Categories (Learn Section)

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK | |
| `name` | VARCHAR(100) | NO | — | UNIQUE | Display name: "Fundamental Rights" |
| `slug` | VARCHAR(120) | NO | — | UNIQUE | URL slug: "fundamental-rights" |
| `description` | TEXT | YES | NULL | — | Brief category description |
| `icon_url` | TEXT | YES | NULL | — | R2 URL to category icon image |
| `sort_order` | INTEGER | NO | `0` | — | Manual ordering on Learn hub |
| `meta_title` | VARCHAR(120) | YES | NULL | — | SEO: `<title>` override |
| `meta_description` | VARCHAR(320) | YES | NULL | — | SEO: `<meta name="description">` |
| `created_at` | TIMESTAMPTZ | NO | `now()` | — | |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | — | |

**Indexes:**
| Name | Columns | Type | Purpose |
|---|---|---|---|
| `categories_slug_unique` | `slug` | UNIQUE | URL resolution |
| `categories_sort_order_idx` | `sort_order` | BTREE | Ordered listing |

**Deletion rule:** A category cannot be deleted if it has articles. The API returns 400 with a message: "Move or delete all articles in this category first."

---

## 4.5 `articles` — Educational Content (Learn Section)

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK | |
| `category_id` | UUID | NO | — | FK → categories.id | |
| `author_id` | UUID | NO | — | FK → users.id | Creator/editor |
| `title` | VARCHAR(300) | NO | — | — | |
| `slug` | VARCHAR(320) | NO | — | UNIQUE | URL slug within category |
| `excerpt` | VARCHAR(500) | YES | NULL | — | Short summary for cards |
| `body` | TEXT | NO | — | — | Rich text HTML (sanitized) |
| `featured_image_url` | TEXT | YES | NULL | — | R2 URL |
| `featured_image_alt` | VARCHAR(300) | YES | NULL | — | Accessibility alt text |
| `status` | VARCHAR(20) | NO | `'draft'` | CHECK IN ('draft','published','archived') | Content lifecycle state |
| `published_at` | TIMESTAMPTZ | YES | NULL | — | Set when status → published |
| `meta_title` | VARCHAR(120) | YES | NULL | — | SEO override |
| `meta_description` | VARCHAR(320) | YES | NULL | — | SEO override |
| `og_image_url` | TEXT | YES | NULL | — | Social sharing image |
| `search_vector` | TSVECTOR | YES | NULL | — | Full-text search index (auto-updated) |
| `reading_time_minutes` | INTEGER | YES | NULL | — | Calculated from word count |
| `sort_order` | INTEGER | NO | `0` | — | Manual ordering within category |
| `created_at` | TIMESTAMPTZ | NO | `now()` | — | |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | — | |
| `deleted_at` | TIMESTAMPTZ | YES | NULL | — | Soft delete |

**Indexes:**
| Name | Columns | Type | Purpose |
|---|---|---|---|
| `articles_slug_unique` | `slug` | UNIQUE | URL resolution |
| `articles_category_status_idx` | `category_id, status` | BTREE | Category page: published articles |
| `articles_status_published_idx` | `status, published_at DESC` | BTREE | Latest published articles |
| `articles_author_id_idx` | `author_id` | BTREE | Articles by author |
| `articles_search_vector_idx` | `search_vector` | GIN | Full-text search |
| `articles_deleted_at_idx` | `deleted_at` | BTREE WHERE `deleted_at IS NULL` | Partial index: active records only |

**Trigger:** `search_vector` is auto-updated via a PostgreSQL trigger:
```sql
CREATE FUNCTION articles_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(
      regexp_replace(NEW.body, '<[^>]*>', ' ', 'g'), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, excerpt, body ON articles
  FOR EACH ROW EXECUTE FUNCTION articles_search_vector_update();
```

**Trigger:** `reading_time_minutes` is auto-calculated:
```sql
-- Calculated in application layer before save:
-- Math.ceil(stripHtml(body).split(/\s+/).length / 200)
```

---

## 4.6 `blog_posts` — Blog Content

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK | |
| `author_id` | UUID | NO | — | FK → users.id | |
| `category_id` | UUID | YES | NULL | FK → categories.id | Optional blog categorization |
| `title` | VARCHAR(300) | NO | — | — | |
| `slug` | VARCHAR(320) | NO | — | UNIQUE | |
| `excerpt` | VARCHAR(500) | YES | NULL | — | |
| `body` | TEXT | NO | — | — | Rich text HTML (sanitized) |
| `featured_image_url` | TEXT | YES | NULL | — | |
| `featured_image_alt` | VARCHAR(300) | YES | NULL | — | |
| `tags` | TEXT[] | YES | `'{}'` | — | PostgreSQL text array for tags |
| `status` | VARCHAR(20) | NO | `'draft'` | CHECK IN ('draft','published','archived') | |
| `published_at` | TIMESTAMPTZ | YES | NULL | — | |
| `meta_title` | VARCHAR(120) | YES | NULL | — | |
| `meta_description` | VARCHAR(320) | YES | NULL | — | |
| `og_image_url` | TEXT | YES | NULL | — | |
| `search_vector` | TSVECTOR | YES | NULL | — | Auto-updated via trigger |
| `reading_time_minutes` | INTEGER | YES | NULL | — | |
| `created_at` | TIMESTAMPTZ | NO | `now()` | — | |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | — | |
| `deleted_at` | TIMESTAMPTZ | YES | NULL | — | |

**Indexes:**
| Name | Columns | Type | Purpose |
|---|---|---|---|
| `blog_posts_slug_unique` | `slug` | UNIQUE | URL resolution |
| `blog_posts_status_published_idx` | `status, published_at DESC` | BTREE | Blog listing (paginated) |
| `blog_posts_category_id_idx` | `category_id` | BTREE | Blog filtered by category |
| `blog_posts_tags_idx` | `tags` | GIN | Tag-based filtering |
| `blog_posts_search_vector_idx` | `search_vector` | GIN | Full-text search |
| `blog_posts_deleted_at_idx` | `deleted_at` | BTREE WHERE `deleted_at IS NULL` | Partial index |

**Why `tags` as TEXT[] instead of a junction table:** For a blog with < 500 posts and < 50 unique tags, a PostgreSQL array with GIN index is simpler, faster to query (`@>` operator), and avoids the complexity of a `blog_post_tags` junction table. If tag management grows complex (tag descriptions, tag merging, tag analytics), migrate to a junction table in V2.0.

**Search trigger:** Same pattern as `articles` (Section 4.5).

---

## 4.7 `projects` — Initiatives & Projects

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK | |
| `title` | VARCHAR(300) | NO | — | — | |
| `slug` | VARCHAR(320) | NO | — | UNIQUE | |
| `description` | TEXT | NO | — | — | Rich text body |
| `short_description` | VARCHAR(500) | YES | NULL | — | For project cards |
| `featured_image_url` | TEXT | YES | NULL | — | |
| `featured_image_alt` | VARCHAR(300) | YES | NULL | — | |
| `status` | VARCHAR(20) | NO | `'active'` | CHECK IN ('active','completed','upcoming') | Project lifecycle |
| `cta_text` | VARCHAR(100) | YES | NULL | — | Custom CTA label: "Take Survey" |
| `cta_url` | TEXT | YES | NULL | — | Custom CTA link (internal or external) |
| `start_date` | DATE | YES | NULL | — | |
| `end_date` | DATE | YES | NULL | — | |
| `sort_order` | INTEGER | NO | `0` | — | |
| `meta_title` | VARCHAR(120) | YES | NULL | — | |
| `meta_description` | VARCHAR(320) | YES | NULL | — | |
| `search_vector` | TSVECTOR | YES | NULL | — | |
| `created_at` | TIMESTAMPTZ | NO | `now()` | — | |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | — | |
| `deleted_at` | TIMESTAMPTZ | YES | NULL | — | |

**Indexes:**
| Name | Columns | Type | Purpose |
|---|---|---|---|
| `projects_slug_unique` | `slug` | UNIQUE | URL resolution |
| `projects_status_sort_idx` | `status, sort_order` | BTREE | Project listing |
| `projects_search_vector_idx` | `search_vector` | GIN | Full-text search |

---

## 4.8 `school_sessions` — School Outreach Records

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK | |
| `title` | VARCHAR(300) | NO | — | — | "Session at DPS Noida" |
| `slug` | VARCHAR(320) | NO | — | UNIQUE | |
| `school_name` | VARCHAR(300) | NO | — | — | |
| `session_date` | DATE | NO | — | — | |
| `description` | TEXT | YES | NULL | — | Session recap |
| `student_count` | INTEGER | YES | NULL | CHECK >= 0 | Approximate headcount |
| `city` | VARCHAR(100) | YES | NULL | — | |
| `state` | VARCHAR(100) | YES | NULL | — | |
| `sort_order` | INTEGER | NO | `0` | — | |
| `search_vector` | TSVECTOR | YES | NULL | — | |
| `created_at` | TIMESTAMPTZ | NO | `now()` | — | |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | — | |
| `deleted_at` | TIMESTAMPTZ | YES | NULL | — | |

**Indexes:**
| Name | Columns | Type | Purpose |
|---|---|---|---|
| `school_sessions_slug_unique` | `slug` | UNIQUE | URL resolution |
| `school_sessions_date_idx` | `session_date DESC` | BTREE | Chronological listing |
| `school_sessions_search_vector_idx` | `search_vector` | GIN | Full-text search |

---

## 4.9 `session_photos` — School Session Gallery

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK | |
| `session_id` | UUID | NO | — | FK → school_sessions.id ON DELETE CASCADE | |
| `image_url` | TEXT | NO | — | — | R2 URL |
| `thumbnail_url` | TEXT | YES | NULL | — | Auto-generated thumbnail URL |
| `alt_text` | VARCHAR(300) | YES | `''` | — | |
| `sort_order` | INTEGER | NO | `0` | — | Photo ordering within session |
| `created_at` | TIMESTAMPTZ | NO | `now()` | — | |

**Indexes:**
| Name | Columns | Type | Purpose |
|---|---|---|---|
| `session_photos_session_id_idx` | `session_id, sort_order` | BTREE | Fetch photos for a session in order |

**Constraint:** Application-level limit of 10 photos per session. Enforced in the service layer, not the database (to allow admin override if needed).

---

## 4.10 `team_members` — Team Profiles

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK | |
| `name` | VARCHAR(200) | NO | — | — | |
| `role_title` | VARCHAR(200) | NO | — | — | "Co-Founder", "Content Lead" |
| `bio` | TEXT | YES | NULL | — | Short biography |
| `photo_url` | TEXT | YES | NULL | — | R2 URL |
| `linkedin_url` | TEXT | YES | NULL | — | |
| `instagram_url` | TEXT | YES | NULL | — | |
| `email` | VARCHAR(255) | YES | NULL | — | Public contact (optional) |
| `is_active` | BOOLEAN | NO | `true` | — | Inactive members hidden from public |
| `sort_order` | INTEGER | NO | `0` | — | Display order on About page |
| `created_at` | TIMESTAMPTZ | NO | `now()` | — | |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | — | |

**Indexes:**
| Name | Columns | Type | Purpose |
|---|---|---|---|
| `team_members_active_sort_idx` | `is_active, sort_order` | BTREE | Public team listing |

---

## 4.11 `core_principles` — Organization Values

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK | |
| `title` | VARCHAR(200) | NO | — | — | "Non-Partisan" |
| `description` | TEXT | NO | — | — | Explanation paragraph |
| `icon_name` | VARCHAR(50) | YES | NULL | — | Icon identifier (for frontend rendering) |
| `sort_order` | INTEGER | NO | `0` | — | |
| `created_at` | TIMESTAMPTZ | NO | `now()` | — | |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | — | |

---

## 4.12 `faq_entries` — FAQ Content

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK | |
| `question` | VARCHAR(500) | NO | — | — | |
| `answer` | TEXT | NO | — | — | Rich text (sanitized) |
| `category` | VARCHAR(100) | YES | `'general'` | — | FAQ grouping: "general", "volunteer", "schools" |
| `is_active` | BOOLEAN | NO | `true` | — | |
| `sort_order` | INTEGER | NO | `0` | — | |
| `search_vector` | TSVECTOR | YES | NULL | — | |
| `created_at` | TIMESTAMPTZ | NO | `now()` | — | |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | — | |

**Indexes:**
| Name | Columns | Type | Purpose |
|---|---|---|---|
| `faq_entries_active_sort_idx` | `is_active, category, sort_order` | BTREE | FAQ listing by group |
| `faq_entries_search_vector_idx` | `search_vector` | GIN | Full-text search |

---

## 4.13 `media_files` — Uploaded Media Registry

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK | |
| `uploaded_by` | UUID | NO | — | FK → users.id | |
| `filename` | VARCHAR(500) | NO | — | — | Original filename (sanitized) |
| `storage_key` | VARCHAR(500) | NO | — | UNIQUE | R2 object key: `media/2026/06/uuid.webp` |
| `url` | TEXT | NO | — | — | Full public URL (R2 CDN) |
| `thumbnail_url` | TEXT | YES | NULL | — | Auto-generated thumbnail |
| `mime_type` | VARCHAR(100) | NO | — | — | `image/webp`, `image/jpeg`, etc. |
| `file_size` | INTEGER | NO | — | CHECK > 0 | Size in bytes |
| `width` | INTEGER | YES | NULL | — | Image width in pixels |
| `height` | INTEGER | YES | NULL | — | Image height in pixels |
| `alt_text` | VARCHAR(300) | YES | `''` | — | |
| `created_at` | TIMESTAMPTZ | NO | `now()` | — | |

**Indexes:**
| Name | Columns | Type | Purpose |
|---|---|---|---|
| `media_files_storage_key_unique` | `storage_key` | UNIQUE | Prevent duplicate uploads |
| `media_files_uploaded_by_idx` | `uploaded_by` | BTREE | Files by uploader |
| `media_files_mime_type_idx` | `mime_type` | BTREE | Filter by type |
| `media_files_created_at_idx` | `created_at DESC` | BTREE | Recent uploads first |

**No soft delete.** Media files are hard-deleted from both the database and R2. Orphan detection: a weekly job scans for `media_files` entries whose URLs are not referenced in any content column (`articles.featured_image_url`, `blog_posts.featured_image_url`, `team_members.photo_url`, `session_photos.image_url`, `projects.featured_image_url`). Orphans are flagged in admin UI for manual review.

---

## 4.14 `contact_submissions` — Contact Form Entries

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK | |
| `name` | VARCHAR(200) | NO | — | — | |
| `email` | VARCHAR(255) | NO | — | — | |
| `subject` | VARCHAR(50) | NO | — | CHECK IN ('general','partnership','volunteer','media','other') | |
| `message` | TEXT | NO | — | CHECK length ≤ 5000 | |
| `status` | VARCHAR(20) | NO | `'new'` | CHECK IN ('new','read','replied','archived') | |
| `ip_address` | INET | YES | NULL | — | For rate limiting / abuse detection |
| `user_agent` | TEXT | YES | NULL | — | Browser identification |
| `read_at` | TIMESTAMPTZ | YES | NULL | — | When admin first opened |
| `created_at` | TIMESTAMPTZ | NO | `now()` | — | |

**Indexes:**
| Name | Columns | Type | Purpose |
|---|---|---|---|
| `contact_submissions_status_idx` | `status, created_at DESC` | BTREE | Inbox filtering |
| `contact_submissions_email_idx` | `email` | BTREE | Lookup by sender |

**No soft delete.** Contact submissions can be hard-deleted by Admin+ (personal data cleanup).

---

## 4.15 `volunteer_registrations` — Volunteer Applications

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK | |
| `name` | VARCHAR(200) | NO | — | — | |
| `email` | VARCHAR(255) | NO | — | UNIQUE | Prevents duplicate registrations |
| `phone` | VARCHAR(30) | YES | NULL | — | |
| `age` | INTEGER | NO | — | CHECK BETWEEN 14 AND 99 | |
| `city` | VARCHAR(100) | NO | — | — | |
| `state` | VARCHAR(100) | YES | NULL | — | |
| `occupation` | VARCHAR(50) | NO | — | CHECK IN ('student','educator','professional','other') | |
| `interests` | TEXT[] | NO | `'{}'` | — | Array: ['content','research','social_media','outreach','design','technology','other'] |
| `motivation` | TEXT | YES | NULL | — | "Why do you want to volunteer?" (max 500 chars, enforced in app) |
| `status` | VARCHAR(20) | NO | `'new'` | CHECK IN ('new','contacted','accepted','rejected','inactive') | |
| `ip_address` | INET | YES | NULL | — | |
| `created_at` | TIMESTAMPTZ | NO | `now()` | — | |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | — | |

**Indexes:**
| Name | Columns | Type | Purpose |
|---|---|---|---|
| `volunteer_registrations_email_unique` | `email` | UNIQUE | Duplicate prevention |
| `volunteer_registrations_status_idx` | `status, created_at DESC` | BTREE | Pipeline filtering |

---

## 4.16 `newsletter_subscribers` — Email Subscriptions

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK | |
| `email` | VARCHAR(255) | NO | — | UNIQUE | |
| `status` | VARCHAR(20) | NO | `'active'` | CHECK IN ('active','unsubscribed') | |
| `subscribed_at` | TIMESTAMPTZ | NO | `now()` | — | |
| `unsubscribed_at` | TIMESTAMPTZ | YES | NULL | — | |
| `ip_address` | INET | YES | NULL | — | |

**Indexes:**
| Name | Columns | Type | Purpose |
|---|---|---|---|
| `newsletter_subscribers_email_unique` | `email` | UNIQUE | Duplicate prevention |
| `newsletter_subscribers_status_idx` | `status` | BTREE | Active subscriber count/export |

**Resubscribe logic:** If a previously unsubscribed email subscribes again, update `status = 'active'`, `unsubscribed_at = NULL`, `subscribed_at = now()`. Do NOT create a duplicate row.

---

## 4.17 `settings` — System Configuration

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK | |
| `key` | VARCHAR(100) | NO | — | UNIQUE | Dot-notation: "site.title", "social.instagram" |
| `value` | TEXT | NO | — | — | String value (JSON-parseable if complex) |
| `type` | VARCHAR(20) | NO | `'string'` | CHECK IN ('string','number','boolean','json','url') | Helps admin UI render correct input |
| `group` | VARCHAR(50) | NO | `'general'` | — | Settings group: "general", "seo", "social", "contact", "analytics" |
| `label` | VARCHAR(200) | YES | NULL | — | Human-readable label for admin UI |
| `description` | VARCHAR(500) | YES | NULL | — | Help text in admin UI |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | — | |
| `updated_by` | UUID | YES | NULL | FK → users.id | Last editor |

**Indexes:**
| Name | Columns | Type | Purpose |
|---|---|---|---|
| `settings_key_unique` | `key` | UNIQUE | Key lookup |
| `settings_group_idx` | `group` | BTREE | Group-based admin page rendering |

**Seed data:** These settings are pre-seeded during initial migration:

| Key | Type | Default Value | Group |
|---|---|---|---|
| `site.title` | string | "The Nagrik" | general |
| `site.tagline` | string | "Student-Led Civic Literacy Initiative" | general |
| `site.description` | string | "Building informed citizens" | general |
| `contact.email` | string | "thenagrik.org@gmail.com" | contact |
| `contact.phone` | string | "" | contact |
| `social.instagram` | url | "https://instagram.com/nagrikindia" | social |
| `social.linkedin` | url | "" | social |
| `social.twitter` | url | "" | social |
| `seo.default_title_suffix` | string | " \| The Nagrik" | seo |
| `seo.default_og_image` | url | "" | seo |
| `analytics.ga_measurement_id` | string | "" | analytics |
| `impact.students_reached` | number | "0" | general |

---

## 4.18 `audit_logs` — Immutable Action Log

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK | |
| `user_id` | UUID | YES | NULL | FK → users.id ON DELETE SET NULL | NULL if user was deleted |
| `user_email` | VARCHAR(255) | NO | — | — | Denormalized: preserved even if user deleted |
| `action` | VARCHAR(50) | NO | — | — | 'create', 'update', 'delete', 'publish', 'archive', 'login', 'logout', 'status_change' |
| `entity_type` | VARCHAR(50) | NO | — | — | 'article', 'blog_post', 'project', 'user', 'setting', etc. |
| `entity_id` | UUID | YES | NULL | — | ID of affected entity (NULL for login/logout) |
| `entity_title` | VARCHAR(300) | YES | NULL | — | Denormalized: human-readable reference |
| `changes` | JSONB | YES | NULL | — | `{"field": {"old": "draft", "new": "published"}}` |
| `ip_address` | INET | YES | NULL | — | |
| `user_agent` | TEXT | YES | NULL | — | |
| `created_at` | TIMESTAMPTZ | NO | `now()` | — | Immutable — no updated_at |

**Indexes:**
| Name | Columns | Type | Purpose |
|---|---|---|---|
| `audit_logs_user_id_idx` | `user_id` | BTREE | Logs by actor |
| `audit_logs_entity_idx` | `entity_type, entity_id` | BTREE | History for an entity |
| `audit_logs_action_idx` | `action` | BTREE | Filter by action type |
| `audit_logs_created_at_idx` | `created_at DESC` | BTREE | Chronological feed |

**Rules:**
- This table is **append-only**. No UPDATE. No DELETE (except retention cleanup).
- `user_email` is denormalized intentionally: if a user is deleted, we still know WHO performed the action.
- `entity_title` is denormalized for the same reason: if content is deleted, the log still shows what was deleted.
- **Retention:** Rows older than 12 months are hard-deleted by a scheduled job.
- **Partition consideration (V2.0):** If logs exceed 1M rows, partition by `created_at` (monthly).

---

# 5. Relationship Mapping

## 5.1 Complete Relationship Registry

| Parent | Child | Cardinality | FK Column | ON DELETE | Rationale |
|---|---|---|---|---|---|
| `users` | `articles` | 1:N | `articles.author_id` | RESTRICT | Cannot delete a user who authored content |
| `users` | `blog_posts` | 1:N | `blog_posts.author_id` | RESTRICT | Same |
| `users` | `refresh_tokens` | 1:N | `refresh_tokens.user_id` | CASCADE | Delete user → delete all tokens |
| `users` | `password_resets` | 1:N | `password_resets.user_id` | CASCADE | Delete user → delete all reset tokens |
| `users` | `media_files` | 1:N | `media_files.uploaded_by` | RESTRICT | Cannot delete user with uploaded files |
| `users` | `audit_logs` | 1:N | `audit_logs.user_id` | SET NULL | User deleted → log retains entry with null user_id but preserved email |
| `users` | `settings` | 1:N | `settings.updated_by` | SET NULL | |
| `categories` | `articles` | 1:N | `articles.category_id` | RESTRICT | Cannot delete category with articles |
| `categories` | `blog_posts` | 1:N | `blog_posts.category_id` | SET NULL | Category deleted → blog posts become uncategorized |
| `school_sessions` | `session_photos` | 1:N | `session_photos.session_id` | CASCADE | Delete session → delete all its photos |

## 5.2 Non-FK Relationships

| Entity A | Entity B | Relationship | Implementation |
|---|---|---|---|
| `articles` | `articles` | Related articles | Computed at query time: same `category_id`, exclude self, order by `published_at DESC`, limit 3 |
| `blog_posts` | `blog_posts` | Related posts | Computed: same `category_id` or overlapping `tags`, exclude self, limit 3 |
| `articles` / `blog_posts` | `media_files` | Image reference | URL string stored in `featured_image_url` — no FK. Media is referenced, not owned. |
| `contact_submissions` | `users` | Read/replied by | Status changes logged in `audit_logs`, not via direct FK |

---

# 6. ER Diagram

```
┌────────────────┐          ┌────────────────┐
│     users      │          │   categories   │
├────────────────┤          ├────────────────┤
│ id          PK │──┐       │ id          PK │──┐
│ email          │  │       │ name           │  │
│ password_hash  │  │       │ slug        UK │  │
│ name           │  │       │ description    │  │
│ role           │  │       │ icon_url       │  │
│ status         │  │       │ sort_order     │  │
└────────────────┘  │       └────────────────┘  │
        │           │               │           │
        │ 1:N       │ 1:N           │ 1:N       │ 1:N (optional)
        │           │               │           │
        ▼           │               ▼           │
┌────────────────┐  │       ┌────────────────┐  │
│ refresh_tokens │  │       │   articles     │◄─┘
├────────────────┤  │       ├────────────────┤
│ id          PK │  │       │ id          PK │
│ user_id     FK │──┘  ┌───▶│ author_id   FK │
│ token_hash  UK │     │    │ category_id FK │
│ expires_at     │     │    │ title          │
│ revoked_at     │     │    │ slug        UK │
└────────────────┘     │    │ body           │
                       │    │ status         │
┌────────────────┐     │    │ search_vector  │
│ password_resets │     │    └────────────────┘
├────────────────┤     │
│ id          PK │     │    ┌────────────────┐
│ user_id     FK │─────┤    │  blog_posts    │
│ token_hash  UK │     │    ├────────────────┤
│ expires_at     │     │    │ id          PK │
│ used_at        │     ├───▶│ author_id   FK │
└────────────────┘     │    │ category_id FK │ (optional)
                       │    │ title          │
┌────────────────┐     │    │ slug        UK │
│  media_files   │     │    │ body           │
├────────────────┤     │    │ tags        [] │
│ id          PK │     │    │ status         │
│ uploaded_by FK │─────┤    │ search_vector  │
│ storage_key UK │     │    └────────────────┘
│ url            │     │
│ mime_type      │     │    ┌────────────────┐
│ file_size      │     │    │   projects     │
└────────────────┘     │    ├────────────────┤
                       │    │ id          PK │
┌────────────────┐     │    │ title          │
│  audit_logs    │     │    │ slug        UK │
├────────────────┤     │    │ description    │
│ id          PK │     │    │ status         │
│ user_id     FK │─────┘    │ cta_text       │
│ user_email     │          │ cta_url        │
│ action         │          │ search_vector  │
│ entity_type    │          └────────────────┘
│ entity_id      │
│ changes     {} │          ┌────────────────┐      ┌────────────────┐
│ created_at     │          │school_sessions │      │ session_photos │
└────────────────┘          ├────────────────┤      ├────────────────┤
                            │ id          PK │──1:N▶│ id          PK │
┌────────────────┐          │ title          │      │ session_id  FK │
│   settings     │          │ slug        UK │      │ image_url      │
├────────────────┤          │ school_name    │      │ alt_text       │
│ id          PK │          │ session_date   │      │ sort_order     │
│ key         UK │          │ student_count  │      └────────────────┘
│ value          │          │ search_vector  │
│ type           │          └────────────────┘
│ group          │
│ updated_by  FK │          ┌────────────────┐      ┌────────────────┐
└────────────────┘          │ team_members   │      │core_principles │
                            ├────────────────┤      ├────────────────┤
┌────────────────┐          │ id          PK │      │ id          PK │
│contact_submiss.│          │ name           │      │ title          │
├────────────────┤          │ role_title     │      │ description    │
│ id          PK │          │ photo_url      │      │ sort_order     │
│ name           │          │ is_active      │      └────────────────┘
│ email          │          │ sort_order     │
│ subject        │          └────────────────┘      ┌────────────────┐
│ message        │                                  │  faq_entries   │
│ status         │          ┌────────────────┐      ├────────────────┤
└────────────────┘          │volunteer_regs  │      │ id          PK │
                            ├────────────────┤      │ question       │
┌────────────────┐          │ id          PK │      │ answer         │
│newsletter_subs │          │ name           │      │ category       │
├────────────────┤          │ email       UK │      │ is_active      │
│ id          PK │          │ phone          │      │ sort_order     │
│ email       UK │          │ age            │      │ search_vector  │
│ status         │          │ occupation     │      └────────────────┘
│ subscribed_at  │          │ interests   [] │
└────────────────┘          │ status         │
                            └────────────────┘
```

---

# 7. CRUD Mapping

| Entity | Create | Read (Public) | Read (Admin) | Update | Delete | Status Change | Audit |
|---|---|---|---|---|---|---|---|
| `users` | SuperAdmin | — | SuperAdmin | SuperAdmin | SuperAdmin (deactivate) | SuperAdmin | ✅ |
| `refresh_tokens` | System (login) | — | — | — | System (hard delete) | — | ❌ |
| `password_resets` | System (request) | — | — | System (consume) | System (hard delete) | — | ❌ |
| `categories` | Admin+ | All (public) | All (admin) | Admin+ | Admin+ (if empty) | — | ✅ |
| `articles` | Editor+ | Published only | All statuses | Editor+ | Admin+ (soft) | Admin+ (publish/archive) | ✅ |
| `blog_posts` | Editor+ | Published only | All statuses | Editor+ | Admin+ (soft) | Admin+ (publish/archive) | ✅ |
| `projects` | Admin+ | All (public) | All (admin) | Admin+ | Admin+ (soft) | — | ✅ |
| `school_sessions` | Editor+ | All (public) | All (admin) | Editor+ | Admin+ (soft) | — | ✅ |
| `session_photos` | Editor+ | Via session | Via session | Editor+ | Editor+ (hard) | — | ✅ |
| `team_members` | Admin+ | Active only | All | Admin+ | Admin+ (hard) | Admin+ (active/inactive) | ✅ |
| `core_principles` | Admin+ | All | All | Admin+ | Admin+ (hard) | — | ✅ |
| `faq_entries` | Editor+ | Active only | All | Editor+ | Admin+ (hard) | Admin+ (active/inactive) | ✅ |
| `media_files` | Editor+ | Via content | Editor+ | Editor+ (alt text) | Admin+ (hard + R2 delete) | — | ✅ |
| `contact_submissions` | Public (form) | — | Admin+ | Admin+ (status only) | Admin+ (hard) | Admin+ | ✅ |
| `volunteer_registrations` | Public (form) | — | Admin+ | Admin+ (status only) | Admin+ (hard) | Admin+ | ✅ |
| `newsletter_subscribers` | Public (form) | — | Admin+ | — | Admin+ (hard) | — | ✅ |
| `settings` | System (seed) | Public (cached) | SuperAdmin | SuperAdmin | — | — | ✅ |
| `audit_logs` | System (auto) | — | SuperAdmin | — | System (12mo purge) | — | ❌ (meta) |

---

# 8. Authentication Schema

## 8.1 Auth Architecture

```
                          ┌──────────────┐
                          │    Client    │
                          └──────┬───────┘
                                 │
                  POST /api/v1/auth/login
                  { email, password }
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │   Auth Controller     │
                     │                       │
                     │  1. Validate input    │
                     │  2. Find user by email│
                     │  3. Check locked_until│
                     │  4. bcrypt.compare()  │
                     │  5. Generate tokens   │
                     └───────────┬───────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
         Access Token     Refresh Token        Audit Log
         (in-memory)      (HTTP-only cookie)   (DB insert)
         15 min TTL       7 day TTL
              │                  │
              │           ┌──────┴──────┐
              │           │refresh_tokens│
              │           │  table (DB)  │
              │           └─────────────┘
              │
              ▼
    Authorization Header
    Bearer <access_token>
```

## 8.2 Token Design

| Token | Storage | TTL | Format | Rotation |
|---|---|---|---|---|
| **Access Token** | Client memory (JS variable) | 15 minutes | JWT (HS256): `{sub: userId, role, iat, exp}` | New on each refresh |
| **Refresh Token** | HTTP-only, Secure, SameSite=Strict cookie + SHA-256 hash in `refresh_tokens` table | 7 days | 64 random bytes, hex-encoded (128 chars) | Rotated on every refresh (old token revoked) |
| **Password Reset Token** | Sent via email, SHA-256 hash in `password_resets` table | 1 hour | 64 random bytes, hex-encoded | Single-use |

## 8.3 Login Lockout Logic

```
failed_login_attempts >= 5 AND locked_until IS NULL
  → SET locked_until = now() + INTERVAL '15 minutes'
  → Return 423 Locked

locked_until IS NOT NULL AND locked_until > now()
  → Return 423 Locked (with remaining time)

locked_until IS NOT NULL AND locked_until <= now()
  → Clear lock: SET locked_until = NULL, failed_login_attempts = 0
  → Proceed with login attempt

Successful login:
  → SET failed_login_attempts = 0, locked_until = NULL, last_login_at = now()
```

## 8.4 RBAC Permission Matrix

| Permission | Editor | Admin | SuperAdmin |
|---|---|---|---|
| **Create content** (articles, blogs, sessions, FAQ) | ✅ | ✅ | ✅ |
| **Edit own content** | ✅ | ✅ | ✅ |
| **Edit any content** | ❌ | ✅ | ✅ |
| **Publish/unpublish content** | ❌ | ✅ | ✅ |
| **Delete content** | ❌ | ✅ | ✅ |
| **Upload media** | ✅ | ✅ | ✅ |
| **Delete media** | ❌ | ✅ | ✅ |
| **View form submissions** | ❌ | ✅ | ✅ |
| **Manage form statuses** | ❌ | ✅ | ✅ |
| **Export data (CSV)** | ❌ | ✅ | ✅ |
| **Manage categories** | ❌ | ✅ | ✅ |
| **Manage projects** | ❌ | ✅ | ✅ |
| **Manage team** | ❌ | ✅ | ✅ |
| **Manage users** | ❌ | ❌ | ✅ |
| **Edit settings** | ❌ | ❌ | ✅ |
| **View audit logs** | ❌ | ❌ | ✅ |

**RBAC is enforced via Express middleware**, not database-level row security:

```typescript
// middleware/authorize.ts
export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// Usage in routes:
router.post('/articles', authorize('editor', 'admin', 'super_admin'), createArticle);
router.patch('/articles/:id/status', authorize('admin', 'super_admin'), updateArticleStatus);
router.get('/users', authorize('super_admin'), listUsers);
```

---

# 9. CMS Schema

## 9.1 Content Lifecycle State Machine

```
                    ┌──────────────┐
                    │              │
        ┌──────────▶    DRAFT     ◀──────────┐
        │           │              │          │
        │           └──────┬───────┘          │
        │                  │                  │
        │           publish (Admin+)    unpublish (Admin+)
        │                  │                  │
        │                  ▼                  │
        │           ┌──────────────┐          │
  restore (Admin+)  │              │          │
        │           │  PUBLISHED   ├──────────┘
        │           │              │
        │           └──────┬───────┘
        │                  │
        │           archive (Admin+)
        │                  │
        │                  ▼
        │           ┌──────────────┐
        └───────────│              │
                    │  ARCHIVED    │
                    │              │
                    └──────────────┘
```

**Status transitions as SQL:**

```sql
-- Publish: draft → published
UPDATE articles SET status = 'published', published_at = now(), updated_at = now()
WHERE id = $1 AND status = 'draft' AND deleted_at IS NULL;

-- Unpublish: published → draft
UPDATE articles SET status = 'draft', updated_at = now()
WHERE id = $1 AND status = 'published' AND deleted_at IS NULL;

-- Archive: published → archived
UPDATE articles SET status = 'archived', updated_at = now()
WHERE id = $1 AND status = 'published' AND deleted_at IS NULL;

-- Restore: archived → draft
UPDATE articles SET status = 'draft', updated_at = now()
WHERE id = $1 AND status = 'archived' AND deleted_at IS NULL;

-- Soft delete: any → deleted (sets deleted_at)
UPDATE articles SET deleted_at = now(), updated_at = now()
WHERE id = $1 AND deleted_at IS NULL;
```

## 9.2 Slug Management

**Rules:**
1. Auto-generated from title: `"Understanding Article 21"` → `"understanding-article-21"`
2. Transformation: lowercase, trim, replace spaces with hyphens, strip non-alphanumeric (except hyphens), collapse multiple hyphens, truncate to 220 chars
3. Uniqueness: enforced via UNIQUE index. If collision, append `-2`, `-3`, etc.
4. Manual override: admin can edit slug after creation
5. No reserved words: slugs cannot match reserved route segments (`admin`, `api`, `search`, `join`, `privacy`, `terms`, `sitemap.xml`, `robots.txt`, `feed.xml`)

**Slug generation utility:**

```typescript
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')   // Strip non-alphanumeric
    .replace(/[\s_]+/g, '-')         // Spaces/underscores → hyphens
    .replace(/-+/g, '-')             // Collapse multiple hyphens
    .replace(/^-|-$/g, '')           // Trim leading/trailing hyphens
    .slice(0, 220);                  // Truncate
}
```

---

# 10. Admin Schema

## 10.1 Dashboard Data Sources

The admin dashboard aggregates data from multiple tables via a single API endpoint:

```sql
-- GET /api/v1/dashboard/stats
SELECT
  (SELECT COUNT(*) FROM blog_posts WHERE deleted_at IS NULL) AS total_blog_posts,
  (SELECT COUNT(*) FROM articles WHERE deleted_at IS NULL) AS total_articles,
  (SELECT COUNT(*) FROM projects WHERE deleted_at IS NULL) AS total_projects,
  (SELECT COUNT(*) FROM newsletter_subscribers WHERE status = 'active') AS total_subscribers,
  (SELECT COUNT(*) FROM contact_submissions WHERE status = 'new') AS unread_messages,
  (SELECT COUNT(*) FROM volunteer_registrations WHERE status = 'new') AS new_volunteers;

-- GET /api/v1/dashboard/activity
SELECT id, user_email, action, entity_type, entity_title, created_at
FROM audit_logs
ORDER BY created_at DESC
LIMIT 20;
```

## 10.2 Settings Architecture

Settings use a **typed key-value store** (see table 4.17). This is intentionally NOT a JSON blob or a single-row wide table because:

1. **Typed values**: Each setting has a `type` field that tells the admin UI what input to render (text input, toggle, URL input, number input)
2. **Grouped display**: The `group` field organizes settings into tabs in the admin UI
3. **Audit trail**: Changes to individual settings are logged in `audit_logs` with old/new values
4. **API simplicity**: `GET /api/v1/settings` returns all settings as a flat object; `PATCH /api/v1/settings/:key` updates one

---

# 11. Media Management Schema

## 11.1 Upload Flow

```
Admin uploads file via /admin/media
        │
        ▼
┌────────────────────────────────┐
│ 1. Client-side validation      │
│    • File type: jpg,png,webp,  │
│      gif,svg,pdf               │
│    • Max size: 10MB            │
│    • Max dimensions: 4096px    │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 2. Upload to Express endpoint  │
│    POST /api/v1/media          │
│    Content-Type: multipart     │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 3. Server-side validation      │
│    • MIME type check (magic    │
│      bytes, not just extension)│
│    • File size re-check        │
│    • Sanitize filename         │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 4. Process with Sharp          │
│    • Convert to WebP           │
│    • Generate thumbnail        │
│      (400px wide)              │
│    • Extract width/height      │
│    • Strip EXIF data           │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 5. Upload to Cloudflare R2     │
│    Key: media/YYYY/MM/uuid.webp│
│    + thumbnail: media/YYYY/MM/ │
│      uuid-thumb.webp           │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 6. Insert media_files record   │
│    with url, thumbnail_url,    │
│    mime_type, file_size, etc.  │
└────────────────────────────────┘
```

## 11.2 Usage Tracking

Media files are referenced by URL string (not FK) in content tables. To detect orphaned files:

```sql
-- Find media files not referenced anywhere
SELECT mf.id, mf.url, mf.created_at
FROM media_files mf
WHERE mf.url NOT IN (
  SELECT featured_image_url FROM articles WHERE featured_image_url IS NOT NULL
  UNION ALL
  SELECT featured_image_url FROM blog_posts WHERE featured_image_url IS NOT NULL
  UNION ALL
  SELECT featured_image_url FROM projects WHERE featured_image_url IS NOT NULL
  UNION ALL
  SELECT photo_url FROM team_members WHERE photo_url IS NOT NULL
  UNION ALL
  SELECT image_url FROM session_photos
  UNION ALL
  SELECT icon_url FROM categories WHERE icon_url IS NOT NULL
)
AND mf.created_at < now() - INTERVAL '7 days'; -- Grace period for recent uploads
```

This query runs weekly as a background job. Results are displayed in admin UI for manual review. Auto-deletion is NOT enabled to prevent accidental data loss from images referenced in article body HTML but not in dedicated columns.

---

# 12. SEO Schema

SEO metadata is **embedded in each content table** (not a separate table) because:
- Every content type has identical SEO fields (`meta_title`, `meta_description`, `og_image_url`)
- A separate `seo_metadata` table would require polymorphic FKs (entity_type + entity_id), which is an anti-pattern
- Embedding keeps queries simple: one SELECT to get content + SEO data

**SEO fields present in:** `articles`, `blog_posts`, `projects`, `categories`

| Field | Purpose | Fallback if NULL |
|---|---|---|
| `meta_title` | `<title>` tag | `{content.title} \| The Nagrik` |
| `meta_description` | `<meta name="description">` | First 160 chars of `excerpt` or `body` |
| `og_image_url` | Open Graph / Twitter Card image | `featured_image_url` → site-wide default from `settings` |

**Generated at build/SSR time:**

```typescript
// lib/seo.ts
function buildSeoMeta(content: Article | BlogPost, settings: Settings) {
  return {
    title: content.meta_title || `${content.title}${settings['seo.default_title_suffix']}`,
    description: content.meta_description || truncate(stripHtml(content.excerpt || content.body), 160),
    ogImage: content.og_image_url || content.featured_image_url || settings['seo.default_og_image'],
    canonical: `https://thenagrik.org${content.path}`,
  };
}
```

---

# 13. Notification Schema

Notifications are **email-based only** in V1.0. No in-app notification table is needed because:
- Admin users are few (2–5 people)
- Toast notifications are ephemeral (shown on action, not persisted)
- Push notifications are V2.0+

## 13.1 Email Triggers

| Trigger | Recipient | Template | Priority |
|---|---|---|---|
| Contact form submitted | Admin email (from `settings.contact.email`) | `contact-notification` | P0 (V1.0) |
| Volunteer registered | Admin email | `volunteer-notification` | P0 (V1.0) |
| Password reset requested | User's email | `password-reset` | P0 (V1.0) |
| Contact auto-reply | Submitter's email | `contact-confirmation` | P1 (V1.1) |
| Volunteer auto-reply | Volunteer's email | `volunteer-confirmation` | P1 (V1.1) |
| Newsletter welcome | Subscriber's email | `newsletter-welcome` | P2 (V1.2) |

## 13.2 Email Implementation

```typescript
// services/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactNotification(submission: ContactSubmission) {
  await resend.emails.send({
    from: 'The Nagrik <noreply@thenagrik.org>',
    to: [process.env.ADMIN_EMAIL!],
    subject: `New contact: ${submission.subject} — ${submission.name}`,
    html: renderContactEmail(submission), // Pre-built HTML template
  });
}
```

**Failure handling:** Email sends are fire-and-forget in V1.0. If Resend is down, the form submission still succeeds (data saved to DB). Failed email attempts are logged to `console.error`. In V2.0, add a `notification_queue` table with retry logic.

---

# 14. Audit & Logging

## 14.1 What Gets Logged

| Action | Entity Types | Data Captured |
|---|---|---|
| `create` | All content entities | Entity ID, title |
| `update` | All content entities, settings | Changed fields with old → new values |
| `delete` | All content entities, media | Entity ID, title (denormalized) |
| `publish` | articles, blog_posts | Status change: draft → published |
| `archive` | articles, blog_posts | Status change: published → archived |
| `status_change` | contact_submissions, volunteer_registrations | Pipeline status change |
| `login` | users | User email, IP, user agent |
| `logout` | users | User email |
| `login_failed` | — | Attempted email, IP (no user_id) |

## 14.2 Audit Log Implementation

```typescript
// services/auditLog.ts
export async function logAction(params: {
  userId: string | null;
  userEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  entityTitle?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  ipAddress?: string;
  userAgent?: string;
}) {
  await db.insert(auditLogs).values({
    userId: params.userId,
    userEmail: params.userEmail,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId ?? null,
    entityTitle: params.entityTitle ?? null,
    changes: params.changes ? JSON.stringify(params.changes) : null,
    ipAddress: params.ipAddress ?? null,
    userAgent: params.userAgent ?? null,
  });
}

// Usage in service layer:
await logAction({
  userId: req.user.id,
  userEmail: req.user.email,
  action: 'publish',
  entityType: 'article',
  entityId: article.id,
  entityTitle: article.title,
  changes: { status: { old: 'draft', new: 'published' } },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
```

## 14.3 Change Diff Format

The `changes` JSONB column stores field-level diffs:

```json
{
  "title": { "old": "Understanding RTI", "new": "Understanding the Right to Information" },
  "status": { "old": "draft", "new": "published" },
  "body": { "old": "[HTML content - truncated]", "new": "[HTML content - truncated]" }
}
```

**Rules:**
- Body/description diffs are truncated to first 200 chars (these fields are too large to store full old/new)
- Password fields are NEVER logged (not even hashed values)
- The `changes` field is NULL for `create`, `delete`, `login`, `logout` actions

---

# 15. Indexing Strategy

## 15.1 Complete Index Registry

| Table | Index Name | Columns | Type | Purpose |
|---|---|---|---|---|
| `users` | `users_pkey` | `id` | PRIMARY | PK |
| `users` | `users_email_unique` | `email` | UNIQUE | Login lookup |
| `users` | `users_role_status_idx` | `role, status` | BTREE | Admin user listing |
| `refresh_tokens` | `refresh_tokens_token_hash_unique` | `token_hash` | UNIQUE | Token validation |
| `refresh_tokens` | `refresh_tokens_user_id_idx` | `user_id` | BTREE | Revoke all user tokens |
| `refresh_tokens` | `refresh_tokens_expires_at_idx` | `expires_at` | BTREE | Cleanup expired |
| `password_resets` | `password_resets_token_hash_unique` | `token_hash` | UNIQUE | Token validation |
| `categories` | `categories_slug_unique` | `slug` | UNIQUE | URL resolution |
| `articles` | `articles_slug_unique` | `slug` | UNIQUE | URL resolution |
| `articles` | `articles_category_status_idx` | `category_id, status` | BTREE | Category page query |
| `articles` | `articles_status_published_idx` | `status, published_at DESC` | BTREE | Latest published |
| `articles` | `articles_search_vector_idx` | `search_vector` | GIN | Full-text search |
| `blog_posts` | `blog_posts_slug_unique` | `slug` | UNIQUE | URL resolution |
| `blog_posts` | `blog_posts_status_published_idx` | `status, published_at DESC` | BTREE | Blog listing |
| `blog_posts` | `blog_posts_tags_idx` | `tags` | GIN | Tag filtering |
| `blog_posts` | `blog_posts_search_vector_idx` | `search_vector` | GIN | Full-text search |
| `projects` | `projects_slug_unique` | `slug` | UNIQUE | URL resolution |
| `school_sessions` | `school_sessions_slug_unique` | `slug` | UNIQUE | URL resolution |
| `school_sessions` | `school_sessions_date_idx` | `session_date DESC` | BTREE | Chronological listing |
| `session_photos` | `session_photos_session_sort_idx` | `session_id, sort_order` | BTREE | Photo ordering |
| `contact_submissions` | `contact_submissions_status_idx` | `status, created_at DESC` | BTREE | Inbox filtering |
| `volunteer_registrations` | `volunteer_registrations_email_unique` | `email` | UNIQUE | Duplicate prevention |
| `audit_logs` | `audit_logs_created_at_idx` | `created_at DESC` | BTREE | Recent activity |
| `audit_logs` | `audit_logs_entity_idx` | `entity_type, entity_id` | BTREE | Entity history |

**Total indexes: 23** (including PKs and UNIQUEs)

## 15.2 Partial Indexes

```sql
-- Only index non-deleted articles (most queries filter on deleted_at IS NULL)
CREATE INDEX articles_active_idx ON articles (status, published_at DESC)
WHERE deleted_at IS NULL;

-- Only index non-deleted blog posts
CREATE INDEX blog_posts_active_idx ON blog_posts (status, published_at DESC)
WHERE deleted_at IS NULL;
```

Partial indexes reduce index size and improve write performance by excluding soft-deleted rows that are never queried publicly.

---

# 16. Search Strategy

## 16.1 Searchable Entities

| Entity | Searchable Fields | Weight | Public |
|---|---|---|---|
| `articles` | title (A), excerpt (B), body (C) | Title matches rank highest | ✅ Published only |
| `blog_posts` | title (A), excerpt (B), body (C) | Same | ✅ Published only |
| `projects` | title (A), description (C) | Title-heavy | ✅ All |
| `faq_entries` | question (A), answer (B) | Question-heavy | ✅ Active only |
| `school_sessions` | title (A), school_name (B), description (C) | Title + school name | ✅ All |

## 16.2 Unified Search Query

```sql
-- GET /api/v1/search?q=fundamental+rights&page=1&per_page=10
WITH search_results AS (
  SELECT 'article' AS type, id, title, excerpt,
         slug, 'learn' AS section,
         ts_rank(search_vector, websearch_to_tsquery('english', $1)) AS rank
  FROM articles
  WHERE search_vector @@ websearch_to_tsquery('english', $1)
    AND status = 'published' AND deleted_at IS NULL

  UNION ALL

  SELECT 'blog_post' AS type, id, title, excerpt,
         slug, 'blog' AS section,
         ts_rank(search_vector, websearch_to_tsquery('english', $1)) AS rank
  FROM blog_posts
  WHERE search_vector @@ websearch_to_tsquery('english', $1)
    AND status = 'published' AND deleted_at IS NULL

  UNION ALL

  SELECT 'project' AS type, id, title, short_description AS excerpt,
         slug, 'projects' AS section,
         ts_rank(search_vector, websearch_to_tsquery('english', $1)) AS rank
  FROM projects
  WHERE search_vector @@ websearch_to_tsquery('english', $1)
    AND deleted_at IS NULL

  UNION ALL

  SELECT 'faq' AS type, id, question AS title, answer AS excerpt,
         NULL AS slug, 'faq' AS section,
         ts_rank(search_vector, websearch_to_tsquery('english', $1)) AS rank
  FROM faq_entries
  WHERE search_vector @@ websearch_to_tsquery('english', $1)
    AND is_active = true
)
SELECT * FROM search_results
ORDER BY rank DESC
LIMIT $2 OFFSET $3;
```

## 16.3 Autocomplete (P2)

```sql
-- Prefix matching for search suggestions
SELECT title FROM articles
WHERE title ILIKE $1 || '%' AND status = 'published' AND deleted_at IS NULL
UNION
SELECT title FROM blog_posts
WHERE title ILIKE $1 || '%' AND status = 'published' AND deleted_at IS NULL
LIMIT 5;
```

Add `pg_trgm` extension for fuzzy matching / "did you mean?" in V2.0:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- Then: SELECT title, similarity(title, 'judiciery') AS sim
--       FROM articles WHERE similarity(title, 'judiciery') > 0.3
--       ORDER BY sim DESC LIMIT 3;
```

---

# 17. Caching Strategy

## 17.1 V1.0 Caching (No Redis)

| Layer | Mechanism | TTL | Invalidation |
|---|---|---|---|
| **Public pages** | Next.js ISR (Incremental Static Regeneration) | 60 seconds default | On-demand revalidation via `POST /api/revalidate?path=/blog/[slug]` from backend after publish |
| **API responses (public)** | HTTP `Cache-Control: public, s-maxage=60, stale-while-revalidate=300` | 60s fresh, 5min stale | CDN respects headers |
| **API responses (admin)** | HTTP `Cache-Control: no-store` | None | Never cached |
| **Settings** | In-memory LRU cache (Node.js `lru-cache`, max 50 entries) | 5 minutes | Cleared on settings update |
| **Search results** | Not cached | — | Always fresh from DB |
| **Static assets** | Vercel CDN / R2 CDN | 1 year (`immutable`) | Filename-hashed (content hash) |

## 17.2 V2.0 Caching (Add Redis)

When traffic exceeds 10K daily visitors:
- Add Redis (Upstash, serverless) for session storage, rate limiting, and API response caching
- Cache frequently-read data: settings, category list, published article counts
- Cache invalidation: pub/sub pattern (publish event → clear relevant cache keys)

---

# 18. Security Architecture

## 18.1 Data Security

| Concern | Mitigation |
|---|---|
| **Password storage** | bcrypt with cost factor 12. Never stored in plain text. Never logged. |
| **Token storage** | Refresh tokens stored as SHA-256 hashes. Raw token only exists in HTTP-only cookie. |
| **SQL injection** | Drizzle ORM parameterizes all queries by design. No raw SQL string concatenation. |
| **XSS** | Rich text HTML sanitized via `sanitize-html` before storage. CSP headers via Helmet. |
| **CSRF** | SameSite=Strict cookie + custom header check for admin API calls. |
| **File upload** | MIME type validated via magic bytes (not just extension). SVG files sanitized. Max 10MB. |
| **Rate limiting** | `express-rate-limit`: 100 req/min general, 5 req/min for auth endpoints, 3 req/min for forms. |
| **Secrets** | All secrets in environment variables. Never committed to git. `.env.example` with dummy values. |
| **HTTPS** | Enforced by Vercel (frontend) and Railway (backend). HSTS header set. |

## 18.2 Data Retention

| Data Type | Retention | Deletion Method |
|---|---|---|
| **Audit logs** | 12 months | Hard delete (scheduled job) |
| **Expired refresh tokens** | 1 day after expiry | Hard delete (scheduled job) |
| **Used password reset tokens** | 1 day after use | Hard delete (scheduled job) |
| **Contact submissions** | Indefinite (admin can hard delete) | Admin manual deletion |
| **Volunteer registrations** | Indefinite (admin can hard delete) | Admin manual deletion |
| **Newsletter subscribers** | Until unsubscribe + 30 days | Hard delete 30 days after unsubscribe |
| **Soft-deleted content** | Indefinite | Admin can permanently delete (future) |
| **Media files** | Indefinite | Admin hard delete (DB + R2) |

## 18.3 Personal Data Inventory (GDPR-Ready)

| Table | Personal Data Fields | Lawful Basis | Subject Access |
|---|---|---|---|
| `users` | email, name | Legitimate interest (admin access) | SuperAdmin can export/delete |
| `contact_submissions` | name, email, message, IP | Consent (form submission) | Admin can export/delete |
| `volunteer_registrations` | name, email, phone, age, city | Consent (form submission) | Admin can export/delete |
| `newsletter_subscribers` | email, IP | Consent (subscription) | Admin can export/delete; unsubscribe link |
| `audit_logs` | user_email, IP, user agent | Legitimate interest (security) | Retained 12 months, then purged |

---

# 19. Scalability Strategy

## 19.1 Growth Phases

| Phase | Traffic | DB Size | Architecture Changes |
|---|---|---|---|
| **V1.0 (Launch)** | < 1K/day | < 100MB | Single PG instance (Railway, 1GB RAM) |
| **V1.5 (Growth)** | < 10K/day | < 500MB | Add PgBouncer for connection pooling. Add Redis for rate limiting. Optimize slow queries. |
| **V2.0 (Scale)** | < 100K/day | < 2GB | Read replica for public queries. Redis for API caching. Background job queue (BullMQ). CDN for all media. |
| **V3.0 (Mature)** | 100K+/day | 5GB+ | Partition `audit_logs` by month. Consider moving search to Meilisearch. Evaluate horizontal scaling. |

## 19.2 Query Optimization Targets

| Query | Target | Current Approach |
|---|---|---|
| Homepage (featured content) | < 50ms | ISR cache (no DB hit for most requests) |
| Category → article list | < 100ms | Composite index on `category_id, status` |
| Full-text search | < 200ms | GIN index on `search_vector` |
| Admin dashboard stats | < 300ms | Single aggregate query (6 COUNT subqueries) |
| Audit log listing | < 200ms | Index on `created_at DESC`, LIMIT 50 |

---

# 20. API Mapping

## 20.1 Public API → Table Mapping

| Endpoint | Method | Table(s) | Response |
|---|---|---|---|
| `/api/v1/articles` | GET | `articles`, `categories` | Paginated published articles |
| `/api/v1/articles/:slug` | GET | `articles`, `categories`, `users` | Single article with author + category |
| `/api/v1/articles/:slug/related` | GET | `articles` | 3 related articles (same category) |
| `/api/v1/blog` | GET | `blog_posts`, `categories` | Paginated published posts |
| `/api/v1/blog/:slug` | GET | `blog_posts`, `categories`, `users` | Single blog post |
| `/api/v1/blog/:slug/related` | GET | `blog_posts` | 3 related posts |
| `/api/v1/categories` | GET | `categories` | All categories with article counts |
| `/api/v1/categories/:slug` | GET | `categories`, `articles` | Category + its published articles |
| `/api/v1/projects` | GET | `projects` | All active projects |
| `/api/v1/projects/:slug` | GET | `projects` | Single project |
| `/api/v1/schools/sessions` | GET | `school_sessions`, `session_photos` | Sessions with photos |
| `/api/v1/team` | GET | `team_members` | Active team members |
| `/api/v1/faq` | GET | `faq_entries` | Active FAQs grouped by category |
| `/api/v1/search` | GET | `articles`, `blog_posts`, `projects`, `faq_entries` | Unified search results |
| `/api/v1/settings/public` | GET | `settings` | Non-sensitive settings (cached) |
| `/api/v1/contact` | POST | `contact_submissions` | Submit contact form |
| `/api/v1/volunteers` | POST | `volunteer_registrations` | Submit volunteer form |
| `/api/v1/newsletter/subscribe` | POST | `newsletter_subscribers` | Subscribe email |

## 20.2 Admin API → Table Mapping

| Endpoint Pattern | Methods | Table | Auth |
|---|---|---|---|
| `/api/v1/auth/login` | POST | `users`, `refresh_tokens`, `audit_logs` | Public |
| `/api/v1/auth/refresh` | POST | `refresh_tokens` | Cookie |
| `/api/v1/auth/logout` | POST | `refresh_tokens`, `audit_logs` | Bearer |
| `/api/v1/auth/forgot-password` | POST | `password_resets` | Public |
| `/api/v1/auth/reset-password` | POST | `password_resets`, `users` | Token |
| `/api/v1/admin/dashboard/stats` | GET | Multiple (aggregates) | Editor+ |
| `/api/v1/admin/dashboard/activity` | GET | `audit_logs` | Editor+ |
| `/api/v1/admin/articles` | GET, POST | `articles` | Editor+ |
| `/api/v1/admin/articles/:id` | GET, PUT, DELETE | `articles` | Editor+/Admin+ |
| `/api/v1/admin/articles/:id/status` | PATCH | `articles`, `audit_logs` | Admin+ |
| `/api/v1/admin/blog` | GET, POST | `blog_posts` | Editor+ |
| `/api/v1/admin/blog/:id` | GET, PUT, DELETE | `blog_posts` | Editor+/Admin+ |
| `/api/v1/admin/blog/:id/status` | PATCH | `blog_posts`, `audit_logs` | Admin+ |
| `/api/v1/admin/categories` | GET, POST | `categories` | Admin+ |
| `/api/v1/admin/categories/:id` | PUT, DELETE | `categories` | Admin+ |
| `/api/v1/admin/projects` | GET, POST | `projects` | Admin+ |
| `/api/v1/admin/projects/:id` | GET, PUT, DELETE | `projects` | Admin+ |
| `/api/v1/admin/schools` | GET, POST | `school_sessions` | Editor+ |
| `/api/v1/admin/schools/:id` | GET, PUT, DELETE | `school_sessions` | Editor+/Admin+ |
| `/api/v1/admin/schools/:id/photos` | POST, DELETE | `session_photos` | Editor+ |
| `/api/v1/admin/team` | GET, POST | `team_members` | Admin+ |
| `/api/v1/admin/team/:id` | PUT, DELETE | `team_members` | Admin+ |
| `/api/v1/admin/team/reorder` | PATCH | `team_members` | Admin+ |
| `/api/v1/admin/faq` | GET, POST | `faq_entries` | Editor+ |
| `/api/v1/admin/faq/:id` | PUT, DELETE | `faq_entries` | Editor+/Admin+ |
| `/api/v1/admin/media` | GET, POST | `media_files` | Editor+ |
| `/api/v1/admin/media/:id` | PATCH, DELETE | `media_files` | Editor+/Admin+ |
| `/api/v1/admin/forms/contact` | GET | `contact_submissions` | Admin+ |
| `/api/v1/admin/forms/contact/:id` | PATCH | `contact_submissions` | Admin+ |
| `/api/v1/admin/forms/contact/export` | GET | `contact_submissions` | Admin+ |
| `/api/v1/admin/forms/volunteers` | GET | `volunteer_registrations` | Admin+ |
| `/api/v1/admin/forms/volunteers/:id` | PATCH | `volunteer_registrations` | Admin+ |
| `/api/v1/admin/forms/volunteers/export` | GET | `volunteer_registrations` | Admin+ |
| `/api/v1/admin/forms/newsletter` | GET | `newsletter_subscribers` | Admin+ |
| `/api/v1/admin/forms/newsletter/export` | GET | `newsletter_subscribers` | Admin+ |
| `/api/v1/admin/users` | GET, POST | `users` | SuperAdmin |
| `/api/v1/admin/users/:id` | PUT, DELETE | `users` | SuperAdmin |
| `/api/v1/admin/settings` | GET | `settings` | SuperAdmin |
| `/api/v1/admin/settings/:key` | PATCH | `settings`, `audit_logs` | SuperAdmin |
| `/api/v1/admin/audit-logs` | GET | `audit_logs` | SuperAdmin |

**Total: ~80 endpoints**

---

# 21. Future Expansion

## 21.1 Donations (V2.0)

```
TABLE: donations
├── id                UUID PK
├── donor_name        VARCHAR(200)
├── donor_email       VARCHAR(255)
├── donor_pan         VARCHAR(10) NULL   -- For 80G tax receipts
├── amount_paise      INTEGER            -- Amount in paise (₹500 = 50000)
├── currency          VARCHAR(3) DEFAULT 'INR'
├── gateway           VARCHAR(20) DEFAULT 'razorpay'
├── gateway_order_id  VARCHAR(100)
├── gateway_payment_id VARCHAR(100) NULL
├── status            VARCHAR(20) CHECK IN ('pending','completed','failed','refunded')
├── receipt_url       TEXT NULL
├── created_at        TIMESTAMPTZ
├── completed_at      TIMESTAMPTZ NULL
```

## 21.2 Members & Bookmarks (V2.0)

```
TABLE: members
├── id                UUID PK
├── email             VARCHAR(255) UNIQUE
├── password_hash     TEXT
├── name              VARCHAR(200)
├── status            VARCHAR(20) DEFAULT 'active'
├── email_verified    BOOLEAN DEFAULT false
├── created_at        TIMESTAMPTZ
├── updated_at        TIMESTAMPTZ

TABLE: bookmarks
├── id                UUID PK
├── member_id         UUID FK → members.id
├── entity_type       VARCHAR(20) -- 'article', 'blog_post'
├── entity_id         UUID
├── created_at        TIMESTAMPTZ
├── UNIQUE (member_id, entity_type, entity_id)
```

## 21.3 Quizzes (V2.0)

```
TABLE: quizzes
├── id                UUID PK
├── category_id       UUID FK → categories.id
├── title             VARCHAR(300)
├── questions         JSONB      -- Array of {question, options[], correct_index}
├── passing_score     INTEGER DEFAULT 70
├── is_active         BOOLEAN DEFAULT true
├── created_at        TIMESTAMPTZ

TABLE: quiz_attempts
├── id                UUID PK
├── quiz_id           UUID FK → quizzes.id
├── member_id         UUID FK → members.id NULL
├── score             INTEGER
├── answers           JSONB      -- Array of selected indices
├── created_at        TIMESTAMPTZ
```

## 21.4 Events (V2.0+)

```
TABLE: events
├── id                UUID PK
├── title             VARCHAR(300)
├── slug              VARCHAR(320) UNIQUE
├── description       TEXT
├── event_date        TIMESTAMPTZ
├── event_end_date    TIMESTAMPTZ NULL
├── location          VARCHAR(300) NULL
├── is_online         BOOLEAN DEFAULT false
├── registration_url  TEXT NULL
├── status            VARCHAR(20) CHECK IN ('upcoming','ongoing','completed','cancelled')
├── featured_image_url TEXT NULL
├── max_attendees     INTEGER NULL
├── created_at        TIMESTAMPTZ
├── updated_at        TIMESTAMPTZ
```

## 21.5 Internationalization (V2.0+)

```
TABLE: translations
├── id                UUID PK
├── entity_type       VARCHAR(50)   -- 'article', 'blog_post', 'project', etc.
├── entity_id         UUID
├── locale            VARCHAR(5) DEFAULT 'hi' -- ISO 639-1
├── field             VARCHAR(50)   -- 'title', 'body', 'excerpt'
├── value             TEXT
├── created_at        TIMESTAMPTZ
├── updated_at        TIMESTAMPTZ
├── UNIQUE (entity_type, entity_id, locale, field)
```

---

# 22. Engineering Standards

## 22.1 Naming Conventions

| Element | Convention | Example |
|---|---|---|
| **Table names** | `snake_case`, plural | `blog_posts`, `school_sessions` |
| **Column names** | `snake_case` | `featured_image_url`, `created_at` |
| **Primary keys** | Always `id` | `blog_posts.id` |
| **Foreign keys** | `{referenced_table_singular}_id` | `articles.category_id`, `session_photos.session_id` |
| **Boolean columns** | `is_` or `has_` prefix | `is_active`, `has_verified` |
| **Timestamp columns** | `_at` suffix | `created_at`, `published_at`, `deleted_at` |
| **Status columns** | `status` (VARCHAR with CHECK constraint) | Not ENUM (easier to add values) |
| **Indexes** | `{table}_{columns}_idx` | `articles_category_status_idx` |
| **Unique indexes** | `{table}_{column}_unique` | `users_email_unique` |

## 22.2 UUID Strategy

- **Format:** UUID v7 (RFC 9562) — time-sortable UUIDs
- **Generation:** Database-side via `gen_random_uuid()` (PostgreSQL built-in, generates v4; upgrade to v7 via `uuid_generate_v7()` extension if available, otherwise generate in application with `uuidv7` npm package and pass to INSERT)
- **Why v7:** Time-sortable UUIDs maintain B-tree index locality, reducing index fragmentation. Rows inserted sequentially cluster together on disk.

## 22.3 Timestamp Strategy

- **Always use `TIMESTAMPTZ`** (timestamp with timezone). Never `TIMESTAMP`.
- **Store in UTC.** Display in user's local timezone (frontend responsibility).
- **`created_at`:** Set automatically via `DEFAULT now()`. Never updated.
- **`updated_at`:** Set via `DEFAULT now()`. Updated automatically via trigger:

```sql
CREATE FUNCTION update_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at:
CREATE TRIGGER set_updated_at BEFORE UPDATE ON articles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

## 22.4 Soft Delete Policy

| Table | Soft Delete? | Hard Delete? | Notes |
|---|---|---|---|
| `articles` | ✅ `deleted_at` | Future admin action | Content may need recovery |
| `blog_posts` | ✅ `deleted_at` | Future admin action | Same |
| `projects` | ✅ `deleted_at` | Future admin action | Same |
| `school_sessions` | ✅ `deleted_at` | Future admin action | Same |
| `session_photos` | ❌ | ✅ Immediate | No recovery needed for individual photos |
| `team_members` | ❌ | ✅ Immediate | Use `is_active = false` to hide |
| `core_principles` | ❌ | ✅ Immediate | Simple content, easily recreated |
| `faq_entries` | ❌ | ✅ Immediate | Use `is_active = false` to hide |
| `media_files` | ❌ | ✅ Immediate + R2 | Must also delete from R2 |
| `contact_submissions` | ❌ | ✅ Immediate | Personal data — hard delete |
| `volunteer_registrations` | ❌ | ✅ Immediate | Personal data — hard delete |
| `newsletter_subscribers` | ❌ | ✅ Immediate | Personal data — hard delete |
| `users` | ❌ | ❌ Set `status = 'inactive'` | Never delete admin accounts (audit trail) |
| `audit_logs` | ❌ | ✅ Scheduled (12mo) | Retention policy |

## 22.5 Migration Strategy

```
server/
├── src/
│   └── db/
│       ├── schema.ts          ← Single source of truth (Drizzle schema)
│       ├── index.ts           ← Database connection
│       ├── seed.ts            ← Initial data seeding (settings, default admin)
│       └── migrations/        ← Auto-generated by drizzle-kit
│           ├── 0000_init.sql
│           ├── 0001_add_tags.sql
│           └── meta/
```

**Workflow:**
1. Edit `schema.ts`
2. Run `npx drizzle-kit generate` → generates migration SQL
3. Review generated SQL (never blindly apply)
4. Run `npx drizzle-kit push` (development) or `npx drizzle-kit migrate` (production)
5. Commit both `schema.ts` and generated migration file

---

# 23. Drizzle ORM Schema (TypeScript)

```typescript
// server/src/db/schema.ts

import {
  pgTable, uuid, varchar, text, integer, boolean,
  timestamp, inet, jsonb, index, uniqueIndex,
  customType
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ══════════════════════════════════════════════
// Custom Types
// ══════════════════════════════════════════════

const tsvector = customType<{ data: string }>({
  dataType() { return 'tsvector'; },
});

const textArray = customType<{ data: string[] }>({
  dataType() { return 'text[]'; },
});

// ══════════════════════════════════════════════
// AUTH MODULE
// ══════════════════════════════════════════════

export const users = pgTable('users', {
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
}, (table) => ({
  roleStatusIdx: index('users_role_status_idx').on(table.role, table.status),
}));

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 128 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
}, (table) => ({
  userIdIdx: index('refresh_tokens_user_id_idx').on(table.userId),
  expiresAtIdx: index('refresh_tokens_expires_at_idx').on(table.expiresAt),
}));

export const passwordResets = pgTable('password_resets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 128 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('password_resets_user_id_idx').on(table.userId),
}));

// ══════════════════════════════════════════════
// CONTENT MODULE
// ══════════════════════════════════════════════

export const categories = pgTable('categories', {
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
}, (table) => ({
  sortOrderIdx: index('categories_sort_order_idx').on(table.sortOrder),
}));

export const articles = pgTable('articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'restrict' }),
  authorId: uuid('author_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
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
}, (table) => ({
  categoryStatusIdx: index('articles_category_status_idx').on(table.categoryId, table.status),
  statusPublishedIdx: index('articles_status_published_idx').on(table.status, table.publishedAt),
  authorIdIdx: index('articles_author_id_idx').on(table.authorId),
  searchVectorIdx: index('articles_search_vector_idx').using('gin', table.searchVector),
}));

export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
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
}, (table) => ({
  statusPublishedIdx: index('blog_posts_status_published_idx').on(table.status, table.publishedAt),
  categoryIdIdx: index('blog_posts_category_id_idx').on(table.categoryId),
  tagsIdx: index('blog_posts_tags_idx').using('gin', table.tags),
  searchVectorIdx: index('blog_posts_search_vector_idx').using('gin', table.searchVector),
}));

export const projects = pgTable('projects', {
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
  startDate: timestamp('start_date', { mode: 'date' }),
  endDate: timestamp('end_date', { mode: 'date' }),
  sortOrder: integer('sort_order').notNull().default(0),
  metaTitle: varchar('meta_title', { length: 120 }),
  metaDescription: varchar('meta_description', { length: 320 }),
  searchVector: tsvector('search_vector'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  statusSortIdx: index('projects_status_sort_idx').on(table.status, table.sortOrder),
  searchVectorIdx: index('projects_search_vector_idx').using('gin', table.searchVector),
}));

export const schoolSessions = pgTable('school_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 300 }).notNull(),
  slug: varchar('slug', { length: 320 }).notNull().unique(),
  schoolName: varchar('school_name', { length: 300 }).notNull(),
  sessionDate: timestamp('session_date', { mode: 'date' }).notNull(),
  description: text('description'),
  studentCount: integer('student_count'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  sortOrder: integer('sort_order').notNull().default(0),
  searchVector: tsvector('search_vector'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  dateIdx: index('school_sessions_date_idx').on(table.sessionDate),
  searchVectorIdx: index('school_sessions_search_vector_idx').using('gin', table.searchVector),
}));

export const sessionPhotos = pgTable('session_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => schoolSessions.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  altText: varchar('alt_text', { length: 300 }).default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  sessionSortIdx: index('session_photos_session_sort_idx').on(table.sessionId, table.sortOrder),
}));

export const teamMembers = pgTable('team_members', {
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
}, (table) => ({
  activeSortIdx: index('team_members_active_sort_idx').on(table.isActive, table.sortOrder),
}));

export const corePrinciples = pgTable('core_principles', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  iconName: varchar('icon_name', { length: 50 }),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const faqEntries = pgTable('faq_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  question: varchar('question', { length: 500 }).notNull(),
  answer: text('answer').notNull(),
  category: varchar('category', { length: 100 }).default('general'),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  searchVector: tsvector('search_vector'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  activeSortIdx: index('faq_entries_active_sort_idx').on(table.isActive, table.category, table.sortOrder),
  searchVectorIdx: index('faq_entries_search_vector_idx').using('gin', table.searchVector),
}));

// ══════════════════════════════════════════════
// MEDIA MODULE
// ══════════════════════════════════════════════

export const mediaFiles = pgTable('media_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  uploadedBy: uuid('uploaded_by').notNull().references(() => users.id, { onDelete: 'restrict' }),
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
}, (table) => ({
  uploadedByIdx: index('media_files_uploaded_by_idx').on(table.uploadedBy),
  mimeTypeIdx: index('media_files_mime_type_idx').on(table.mimeType),
  createdAtIdx: index('media_files_created_at_idx').on(table.createdAt),
}));

// ══════════════════════════════════════════════
// FORMS MODULE
// ══════════════════════════════════════════════

export const contactSubmissions = pgTable('contact_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 50 }).notNull(),
  message: text('message').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('new'),
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  statusIdx: index('contact_submissions_status_idx').on(table.status, table.createdAt),
  emailIdx: index('contact_submissions_email_idx').on(table.email),
}));

export const volunteerRegistrations = pgTable('volunteer_registrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 30 }),
  age: integer('age').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }),
  occupation: varchar('occupation', { length: 50 }).notNull(),
  interests: textArray('interests').notNull().default(sql`'{}'`),
  motivation: text('motivation'),
  status: varchar('status', { length: 20 }).notNull().default('new'),
  ipAddress: inet('ip_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  statusIdx: index('volunteer_registrations_status_idx').on(table.status, table.createdAt),
}));

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  subscribedAt: timestamp('subscribed_at', { withTimezone: true }).notNull().defaultNow(),
  unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true }),
  ipAddress: inet('ip_address'),
}, (table) => ({
  statusIdx: index('newsletter_subscribers_status_idx').on(table.status),
}));

// ══════════════════════════════════════════════
// SYSTEM MODULE
// ══════════════════════════════════════════════

export const settings = pgTable('settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value').notNull(),
  type: varchar('type', { length: 20 }).notNull().default('string'),
  group: varchar('group', { length: 50 }).notNull().default('general'),
  label: varchar('label', { length: 200 }),
  description: varchar('description', { length: 500 }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
}, (table) => ({
  groupIdx: index('settings_group_idx').on(table.group),
}));

export const auditLogs = pgTable('audit_logs', {
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
}, (table) => ({
  userIdIdx: index('audit_logs_user_id_idx').on(table.userId),
  entityIdx: index('audit_logs_entity_idx').on(table.entityType, table.entityId),
  actionIdx: index('audit_logs_action_idx').on(table.action),
  createdAtIdx: index('audit_logs_created_at_idx').on(table.createdAt),
}));
```

---

# 24. Risks & Technical Debt

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| R-01 | **Tags as TEXT[] may need normalization** if tag management grows (descriptions, merging, analytics) | Low | Migrate to `tags` + `blog_post_tags` junction table in V2.0 if needed |
| R-02 | **No version history** for content (only current state + audit log of field changes) | Medium | Accept for V1.0. Add `article_versions` table in V2.0 if content rollback is needed |
| R-03 | **Media referenced by URL string** (not FK) means orphan detection requires full-table scan | Low | Weekly orphan detection job. Move to FK-based `content_media` junction table if media count exceeds 5K |
| R-04 | **Single PostgreSQL instance** is a single point of failure | Medium | Railway provides automatic backups. Add read replica in V2.0 for redundancy |
| R-05 | **No Redis** means rate limiting state is per-process (resets on restart) | Low | Acceptable for < 10 concurrent admin users. Add Redis in V2.0 for distributed rate limiting |
| R-06 | **Rich text stored as HTML** means body content is tightly coupled to Tiptap editor output | Medium | Sanitize on write. If editor changes, write a migration script to transform HTML |
| R-07 | **No content scheduling** (publish at future date) | Low | Add `scheduled_publish_at` column + cron job in V1.2 if needed |
| R-08 | **UUID v4 (not v7)** if using PostgreSQL `gen_random_uuid()` — less optimal B-tree locality | Low | Generate UUIDs in application layer using `uuidv7` package for better index performance |
| R-09 | **Audit log growth** could reach 100K+ rows in 12 months with active usage | Low | Retention job deletes rows > 12 months. Partition by month if needed in V3.0 |
| R-10 | **No database connection pooling** (using `pg` pool directly) | Low | Sufficient for < 10 connections. Add PgBouncer when sustained connections exceed 20 |

---

# 25. Assumptions

| # | Assumption | Impact if Wrong |
|---|---|---|
| A-01 | Admin panel users will not exceed 10 in V1.0 | If more, need connection pooling and session management at scale |
| A-02 | Content will not exceed 500 articles + 500 blog posts in V1.0 | If more, evaluate full-text search performance and consider Meilisearch |
| A-03 | Media uploads will not exceed 2,000 files in V1.0 | If more, add folder organization and pagination to media library |
| A-04 | Tags do not need descriptions, analytics, or admin management beyond inline entry | If needed, migrate to junction table pattern |
| A-05 | Articles and blog posts are distinct content types (different templates, different listing pages) | If unified, merge into single `content` table with `type` column |
| A-06 | No public user authentication is needed in V1.0 | If member accounts needed, add `members` table + separate auth flow |
| A-07 | Categories are shared between articles and blog posts | If separate taxonomies needed, add a `type` column to categories |
| A-08 | Content versioning (rollback to previous version) is not needed in V1.0 | If needed, add `content_versions` table with full body snapshots |
| A-09 | All admin users use the same password policy (min 8 chars) | If different policies per role, add `password_policy` to settings |
| A-10 | RSS feed is generated from blog_posts only (not articles) | If articles should also appear in RSS, extend the feed query |
| A-11 | Newsletter subscribers are stored locally, not synced to an external ESP | If ESP integration needed (Mailchimp, Brevo), add sync job + external_id column |
| A-12 | The settings table is sufficient for site configuration (no need for a page builder or block editor) | If page builder needed, add `pages` + `page_blocks` tables |
| A-13 | Images are processed server-side (Sharp) on upload, not on demand | If on-demand processing needed (Cloudflare Images or Imgix), change to URL-based transformation |
| A-14 | The `inet` type for IP addresses is supported by Drizzle ORM's pg adapter | If not, fallback to `varchar(45)` for IPv6 compatibility |
| A-15 | PostgreSQL's `websearch_to_tsquery` is sufficient for user-facing search (handles OR, AND, NOT, phrase matching) | If users expect fuzzy/typo-tolerant search, add `pg_trgm` extension |
| A-16 | `sort_order` columns are managed manually by admin (drag-and-drop reordering) | If auto-sort needed (alphabetical, date), remove `sort_order` and sort by natural column |
| A-17 | The `CHECK` constraints on `status` and `role` columns are enforced at database level | Drizzle may not generate CHECK constraints automatically — verify and add via raw SQL migration if needed |
| A-18 | The application server (Express) handles at most 5 concurrent requests to PostgreSQL | If spikes occur, Railway's managed PostgreSQL handles connection queuing |

---

*End of Backend Schema Architecture*

*This document is the single source of truth for all database, API, and backend decisions. Any schema change must be reflected here before implementation.*
