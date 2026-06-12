# Technical Requirements Document (TRD)
## **THE NAGRIK** — Student-Led Civic Literacy Website
### Engineering Specification v1.0

| Field | Value |
|---|---|
| **Document Version** | 1.0 |
| **Date** | June 6, 2026 |
| **Author** | Engineering Team |
| **Source PRD** | PRD_TheNagrik.md v1.0 |
| **Classification** | Internal — Engineering |
| **Status** | Draft |

---

# 1. Technical Executive Summary

## 1.1 Product Type

Content-driven CRUD website for a non-profit civic literacy initiative. Static-first public frontend backed by a headless CMS API. Admin panel for content management. No real-time features, no public user accounts, no e-commerce in MVP.

## 1.2 Architecture Overview

**Decoupled monolith** — a Next.js frontend consuming a custom Node.js/Express REST API backed by PostgreSQL. This is NOT a microservices architecture. It is a single backend application with clean module separation, designed to be simple, maintainable, and deployable by a small team.

> [!IMPORTANT]
> **Architectural Decision: Custom Backend over Strapi.** While the PRD recommends Strapi v5, this TRD specifies a custom Node.js/Express backend. Reasoning: (1) Strapi's admin panel is generic and cannot match the tailored admin experience the PRD specifies (dashboard metrics, unified form inbox, audit logs). (2) A custom backend gives full control over API contracts, validation, and business logic. (3) The admin panel is built as part of the Next.js frontend (under `/admin` routes), eliminating a separate deployment. (4) Total entities are only 18 — Strapi's overhead is not justified. (5) Future features (donations, quizzes, volunteer portal) are easier to build on a custom backend.

## 1.3 Engineering Goals

| # | Goal |
|---|---|
| EG-1 | Ship MVP in 8 weeks with a team of 2–3 developers |
| EG-2 | Achieve Lighthouse score > 90 on all public pages |
| EG-3 | Enable non-technical team members to publish content in < 5 minutes |
| EG-4 | Maintain < $20/month infrastructure cost |
| EG-5 | Zero-downtime deployments from day one |
| EG-6 | Codebase understandable by a new developer within 1 day |

## 1.4 System Philosophy

1. **Simple over clever** — No abstractions that don't solve an immediate problem
2. **Static over dynamic** — Pre-render everything possible; API calls only when data is mutable
3. **Convention over configuration** — Consistent patterns across all modules
4. **Secure by default** — Every endpoint authenticated unless explicitly public
5. **Fail gracefully** — Every error state has a user-facing recovery path

## 1.5 Scalability Strategy

| Phase | Traffic | Strategy |
|---|---|---|
| MVP (0–6mo) | < 10K/mo | Single Vercel deployment + single Railway backend instance. SSG for all public pages. |
| Growth (6–12mo) | 10K–50K/mo | ISR with 60s revalidation. Add Redis cache for API responses. Move media to CDN. |
| Scale (12mo+) | 50K–200K/mo | Horizontal backend scaling on Railway. Dedicated PostgreSQL. Algolia for search. Consider edge functions for personalization. |

---

# 2. Recommended Tech Stack

## 2.1 Frontend

| Component | Technology | Why |
|---|---|---|
| **Framework** | **Next.js 15 (App Router)** | Server Components for zero-JS public pages; SSG/ISR for SEO; file-based routing eliminates boilerplate; Vercel-native deployment |
| **Language** | **TypeScript 5.x** | Catch bugs at compile time; self-documenting interfaces for API contracts; required for team > 1 dev |
| **Styling** | **CSS Modules + CSS Custom Properties** | No runtime CSS; scoped by default; design tokens via CSS variables; no Tailwind dependency = smaller bundle |
| **UI Components** | **Custom component library** | 18 entities with consistent card/form/table patterns; building custom is faster than adapting a generic library for this scope |
| **Form Handling** | **React Hook Form v7** | Uncontrolled components for performance; built-in validation; minimal re-renders on 10+ field forms |
| **Validation** | **Zod** | Schema-first validation shared between client and server; TypeScript type inference; composable schemas |
| **Animation** | **CSS transitions + Framer Motion (lightweight)** | CSS for simple hover/fade; Framer Motion only for scroll-triggered animations and page transitions |
| **Rich Text Editor** | **Tiptap v2** | Headless, React-native, extensible; better DX than TinyMCE/CKEditor; built-in image/link/list extensions |
| **Data Fetching** | **Next.js `fetch` + SWR** | Server-side: native `fetch` with caching. Client-side (admin): SWR for stale-while-revalidate UX |
| **SEO** | **Next.js Metadata API** | Dynamic `generateMetadata()` per route; automatic sitemap generation via `next-sitemap`; JSON-LD structured data |
| **Icons** | **Lucide React** | Tree-shakeable; 1,500+ icons; consistent stroke style matching Cool Sophistication palette |

## 2.2 Backend

| Component | Technology | Why |
|---|---|---|
| **Runtime** | **Node.js 22 LTS** | JavaScript ecosystem consistency with frontend; async I/O ideal for CRUD + email operations; largest package ecosystem |
| **Framework** | **Express.js 5** | Minimal, battle-tested, zero-opinion; for 18 entities with CRUD, Express is sufficient — NestJS is overkill; 1.5M weekly downloads |
| **Language** | **TypeScript 5.x** | Shared types with frontend; compile-time safety; better DX than plain JS |
| **ORM** | **Drizzle ORM** | TypeScript-first; SQL-like API (no magic); excellent PostgreSQL support; migration generation; ~10x lighter than Prisma |
| **Validation** | **Zod** | Same schemas as frontend; consistent validation; API request body parsing |
| **API Style** | **REST (JSON)** | CRUD-heavy application; GraphQL is unnecessary complexity for 18 entities; REST is sufficient and simpler to cache |
| **Authentication** | **Custom JWT** | `jsonwebtoken` + `bcryptjs`; access token (15min) + refresh token (7d); no OAuth needed (admin-only auth) |
| **File Processing** | **Sharp** | Image resize, WebP conversion, thumbnail generation on upload; C++ bindings for speed |
| **Email** | **Resend SDK** | Transactional emails; React-based templates; 3,000 emails/month free tier; simple API |
| **Logging** | **Pino** | Fastest Node.js logger; structured JSON output; log levels; production-ready |
| **Rate Limiting** | **express-rate-limit** | In-memory for MVP; Redis-backed for scale; per-IP and per-endpoint configuration |

## 2.3 Database

| Component | Technology | Why |
|---|---|---|
| **Database** | **PostgreSQL 16** | ACID compliance for content integrity; `uuid-ossp` for UUIDs; `tsvector` for full-text search (eliminates Fuse.js/Algolia for MVP); JSON columns for flexible fields; free and open-source |
| **Hosting** | **Railway managed PostgreSQL** | Automated backups; zero-config SSL; scaling without migration; $5/month starter |
| **Migrations** | **Drizzle Kit** | Schema-driven migrations; TypeScript migration files; push/pull workflow |

### Why PostgreSQL over alternatives

| Option | Verdict |
|---|---|
| MySQL | Lacks native UUID generation, weaker JSON support, no full-text search vector types |
| MongoDB | Schema-less is wrong for 18 well-defined entities; no native joins; ACID only at document level |
| SQLite | Not suitable for concurrent API access; no managed hosting options |
| Supabase (Postgres) | Adds unnecessary real-time layer and auth overhead; direct PostgreSQL is simpler |

## 2.4 Authentication

| Component | Implementation |
|---|---|
| **Strategy** | JWT (access + refresh tokens) |
| **Access Token** | 15-minute expiry; stored in memory (frontend) |
| **Refresh Token** | 7-day expiry; stored in HTTP-only, Secure, SameSite=Strict cookie |
| **Password Hashing** | bcryptjs with 12 salt rounds |
| **RBAC** | 3 roles: `super_admin`, `admin`, `editor` — enforced via middleware |
| **Session Management** | Stateless JWT; refresh token rotation on use; invalidation via database blocklist |

## 2.5 Storage

| Type | Service | Why |
|---|---|---|
| **Images/Media** | **Cloudflare R2** | S3-compatible API; zero egress fees (critical for image-heavy NGO site); $0.015/GB storage; free 10M reads/month |
| **Documents (PDF)** | **Cloudflare R2** | Same bucket; separate `/documents/` prefix |
| **Backups** | **Cloudflare R2** | Separate bucket; lifecycle rules for 30-day retention |

## 2.6 Deployment

| Component | Service | Why |
|---|---|---|
| **Frontend Hosting** | **Vercel** (Hobby → Pro) | Native Next.js support; automatic SSG/ISR; global edge network; preview deployments per PR; free tier covers MVP |
| **Backend Hosting** | **Railway** | Docker-based deployment; managed PostgreSQL add-on; auto-scaling; $5/month starter; sleep-on-idle for cost savings |
| **CDN** | **Cloudflare** (free tier) | Global CDN for R2 media; DDoS protection; DNS management; edge caching rules |
| **DNS** | **Cloudflare** | Free DNS; automatic HTTPS; proxy for DDoS protection |
| **SSL** | **Automatic** | Vercel auto-SSL for frontend; Railway auto-SSL for API; Cloudflare edge certificates |
| **Environments** | `development` → `staging` → `production` | Environment variables per environment; preview deployments for staging |

---

# 3. System Architecture

## 3.1 Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERNET                                  │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE (DNS + CDN)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ DNS Routing   │  │ DDoS Shield  │  │ Edge Caching (media) │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└───────┬──────────────────────┬──────────────────────────────────┘
        │                      │
        ▼                      ▼
┌──────────────┐      ┌──────────────────┐
│   VERCEL     │      │  CLOUDFLARE R2   │
│  (Frontend)  │      │  (Media Storage) │
│              │      │                  │
│  Next.js 15  │      │  /images/        │
│  App Router  │      │  /documents/     │
│              │      │  /thumbnails/    │
│  SSG Pages   │      └──────────────────┘
│  ISR Pages   │               ▲
│  Admin SPA   │               │ (upload)
│              │               │
└──────┬───────┘      ┌───────┴──────────┐
       │              │                  │
       │  (API calls) │   RAILWAY        │
       └──────────────►  (Backend)       │
                      │                  │
                      │  Node.js 22      │
                      │  Express.js 5    │
                      │  TypeScript      │
                      │                  │
                      └──────┬───────────┘
                             │
               ┌─────────────┼─────────────┐
               │             │             │
               ▼             ▼             ▼
      ┌──────────────┐ ┌──────────┐ ┌──────────┐
      │ PostgreSQL 16│ │  Resend  │ │  Google  │
      │  (Railway)   │ │  (Email) │ │Analytics │
      │              │ │          │ │   (GA4)  │
      │  18 Tables   │ │  Form    │ │          │
      │  Full-text   │ │  confirm │ │  Client  │
      │  search      │ │  Alerts  │ │  side    │
      └──────────────┘ │  Reset   │ └──────────┘
                       └──────────┘
```

## 3.2 Request Flow — Public Page (SSG)

```
User → Cloudflare CDN → Vercel Edge → Pre-rendered HTML (< 50ms)
                                     ↓ (if ISR stale)
                              Next.js Server → Backend API → PostgreSQL
                                     ↓
                              Re-render & Cache (background)
```

## 3.3 Request Flow — Admin Action (SPA)

```
Admin Browser → Vercel (/admin) → Client-side React SPA
                                         ↓
                                    SWR fetch()
                                         ↓
                           Backend API (Railway) [JWT auth]
                                    ↓         ↓
                              PostgreSQL   Cloudflare R2
                                    ↓
                              Response → SWR cache → UI update
```

## 3.4 Request Flow — Public Form Submission

```
Visitor → Contact Form → POST /api/v1/contact
                              ↓
                     Rate limit check (IP)
                              ↓
                     Honeypot validation
                              ↓
                     Zod schema validation
                              ↓
                     PostgreSQL INSERT
                              ↓
                  ┌───────────┴───────────┐
                  ↓                       ↓
           Resend email              Response 201
           (admin notify)            {success: true}
```

---

# 4. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                               │
│                                                                      │
│  ┌────────────────────────────┐  ┌────────────────────────────┐     │
│  │     PUBLIC WEBSITE         │  │      ADMIN PANEL           │     │
│  │     (SSG / ISR)            │  │      (CSR / SPA)           │     │
│  │                            │  │                            │     │
│  │  Home, About, Learn,      │  │  Dashboard, Content CRUD,  │     │
│  │  Projects, Schools,       │  │  Media Library, Forms,     │     │
│  │  Blog, Join Us, FAQ       │  │  Users, Settings, Logs     │     │
│  │                            │  │                            │     │
│  │  Next.js 15 App Router    │  │  Next.js 15 App Router    │     │
│  │  Server Components        │  │  Client Components        │     │
│  └────────────┬───────────────┘  └───────────┬────────────────┘     │
│               │ (build-time fetch)             │ (runtime fetch)     │
└───────────────┼────────────────────────────────┼─────────────────────┘
                │                                │
                ▼                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           API LAYER                                  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Express.js 5 REST API                      │   │
│  │                    /api/v1/*                                   │   │
│  │                                                               │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │   │
│  │  │  Auth    │ │  Rate    │ │  CORS    │ │  Logger  │       │   │
│  │  │Middleware│ │ Limiter  │ │ Config   │ │  (Pino)  │       │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │   │
│  │                                                               │   │
│  │  ┌─────────────────────────────────────────────────────┐     │   │
│  │  │                   ROUTE MODULES                      │     │   │
│  │  │                                                      │     │   │
│  │  │  /auth  /blog  /articles  /categories  /projects    │     │   │
│  │  │  /schools  /team  /contact  /volunteers  /newsletter│     │   │
│  │  │  /faq  /media  /search  /users  /settings  /audit   │     │   │
│  │  └─────────────────────────────────────────────────────┘     │   │
│  │                          │                                    │   │
│  │              ┌───────────┼───────────┐                       │   │
│  │              ▼           ▼           ▼                       │   │
│  │         Controller → Service → Repository                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────┬──────────────────┬────────────────────────────┘
                      │                  │
                      ▼                  ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│     DATA LAYER           │  │    EXTERNAL SERVICES     │
│                          │  │                          │
│  ┌────────────────────┐  │  │  ┌──────────────────┐   │
│  │   PostgreSQL 16    │  │  │  │   Cloudflare R2  │   │
│  │                    │  │  │  │   (Media Files)  │   │
│  │   18 Tables        │  │  │  └──────────────────┘   │
│  │   Drizzle ORM      │  │  │                          │
│  │   Full-text Search │  │  │  ┌──────────────────┐   │
│  └────────────────────┘  │  │  │     Resend       │   │
│                          │  │  │  (Transactional   │   │
│                          │  │  │   Email)          │   │
│                          │  │  └──────────────────┘   │
│                          │  │                          │
│                          │  │  ┌──────────────────┐   │
│                          │  │  │   Google GA4     │   │
│                          │  │  │   (Analytics)    │   │
│                          │  │  └──────────────────┘   │
└──────────────────────────┘  └──────────────────────────┘
```

---

# 5. Module Breakdown

## 5.1 Module Overview

| # | Module | Priority | Frontend | Backend | DB Tables |
|---|---|---|---|---|---|
| M-01 | Homepage | P0 | SSG page with ISR | Aggregate API for featured content | Settings |
| M-02 | Navigation & Footer | P0 | Shared layout component | Settings API for social links | Settings |
| M-03 | About | P0 | SSG page | CRUD for core principles, team | CorePrinciples, TeamMembers |
| M-04 | Learn (Categories + Articles) | P0 | SSG + ISR for categories/articles | Full CRUD + search | Categories, Articles |
| M-05 | Projects | P0 | SSG + ISR | Full CRUD | Projects |
| M-06 | Schools | P0 | SSG + ISR | CRUD + photo upload | SchoolSessions, SessionPhotos |
| M-07 | Blog | P0 | SSG + ISR with pagination | Full CRUD + tags | BlogPosts, BlogTags |
| M-08 | Join Us / Contact | P0 | Static page + client form | Form submission + email | ContactSubmissions |
| M-09 | Volunteer Registration | P1 | Client form | Form submission + status mgmt | VolunteerRegistrations |
| M-10 | Newsletter | P1 | Footer widget (client) | Subscribe/unsubscribe | NewsletterSubscribers |
| M-11 | Search | P1 | Search results page | PostgreSQL full-text search | — (queries existing tables) |
| M-12 | FAQ | P2 | SSG page with accordion | CRUD | FAQEntries |
| M-13 | Admin Dashboard | P1 | CSR admin page | Aggregate metrics API | — (queries existing tables) |
| M-14 | Admin — Content Management | P0 | CSR forms + rich text editor | CRUD APIs for all content types | All content tables |
| M-15 | Admin — Media Library | P1 | CSR grid + upload | Upload to R2 + metadata CRUD | Media |
| M-16 | Admin — Form Management | P1 | CSR inbox view | Read/status/export APIs | Contact, Volunteer, Newsletter |
| M-17 | Admin — User Management | P1 | CSR user list + forms | CRUD + role assignment | Users |
| M-18 | Admin — Settings | P1 | CSR settings forms | Key-value CRUD | Settings |
| M-19 | Admin — Audit Logs | P2 | CSR log viewer | Read-only log API | AuditLogs |
| M-20 | Auth | P0 | Login page | JWT login/refresh/reset | Users |
| M-21 | SEO | P0 | Metadata API + JSON-LD | Sitemap generation | — |

## 5.2 Module Detail — Learn (M-04, representative example)

### Purpose
Central content hub delivering structured civic literacy content across 9+ categories with articles.

### Frontend
- **`/learn`** — SSG page; grid of category cards with icons fetched at build time
- **`/learn/[category-slug]`** — ISR page (60s revalidation); article list with pagination
- **`/learn/[category-slug]/[article-slug]`** — ISR page; full article with breadcrumb, related articles, share buttons
- Components: `CategoryCard`, `ArticleCard`, `ArticleContent`, `Breadcrumb`, `ShareButtons`, `RelatedArticles`, `ReadingTime`

### Backend
- **Controller**: `articles.controller.ts` — route handlers
- **Service**: `articles.service.ts` — business logic (read time calculation, related articles query, slug generation)
- **Repository**: `articles.repository.ts` — Drizzle queries

### Database Tables
- `categories` — parent table
- `articles` — content with `category_id` FK

### API Endpoints
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/categories` | Public | List all categories with article counts |
| GET | `/api/v1/categories/:slug` | Public | Get single category |
| GET | `/api/v1/articles` | Public | List articles (paginated, filter by category) |
| GET | `/api/v1/articles/:slug` | Public | Get single article with author, category |
| GET | `/api/v1/articles/:slug/related` | Public | Get up to 3 related articles |
| POST | `/api/v1/categories` | Admin+ | Create category |
| PUT | `/api/v1/categories/:id` | Admin+ | Update category |
| DELETE | `/api/v1/categories/:id` | Admin+ | Delete category (check for articles) |
| POST | `/api/v1/articles` | Editor+ | Create article (draft) |
| PUT | `/api/v1/articles/:id` | Editor+ | Update article |
| PATCH | `/api/v1/articles/:id/status` | Admin+ | Publish/archive article |
| DELETE | `/api/v1/articles/:id` | Admin+ | Soft-delete article |

### Validation (Zod schemas)
```typescript
const createArticleSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(100),
  categoryId: z.string().uuid(),
  featuredImageUrl: z.string().url().optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  publishDate: z.string().datetime().optional(),
});
```

### Dependencies
- Categories must exist before articles can be created
- Author (user) must exist and be authenticated
- Media library for featured image uploads

> [!NOTE]
> All other modules follow this same structure. The remaining modules are documented via the API Design (Section 7), Database Schema (Section 6), and Frontend Architecture (Section 11) sections to avoid redundancy.

---

# 6. Database Design

## 6.1 Design Principles

- **UUIDs** for all primary keys (`uuid_generate_v4()`) — no sequential IDs exposed
- **Soft deletes** via `deleted_at TIMESTAMP NULL` on content tables
- **Timestamps** on all tables: `created_at`, `updated_at` (auto-managed by Drizzle)
- **Slugs** as unique, URL-safe identifiers: auto-generated from title, editable, validated format
- **Enums** as PostgreSQL native enums (not string columns)
- **Indexes** on all foreign keys, slugs, status fields, and full-text search vectors

## 6.2 Complete Schema

### `users`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT uuid_generate_v4() | |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL | Login identifier |
| `name` | `VARCHAR(100)` | NOT NULL | Display name |
| `password_hash` | `VARCHAR(255)` | NOT NULL | bcrypt hash |
| `role` | `user_role` ENUM | NOT NULL, DEFAULT 'editor' | super_admin, admin, editor |
| `status` | `user_status` ENUM | NOT NULL, DEFAULT 'active' | active, inactive |
| `refresh_token_hash` | `VARCHAR(255)` | NULL | Hashed refresh token for rotation |
| `failed_login_attempts` | `INT` | DEFAULT 0 | Lockout tracking |
| `locked_until` | `TIMESTAMP` | NULL | Account lockout expiry |
| `last_login_at` | `TIMESTAMP` | NULL | |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |

**Indexes**: `UNIQUE(email)`, `INDEX(role)`, `INDEX(status)`

---

### `categories`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `name` | `VARCHAR(100)` | NOT NULL | Display name |
| `slug` | `VARCHAR(120)` | UNIQUE, NOT NULL | URL slug |
| `description` | `TEXT` | NULL | Short description |
| `icon_url` | `VARCHAR(500)` | NULL | Path to icon in R2 |
| `sort_order` | `INT` | NOT NULL, DEFAULT 0 | Display ordering |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |

**Indexes**: `UNIQUE(slug)`, `INDEX(sort_order)`

---

### `articles`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `title` | `VARCHAR(200)` | NOT NULL | |
| `slug` | `VARCHAR(220)` | UNIQUE, NOT NULL | |
| `body` | `TEXT` | NOT NULL | Rich text (HTML) |
| `category_id` | `UUID` | FK → categories.id, NOT NULL | |
| `featured_image_url` | `VARCHAR(500)` | NULL | |
| `author_id` | `UUID` | FK → users.id, NOT NULL | |
| `status` | `content_status` ENUM | NOT NULL, DEFAULT 'draft' | draft, published, archived |
| `publish_date` | `TIMESTAMP` | NULL | Null = not yet published |
| `meta_title` | `VARCHAR(70)` | NULL | SEO title |
| `meta_description` | `VARCHAR(160)` | NULL | SEO description |
| `og_image_url` | `VARCHAR(500)` | NULL | |
| `read_time_minutes` | `INT` | NOT NULL, DEFAULT 1 | Calculated on save |
| `search_vector` | `TSVECTOR` | NULL | PostgreSQL full-text search |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | `TIMESTAMP` | NULL | Soft delete |

**Indexes**: `UNIQUE(slug)`, `INDEX(category_id)`, `INDEX(author_id)`, `INDEX(status)`, `INDEX(publish_date DESC)`, `GIN(search_vector)`

**Trigger**: Auto-update `search_vector` on INSERT/UPDATE:
```sql
search_vector = to_tsvector('english', coalesce(title,'') || ' ' || coalesce(body,''))
```

---

### `blog_posts`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `title` | `VARCHAR(200)` | NOT NULL | |
| `slug` | `VARCHAR(220)` | UNIQUE, NOT NULL | |
| `body` | `TEXT` | NOT NULL | Rich text (HTML) |
| `excerpt` | `VARCHAR(300)` | NULL | Auto-generated if empty |
| `featured_image_url` | `VARCHAR(500)` | NULL | |
| `author_id` | `UUID` | FK → users.id, NOT NULL | |
| `category_id` | `UUID` | FK → categories.id, NULL | Optional category |
| `status` | `content_status` ENUM | NOT NULL, DEFAULT 'draft' | |
| `publish_date` | `TIMESTAMP` | NULL | |
| `meta_title` | `VARCHAR(70)` | NULL | |
| `meta_description` | `VARCHAR(160)` | NULL | |
| `og_image_url` | `VARCHAR(500)` | NULL | |
| `read_time_minutes` | `INT` | NOT NULL, DEFAULT 1 | |
| `search_vector` | `TSVECTOR` | NULL | |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | `TIMESTAMP` | NULL | |

**Indexes**: Same pattern as `articles`

---

### `blog_tags`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `blog_post_id` | `UUID` | FK → blog_posts.id, ON DELETE CASCADE | |
| `tag` | `VARCHAR(50)` | NOT NULL | Lowercase, trimmed |

**Indexes**: `INDEX(blog_post_id)`, `INDEX(tag)`, `UNIQUE(blog_post_id, tag)`

---

### `projects`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `title` | `VARCHAR(200)` | NOT NULL | |
| `slug` | `VARCHAR(220)` | UNIQUE, NOT NULL | |
| `short_description` | `VARCHAR(300)` | NOT NULL | Card display |
| `full_description` | `TEXT` | NULL | Rich text for project page |
| `status` | `project_status` ENUM | NOT NULL | active, coming_soon, launching, completed |
| `cta_label` | `VARCHAR(50)` | NULL | e.g., "Take Survey" |
| `cta_url` | `VARCHAR(500)` | NULL | External link |
| `thumbnail_url` | `VARCHAR(500)` | NULL | |
| `launch_date` | `DATE` | NULL | |
| `sort_order` | `INT` | NOT NULL, DEFAULT 0 | |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |

**Indexes**: `UNIQUE(slug)`, `INDEX(status)`, `INDEX(sort_order)`

---

### `school_sessions`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `title` | `VARCHAR(200)` | NOT NULL | |
| `school_name` | `VARCHAR(200)` | NOT NULL | |
| `session_date` | `DATE` | NOT NULL | |
| `description` | `TEXT` | NULL | Write-up |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |

**Indexes**: `INDEX(session_date DESC)`

---

### `session_photos`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `session_id` | `UUID` | FK → school_sessions.id, ON DELETE CASCADE | |
| `photo_url` | `VARCHAR(500)` | NOT NULL | R2 URL |
| `alt_text` | `VARCHAR(200)` | NULL | Accessibility |
| `sort_order` | `INT` | NOT NULL, DEFAULT 0 | |

**Indexes**: `INDEX(session_id)`

**Constraint**: Application-level: max 10 photos per session

---

### `team_members`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `name` | `VARCHAR(100)` | NOT NULL | |
| `role` | `VARCHAR(150)` | NOT NULL | Position title |
| `bio` | `TEXT` | NULL | |
| `photo_url` | `VARCHAR(500)` | NULL | |
| `linkedin_url` | `VARCHAR(500)` | NULL | |
| `sort_order` | `INT` | NOT NULL, DEFAULT 0 | |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT true | |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |

**Indexes**: `INDEX(is_active)`, `INDEX(sort_order)`

---

### `core_principles`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `title` | `VARCHAR(100)` | NOT NULL | |
| `description` | `TEXT` | NOT NULL | |
| `icon_identifier` | `VARCHAR(50)` | NOT NULL | Lucide icon name |
| `sort_order` | `INT` | NOT NULL, DEFAULT 0 | |

---

### `contact_submissions`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `name` | `VARCHAR(200)` | NOT NULL | |
| `email` | `VARCHAR(255)` | NOT NULL | |
| `subject` | `contact_subject` ENUM | NOT NULL | general, partnership, volunteer, media, other |
| `message` | `TEXT` | NOT NULL | |
| `status` | `submission_status` ENUM | NOT NULL, DEFAULT 'new' | new, read, responded, archived |
| `ip_address` | `INET` | NULL | For rate limiting; anonymized on export |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |

**Indexes**: `INDEX(status)`, `INDEX(created_at DESC)`

---

### `volunteer_registrations`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `name` | `VARCHAR(200)` | NOT NULL | |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | Prevent duplicates |
| `phone` | `VARCHAR(15)` | NULL | Indian format |
| `age` | `INT` | NOT NULL | CHECK (age >= 14 AND age <= 99) |
| `city_state` | `VARCHAR(200)` | NOT NULL | |
| `occupation` | `VARCHAR(50)` | NOT NULL | |
| `areas_of_interest` | `JSONB` | NOT NULL, DEFAULT '[]' | Array of strings |
| `motivation` | `TEXT` | NULL | Max 500 chars (app-level) |
| `status` | `volunteer_status` ENUM | NOT NULL, DEFAULT 'new' | new, contacted, accepted, rejected |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |

**Indexes**: `UNIQUE(email)`, `INDEX(status)`, `INDEX(created_at DESC)`

---

### `newsletter_subscribers`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL | |
| `source_page` | `VARCHAR(100)` | NULL | Which page they subscribed from |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT true | |
| `unsubscribe_token` | `VARCHAR(64)` | UNIQUE, NOT NULL | For unsubscribe links |
| `subscribed_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |
| `unsubscribed_at` | `TIMESTAMP` | NULL | |

**Indexes**: `UNIQUE(email)`, `INDEX(is_active)`

---

### `faq_entries`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `question` | `VARCHAR(300)` | NOT NULL | |
| `answer` | `TEXT` | NOT NULL | Rich text (max 2000 chars app-level) |
| `section` | `VARCHAR(100)` | NOT NULL | Grouping label |
| `sort_order` | `INT` | NOT NULL, DEFAULT 0 | |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT true | |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |

---

### `media`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `filename` | `VARCHAR(255)` | NOT NULL | Stored filename (UUID-based) |
| `original_filename` | `VARCHAR(255)` | NOT NULL | User's original filename |
| `url` | `VARCHAR(500)` | NOT NULL | Full R2 URL |
| `thumbnail_url` | `VARCHAR(500)` | NULL | Generated thumbnail |
| `mime_type` | `VARCHAR(100)` | NOT NULL | |
| `size_bytes` | `INT` | NOT NULL | |
| `width` | `INT` | NULL | Image dimensions |
| `height` | `INT` | NULL | |
| `alt_text` | `VARCHAR(200)` | NULL | |
| `title` | `VARCHAR(200)` | NULL | |
| `caption` | `TEXT` | NULL | |
| `uploaded_by` | `UUID` | FK → users.id, NOT NULL | |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |

**Indexes**: `INDEX(uploaded_by)`, `INDEX(mime_type)`, `INDEX(created_at DESC)`

---

### `settings`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `key` | `VARCHAR(100)` | PK | Dot-notation: `general.site_title` |
| `value` | `TEXT` | NOT NULL | JSON-stringified value |
| `group` | `VARCHAR(50)` | NOT NULL | general, seo, social, contact, analytics |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |

**Indexes**: `INDEX(group)`

---

### `audit_logs`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `user_id` | `UUID` | FK → users.id, NOT NULL | Who performed action |
| `action` | `VARCHAR(20)` | NOT NULL | create, update, delete, publish, archive, login |
| `entity_type` | `VARCHAR(50)` | NOT NULL | Table name: articles, blog_posts, etc. |
| `entity_id` | `UUID` | NULL | NULL for login events |
| `changes` | `JSONB` | NULL | `{before: {...}, after: {...}}` |
| `ip_address` | `INET` | NULL | |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | |

**Indexes**: `INDEX(user_id)`, `INDEX(entity_type)`, `INDEX(action)`, `INDEX(created_at DESC)`

**Retention**: Partition by month; drop partitions older than 12 months (cron job).

## 6.3 Enum Definitions (PostgreSQL)

```sql
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'editor');
CREATE TYPE user_status AS ENUM ('active', 'inactive');
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE project_status AS ENUM ('active', 'coming_soon', 'launching', 'completed');
CREATE TYPE contact_subject AS ENUM ('general', 'partnership', 'volunteer', 'media', 'other');
CREATE TYPE submission_status AS ENUM ('new', 'read', 'responded', 'archived');
CREATE TYPE volunteer_status AS ENUM ('new', 'contacted', 'accepted', 'rejected');
```

## 6.4 Full-Text Search Strategy

PostgreSQL's built-in `tsvector` + `tsquery` eliminates the need for Fuse.js or Algolia in MVP:

```sql
-- Search across articles and blog posts
SELECT id, title, slug, 'article' as type,
       ts_rank(search_vector, query) AS rank
FROM articles, to_tsquery('english', 'constitution & rights') AS query
WHERE search_vector @@ query AND status = 'published'
UNION ALL
SELECT id, title, slug, 'blog_post' as type,
       ts_rank(search_vector, query) AS rank
FROM blog_posts, to_tsquery('english', 'constitution & rights') AS query
WHERE search_vector @@ query AND status = 'published'
ORDER BY rank DESC
LIMIT 20;
```

---

# 7. API Design

## 7.1 Global Conventions

| Convention | Specification |
|---|---|
| **Base URL** | `https://api.thenagrik.org/api/v1` |
| **Content-Type** | `application/json` (all requests and responses) |
| **File Upload** | `multipart/form-data` (media endpoint only) |
| **Versioning** | URL path: `/api/v1/` |
| **Pagination** | Query params: `?page=1&per_page=10` (max 100) |
| **Sorting** | `?sort=created_at&order=desc` |
| **Filtering** | `?status=published&category=constitution` |
| **Search** | `?q=search+term` |
| **Date Format** | ISO 8601: `2026-06-06T17:30:00Z` |
| **ID Format** | UUID v4 |

## 7.2 Standard Response Envelope

```typescript
// Success
{
  "success": true,
  "data": T | T[],
  "meta": {
    "page": number,
    "per_page": number,
    "total": number,
    "total_pages": number
  } | null
}

// Error
{
  "success": false,
  "error": {
    "code": string,       // VALIDATION_ERROR, NOT_FOUND, UNAUTHORIZED, etc.
    "message": string,    // Human-readable message
    "details": Array<{
      "field": string,
      "message": string
    }> | null
  }
}
```

## 7.3 Error Codes

| HTTP Status | Error Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Request body fails Zod schema |
| 401 | `UNAUTHORIZED` | Missing or expired JWT |
| 403 | `FORBIDDEN` | Role lacks permission |
| 404 | `NOT_FOUND` | Entity doesn't exist or is soft-deleted |
| 409 | `CONFLICT` | Duplicate slug, email, etc. |
| 429 | `RATE_LIMITED` | Too many requests from IP |
| 500 | `INTERNAL_ERROR` | Unhandled server error |

## 7.4 Complete Endpoint Registry

> [!NOTE]
> Access levels: **Public** = no auth, **Editor+** = editor, admin, super_admin, **Admin+** = admin, super_admin, **SuperAdmin** = super_admin only.

### Auth Module
| Method | Endpoint | Access | Request Body | Response |
|---|---|---|---|---|
| POST | `/auth/login` | Public | `{email, password}` | `{accessToken, user}` + refresh cookie |
| POST | `/auth/logout` | Editor+ | — | `{success: true}` + clear cookie |
| POST | `/auth/refresh` | Public (cookie) | — | `{accessToken}` |
| POST | `/auth/forgot-password` | Public | `{email}` | `{success: true}` (always, no leak) |
| POST | `/auth/reset-password` | Public | `{token, newPassword}` | `{success: true}` |
| GET | `/auth/me` | Editor+ | — | `{user}` |

### Categories
| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/categories` | Public | Includes `article_count` per category |
| GET | `/categories/:slug` | Public | |
| POST | `/categories` | Admin+ | |
| PUT | `/categories/:id` | Admin+ | |
| DELETE | `/categories/:id` | Admin+ | Fails if articles exist |

### Articles
| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/articles` | Public | `?category=slug&page=1&per_page=9&status=published` |
| GET | `/articles/:slug` | Public | Includes author, category; only published |
| GET | `/articles/:slug/related` | Public | Up to 3 from same category |
| POST | `/articles` | Editor+ | Creates as draft |
| PUT | `/articles/:id` | Editor+ | |
| PATCH | `/articles/:id/status` | Admin+ | `{status: 'published'}` |
| DELETE | `/articles/:id` | Admin+ | Soft delete |

### Blog Posts
| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/blog` | Public | `?category=slug&tag=string&page=1&per_page=9` |
| GET | `/blog/:slug` | Public | Only published |
| GET | `/blog/:slug/related` | Public | Up to 3 |
| POST | `/blog` | Editor+ | Creates as draft |
| PUT | `/blog/:id` | Editor+ | |
| PATCH | `/blog/:id/status` | Admin+ | |
| DELETE | `/blog/:id` | Admin+ | Soft delete |

### Projects
| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/projects` | Public | Sorted by sort_order |
| GET | `/projects/:slug` | Public | |
| POST | `/projects` | Admin+ | |
| PUT | `/projects/:id` | Admin+ | |
| DELETE | `/projects/:id` | Admin+ | |

### School Sessions
| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/schools/sessions` | Public | `?page=1&per_page=10` DESC by date |
| GET | `/schools/sessions/:id` | Public | Includes photos array |
| POST | `/schools/sessions` | Editor+ | |
| PUT | `/schools/sessions/:id` | Editor+ | |
| DELETE | `/schools/sessions/:id` | Admin+ | Cascades photos |
| POST | `/schools/sessions/:id/photos` | Editor+ | `multipart/form-data`, max 10 |
| DELETE | `/schools/sessions/:id/photos/:photoId` | Editor+ | |

### Team Members
| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/team` | Public | `is_active=true`, sorted by sort_order |
| POST | `/team` | Admin+ | |
| PUT | `/team/:id` | Admin+ | |
| DELETE | `/team/:id` | Admin+ | |

### Contact
| Method | Endpoint | Access | Notes |
|---|---|---|---|
| POST | `/contact` | Public | Rate limited: 3/hr per IP. Honeypot field. |
| GET | `/contact/submissions` | Admin+ | `?status=new&page=1` |
| PATCH | `/contact/submissions/:id` | Admin+ | `{status: 'read'}` |
| DELETE | `/contact/submissions/:id` | Admin+ | Hard delete |
| GET | `/contact/export` | Admin+ | Returns CSV |

### Volunteers
| Method | Endpoint | Access | Notes |
|---|---|---|---|
| POST | `/volunteers` | Public | Rate limited: 1/hr per email |
| GET | `/volunteers` | Admin+ | `?status=new&occupation=college_student` |
| PATCH | `/volunteers/:id` | Admin+ | `{status: 'contacted'}` |
| DELETE | `/volunteers/:id` | Admin+ | Hard delete |
| GET | `/volunteers/export` | Admin+ | CSV |

### Newsletter
| Method | Endpoint | Access | Notes |
|---|---|---|---|
| POST | `/newsletter/subscribe` | Public | Rate limited |
| POST | `/newsletter/unsubscribe` | Public | `{token}` — unsubscribe token |
| GET | `/newsletter/subscribers` | Admin+ | |
| GET | `/newsletter/export` | Admin+ | CSV |

### FAQ
| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/faq` | Public | Grouped by section, sorted |
| POST | `/faq` | Editor+ | |
| PUT | `/faq/:id` | Editor+ | |
| DELETE | `/faq/:id` | Admin+ | |

### Media
| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/media` | Editor+ | `?mime_type=image&q=search` |
| POST | `/media` | Editor+ | `multipart/form-data`; Sharp processing |
| PUT | `/media/:id` | Editor+ | Metadata only (alt, title, caption) |
| DELETE | `/media/:id` | Admin+ | Deletes from R2 |

### Search
| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/search` | Public | `?q=term&type=article,blog_post` |

### Users
| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/users` | SuperAdmin | |
| POST | `/users` | SuperAdmin | |
| PUT | `/users/:id` | SuperAdmin | |
| DELETE | `/users/:id` | SuperAdmin | Cannot delete last super_admin |

### Settings
| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/settings` | Admin+ | Grouped by group |
| PUT | `/settings` | SuperAdmin | Batch update `{key: value}` pairs |

### Audit Logs
| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/audit-logs` | SuperAdmin | `?user_id=&action=&entity_type=&from=&to=` |

### Dashboard (Admin)
| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/dashboard/stats` | Editor+ | Aggregate counts |
| GET | `/dashboard/activity` | Editor+ | Last 20 audit log entries |

---

# 8. Authentication & Authorization

## 8.1 Login Flow

```
1. POST /auth/login {email, password}
2. Server: Validate credentials → bcrypt.compare()
3. Server: Check account status (active, not locked)
4. Server: Generate access token (JWT, 15min) + refresh token (UUID, 7d)
5. Server: Hash refresh token → store in users.refresh_token_hash
6. Server: Set refresh token as HTTP-only cookie
7. Response: {accessToken, user: {id, email, name, role}}
8. Client: Store accessToken in memory (NOT localStorage)
```

## 8.2 Token Refresh Flow

```
1. Access token expires (15min)
2. Client: POST /auth/refresh (cookie sent automatically)
3. Server: Validate refresh token → hash and compare with DB
4. Server: Generate new access token + new refresh token (rotation)
5. Server: Update refresh_token_hash in DB
6. Response: {accessToken} + new refresh cookie
```

## 8.3 Password Reset Flow

```
1. POST /auth/forgot-password {email}
2. Server: Generate reset token (crypto.randomBytes(32).hex())
3. Server: Store hash of token in DB with 1hr expiry
4. Server: Send email via Resend with reset link
5. Always respond 200 (prevent email enumeration)
6. User clicks link → /admin/reset-password?token=xxx
7. POST /auth/reset-password {token, newPassword}
8. Server: Validate token, update password, invalidate token
```

## 8.4 RBAC Middleware

```typescript
// middleware/authorize.ts
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user; // Set by JWT middleware
    if (!user) return res.status(401).json({success: false, error: {code: 'UNAUTHORIZED'}});
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({success: false, error: {code: 'FORBIDDEN'}});
    }
    next();
  };
}

// Usage in routes
router.post('/articles', authenticate, authorize('editor', 'admin', 'super_admin'), createArticle);
router.patch('/articles/:id/status', authenticate, authorize('admin', 'super_admin'), updateArticleStatus);
router.delete('/users/:id', authenticate, authorize('super_admin'), deleteUser);
```

## 8.5 Permission Matrix (enforced at middleware level)

| Resource | Action | SuperAdmin | Admin | Editor |
|---|---|---|---|---|
| Articles | create, update | ✅ | ✅ | ✅ |
| Articles | publish, delete | ✅ | ✅ | ❌ |
| Blog Posts | create, update | ✅ | ✅ | ✅ |
| Blog Posts | publish, delete | ✅ | ✅ | ❌ |
| Categories | all CRUD | ✅ | ✅ | ❌ |
| Projects | all CRUD | ✅ | ✅ | ❌ |
| School Sessions | create, update | ✅ | ✅ | ✅ |
| School Sessions | delete | ✅ | ✅ | ❌ |
| Team Members | all CRUD | ✅ | ✅ | ❌ |
| FAQ | create, update | ✅ | ✅ | ✅ |
| FAQ | delete | ✅ | ✅ | ❌ |
| Media | upload, view | ✅ | ✅ | ✅ |
| Media | delete | ✅ | ✅ | ❌ |
| Form Submissions | all | ✅ | ✅ | ❌ |
| Users | all CRUD | ✅ | ❌ | ❌ |
| Settings | all | ✅ | ❌ | ❌ |
| Audit Logs | read | ✅ | ❌ | ❌ |

---

# 9. CRUD Rules

## 9.1 Universal CRUD Patterns

| Operation | Rules |
|---|---|
| **Create** | Validate with Zod → Generate UUID → Generate slug (if applicable) → Insert → Audit log → Return 201 |
| **Read (public)** | Filter by `status = 'published'` AND `deleted_at IS NULL` → Apply pagination → Return 200 |
| **Read (admin)** | All statuses visible → Filter by `deleted_at IS NULL` → Apply pagination → Return 200 |
| **Update** | Validate with Zod → Check existence → Check ownership/role → Update `updated_at` → Audit log → Return 200 |
| **Soft Delete** | Set `deleted_at = NOW()` → Audit log → Return 200. Content tables only (articles, blog_posts). |
| **Hard Delete** | DELETE row → Audit log → Return 200. Form submissions, media. |
| **Publish** | Set `status = 'published'`, `publish_date = NOW()` → Audit log → Trigger ISR revalidation on frontend → Return 200 |
| **Archive** | Set `status = 'archived'` → Audit log → Return 200 |

## 9.2 Slug Generation

```typescript
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')    // Remove special chars
    .replace(/\s+/g, '-')            // Spaces to hyphens
    .replace(/-+/g, '-')             // Collapse multiple hyphens
    .replace(/^-|-$/g, '')           // Trim hyphens
    .substring(0, 220);              // Max length
}

// If slug exists, append `-2`, `-3`, etc.
```

## 9.3 Read Time Calculation

```typescript
function calculateReadTime(htmlBody: string): number {
  const text = htmlBody.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200)); // 200 WPM average
}
```

## 9.4 Audit Logging

Every write operation (create, update, delete, publish, status change) creates an audit log entry:

```typescript
async function auditLog(userId: string, action: string, entityType: string, entityId: string | null, changes: object | null, ip: string) {
  await db.insert(auditLogs).values({
    id: uuid(), userId, action, entityType, entityId,
    changes: changes ? JSON.stringify(changes) : null,
    ipAddress: ip, createdAt: new Date()
  });
}
```

---

# 10. Admin Panel Architecture

## 10.1 Admin Routing (Next.js App Router)

```
/admin                          → Dashboard (redirect to /admin/dashboard)
/admin/login                    → Login page (unauthenticated)
/admin/dashboard                → Dashboard with stats and activity
/admin/blog                     → Blog post list
/admin/blog/new                 → Create blog post
/admin/blog/[id]/edit           → Edit blog post
/admin/articles                 → Article list
/admin/articles/new             → Create article
/admin/articles/[id]/edit       → Edit article
/admin/categories               → Category management
/admin/projects                 → Project list + CRUD
/admin/schools                  → School session list + CRUD
/admin/team                     → Team member management
/admin/faq                      → FAQ management
/admin/media                    → Media library grid
/admin/forms/contact            → Contact submissions inbox
/admin/forms/volunteers         → Volunteer registrations
/admin/forms/newsletter         → Newsletter subscribers
/admin/users                    → User management (SuperAdmin only)
/admin/settings                 → Site settings (SuperAdmin only)
/admin/audit-logs               → Audit log viewer (SuperAdmin only)
```

## 10.2 Admin Layout

- **Sidebar** (collapsible): Navigation grouped by section
- **Header**: Breadcrumb + user dropdown (profile, logout)
- **Main Content**: List views with data tables; form views with rich text editors
- **Protected**: All `/admin/*` routes wrapped in `AdminAuthProvider` that checks JWT and role

## 10.3 Shared Admin Components

| Component | Usage |
|---|---|
| `DataTable` | Sortable, filterable, paginated table for all list views |
| `ContentForm` | Reusable form layout with Tiptap editor, image upload, SEO fields |
| `StatusBadge` | Color-coded badges for content/submission statuses |
| `ConfirmDialog` | Delete confirmation modals |
| `FileUploader` | Drag-and-drop with preview for media |
| `StatsCard` | Dashboard metric display cards |
| `ActivityFeed` | Timeline of recent audit log entries |

---

# 11. Frontend Architecture

## 11.1 Folder Structure

```
src/
├── app/                           # Next.js App Router
│   ├── (public)/                  # Public page group
│   │   ├── page.tsx               # Homepage
│   │   ├── about/page.tsx
│   │   ├── learn/
│   │   │   ├── page.tsx           # Category grid
│   │   │   └── [category]/
│   │   │       ├── page.tsx       # Article list
│   │   │       └── [article]/page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── schools/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── join/page.tsx
│   │   ├── faq/page.tsx
│   │   ├── search/page.tsx
│   │   ├── privacy/page.tsx
│   │   └── terms/page.tsx
│   ├── admin/                     # Admin SPA group
│   │   ├── layout.tsx             # Admin sidebar + auth check
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── blog/
│   │   ├── articles/
│   │   ├── categories/
│   │   ├── projects/
│   │   ├── schools/
│   │   ├── team/
│   │   ├── faq/
│   │   ├── media/
│   │   ├── forms/
│   │   ├── users/
│   │   ├── settings/
│   │   └── audit-logs/
│   ├── layout.tsx                 # Root layout
│   ├── not-found.tsx              # 404 page
│   └── error.tsx                  # Error boundary
├── components/
│   ├── ui/                        # Primitives: Button, Input, Card, Badge, etc.
│   ├── layout/                    # Header, Footer, Sidebar, Breadcrumb
│   ├── content/                   # ArticleCard, ProjectCard, CategoryCard
│   ├── forms/                     # ContactForm, VolunteerForm, NewsletterForm
│   ├── admin/                     # DataTable, ContentForm, FileUploader
│   └── seo/                       # JsonLd, MetaTags
├── lib/
│   ├── api.ts                     # API client (fetch wrapper with auth)
│   ├── auth.ts                    # Auth context, token management
│   ├── utils.ts                   # Formatters, helpers
│   └── validations.ts            # Shared Zod schemas
├── hooks/
│   ├── use-auth.ts
│   ├── use-articles.ts
│   └── use-media.ts
├── styles/
│   ├── globals.css                # CSS custom properties (design tokens)
│   ├── reset.css                  # CSS reset
│   └── components/                # CSS Modules per component
├── types/
│   └── index.ts                   # Shared TypeScript interfaces
└── public/
    ├── fonts/                     # Self-hosted DM Sans, DM Mono
    ├── images/                    # Static images (logo, icons)
    └── robots.txt
```

## 11.2 Design Token System (CSS Custom Properties)

```css
:root {
  /* Color Palette — Cool Sophistication */
  --color-pastel-green: #B5D5B0;
  --color-soft-sky-blue: #A3C4D8;
  --color-cool-slate: #6B8A9E;
  --color-off-white: #F5F5F0;
  --color-deep-navy: #1A2332;
  --color-saffron: #FF9933;
  --color-green: #138808;

  /* Semantic Colors */
  --color-bg-primary: var(--color-off-white);
  --color-bg-card: #FFFFFF;
  --color-text-primary: var(--color-deep-navy);
  --color-text-secondary: #4A5568;
  --color-text-muted: #8A919E;
  --color-accent-primary: var(--color-cool-slate);
  --color-accent-secondary: var(--color-soft-sky-blue);
  --color-success: var(--color-pastel-green);
  --color-error: #E53E3E;
  --color-warning: #ECC94B;

  /* Typography */
  --font-sans: 'DM Sans', system-ui, sans-serif;
  --font-mono: 'DM Mono', monospace;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 2rem;
  --font-size-4xl: 2.5rem;
  --font-size-5xl: 3rem;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-24: 6rem;

  /* Layout */
  --max-width: 1200px;
  --border-radius: 8px;
  --border-radius-lg: 12px;
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg: 0 12px 36px rgba(0,0,0,0.12);
}
```

## 11.3 Data Fetching Strategy

| Context | Strategy | Caching |
|---|---|---|
| Public pages (SSG) | `fetch()` in Server Components at build time | Revalidate every 60s (ISR) |
| Public pages (dynamic) | `fetch()` with `{next: {revalidate: 60}}` | ISR |
| Admin list views | SWR with `refreshInterval: 0` (manual refresh) | In-memory |
| Admin forms | SWR `mutate()` on save | Optimistic UI update |
| Search | Client-side `fetch()` with 300ms debounce | No cache |

## 11.4 ISR Revalidation

When admin publishes/updates content:
```typescript
// Backend sends webhook to Next.js on-demand revalidation
await fetch(`${FRONTEND_URL}/api/revalidate`, {
  method: 'POST',
  headers: { 'x-revalidate-secret': REVALIDATION_SECRET },
  body: JSON.stringify({ paths: ['/blog', `/blog/${slug}`] })
});
```

---

# 12. Backend Architecture

## 12.1 Folder Structure

```
server/
├── src/
│   ├── index.ts                   # Express app bootstrap
│   ├── config/
│   │   ├── database.ts            # Drizzle connection
│   │   ├── storage.ts             # R2 client config
│   │   ├── email.ts               # Resend config
│   │   └── env.ts                 # Validated env vars (Zod)
│   ├── middleware/
│   │   ├── authenticate.ts        # JWT verification
│   │   ├── authorize.ts           # Role-based access
│   │   ├── rate-limit.ts          # Rate limiting configs
│   │   ├── validate.ts            # Zod request validation
│   │   ├── error-handler.ts       # Global error handler
│   │   └── audit.ts               # Audit logging middleware
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.schemas.ts    # Zod schemas
│   │   ├── articles/
│   │   │   ├── articles.routes.ts
│   │   │   ├── articles.controller.ts
│   │   │   ├── articles.service.ts
│   │   │   ├── articles.repository.ts
│   │   │   └── articles.schemas.ts
│   │   ├── blog/
│   │   ├── categories/
│   │   ├── projects/
│   │   ├── schools/
│   │   ├── team/
│   │   ├── contact/
│   │   ├── volunteers/
│   │   ├── newsletter/
│   │   ├── faq/
│   │   ├── media/
│   │   ├── search/
│   │   ├── users/
│   │   ├── settings/
│   │   ├── audit/
│   │   └── dashboard/
│   ├── db/
│   │   ├── schema.ts              # Drizzle schema definitions
│   │   ├── migrations/            # Generated migration files
│   │   └── seed.ts                # Initial data seeding
│   ├── utils/
│   │   ├── slug.ts
│   │   ├── read-time.ts
│   │   ├── csv-export.ts
│   │   ├── image-processor.ts     # Sharp operations
│   │   └── email-templates.ts     # Resend email templates
│   └── types/
│       └── index.ts               # Shared types
├── drizzle.config.ts
├── tsconfig.json
├── Dockerfile
└── package.json
```

## 12.2 Layered Architecture Pattern

```
Route (Express Router)
  → Controller (HTTP handling, response formatting)
    → Service (Business logic, validation, orchestration)
      → Repository (Database queries via Drizzle)
```

| Layer | Responsibility | What it DOES NOT do |
|---|---|---|
| **Route** | Define HTTP methods, path, middleware chain | No business logic |
| **Controller** | Parse request, call service, format response | No DB queries, no business rules |
| **Service** | Business logic, validation orchestration, multi-entity coordination | No HTTP awareness, no `req`/`res` |
| **Repository** | Single-entity database operations (Drizzle queries) | No business logic, no validation |

## 12.3 Error Handling

```typescript
// Global error handler (last middleware)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message, details: err.details }
    });
  }

  logger.error({ err, path: req.path, method: req.method });

  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }
  });
});
```

## 12.4 Background Jobs

| Job | Trigger | Implementation |
|---|---|---|
| Email sending | On form submission / password reset | Inline async (Resend is fast enough; no queue needed for MVP) |
| Image processing | On media upload | Inline async with Sharp (< 2s for resize + WebP) |
| Audit log cleanup | Cron (monthly) | Railway cron job: delete audit_logs older than 12 months |
| Database backup | Cron (daily) | Railway managed backups (automatic) |
| Sitemap regeneration | On content publish | Triggered via ISR revalidation webhook |

---

# 13. Security Requirements

## 13.1 OWASP Top 10 Mitigation

| # | Vulnerability | Mitigation |
|---|---|---|
| A01 | Broken Access Control | RBAC middleware on all protected routes; JWT + role checks; no object-level access bypass |
| A02 | Cryptographic Failures | bcrypt for passwords; HTTPS enforced; no secrets in client code; env vars for all credentials |
| A03 | Injection | Drizzle ORM (parameterized queries); Zod input validation; no raw SQL from user input |
| A04 | Insecure Design | Least privilege RBAC; rate limiting; no admin functionality on public routes |
| A05 | Security Misconfiguration | CORS whitelist (frontend domain only); security headers via helmet.js; no default credentials |
| A06 | Vulnerable Components | `npm audit` in CI; Dependabot alerts; pin major versions |
| A07 | Auth Failures | Account lockout (5 attempts); JWT expiry (15min); refresh token rotation; no token in URL |
| A08 | Data Integrity | Audit logs for all writes; Zod schema validation on all inputs; CSRF via SameSite cookies |
| A09 | Logging Failures | Pino structured logging; audit trail for all admin actions; no PII in logs |
| A10 | SSRF | No user-provided URLs fetched server-side (except CTA URL validation which is stored, not fetched) |

## 13.2 Security Headers (via helmet.js)

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://www.googletagmanager.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "https://*.r2.cloudflarestorage.com", "data:"],
      connectSrc: ["'self'", "https://api.thenagrik.org"],
      fontSrc: ["'self'"],
      frameSrc: ["https://tally.so"],  // For embedded survey
    }
  },
  hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
```

## 13.3 Rate Limiting Configuration

| Endpoint Group | Limit | Window |
|---|---|---|
| Public API (general) | 100 requests | 1 minute per IP |
| Auth login | 5 requests | 15 minutes per IP |
| Form submissions | 3 requests | 1 hour per IP |
| Newsletter subscribe | 2 requests | 1 hour per IP |
| Admin API | 200 requests | 1 minute per user |
| Media upload | 10 uploads | 1 minute per user |

## 13.4 File Upload Security

```typescript
const ALLOWED_MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  document: ['application/pdf'],
  video: ['video/mp4'],
};

const MAX_SIZES = {
  image: 10 * 1024 * 1024,    // 10MB
  document: 20 * 1024 * 1024,  // 20MB
  video: 50 * 1024 * 1024,     // 50MB
};

// Validation: Check MIME from file magic bytes, not just extension
// Filename: Replace with UUID to prevent path traversal
// Storage: Separate bucket prefix per type
```

---

# 14. Performance Optimization

## 14.1 Frontend Performance

| Optimization | Implementation |
|---|---|
| **SSG** | All public pages pre-rendered at build time |
| **ISR** | Content pages revalidate every 60s; on-demand revalidation on publish |
| **Image Optimization** | Next.js `<Image>` component with WebP, responsive srcset, lazy loading |
| **Font Loading** | Self-hosted DM Sans/DM Mono with `font-display: swap`; preload critical weights |
| **Code Splitting** | Automatic per-route by Next.js App Router; dynamic imports for Tiptap (admin only) |
| **Bundle Size** | No Tailwind (saves 50KB+); tree-shake Lucide icons; lazy-load Framer Motion |
| **Compression** | Vercel auto-applies Brotli/Gzip |
| **Prefetching** | Next.js `<Link>` auto-prefetches visible links |

## 14.2 Backend Performance

| Optimization | Implementation |
|---|---|
| **Database Indexing** | All FKs, slugs, status columns, search vectors indexed (see Section 6) |
| **Query Optimization** | Drizzle's query builder generates efficient SQL; no N+1 queries (use `with` joins) |
| **Response Compression** | `compression` middleware (gzip for API responses) |
| **Connection Pooling** | Drizzle with `pg` pool; 10 connections default |
| **Pagination** | Cursor-based for admin (performance); offset-based for public (SEO-friendly URLs) |
| **Caching** | Settings cached in-memory (refresh on update). Future: Redis for API response caching. |
| **Image Processing** | Sharp runs async; thumbnails generated on upload, not on request |

## 14.3 Target Metrics

| Metric | Target | How |
|---|---|---|
| LCP | < 2.0s | SSG + optimized images + CDN |
| FCP | < 1.2s | Static HTML served from edge |
| CLS | < 0.05 | Explicit image dimensions; font-display: swap |
| TTI | < 3.0s | Minimal JS on public pages (Server Components) |
| Lighthouse | > 95 | All above combined |
| API p95 | < 150ms | Indexed queries + connection pooling |

---

# 15. SEO Technical Requirements

## 15.1 Implementation

| Requirement | Implementation |
|---|---|
| **Metadata** | Next.js `generateMetadata()` per route; dynamic title/description from CMS |
| **Open Graph** | OG title, description, image, type on every page |
| **JSON-LD** | `Organization` schema on homepage; `Article` schema on blog/learn pages; `BreadcrumbList` on all pages; `FAQPage` on FAQ |
| **Sitemap** | Auto-generated via `next-sitemap`; regenerated on build; includes all public URLs with `lastmod` |
| **Robots.txt** | Allow all public routes; disallow `/admin/*`, `/api/*` |
| **Canonical URLs** | Self-referencing canonical on every page |
| **Heading Hierarchy** | Single `<h1>` per page; enforced in component design |
| **URL Structure** | Clean slugs: `/learn/constitution/fundamental-rights` |
| **RSS Feed** | `/blog/feed.xml` — auto-generated from published blog posts |

## 15.2 Structured Data Templates

```json
// Homepage — Organization
{
  "@context": "https://schema.org",
  "@type": "NGO",
  "name": "The Nagrik",
  "url": "https://thenagrik.org",
  "logo": "https://thenagrik.org/images/logo.png",
  "description": "Student-led civic literacy initiative",
  "sameAs": ["https://instagram.com/nagrikindia"]
}

// Article page — Article
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{{title}}",
  "datePublished": "{{publish_date}}",
  "author": {"@type": "Person", "name": "{{author_name}}"},
  "publisher": {"@type": "Organization", "name": "The Nagrik"}
}
```

---

# 16. Accessibility (WCAG 2.1 AA)

| Requirement | Implementation |
|---|---|
| **Semantic HTML** | `<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`, `<section>` |
| **Skip Navigation** | `<a href="#main-content" class="sr-only focus:visible">Skip to content</a>` |
| **Focus Management** | Visible focus ring (`outline: 2px solid var(--color-cool-slate)`) on all interactive elements |
| **ARIA Labels** | `aria-label` on icon buttons; `aria-expanded` on hamburger menu; `aria-current="page"` on nav |
| **Color Contrast** | All text combinations verified ≥ 4.5:1 against backgrounds |
| **Form Accessibility** | `<label>` for every input; `aria-describedby` for error messages; `role="alert"` on validation errors |
| **Image Alt Text** | Required `alt` attribute; enforced in CMS media library |
| **Keyboard Navigation** | Tab order follows visual order; Escape closes modals; Enter/Space activates buttons |
| **Reduced Motion** | `@media (prefers-reduced-motion: reduce)` disables animations |
| **Responsive Text** | All text remains readable at 200% browser zoom; no horizontal scrolling |

---

# 17. DevOps & Deployment

## 17.1 Git Strategy

| Aspect | Decision |
|---|---|
| **Branching** | Trunk-based: `main` (production), feature branches `feat/module-name`, `fix/bug-description` |
| **Merge Strategy** | Squash merge to main; linear history |
| **Commit Convention** | Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:` |
| **Monorepo** | Single repo with `/frontend` and `/server` directories |
| **PR Requirements** | 1 approval; CI passing; no merge conflicts |

## 17.2 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI/CD
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci --prefix frontend && npm ci --prefix server
      - run: npm run lint --prefix frontend && npm run lint --prefix server
      - run: npm run type-check --prefix frontend && npm run type-check --prefix server

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_DB: test, POSTGRES_USER: test, POSTGRES_PASSWORD: test }
        ports: ['5432:5432']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci --prefix server
      - run: npm test --prefix server
        env: { DATABASE_URL: 'postgresql://test:test@localhost:5432/test' }

  deploy-backend:
    if: github.ref == 'refs/heads/main'
    needs: [lint-and-type-check, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: railwayapp/cli-action@v1
        with: { service: backend }
        env: { RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }} }

  # Frontend deploys automatically via Vercel Git integration
```

## 17.3 Environment Variables

| Variable | Service | Secret? |
|---|---|---|
| `DATABASE_URL` | Backend | ✅ |
| `JWT_SECRET` | Backend | ✅ |
| `JWT_REFRESH_SECRET` | Backend | ✅ |
| `R2_ACCESS_KEY_ID` | Backend | ✅ |
| `R2_SECRET_ACCESS_KEY` | Backend | ✅ |
| `R2_BUCKET_NAME` | Backend | ❌ |
| `R2_ENDPOINT` | Backend | ❌ |
| `R2_PUBLIC_URL` | Backend | ❌ |
| `RESEND_API_KEY` | Backend | ✅ |
| `ADMIN_EMAIL` | Backend | ❌ |
| `FRONTEND_URL` | Backend | ❌ |
| `REVALIDATION_SECRET` | Backend + Frontend | ✅ |
| `NEXT_PUBLIC_API_URL` | Frontend | ❌ |
| `NEXT_PUBLIC_GA_ID` | Frontend | ❌ |

## 17.4 Docker (Backend)

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

## 17.5 Health Check

```typescript
// GET /health
app.get('/health', async (req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'unhealthy' });
  }
});
```

---

# 18. Third-Party Integrations

| Service | Purpose | Integration Method | Cost |
|---|---|---|---|
| **Cloudflare R2** | Media file storage | AWS S3-compatible SDK (`@aws-sdk/client-s3`) | $0.015/GB stored; free egress |
| **Resend** | Transactional email | REST SDK (`resend`) | Free: 3,000 emails/month |
| **Google Analytics 4** | Website analytics | Client-side `gtag.js` script | Free |
| **Google Search Console** | SEO monitoring | Meta tag verification | Free |
| **Tally** | Civic Literacy Survey | `<iframe>` embed on Projects page | Free |
| **Cloudflare** | DNS, CDN, DDoS | Dashboard config; DNS records | Free tier |
| **Vercel** | Frontend hosting | Git integration | Free: Hobby tier |
| **Railway** | Backend + DB hosting | Docker deployment | $5/month starter |

### Future Integrations (V1.1+)

| Service | Purpose | When |
|---|---|---|
| **Razorpay** | Donation gateway | V2.0 (Indian payment gateway) |
| **Algolia / Meilisearch** | Full-text search | V1.1 (when content > 200 articles) |
| **Brevo / Mailchimp** | Newsletter campaigns | V1.1 (connect via CSV export or API) |
| **hCaptcha** | Bot protection | V1.1 (replace honeypot) |

---

# 19. Testing Strategy

| Type | Tool | Scope | When |
|---|---|---|---|
| **Unit Tests** | Vitest | Service layer business logic; utility functions; Zod schemas | Every PR |
| **Integration Tests** | Vitest + Supertest | API endpoints with test database; auth flows | Every PR |
| **API Contract Tests** | Vitest + Supertest | Response shape validation against TypeScript types | Every PR |
| **Component Tests** | Vitest + React Testing Library | Admin form components; data table; content rendering | Every PR |
| **E2E Tests** | Playwright | Critical user flows: browse articles, submit contact form, admin login + publish | Pre-release |
| **Accessibility Tests** | axe-core + Playwright | WCAG 2.1 AA automated checks on all public pages | Pre-release |
| **Performance Tests** | Lighthouse CI | Score > 90 on all public pages | Pre-release |
| **Security Tests** | `npm audit` + Snyk | Dependency vulnerability scanning | Weekly (Dependabot) |
| **Load Tests** | k6 (future) | API throughput under load | Pre-scale events |
| **Manual QA** | Team | Visual review, cross-browser, mobile | Pre-release |

### Test Coverage Targets

| Layer | Target |
|---|---|
| Service layer | > 85% line coverage |
| API routes | > 80% (all happy + error paths) |
| Frontend components | > 70% (critical admin components) |
| E2E | All P0 user flows covered |

---

# 20. Monitoring & Observability

| Aspect | Tool | Cost |
|---|---|---|
| **Application Logs** | Pino → Railway log drain | Included in Railway |
| **Error Tracking** | Sentry (free tier) | Free: 5K errors/month |
| **Uptime Monitoring** | BetterUptime (free) or UptimeRobot | Free |
| **Performance** | Vercel Analytics (built-in) | Included with Vercel |
| **Frontend Errors** | Sentry JS SDK | Same Sentry account |
| **Health Checks** | Railway built-in + `/health` endpoint | Included |
| **Audit Trail** | Custom audit_logs table | No additional cost |
| **Admin Alerts** | Resend email on critical events (form submissions, errors) | Included in Resend tier |

### Alert Triggers

| Event | Channel | Priority |
|---|---|---|
| Backend health check fails | Email to admin | Critical |
| 5xx error rate > 1% | Sentry alert | High |
| New contact form submission | Email to admin | Normal |
| New volunteer registration | Email to admin | Normal |
| Failed login > 5 attempts | Audit log entry | High |

---

# 21. Engineering Standards

## 21.1 Naming Conventions

| Element | Convention | Example |
|---|---|---|
| **Files (components)** | PascalCase | `ArticleCard.tsx` |
| **Files (modules)** | kebab-case | `articles.service.ts` |
| **CSS Modules** | camelCase | `styles.articleCard` |
| **DB tables** | snake_case plural | `blog_posts` |
| **DB columns** | snake_case | `created_at` |
| **API endpoints** | kebab-case plural | `/api/v1/blog-posts` (exception: `/blog` for brevity) |
| **TypeScript types** | PascalCase | `BlogPost`, `CreateArticleInput` |
| **Env variables** | SCREAMING_SNAKE | `DATABASE_URL` |
| **Git branches** | `type/description` | `feat/learn-page`, `fix/contact-form-validation` |
| **Commits** | Conventional Commits | `feat(articles): add full-text search` |

## 21.2 Code Quality Tools

| Tool | Purpose | Config |
|---|---|---|
| **ESLint** | Linting | `@typescript-eslint/recommended` + `next/core-web-vitals` |
| **Prettier** | Formatting | `printWidth: 100`, `singleQuote: true`, `trailingComma: 'all'` |
| **TypeScript** | Type checking | `strict: true`, `noUnusedLocals: true` |
| **Husky** | Git hooks | Pre-commit: lint-staged (lint + format changed files) |

## 21.3 API Standards

- All dates in ISO 8601 UTC
- All IDs are UUID v4
- All list endpoints support `page`, `per_page`, `sort`, `order`
- All responses use the standard envelope format (Section 7.2)
- No breaking changes without version bump (`/api/v2/`)

## 21.4 Migration Strategy

```bash
# Generate migration from schema changes
npx drizzle-kit generate

# Apply migrations (run on deploy)
npx drizzle-kit migrate

# Seed initial data (first deploy only)
npx tsx src/db/seed.ts
```

Initial seed data: 1 super_admin user, 9 categories, 4 core principles, default settings.

---

# 22. Scalability Roadmap

## Phase 1: MVP (Current Architecture)

- Single Vercel instance, single Railway instance, single PostgreSQL
- SSG for all public pages; ISR with 60s revalidation
- PostgreSQL full-text search
- < 10K monthly visitors

## Phase 2: Growth Optimization (10K–50K/mo)

| Change | Trigger |
|---|---|
| Add Redis for API response caching | API p95 > 200ms |
| Move to Vercel Pro for increased ISR bandwidth | ISR cache misses > 5% |
| Add Cloudflare page rules for aggressive caching | Media bandwidth costs > $5/mo |
| Implement database read replicas | Query load > 50% CPU |

## Phase 3: Scale (50K–200K/mo)

| Change | Trigger |
|---|---|
| Horizontal scaling on Railway (2–3 instances) | Single instance CPU > 80% |
| Dedicated PostgreSQL (Railway Pro or Neon) | Connection pool exhaustion |
| Algolia for search | Content > 500 articles; search latency > 300ms |
| Edge functions for personalized content | Regional traffic patterns emerge |

## Phase 4: Future Architecture

| Feature | Architecture Impact |
|---|---|
| Multi-language (i18n) | `next-intl`; content duplicated per locale in CMS; URL prefix `/hi/`, `/en/` |
| Mobile app | Existing API serves mobile clients directly; add API rate limiting per user token |
| Donation gateway | New `donations` table + Razorpay webhook handler; PCI-DSS scoping |
| Community forum | Consider separate service or embedded solution (Discourse) to avoid scope creep |
| Volunteer portal | Add `public_users` table with separate auth flow; extend RBAC |

> [!WARNING]
> **No microservices migration is planned or recommended.** The entire application is a CRUD website with < 20 entities. A monolith with clean module separation will serve up to 1M monthly visitors without architectural changes. Microservices would add operational overhead without proportional benefit.

---

# 23. Risks & Technical Debt

## 23.1 Architecture Risks

| Risk | Impact | Probability | Mitigation |
|---|---|---|---|
| Custom backend takes longer than Strapi | Medium (2-3 week delay) | Medium | Reusable module template; code generation for CRUD boilerplate |
| ISR cache staleness confuses editors | Low | Medium | Admin UI shows "Last published" timestamp; manual revalidation button |
| PostgreSQL full-text search insufficient | Low | Low | Clean abstraction in search service; swap to Algolia without frontend changes |

## 23.2 Known Technical Debt (Acceptable in MVP)

| Debt | Why Acceptable | Resolve By |
|---|---|---|
| In-memory rate limiting (no Redis) | < 10K visitors; single instance | V1.1 |
| No email queue (inline Resend calls) | Resend API is fast (< 200ms); form submissions are low-volume | V1.1 (if email volume > 100/day) |
| No image CDN (direct R2 URLs) | Cloudflare auto-caches R2; good enough for MVP | V1.1 (add Cloudflare Image Resizing) |
| No automated database backups beyond Railway | Railway does daily backups | V1.0 (add pg_dump cron to R2) |
| Honeypot instead of CAPTCHA | Blocks basic bots; CAPTCHA hurts UX | V1.1 (add hCaptcha if spam > 10%) |
| No 2FA for admin | Admin user count < 10; strong passwords enforced | V1.1 |

## 23.3 Infrastructure Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Railway outage | API downtime; admin inaccessible | Public site still serves via Vercel CDN (SSG). Restore from Railway backup to alternative PaaS. |
| Vercel free tier limits reached | Build failures; slow ISR | Upgrade to Pro ($20/mo); well within NGO budget |
| R2 pricing changes | Storage cost increase | R2 pricing is already lowest in market; can migrate to S3 with same SDK |
| Domain registrar issues | Site unreachable | Use Cloudflare Registrar; enable DNSSEC |

---

# 24. Assumptions

| # | Assumption | Impact if Wrong |
|---|---|---|
| TA-1 | Team has 2–3 developers for initial build | If solo developer, extend timeline to 12 weeks |
| TA-2 | Node.js/TypeScript is within team's skillset | If not, consider Next.js full-stack (API routes) instead of separate Express backend |
| TA-3 | Content volume stays under 500 articles for 12 months | If higher, move to Algolia search earlier |
| TA-4 | Concurrent admin users ≤ 5 at any time | If higher, add WebSocket presence awareness |
| TA-5 | No real-time features needed (chat, live notifications) | If needed, add WebSocket server (Socket.io) |
| TA-6 | English-only for all API responses and error messages | If i18n needed, add `accept-language` header parsing |
| TA-7 | Railway's managed PostgreSQL meets reliability needs | If not, migrate to Neon or Supabase PostgreSQL |
| TA-8 | Free tiers of Vercel/Railway/Resend/Cloudflare sufficient for 6 months | Budget $20–40/month for paid tiers if traffic exceeds free limits |
| TA-9 | No CI/CD beyond GitHub Actions is needed | If complex staging environments needed, add preview deployments |
| TA-10 | The Nagrik team can maintain the codebase after handoff | Provide developer documentation and runbook |
| TA-11 | API is consumed only by the Next.js frontend (no mobile app in MVP) | If mobile app, add API key authentication layer |
| TA-12 | The custom backend architecture is preferred over Strapi CMS | If Strapi is preferred, this TRD's backend sections need to be reworked |

---

# Appendix A: Initial Seed Data

```typescript
// Categories to seed
const INITIAL_CATEGORIES = [
  { name: 'Constitution', slug: 'constitution', sortOrder: 1 },
  { name: 'Fundamental Rights', slug: 'fundamental-rights', sortOrder: 2 },
  { name: 'Fundamental Duties', slug: 'fundamental-duties', sortOrder: 3 },
  { name: 'Parliament', slug: 'parliament', sortOrder: 4 },
  { name: 'Judiciary', slug: 'judiciary', sortOrder: 5 },
  { name: 'Elections', slug: 'elections', sortOrder: 6 },
  { name: 'Citizenship', slug: 'citizenship', sortOrder: 7 },
  { name: 'Public Policy', slug: 'public-policy', sortOrder: 8 },
  { name: 'Digital Citizenship', slug: 'digital-citizenship', sortOrder: 9 },
];

// Default settings
const INITIAL_SETTINGS = [
  { key: 'general.site_title', value: 'The Nagrik', group: 'general' },
  { key: 'general.tagline', value: 'Democracy is inherited. Citizenship is learned.', group: 'general' },
  { key: 'social.instagram', value: 'https://instagram.com/nagrikindia', group: 'social' },
  { key: 'social.email', value: 'thenagrik.org@gmail.com', group: 'social' },
  { key: 'seo.default_meta_description', value: 'Student-led civic literacy initiative building informed citizens in India.', group: 'seo' },
];

// Core principles
const INITIAL_PRINCIPLES = [
  { title: 'Accessibility', description: 'Knowledge about governance, law, and citizenship should be understandable to everyone.', iconIdentifier: 'globe', sortOrder: 1 },
  { title: 'Non-Partisanship', description: 'We do not endorse political parties. Our focus remains on civic education and informed participation.', iconIdentifier: 'scale', sortOrder: 2 },
  { title: 'Critical Thinking', description: 'We encourage students to question, analyze, and engage with public issues thoughtfully.', iconIdentifier: 'lightbulb', sortOrder: 3 },
  { title: 'Service', description: 'Citizenship is not only about rights; it is also about contributing positively to society.', iconIdentifier: 'heart-handshake', sortOrder: 4 },
];

// Initial super admin (password set via env var or first-run wizard)
const INITIAL_USER = {
  email: 'admin@thenagrik.org',
  name: 'Admin',
  role: 'super_admin',
  password: process.env.INITIAL_ADMIN_PASSWORD, // bcrypt hashed on seed
};
```

---

# Appendix B: Cost Estimation

| Service | Tier | Monthly Cost |
|---|---|---|
| Vercel | Hobby (free) → Pro ($20) | $0–20 |
| Railway | Starter ($5) | $5 |
| Railway PostgreSQL | Included in starter | $0 |
| Cloudflare R2 | Pay-per-use | < $1 |
| Cloudflare DNS/CDN | Free | $0 |
| Resend | Free (3K emails/mo) | $0 |
| Sentry | Free (5K events/mo) | $0 |
| Domain (.org) | Annual | ~$10/year |
| **Total** | | **$5–26/month** |

---

# Appendix C: Development Timeline Estimate

| Phase | Duration | Deliverables |
|---|---|---|
| **Sprint 1** (Week 1–2) | 2 weeks | Project setup, database schema, auth module, basic API for categories/articles |
| **Sprint 2** (Week 3–4) | 2 weeks | Blog API, projects API, schools API, media upload pipeline |
| **Sprint 3** (Week 5–6) | 2 weeks | Frontend public pages (Home, About, Learn, Projects, Schools, Blog, Contact) |
| **Sprint 4** (Week 7–8) | 2 weeks | Admin panel (dashboard, content CRUD, media library, form inbox), SEO, testing |
| **Stabilization** (Week 9) | 1 week | Bug fixes, performance optimization, accessibility audit, deployment |
| **Launch** | Week 10 | Production deployment, DNS cutover, monitoring setup |

**Total: ~10 weeks** with 2 developers or **~14 weeks** with 1 developer.

---

*End of Technical Requirements Document*

*This document should be reviewed by the engineering team lead before implementation begins. All assumptions in Section 24 should be validated with the product owner.*
