# Implementation Plan
## **THE NAGRIK** — Civic Literacy Initiative
### Complete Engineering Delivery Blueprint v1.0

| Field | Value |
|---|---|
| **Document Version** | 1.0 |
| **Date** | June 7, 2026 |
| **Source Documents** | PRD v1.0, TRD v1.0, AFD v1.0, DesignBrief v1.0, BackendSchema v1.0 |
| **Delivery Model** | Solo Founder + AI Agents (Primary), adaptable to small team |
| **Classification** | Internal — Engineering Delivery |

---

# 1. Project Executive Summary

## 1.1 Product Type

A **content-driven public website with a custom admin panel** for a student-led civic literacy non-profit organization operating in India. The product is NOT a SaaS application — it is a CRUD-based CMS platform with editorial design principles.

## 1.2 Delivery Strategy

**Incremental vertical slices.** Each sprint delivers a working feature from database to UI. No "backend-only" or "frontend-only" sprints. Every sprint ends with something demonstrable.

```
Sprint 1: Foundation (repo, schema, auth, layout shell)
Sprint 2: Core Content (articles, categories, learn pages)
Sprint 3: Blog + Projects + Schools
Sprint 4: Forms + Admin CMS
Sprint 5: Admin Dashboard + Media + Settings
Sprint 6: Search + SEO + Motion
Sprint 7: Polish + Testing + Accessibility
Sprint 8: Deployment + Launch
```

## 1.3 MVP Scope (V1.0)

| Include | Exclude |
|---|---|
| Public website (8 pages) | Donation gateway |
| Admin panel (12 screens) | Member/student accounts |
| JWT auth with RBAC (3 roles) | Quizzes |
| Content management (articles, blogs, projects, school sessions) | Event ticketing |
| Contact + Volunteer + Newsletter forms | Multi-language |
| Media upload (R2) | Mobile app |
| Full-text search | Community forum |
| SEO optimization | Analytics dashboard |
| Email notifications (Resend) | Push notifications |
| Audit logging | AI features |

## 1.4 Engineering Philosophy

1. **Schema-first**: Database schema drives API contracts, which drive frontend data models
2. **Vertical slices**: Each feature is built top-to-bottom (DB → API → UI) before moving to the next
3. **Editorial design**: The frontend is NOT a component library exercise — it's a designed editorial experience
4. **Minimal infrastructure**: No Redis, no message queue, no microservices. Single Postgres, single Express, single Next.js
5. **AI-augmented development**: Every task is sized and described for AI coding agent execution

---

# 2. Team Structure

## 2.1 Primary Configuration: Solo Founder + AI

| Role | Person/Tool | Responsibilities |
|---|---|---|
| **Product Owner** | Founder | Requirements, content, approval, testing |
| **Backend Agent** | AI (Gemini/Claude) | Express APIs, Drizzle schema, auth, services |
| **Frontend Agent** | AI (Gemini/Claude) | Next.js pages, components, styling, motion |
| **DevOps** | Founder + AI | Vercel/Railway deployment, CI/CD, DNS |
| **Design** | DesignBrief v1.0 (document) | Design tokens are pre-defined — no designer needed for V1 |
| **QA** | Founder + Playwright | Manual testing + automated E2E |
| **Content** | Founder + team | Copy, images, articles for seeding |

## 2.2 Scaled Configuration: 3-Person Team

| Role | Responsibility |
|---|---|
| **Full-Stack Lead** | Architecture decisions, backend, deployment, code review |
| **Frontend Developer** | Next.js pages, components, animations, responsive |
| **Backend Developer** | Express APIs, auth, database, integrations |

## 2.3 Agency Configuration: 5-Person Team

| Role | Responsibility |
|---|---|
| **Technical Lead** | Architecture, code review, deployment |
| **Backend Developer** | APIs, auth, database |
| **Frontend Developer** | Pages, components, layout |
| **UI/Motion Developer** | Animations, transitions, design fidelity |
| **QA Engineer** | Test plans, automation, accessibility |

---

# 3. Technology Stack Summary

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| **Frontend Framework** | Next.js (App Router) | 15.x | SSR/ISR for SEO, React Server Components |
| **Frontend Language** | TypeScript | 5.x | Type safety across the stack |
| **CSS** | Vanilla CSS + CSS Modules | — | Full control, no framework lock-in, per DesignBrief |
| **Animation** | Framer Motion + GSAP (ScrollTrigger) | FM 11.x, GSAP 3.x | Framer for UI transitions, GSAP for scroll narratives |
| **Rich Text Editor** | Tiptap | 2.x | Headless, extensible, outputs clean HTML |
| **Backend Framework** | Express.js | 5.x | Mature, minimal, well-understood |
| **Backend Language** | TypeScript | 5.x | Shared types with frontend |
| **ORM** | Drizzle ORM | Latest | SQL-transparent, lightweight, schema-as-code |
| **Database** | PostgreSQL | 16 | Full-text search, JSON support, Railway-native |
| **Auth** | Custom JWT + bcrypt | — | No third-party auth dependency |
| **File Storage** | Cloudflare R2 | — | S3-compatible, zero egress fees |
| **Image Processing** | Sharp | Latest | WebP conversion, thumbnails, EXIF stripping |
| **Email** | Resend | — | Developer-first API, React email templates |
| **CAPTCHA** | Cloudflare Turnstile | — | Privacy-friendly, free |
| **Frontend Hosting** | Vercel | — | Native Next.js hosting, edge CDN |
| **Backend Hosting** | Railway | — | Managed containers, Postgres, auto-deploy |
| **CI/CD** | GitHub Actions | — | Branch-based workflows |
| **Testing** | Vitest + Playwright | — | Unit + E2E |
| **Linting** | ESLint + Prettier | — | Code consistency |

---

# 4. Development Roadmap

## 4.1 Phase Overview

```
Phase 0 ─── Planning & Design          [COMPLETE] ✅
Phase 1 ─── Foundation & Setup         [Sprint 1, Week 1-2]
Phase 2 ─── Core Backend               [Sprint 2-3, Week 3-6]
Phase 3 ─── Core Frontend              [Sprint 2-4, Week 3-8]
Phase 4 ─── Admin Panel                [Sprint 4-5, Week 7-10]
Phase 5 ─── Integrations & Polish      [Sprint 6, Week 11-12]
Phase 6 ─── Testing & QA               [Sprint 7, Week 13-14]
Phase 7 ─── Deployment & Launch        [Sprint 8, Week 15-16]
Phase 8 ─── Post-Launch                [Ongoing]
```

## 4.2 Phase Details

### Phase 0 — Planning & Design ✅ COMPLETE

| Deliverable | Status |
|---|---|
| PRD | ✅ Done |
| TRD | ✅ Done |
| App Flow Document | ✅ Done |
| Design Brief | ✅ Done |
| Backend Schema | ✅ Done |
| Implementation Plan | ✅ This document |

### Phase 1 — Foundation & Setup (Sprint 1)

| Task | Deliverable |
|---|---|
| Initialize monorepo | `/client` (Next.js) + `/server` (Express) |
| Configure TypeScript | Shared `tsconfig.base.json` |
| Setup ESLint + Prettier | Consistent code style |
| Setup Husky + lint-staged | Pre-commit quality gate |
| Configure environment variables | `.env.example` for both client and server |
| Setup PostgreSQL (Railway dev) | Running database instance |
| Implement Drizzle schema | All 18 tables from BackendSchema |
| Run initial migration | Schema applied to dev database |
| Seed default data | Admin user + settings |
| Setup Express boilerplate | Health check endpoint running |
| Setup Next.js boilerplate | Home page renders |
| Implement design tokens (CSS) | CSS custom properties from DesignBrief |
| Create base layout | Header + Footer + page shell |
| Setup GitHub Actions | Lint + type-check on PR |

### Phase 2 — Core Backend (Sprints 2–3)

| Task | Deliverable |
|---|---|
| Auth module (login, refresh, logout) | JWT auth working |
| RBAC middleware | Role-based route protection |
| Password reset flow | Token-based reset via email |
| Categories CRUD | Full API for learn categories |
| Articles CRUD | Full API with status lifecycle |
| Blog Posts CRUD | Full API with tags, status |
| Projects CRUD | Full API with CTA fields |
| School Sessions CRUD | Full API with photo management |
| Team Members CRUD | Full API with ordering |
| FAQ CRUD | Full API with categories |
| Media upload endpoint | R2 upload + Sharp processing |
| Contact form endpoint | Public submission + rate limiting |
| Volunteer form endpoint | Public submission + validation |
| Newsletter endpoint | Subscribe + resubscribe logic |
| Settings CRUD | Key-value config API |
| Audit logging service | Auto-log all admin mutations |
| Search endpoint | Unified full-text search |

### Phase 3 — Core Frontend (Sprints 2–4)

| Task | Deliverable |
|---|---|
| Homepage | Hero + featured content + CTA sections |
| About page | Mission, team, principles, journey |
| Learn hub | Category grid + article listing |
| Learn article page | Article content + sidebar + related |
| Blog listing | Paginated posts + tag filtering |
| Blog post page | Post content + related posts |
| Projects page | Project grid + detail modals/pages |
| Schools page | Session listing + photo gallery |
| Contact page | Contact form + info |
| Join page | Volunteer registration form |
| FAQ page | Accordion FAQ grouped by category |
| Search results | Unified search with type badges |
| 404 page | Branded error page |
| Privacy + Terms | Static legal pages |

### Phase 4 — Admin Panel (Sprints 4–5)

| Task | Deliverable |
|---|---|
| Admin login page | JWT login form |
| Admin layout | Sidebar + header + breadcrumbs |
| Dashboard | Stats cards + activity feed |
| Articles manager | List + create/edit form + status controls |
| Blog manager | List + create/edit form + tags |
| Projects manager | List + create/edit form |
| Schools manager | List + create/edit form + photo upload |
| Team manager | List + create/edit + drag reorder |
| FAQ manager | List + create/edit + category tabs |
| Media library | Grid view + upload + delete |
| Contact inbox | List + status updates + detail view |
| Volunteer pipeline | List + status pipeline + detail view |
| Newsletter list | Subscriber list + export CSV |
| Settings panel | Grouped settings form |
| User management | User list + create/edit (SuperAdmin) |
| Audit log viewer | Chronological log with filters |

### Phase 5 — Integrations & Polish (Sprint 6)

| Task | Deliverable |
|---|---|
| Email integration (Resend) | Contact/volunteer notifications, password reset |
| Cloudflare Turnstile | CAPTCHA on public forms |
| SEO metadata | Per-page meta tags, OG, Twitter cards |
| Structured data (JSON-LD) | Organization, Article, BreadcrumbList |
| Sitemap generation | Dynamic XML sitemap |
| robots.txt | Configured for production |
| RSS feed | Blog RSS feed |
| Analytics | Vercel Web Analytics integration |
| Motion & animations | Scroll reveals, hero animation, page transitions |
| Responsive testing | All breakpoints verified |
| Accessibility audit | WCAG 2.2 AA compliance |

### Phase 6 — Testing & QA (Sprint 7)

| Task | Deliverable |
|---|---|
| API integration tests | All endpoints tested |
| E2E tests (Playwright) | Critical user flows automated |
| Accessibility testing | axe-core + manual screen reader |
| Performance testing | Lighthouse ≥ 90 all categories |
| Security review | OWASP top 10 checklist |
| Cross-browser testing | Chrome, Firefox, Safari, Edge |
| Mobile testing | iOS Safari, Android Chrome |
| Content review | All copy reviewed, no lorem ipsum |
| Bug fixing | All P0/P1 bugs resolved |

### Phase 7 — Deployment & Launch (Sprint 8)

| Task | Deliverable |
|---|---|
| Production database (Railway) | PostgreSQL provisioned + migrated |
| Production backend (Railway) | Express deployed with env vars |
| Production frontend (Vercel) | Next.js deployed with custom domain |
| DNS configuration | thenagrik.org pointed to Vercel |
| SSL verification | HTTPS working on all routes |
| CDN configuration | R2 public bucket + custom domain |
| Monitoring setup | Vercel Analytics + Railway metrics |
| Backup verification | Railway auto-backup confirmed |
| Seed production data | Initial content loaded |
| Final smoke test | All pages load, all forms submit |
| Launch | DNS propagated, site live |

---

# 5. Dependency Graph

```
┌────────────────────────────────────────────────────────────────┐
│                       PHASE 1: FOUNDATION                      │
│                                                                │
│  Repository Setup ──▶ TypeScript Config ──▶ Linting/Husky     │
│         │                                                      │
│         ▼                                                      │
│  PostgreSQL Setup ──▶ Drizzle Schema ──▶ Migrations ──▶ Seeds │
│         │                                                      │
│         ▼                                                      │
│  Express Boilerplate ──▶ Health Check                         │
│         │                                                      │
│  Next.js Boilerplate ──▶ Design Tokens ──▶ Base Layout        │
└────────────────────────┬───────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────┐
│                       PHASE 2: BACKEND                         │
│                                                                │
│  Auth Module ──▶ RBAC Middleware ──▶ Password Reset            │
│      │                  │                                      │
│      ▼                  ▼                                      │
│  Categories CRUD ──▶ Articles CRUD                             │
│                     Blog Posts CRUD                             │
│                     Projects CRUD                               │
│                     School Sessions CRUD                        │
│                     Team Members CRUD                           │
│                     FAQ CRUD                                    │
│      │                                                         │
│      ▼                                                         │
│  Media Upload ──▶ Contact Form ──▶ Volunteer Form             │
│                  Newsletter ──▶ Settings ──▶ Audit Logs       │
│                                                                │
│  Search Endpoint (depends on all content tables)               │
└────────────────────────┬───────────────────────────────────────┘
                         │
              ┌──────────┼──────────┐
              ▼                     ▼
┌──────────────────────┐ ┌──────────────────────┐
│  PHASE 3: PUBLIC UI  │ │  PHASE 4: ADMIN UI   │
│                      │ │                      │
│  Homepage            │ │  Login Page          │
│  About               │ │  Dashboard           │
│  Learn Hub           │ │  Content Managers    │
│  Learn Article       │ │  Form Inboxes        │
│  Blog Listing        │ │  Media Library       │
│  Blog Post           │ │  Settings            │
│  Projects            │ │  User Management     │
│  Schools             │ │  Audit Logs          │
│  Contact             │ │                      │
│  Join                │ │                      │
│  FAQ                 │ │                      │
│  Search              │ │                      │
│  404                 │ │                      │
└──────────┬───────────┘ └──────────┬───────────┘
           │                        │
           └────────────┬───────────┘
                        ▼
┌────────────────────────────────────────────────────────────────┐
│                    PHASE 5: INTEGRATIONS                       │
│                                                                │
│  Resend Email ──▶ Turnstile CAPTCHA ──▶ Analytics             │
│  SEO Metadata ──▶ Structured Data ──▶ Sitemap ──▶ RSS        │
│  Motion/Animations ──▶ Responsive Polish ──▶ A11y            │
└────────────────────────┬───────────────────────────────────────┘
                         ▼
┌────────────────────────────────────────────────────────────────┐
│                    PHASE 6: TESTING                             │
│                                                                │
│  API Tests ──▶ E2E Tests ──▶ A11y Tests ──▶ Perf Tests       │
│  Security Review ──▶ Cross-Browser ──▶ Bug Fixes              │
└────────────────────────┬───────────────────────────────────────┘
                         ▼
┌────────────────────────────────────────────────────────────────┐
│                    PHASE 7: DEPLOYMENT                          │
│                                                                │
│  Prod DB ──▶ Prod Backend ──▶ Prod Frontend ──▶ DNS ──▶ SSL  │
│  CDN ──▶ Monitoring ──▶ Backups ──▶ Smoke Test ──▶ LAUNCH    │
└────────────────────────────────────────────────────────────────┘
```

### Critical Path

The critical path (longest sequential chain) is:

```
DB Schema → Auth → RBAC → Content CRUD APIs → Admin Panel UI → Integration Testing → Deployment
```

**Total critical path items:** ~45 tasks. Everything else can be parallelized around this spine.

---

# 6. Project Setup

## 6.1 Repository

| Item | Specification |
|---|---|
| **Platform** | GitHub (private repository) |
| **Name** | `thenagrik-website` |
| **Structure** | Monorepo (flat, no Turborepo needed for 2 packages) |
| **License** | Private (add MIT if open-sourced later) |

## 6.2 Branch Strategy

| Branch | Purpose | Protection |
|---|---|---|
| `main` | Production-ready code. Auto-deploys to production. | Required: PR review, CI pass |
| `develop` | Integration branch. Auto-deploys to staging. | Required: CI pass |
| `feature/*` | Feature branches off `develop` | None |
| `fix/*` | Bug fix branches | None |
| `hotfix/*` | Emergency fixes off `main` | Fast-track review |

**Flow:** `feature/auth-login` → PR to `develop` → test on staging → PR to `main` → production

## 6.3 Folder Structure

```
thenagrik-website/
├── client/                          # Next.js 15 (App Router)
│   ├── public/
│   │   ├── fonts/
│   │   ├── images/
│   │   ├── robots.txt
│   │   └── sitemap.xml             # Generated at build time
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/           # Route group: public pages
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx        # Homepage
│   │   │   │   ├── about/
│   │   │   │   ├── learn/
│   │   │   │   ├── blog/
│   │   │   │   ├── projects/
│   │   │   │   ├── schools/
│   │   │   │   ├── contact/
│   │   │   │   ├── join/
│   │   │   │   ├── faq/
│   │   │   │   ├── search/
│   │   │   │   ├── privacy/
│   │   │   │   └── terms/
│   │   │   ├── admin/              # Route group: admin panel
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── login/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── articles/
│   │   │   │   ├── blog/
│   │   │   │   ├── projects/
│   │   │   │   ├── schools/
│   │   │   │   ├── team/
│   │   │   │   ├── faq/
│   │   │   │   ├── media/
│   │   │   │   ├── forms/
│   │   │   │   ├── settings/
│   │   │   │   ├── users/
│   │   │   │   └── audit-logs/
│   │   │   ├── layout.tsx          # Root layout
│   │   │   ├── not-found.tsx       # 404
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/                 # Reusable primitives (Button, Input, Modal, etc.)
│   │   │   ├── layout/             # Header, Footer, Sidebar, Navigation
│   │   │   ├── sections/           # Homepage sections, About sections
│   │   │   ├── content/            # ArticleCard, BlogCard, ProjectCard
│   │   │   ├── forms/              # ContactForm, VolunteerForm, NewsletterForm
│   │   │   ├── admin/              # AdminHeader, AdminSidebar, DataTable
│   │   │   └── motion/             # ScrollReveal, TextReveal, PageTransition
│   │   ├── hooks/                  # Custom hooks (useAuth, useApi, useMediaUpload)
│   │   ├── lib/                    # Utilities (api client, seo helpers, slug utils)
│   │   ├── styles/                 # CSS modules, design tokens
│   │   │   ├── tokens.css          # CSS custom properties
│   │   │   ├── typography.css      # Type scale
│   │   │   ├── reset.css           # CSS reset
│   │   │   └── animations.css      # Keyframe definitions
│   │   └── types/                  # Shared TypeScript types
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                          # Express 5 (TypeScript)
│   ├── src/
│   │   ├── app.ts                  # Express app configuration
│   │   ├── server.ts               # Server entry point
│   │   ├── config/                 # Environment, constants
│   │   │   ├── env.ts
│   │   │   └── constants.ts
│   │   ├── db/
│   │   │   ├── schema.ts           # Drizzle schema (18 tables)
│   │   │   ├── index.ts            # Database connection
│   │   │   ├── seed.ts             # Seed script
│   │   │   └── migrations/         # Drizzle Kit generated
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.validation.ts
│   │   │   ├── articles/
│   │   │   ├── blog/
│   │   │   ├── categories/
│   │   │   ├── projects/
│   │   │   ├── schools/
│   │   │   ├── team/
│   │   │   ├── faq/
│   │   │   ├── media/
│   │   │   ├── forms/
│   │   │   ├── settings/
│   │   │   ├── search/
│   │   │   └── audit/
│   │   ├── middleware/
│   │   │   ├── authenticate.ts     # JWT verification
│   │   │   ├── authorize.ts        # RBAC role check
│   │   │   ├── validate.ts         # Zod validation
│   │   │   ├── rateLimiter.ts      # express-rate-limit
│   │   │   └── errorHandler.ts     # Global error handler
│   │   ├── services/
│   │   │   ├── email.ts            # Resend integration
│   │   │   ├── storage.ts          # R2 upload/delete
│   │   │   ├── auditLog.ts         # Audit logging helper
│   │   │   └── imageProcessor.ts   # Sharp processing
│   │   └── utils/
│   │       ├── slug.ts
│   │       ├── pagination.ts
│   │       └── errors.ts           # Custom error classes
│   ├── drizzle.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── shared/                          # Shared types between client/server
│   ├── types/
│   │   ├── api.ts                  # API request/response types
│   │   ├── entities.ts             # Entity types matching schema
│   │   └── enums.ts                # Shared enums (roles, statuses)
│   ├── tsconfig.json
│   └── package.json
│
├── .github/
│   └── workflows/
│       ├── ci.yml                  # Lint + typecheck + test
│       └── deploy.yml              # Production deployment
│
├── .env.example
├── .gitignore
├── .prettierrc
├── .eslintrc.js
├── package.json                    # Root workspace config
└── README.md
```

## 6.4 Environment Variables

```bash
# .env.example

# ── Database ──
DATABASE_URL=postgresql://user:password@localhost:5432/thenagrik_dev

# ── Auth ──
JWT_SECRET=your-256-bit-secret-here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
BCRYPT_ROUNDS=12

# ── Email ──
RESEND_API_KEY=re_your_api_key
ADMIN_EMAIL=thenagrik.org@gmail.com

# ── Storage ──
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=thenagrik-media
R2_PUBLIC_URL=https://media.thenagrik.org

# ── CAPTCHA ──
TURNSTILE_SECRET_KEY=your_turnstile_secret
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key

# ── Application ──
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# ── Analytics ──
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## 6.5 Code Standards

| Tool | Configuration |
|---|---|
| **ESLint** | `@typescript-eslint/recommended` + `next/core-web-vitals` |
| **Prettier** | `{ semi: true, singleQuote: true, trailingComma: 'all', printWidth: 100, tabWidth: 2 }` |
| **Husky** | Pre-commit: `lint-staged` (ESLint + Prettier on staged files) |
| **Commit Convention** | Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:` |
| **TypeScript** | `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true` |

---

# 7. Database Implementation

## 7.1 Tasks

| # | Task | Depends On | Complexity | Priority |
|---|---|---|---|---|
| DB-01 | Provision PostgreSQL on Railway (dev environment) | None | Low | P0 |
| DB-02 | Install Drizzle ORM + drizzle-kit | DB-01 | Low | P0 |
| DB-03 | Create `schema.ts` (all 18 tables from BackendSchema v1.0) | DB-02 | Medium | P0 |
| DB-04 | Configure `drizzle.config.ts` | DB-02 | Low | P0 |
| DB-05 | Generate initial migration (`0000_init.sql`) | DB-03, DB-04 | Low | P0 |
| DB-06 | Apply migration to dev database | DB-05 | Low | P0 |
| DB-07 | Create search vector trigger SQL (articles, blog_posts, projects, faq_entries, school_sessions) | DB-06 | Medium | P0 |
| DB-08 | Create `updated_at` auto-update trigger | DB-06 | Low | P0 |
| DB-09 | Write seed script (default super_admin user + settings) | DB-06 | Medium | P0 |
| DB-10 | Run seed on dev database | DB-09 | Low | P0 |
| DB-11 | Create database connection module (`db/index.ts`) | DB-02 | Low | P0 |
| DB-12 | Create partial indexes for soft-deleted tables | DB-06 | Low | P1 |
| DB-13 | Verify all indexes exist and are used (EXPLAIN ANALYZE) | DB-12 | Medium | P2 |

**Deliverables:**
- [ ] PostgreSQL running with all 18 tables
- [ ] Search vector triggers operational
- [ ] Seed data inserted (1 admin user + 12 settings)
- [ ] Migration file committed to repo

---

# 8. Authentication Implementation

## 8.1 Tasks

| # | Task | Depends On | Complexity | Priority |
|---|---|---|---|---|
| AUTH-01 | Install dependencies (bcrypt, jsonwebtoken, cookie-parser) | DB-11 | Low | P0 |
| AUTH-02 | Create `auth.service.ts` (hashPassword, comparePassword, generateTokens) | AUTH-01 | Medium | P0 |
| AUTH-03 | Create JWT utility (sign, verify, decode) | AUTH-01 | Medium | P0 |
| AUTH-04 | Create `authenticate` middleware (verify access token from Authorization header) | AUTH-03 | Medium | P0 |
| AUTH-05 | Create `authorize` middleware (check user role against allowed roles) | AUTH-04 | Low | P0 |
| AUTH-06 | Create `POST /api/v1/auth/login` endpoint | AUTH-02, AUTH-03 | Medium | P0 |
| AUTH-07 | Create `POST /api/v1/auth/refresh` endpoint (rotate refresh token) | AUTH-06 | High | P0 |
| AUTH-08 | Create `POST /api/v1/auth/logout` endpoint (revoke refresh token) | AUTH-06 | Low | P0 |
| AUTH-09 | Implement login lockout logic (5 failed attempts → 15min lock) | AUTH-06 | Medium | P0 |
| AUTH-10 | Create `POST /api/v1/auth/forgot-password` endpoint | AUTH-02 | Medium | P1 |
| AUTH-11 | Create `POST /api/v1/auth/reset-password` endpoint | AUTH-10 | Medium | P1 |
| AUTH-12 | Create expired token cleanup job (daily) | AUTH-07 | Low | P2 |
| AUTH-13 | Write auth integration tests | AUTH-06 through AUTH-11 | Medium | P1 |

**Deliverables:**
- [ ] Login/logout/refresh working with HTTP-only cookies
- [ ] RBAC enforced on all admin routes
- [ ] Password reset flow with email
- [ ] Account lockout after failed attempts
- [ ] Auth integration tests passing

---

# 9. Backend Development Plan

## 9.1 Module Summary

| Module | Tables | API Endpoints | Complexity | Priority | Sprint |
|---|---|---|---|---|---|
| Auth | users, refresh_tokens, password_resets | 5 | High | P0 | 1 |
| Categories | categories | 4 (public) + 3 (admin) | Low | P0 | 2 |
| Articles | articles | 3 (public) + 5 (admin) | High | P0 | 2 |
| Blog | blog_posts | 3 (public) + 5 (admin) | High | P0 | 3 |
| Projects | projects | 2 (public) + 4 (admin) | Medium | P0 | 3 |
| Schools | school_sessions, session_photos | 1 (public) + 5 (admin) | Medium | P0 | 3 |
| Team | team_members | 1 (public) + 4 (admin) | Low | P1 | 3 |
| FAQ | faq_entries | 1 (public) + 3 (admin) | Low | P1 | 3 |
| Media | media_files | 3 (admin) | High | P0 | 4 |
| Forms | contact_submissions, volunteer_registrations, newsletter_subscribers | 3 (public) + 6 (admin) | Medium | P0 | 4 |
| Settings | settings | 1 (public) + 2 (admin) | Low | P1 | 5 |
| Search | (cross-table) | 1 (public) | Medium | P1 | 5 |
| Audit | audit_logs | 1 (admin) | Low | P1 | 5 |
| Dashboard | (aggregation) | 2 (admin) | Low | P1 | 5 |

## 9.2 Module Implementation Pattern

Every backend module follows this structure:

```
modules/{module}/
├── {module}.routes.ts          # Express router with middleware chain
├── {module}.controller.ts      # Request handling, input extraction, response formatting
├── {module}.service.ts         # Business logic, database queries, audit logging
└── {module}.validation.ts      # Zod schemas for request body/params/query validation
```

**Standard CRUD service pattern:**

```typescript
// modules/articles/articles.service.ts (pseudocode)
export const articlesService = {
  async list(filters: ArticleFilters, pagination: Pagination) {
    // Drizzle query with where/orderBy/limit/offset
  },
  async getBySlug(slug: string) {
    // Single article with category + author join
  },
  async create(data: CreateArticleDto, userId: string) {
    // Insert + audit log + return
  },
  async update(id: string, data: UpdateArticleDto, userId: string) {
    // Compute diff → update → audit log → return
  },
  async updateStatus(id: string, status: ArticleStatus, userId: string) {
    // Status transition validation → update → audit log
  },
  async softDelete(id: string, userId: string) {
    // Set deleted_at → audit log
  },
};
```

## 9.3 Detailed Module Tasks

### Categories Module

| # | Task | Complexity |
|---|---|---|
| CAT-01 | `GET /api/v1/categories` — public list with article counts | Low |
| CAT-02 | `GET /api/v1/categories/:slug` — public detail with published articles | Low |
| CAT-03 | `GET /api/v1/admin/categories` — admin list (all) | Low |
| CAT-04 | `POST /api/v1/admin/categories` — create (Admin+) | Low |
| CAT-05 | `PUT /api/v1/admin/categories/:id` — update (Admin+) | Low |
| CAT-06 | `DELETE /api/v1/admin/categories/:id` — delete if empty (Admin+) | Low |
| CAT-07 | Zod validation schemas | Low |

### Articles Module

| # | Task | Complexity |
|---|---|---|
| ART-01 | `GET /api/v1/articles` — public paginated list (published only) | Medium |
| ART-02 | `GET /api/v1/articles/:slug` — public detail with category + author | Medium |
| ART-03 | `GET /api/v1/articles/:slug/related` — 3 related articles | Low |
| ART-04 | `GET /api/v1/admin/articles` — admin list (all statuses, filters) | Medium |
| ART-05 | `GET /api/v1/admin/articles/:id` — admin detail | Low |
| ART-06 | `POST /api/v1/admin/articles` — create (Editor+) | High |
| ART-07 | `PUT /api/v1/admin/articles/:id` — update (Editor+) | High |
| ART-08 | `PATCH /api/v1/admin/articles/:id/status` — publish/archive/restore (Admin+) | Medium |
| ART-09 | `DELETE /api/v1/admin/articles/:id` — soft delete (Admin+) | Low |
| ART-10 | Slug generation + collision handling | Medium |
| ART-11 | Reading time calculation | Low |
| ART-12 | Zod validation schemas | Medium |

### Blog Module

| # | Task | Complexity |
|---|---|---|
| Same pattern as Articles, plus: | | |
| BLOG-01 through BLOG-12 | Mirror articles module | High |
| BLOG-13 | Tag filtering (`?tag=constitution`) | Medium |
| BLOG-14 | RSS feed generation (`/api/v1/blog/feed.xml`) | Medium |

### Projects Module

| # | Task | Complexity |
|---|---|---|
| PROJ-01 | `GET /api/v1/projects` — public list (active + completed) | Low |
| PROJ-02 | `GET /api/v1/projects/:slug` — public detail | Low |
| PROJ-03 | `GET /api/v1/admin/projects` — admin list | Low |
| PROJ-04 | `POST /api/v1/admin/projects` — create (Admin+) | Medium |
| PROJ-05 | `PUT /api/v1/admin/projects/:id` — update (Admin+) | Medium |
| PROJ-06 | `DELETE /api/v1/admin/projects/:id` — soft delete (Admin+) | Low |

### Schools Module

| # | Task | Complexity |
|---|---|---|
| SCH-01 | `GET /api/v1/schools/sessions` — public list with photo thumbnails | Medium |
| SCH-02 | `GET /api/v1/admin/schools` — admin list | Low |
| SCH-03 | `POST /api/v1/admin/schools` — create session (Editor+) | Medium |
| SCH-04 | `PUT /api/v1/admin/schools/:id` — update session (Editor+) | Medium |
| SCH-05 | `DELETE /api/v1/admin/schools/:id` — soft delete (Admin+) | Low |
| SCH-06 | `POST /api/v1/admin/schools/:id/photos` — upload photos (Editor+) | High |
| SCH-07 | `DELETE /api/v1/admin/schools/:id/photos/:photoId` — delete photo | Low |

### Media Module

| # | Task | Complexity |
|---|---|---|
| MED-01 | `POST /api/v1/admin/media` — upload file (Editor+) | High |
| MED-02 | `GET /api/v1/admin/media` — list with pagination + type filter | Medium |
| MED-03 | `PATCH /api/v1/admin/media/:id` — update alt text | Low |
| MED-04 | `DELETE /api/v1/admin/media/:id` — delete from DB + R2 (Admin+) | Medium |
| MED-05 | Sharp image processing (WebP conversion, thumbnail, EXIF strip) | High |
| MED-06 | R2 upload/delete service | High |

### Forms Module

| # | Task | Complexity |
|---|---|---|
| FORM-01 | `POST /api/v1/contact` — public contact submission | Medium |
| FORM-02 | `POST /api/v1/volunteers` — public volunteer registration | Medium |
| FORM-03 | `POST /api/v1/newsletter/subscribe` — public subscribe | Low |
| FORM-04 | `GET /api/v1/admin/forms/contact` — admin list with filters | Medium |
| FORM-05 | `PATCH /api/v1/admin/forms/contact/:id` — update status | Low |
| FORM-06 | `GET /api/v1/admin/forms/contact/export` — CSV export | Medium |
| FORM-07 | `GET /api/v1/admin/forms/volunteers` — admin list | Medium |
| FORM-08 | `PATCH /api/v1/admin/forms/volunteers/:id` — update status | Low |
| FORM-09 | `GET /api/v1/admin/forms/volunteers/export` — CSV export | Medium |
| FORM-10 | `GET /api/v1/admin/forms/newsletter` — subscriber list | Low |
| FORM-11 | `GET /api/v1/admin/forms/newsletter/export` — CSV export | Low |
| FORM-12 | Rate limiting on public form endpoints (3/min) | Low |
| FORM-13 | Turnstile CAPTCHA verification | Medium |

---

# 10. Frontend Development Plan

## 10.1 Public Pages

| Page | Route | Key Components | Data Source | Priority | Sprint |
|---|---|---|---|---|---|
| **Homepage** | `/` | Hero, FeaturedArticles, ImpactStats, ProjectsPreview, VolunteerCTA, BlogPreview, NewsletterForm | articles, projects, blog_posts, settings | P0 | 2-3 |
| **About** | `/about` | MissionSection, TeamGrid, CorePrinciples, JourneyTimeline | team_members, core_principles, settings | P0 | 3 |
| **Learn Hub** | `/learn` | CategoryGrid | categories (with article counts) | P0 | 2 |
| **Learn Category** | `/learn/[category]` | CategoryHeader, ArticleList (paginated) | categories, articles | P0 | 2 |
| **Learn Article** | `/learn/[category]/[slug]` | ArticleContent, Sidebar, RelatedArticles | articles, categories | P0 | 2 |
| **Blog Listing** | `/blog` | BlogPostGrid (paginated), TagFilter | blog_posts | P0 | 3 |
| **Blog Post** | `/blog/[slug]` | BlogContent, AuthorBox, RelatedPosts | blog_posts | P0 | 3 |
| **Projects** | `/projects` | ProjectGrid, ProjectDetailModal/Page | projects | P0 | 3 |
| **Schools** | `/schools` | SessionList, PhotoGallery, ImpactCounter | school_sessions, session_photos | P0 | 3 |
| **Contact** | `/contact` | ContactForm, ContactInfo, Map embed | form submission API | P0 | 4 |
| **Join** | `/join` | VolunteerForm, WhyVolunteer, FAQ excerpt | form submission API | P0 | 4 |
| **FAQ** | `/faq` | AccordionGroup (by category) | faq_entries | P1 | 4 |
| **Search** | `/search` | SearchInput, SearchResults (typed badges) | search API | P1 | 5 |
| **404** | `not-found.tsx` | Branded error with civic humor | Static | P2 | 6 |
| **Privacy** | `/privacy` | StaticMarkdown | Static content | P2 | 6 |
| **Terms** | `/terms` | StaticMarkdown | Static content | P2 | 6 |

## 10.2 Admin Pages

| Page | Route | Key Components | Priority | Sprint |
|---|---|---|---|---|
| **Login** | `/admin/login` | LoginForm, ErrorDisplay | P0 | 2 |
| **Dashboard** | `/admin/dashboard` | StatCards, ActivityFeed, QuickLinks | P0 | 5 |
| **Articles List** | `/admin/articles` | DataTable, StatusFilter, CreateButton | P0 | 4 |
| **Article Editor** | `/admin/articles/[id]` | TiptapEditor, MetadataForm, StatusButtons | P0 | 4 |
| **Blog List** | `/admin/blog` | DataTable, StatusFilter, CreateButton | P0 | 4 |
| **Blog Editor** | `/admin/blog/[id]` | TiptapEditor, TagInput, MetadataForm | P0 | 4 |
| **Projects List** | `/admin/projects` | DataTable, CreateButton | P0 | 5 |
| **Project Editor** | `/admin/projects/[id]` | Form with CTA fields, image upload | P0 | 5 |
| **Schools List** | `/admin/schools` | DataTable, CreateButton | P0 | 5 |
| **School Editor** | `/admin/schools/[id]` | SessionForm, PhotoUploader | P0 | 5 |
| **Team Manager** | `/admin/team` | DraggableList, MemberForm | P1 | 5 |
| **FAQ Manager** | `/admin/faq` | SortableList, FAQForm, CategoryTabs | P1 | 5 |
| **Media Library** | `/admin/media` | ImageGrid, UploadZone, DetailPanel | P0 | 5 |
| **Contact Inbox** | `/admin/forms/contact` | InboxList, StatusDropdown, DetailView | P0 | 5 |
| **Volunteer Pipeline** | `/admin/forms/volunteers` | PipelineTable, StatusDropdown, DetailView | P0 | 5 |
| **Newsletter** | `/admin/forms/newsletter` | SubscriberTable, ExportButton | P1 | 5 |
| **Settings** | `/admin/settings` | GroupedForm, SaveButton | P1 | 5 |
| **Users** | `/admin/users` | UserTable, CreateUserForm (SuperAdmin) | P1 | 5 |
| **Audit Logs** | `/admin/audit-logs` | LogTable, Filters | P2 | 6 |

## 10.3 Reusable Component Library

| Component | Usage | Complexity |
|---|---|---|
| `Button` | Primary, secondary, outline, ghost, icon variants | Low |
| `Input` | Text, email, textarea — bottom-border style per DesignBrief | Low |
| `Select` | Custom dropdown matching design system | Medium |
| `Modal` | Confirm dialogs, detail views | Medium |
| `Toast` | Success/error notifications | Medium |
| `DataTable` | Admin lists with sorting, pagination, bulk actions | High |
| `RichTextEditor` | Tiptap wrapper with toolbar | High |
| `ImageUpload` | Drop zone + preview + alt text | Medium |
| `Pagination` | Page navigation for listings | Low |
| `Badge` | Status badges (draft/published/archived, role badges) | Low |
| `Accordion` | FAQ expandable sections | Low |
| `Tabs` | Settings groups, form category tabs | Low |
| `Breadcrumbs` | Navigation hierarchy (admin + learn section) | Low |
| `EmptyState` | Illustrated empty states for admin sections | Low |
| `LoadingSkeleton` | Shimmer loading states per DesignBrief | Medium |
| `ScrollReveal` | Intersection Observer wrapper for reveal animations | Medium |
| `TextReveal` | Word-by-word or line-by-line text animation | Medium |
| `PageTransition` | Cross-fade between page navigations | Medium |

---

# 11. UI/UX Implementation Plan

## 11.1 Design Token Implementation

| Task | File | Complexity | Priority |
|---|---|---|---|
| Define CSS custom properties (colors, spacing, typography, radius, shadows) | `tokens.css` | Medium | P0 |
| Define type scale (14 sizes from h1-hero to caption) | `typography.css` | Medium | P0 |
| Define animation timing tokens (4 durations + 3 easings) | `animations.css` | Low | P0 |
| Define responsive breakpoints (480, 768, 1024, 1440, 1920) | `tokens.css` | Low | P0 |
| Create CSS reset (modern normalize) | `reset.css` | Low | P0 |

**Token values from DesignBrief:**

```css
:root {
  /* Colors — Cool Sophistication */
  --color-bg-primary: #F5F5F0;        /* Off-White paper */
  --color-bg-dark: #1A2332;           /* Deep Navy */
  --color-text-primary: #1A2332;
  --color-text-secondary: #4A5568;
  --color-text-inverted: #F5F5F0;
  --color-accent: #C45C3C;            /* Warm Terracotta */
  --color-accent-hover: #A34B31;
  --color-border: #D4D0C8;
  --color-surface: #FFFFFF;
  --color-surface-muted: #EDEAE3;

  /* Typography */
  --font-serif: 'DM Serif Display', Georgia, serif;
  --font-sans: 'DM Sans', -apple-system, sans-serif;

  /* Spacing scale */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
  --space-4xl: 96px;
  --space-5xl: 128px;
  --space-6xl: 160px;

  /* Radius */
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 8px;

  /* Animation */
  --duration-fast: 200ms;
  --duration-normal: 400ms;
  --duration-slow: 800ms;
  --duration-reveal: 1200ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

## 11.2 Animation Engineering Tasks

| # | Task | Tool | Complexity | Priority |
|---|---|---|---|---|
| ANIM-01 | `ScrollReveal` component (fade-up with stagger) | Framer Motion | Medium | P1 |
| ANIM-02 | `TextReveal` component (line-by-line headline animation) | Framer Motion | High | P1 |
| ANIM-03 | Hero section entrance animation (editorial slide-in) | Framer Motion | High | P1 |
| ANIM-04 | Page transition (cross-fade between routes) | Framer Motion `AnimatePresence` | Medium | P2 |
| ANIM-05 | Scroll-based section pinning (homepage narrative) | GSAP ScrollTrigger | High | P2 |
| ANIM-06 | Impact counter animation (number counting up) | Custom hook | Medium | P1 |
| ANIM-07 | Card hover effects (translateY -3px + border-color shift) | CSS transitions | Low | P1 |
| ANIM-08 | Navigation scroll behavior (shrink header on scroll) | Intersection Observer | Medium | P1 |
| ANIM-09 | Image loading (blur-up placeholder → sharp image) | Next.js `Image` + CSS | Low | P1 |
| ANIM-10 | Form input focus animation (bottom border expansion) | CSS transitions | Low | P1 |
| ANIM-11 | Button press feedback (scale 0.98 on active) | CSS transitions | Low | P2 |
| ANIM-12 | Loading skeleton shimmer | CSS animation | Low | P1 |
| ANIM-13 | Toast notification entry/exit | Framer Motion | Low | P2 |
| ANIM-14 | `prefers-reduced-motion` fallback (disable all motion) | CSS media query | Low | P0 |
| ANIM-15 | Photo lightbox open/close animation | Framer Motion | Medium | P2 |

---

# 12. API Development Plan (Build Order)

The APIs must be built in dependency order. Content APIs depend on auth; admin CRUD depends on content APIs.

## 12.1 Build Sequence

```
Week 1-2: Auth APIs (foundation for all admin endpoints)
    ↓
Week 3-4: Category + Article APIs (core content)
    ↓
Week 4-5: Blog + Project + School APIs (remaining content)
    ↓
Week 5-6: Team + FAQ + Core Principles APIs (simple CRUD)
    ↓
Week 6-7: Media + Form APIs (uploads + public submissions)
    ↓
Week 7-8: Settings + Search + Dashboard + Audit APIs (system)
```

## 12.2 API Endpoint Registry (Complete)

### Auth APIs (5 endpoints)

| # | Method | Endpoint | Auth | Priority |
|---|---|---|---|---|
| 1 | POST | `/api/v1/auth/login` | Public | P0 |
| 2 | POST | `/api/v1/auth/refresh` | Cookie | P0 |
| 3 | POST | `/api/v1/auth/logout` | Bearer | P0 |
| 4 | POST | `/api/v1/auth/forgot-password` | Public | P1 |
| 5 | POST | `/api/v1/auth/reset-password` | Token | P1 |

### Content APIs — Public (16 endpoints)

| # | Method | Endpoint | Notes | Priority |
|---|---|---|---|---|
| 6 | GET | `/api/v1/categories` | With article counts | P0 |
| 7 | GET | `/api/v1/categories/:slug` | With published articles | P0 |
| 8 | GET | `/api/v1/articles` | Paginated, published only | P0 |
| 9 | GET | `/api/v1/articles/:slug` | With category + author | P0 |
| 10 | GET | `/api/v1/articles/:slug/related` | 3 related | P1 |
| 11 | GET | `/api/v1/blog` | Paginated, tag filter | P0 |
| 12 | GET | `/api/v1/blog/:slug` | With author | P0 |
| 13 | GET | `/api/v1/blog/:slug/related` | 3 related | P1 |
| 14 | GET | `/api/v1/blog/feed.xml` | RSS feed | P2 |
| 15 | GET | `/api/v1/projects` | Active projects | P0 |
| 16 | GET | `/api/v1/projects/:slug` | Detail | P0 |
| 17 | GET | `/api/v1/schools/sessions` | With photo thumbnails | P0 |
| 18 | GET | `/api/v1/team` | Active members ordered | P0 |
| 19 | GET | `/api/v1/faq` | Active, grouped by category | P0 |
| 20 | GET | `/api/v1/settings/public` | Non-sensitive settings | P0 |
| 21 | GET | `/api/v1/search?q=` | Unified full-text search | P1 |

### Public Form APIs (3 endpoints)

| # | Method | Endpoint | Notes | Priority |
|---|---|---|---|---|
| 22 | POST | `/api/v1/contact` | Rate limited, Turnstile | P0 |
| 23 | POST | `/api/v1/volunteers` | Rate limited, Turnstile | P0 |
| 24 | POST | `/api/v1/newsletter/subscribe` | Resubscribe logic | P0 |

### Admin Content APIs (35 endpoints)

| # | Method | Endpoint | Auth | Priority |
|---|---|---|---|---|
| 25-27 | GET/POST | `/api/v1/admin/categories` | Admin+ | P0 |
| 28-29 | PUT/DELETE | `/api/v1/admin/categories/:id` | Admin+ | P0 |
| 30-31 | GET/POST | `/api/v1/admin/articles` | Editor+ | P0 |
| 32-34 | GET/PUT/DELETE | `/api/v1/admin/articles/:id` | Editor+/Admin+ | P0 |
| 35 | PATCH | `/api/v1/admin/articles/:id/status` | Admin+ | P0 |
| 36-37 | GET/POST | `/api/v1/admin/blog` | Editor+ | P0 |
| 38-40 | GET/PUT/DELETE | `/api/v1/admin/blog/:id` | Editor+/Admin+ | P0 |
| 41 | PATCH | `/api/v1/admin/blog/:id/status` | Admin+ | P0 |
| 42-43 | GET/POST | `/api/v1/admin/projects` | Admin+ | P0 |
| 44-46 | GET/PUT/DELETE | `/api/v1/admin/projects/:id` | Admin+ | P0 |
| 47-48 | GET/POST | `/api/v1/admin/schools` | Editor+ | P0 |
| 49-51 | GET/PUT/DELETE | `/api/v1/admin/schools/:id` | Editor+/Admin+ | P0 |
| 52 | POST | `/api/v1/admin/schools/:id/photos` | Editor+ | P0 |
| 53 | DELETE | `/api/v1/admin/schools/:id/photos/:photoId` | Editor+ | P0 |
| 54-55 | GET/POST | `/api/v1/admin/team` | Admin+ | P1 |
| 56-57 | PUT/DELETE | `/api/v1/admin/team/:id` | Admin+ | P1 |
| 58 | PATCH | `/api/v1/admin/team/reorder` | Admin+ | P1 |
| 59-60 | GET/POST | `/api/v1/admin/faq` | Editor+ | P1 |
| 61-62 | PUT/DELETE | `/api/v1/admin/faq/:id` | Editor+/Admin+ | P1 |

### Admin Form Management APIs (9 endpoints)

| # | Method | Endpoint | Auth | Priority |
|---|---|---|---|---|
| 63 | GET | `/api/v1/admin/forms/contact` | Admin+ | P0 |
| 64 | PATCH | `/api/v1/admin/forms/contact/:id` | Admin+ | P0 |
| 65 | GET | `/api/v1/admin/forms/contact/export` | Admin+ | P1 |
| 66 | GET | `/api/v1/admin/forms/volunteers` | Admin+ | P0 |
| 67 | PATCH | `/api/v1/admin/forms/volunteers/:id` | Admin+ | P0 |
| 68 | GET | `/api/v1/admin/forms/volunteers/export` | Admin+ | P1 |
| 69 | GET | `/api/v1/admin/forms/newsletter` | Admin+ | P1 |
| 70 | GET | `/api/v1/admin/forms/newsletter/export` | Admin+ | P1 |
| 71 | DELETE | `/api/v1/admin/forms/newsletter/:id` | Admin+ | P2 |

### Admin System APIs (8 endpoints)

| # | Method | Endpoint | Auth | Priority |
|---|---|---|---|---|
| 72-73 | GET/POST | `/api/v1/admin/media` | Editor+ | P0 |
| 74-75 | PATCH/DELETE | `/api/v1/admin/media/:id` | Editor+/Admin+ | P0 |
| 76 | GET | `/api/v1/admin/settings` | SuperAdmin | P1 |
| 77 | PATCH | `/api/v1/admin/settings/:key` | SuperAdmin | P1 |
| 78-79 | GET/POST | `/api/v1/admin/users` | SuperAdmin | P1 |
| 80-81 | PUT/DELETE | `/api/v1/admin/users/:id` | SuperAdmin | P1 |
| 82 | GET | `/api/v1/admin/audit-logs` | SuperAdmin | P2 |
| 83 | GET | `/api/v1/admin/dashboard/stats` | Editor+ | P1 |
| 84 | GET | `/api/v1/admin/dashboard/activity` | Editor+ | P1 |

**Total: ~84 endpoints**

---

# 13. Integration Plan

| Integration | Service | When | Complexity | Priority |
|---|---|---|---|---|
| **Email** | Resend | Sprint 4 | Medium | P0 |
| **File Storage** | Cloudflare R2 (via AWS S3 SDK) | Sprint 4 | High | P0 |
| **Image Processing** | Sharp (local) | Sprint 4 | Medium | P0 |
| **CAPTCHA** | Cloudflare Turnstile | Sprint 4 | Low | P1 |
| **Analytics** | Vercel Web Analytics | Sprint 6 | Low | P1 |
| **Fonts** | Google Fonts (DM Serif Display + DM Sans) | Sprint 1 | Low | P0 |
| **Rich Text** | Tiptap editor | Sprint 4 | High | P0 |
| **Scroll Animations** | GSAP ScrollTrigger | Sprint 6 | High | P2 |
| **UI Animations** | Framer Motion | Sprint 3 | Medium | P1 |
| **Maps** | Google Maps embed (Contact page) | Sprint 4 | Low | P2 |

### Future Integrations (NOT in V1)

| Integration | Target Release |
|---|---|
| Razorpay (Donations) | V2.0 |
| WhatsApp Business API | V2.0 |
| Google Analytics 4 | V1.5 (if Vercel Analytics insufficient) |
| Mailchimp/Brevo (Newsletter ESP) | V2.0 |
| Algolia/Meilisearch | V2.0 (if PG full-text insufficient) |

---

# 14. Testing Plan

## 14.1 Testing Pyramid

```
         ╱ ╲
        ╱ E2E╲                   5-10 critical flows (Playwright)
       ╱───────╲
      ╱ Integr. ╲               API endpoint tests (Vitest + supertest)
     ╱─────────────╲
    ╱  Unit Tests    ╲          Services, utils, validators (Vitest)
   ╱───────────────────╲
  ╱    Type Checking     ╲     TypeScript compiler (zero-cost)
 ╱─────────────────────────╲
```

## 14.2 Test Coverage Targets

| Category | Tool | Coverage | When |
|---|---|---|---|
| **Type checking** | `tsc --noEmit` | 100% (strict mode) | Every PR (CI) |
| **Linting** | ESLint | 100% (no warnings) | Every PR (CI) |
| **Unit tests** | Vitest | 80% on services + utils | Every PR (CI) |
| **API tests** | Vitest + supertest | All 84 endpoints | Sprint 7 |
| **E2E tests** | Playwright | 8 critical flows | Sprint 7 |
| **Accessibility** | axe-core + Playwright | All public pages | Sprint 7 |
| **Performance** | Lighthouse CI | ≥ 90 all categories | Sprint 7 |
| **Security** | Manual OWASP checklist | Top 10 | Sprint 7 |
| **Cross-browser** | Manual + BrowserStack | Chrome, Firefox, Safari, Edge | Sprint 7 |

## 14.3 Critical E2E Flows

| # | Flow | Steps |
|---|---|---|
| E2E-01 | Public article reading | Home → Learn → Category → Article → Related article |
| E2E-02 | Public blog reading | Home → Blog → Post → Related post |
| E2E-03 | Contact form submission | Contact page → Fill form → Submit → Success toast |
| E2E-04 | Volunteer registration | Join page → Fill form → Submit → Success toast |
| E2E-05 | Admin login + article creation | Login → Dashboard → Articles → New → Fill → Save draft |
| E2E-06 | Admin publish article | Articles → Draft → Publish → Verify public visibility |
| E2E-07 | Admin media upload | Media → Upload → Verify thumbnail → Use in article |
| E2E-08 | Search flow | Search → Type query → View results → Click result |

---

# 15. Animation & Motion Implementation

## 15.1 Motion System Architecture

```
Motion Stack:
├── CSS Transitions (hover, focus, simple state changes)
├── CSS Keyframes (loading skeletons, shimmer, pulse)
├── Framer Motion (component mount/unmount, layout, page transitions)
└── GSAP ScrollTrigger (scroll-linked animations, pinning, timelines)
```

## 15.2 Implementation Tasks

| # | Task | Technology | Complexity | Sprint |
|---|---|---|---|---|
| MOT-01 | Install + configure Framer Motion | npm | Low | 3 |
| MOT-02 | Install + configure GSAP + ScrollTrigger | npm (GSAP free for non-commercial) | Low | 6 |
| MOT-03 | Create `ScrollReveal` wrapper component | Framer Motion `useInView` | Medium | 3 |
| MOT-04 | Create `TextReveal` component (editorial headline animation) | Framer Motion | High | 6 |
| MOT-05 | Homepage hero entrance (left-aligned text slide-in + image reveal) | Framer Motion | High | 3 |
| MOT-06 | Homepage scroll narrative (7-section story) | GSAP ScrollTrigger | High | 6 |
| MOT-07 | Impact counter animation (count-up on scroll into view) | Custom hook + `useInView` | Medium | 4 |
| MOT-08 | Card hover micro-interactions (translateY, border) | CSS transitions | Low | 3 |
| MOT-09 | Navigation shrink on scroll | Intersection Observer | Medium | 3 |
| MOT-10 | Page transitions (cross-fade) | Framer Motion `AnimatePresence` | Medium | 6 |
| MOT-11 | Image blur-up loading | Next.js `placeholder="blur"` | Low | 3 |
| MOT-12 | Form input focus animation (border expansion) | CSS transitions | Low | 4 |
| MOT-13 | Toast entry/exit | Framer Motion | Low | 5 |
| MOT-14 | Photo lightbox with zoom | Framer Motion `layoutId` | Medium | 6 |
| MOT-15 | `prefers-reduced-motion` global disable | CSS + React context | Low | 3 |
| MOT-16 | Loading skeleton shimmer animation | CSS keyframes | Low | 3 |
| MOT-17 | Button press feedback (scale) | CSS `:active` | Low | 3 |

---

# 16. SEO Implementation

| # | Task | Complexity | Priority | Sprint |
|---|---|---|---|---|
| SEO-01 | Configure Next.js `metadata` API for all pages | Medium | P0 | 6 |
| SEO-02 | Dynamic `<title>` + `<meta description>` from DB fields | Medium | P0 | 6 |
| SEO-03 | Open Graph tags (og:title, og:description, og:image, og:type) | Medium | P0 | 6 |
| SEO-04 | Twitter Card tags (twitter:card, twitter:title, etc.) | Low | P1 | 6 |
| SEO-05 | JSON-LD structured data: `Organization` (site-wide) | Medium | P1 | 6 |
| SEO-06 | JSON-LD: `Article` (learn articles + blog posts) | Medium | P1 | 6 |
| SEO-07 | JSON-LD: `BreadcrumbList` (learn section navigation) | Low | P1 | 6 |
| SEO-08 | JSON-LD: `FAQPage` (FAQ page) | Low | P2 | 6 |
| SEO-09 | Dynamic XML sitemap (`/sitemap.xml`) | Medium | P0 | 6 |
| SEO-10 | `robots.txt` (allow all, disallow /admin/) | Low | P0 | 6 |
| SEO-11 | Canonical URL tags on all pages | Low | P0 | 6 |
| SEO-12 | `alt` text on all images | Low | P0 | Ongoing |
| SEO-13 | Semantic HTML (h1 hierarchy, landmark roles) | Low | P0 | Ongoing |
| SEO-14 | Core Web Vitals optimization (LCP < 2.5s, CLS < 0.1, INP < 200ms) | High | P0 | 7 |
| SEO-15 | RSS feed with proper `<link rel="alternate">` | Low | P2 | 6 |

---

# 17. DevOps Plan

## 17.1 Infrastructure

| Component | Service | Plan | Monthly Cost (est.) |
|---|---|---|---|
| **Frontend** | Vercel | Hobby (free) → Pro ($20/mo) | $0–20 |
| **Backend** | Railway | Starter ($5/mo) | $5 |
| **Database** | Railway PostgreSQL | Included in plan | $0 |
| **File Storage** | Cloudflare R2 | Pay-per-use ($0.015/GB) | $1–5 |
| **Email** | Resend | Free (100/day) | $0 |
| **DNS** | Cloudflare | Free | $0 |
| **Domain** | thenagrik.org | Annual | ~$12/year |
| **Total** | | | **$6–30/month** |

## 17.2 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [pull_request]
jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci --workspaces
      - run: npm run lint --workspaces
      - run: npm run typecheck --workspaces

  test:
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: thenagrik_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: ['5432:5432']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci --workspaces
      - run: npm test --workspace=server
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/thenagrik_test
```

## 17.3 Deployment Flow

```
Developer pushes to feature/* branch
        │
        ▼
GitHub Actions CI (lint + typecheck + test)
        │
        ▼ (PR merged to develop)
Vercel Preview Deploy (frontend staging)
Railway Preview Deploy (backend staging)
        │
        ▼ (PR merged to main)
Vercel Production Deploy (frontend)
Railway Production Deploy (backend)
        │
        ▼
Post-deploy health check
```

## 17.4 Rollback Strategy

| Scenario | Action |
|---|---|
| **Frontend broken** | Vercel: instant rollback to previous deployment via dashboard |
| **Backend broken** | Railway: rollback to previous container image via dashboard |
| **Database migration broken** | Drizzle: write reverse migration SQL, apply manually |
| **Configuration error** | Update env vars, redeploy |

## 17.5 Monitoring

| What | Tool | Alert Trigger |
|---|---|---|
| Frontend uptime | Vercel built-in | Page load errors |
| Backend uptime | Railway health check (`/api/v1/health`) | 3 consecutive failures |
| Error tracking | Console logs (V1) → Sentry (V2) | — |
| Performance | Vercel Web Analytics | LCP > 3s |
| Database | Railway metrics dashboard | CPU > 80%, connections > 8 |

---

# 18. Sprint Planning

## Sprint 1 — Foundation (Week 1–2)

| Goal | Set up everything needed before feature development begins |
|---|---|
| **Deliverables** | Running monorepo, database with schema, auth system, base layout |

| # | Task | Owner | Estimate | Priority |
|---|---|---|---|---|
| S1-01 | Initialize monorepo (client + server + shared) | Backend | 2h | P0 |
| S1-02 | Configure TypeScript (3 tsconfigs) | Backend | 1h | P0 |
| S1-03 | Setup ESLint + Prettier + Husky | Backend | 1h | P0 |
| S1-04 | Setup GitHub Actions CI | DevOps | 2h | P0 |
| S1-05 | Provision Railway PostgreSQL (dev) | DevOps | 1h | P0 |
| S1-06 | Implement Drizzle schema (all 18 tables) | Backend | 4h | P0 |
| S1-07 | Generate + apply initial migration | Backend | 1h | P0 |
| S1-08 | Create search vector + updated_at triggers (raw SQL) | Backend | 2h | P0 |
| S1-09 | Write seed script (admin user + settings) | Backend | 2h | P0 |
| S1-10 | Create Express boilerplate (app.ts, server.ts, middleware) | Backend | 3h | P0 |
| S1-11 | Implement auth module (login, refresh, logout) | Backend | 6h | P0 |
| S1-12 | Implement RBAC middleware | Backend | 2h | P0 |
| S1-13 | Create Next.js boilerplate | Frontend | 2h | P0 |
| S1-14 | Implement design tokens (CSS custom properties) | Frontend | 3h | P0 |
| S1-15 | Download + configure Google Fonts (DM Serif + DM Sans) | Frontend | 1h | P0 |
| S1-16 | Create CSS type scale | Frontend | 2h | P0 |
| S1-17 | Create base public layout (header + footer shell) | Frontend | 4h | P0 |
| S1-18 | Create admin login page | Frontend | 3h | P0 |
| S1-19 | Create admin layout (sidebar + header shell) | Frontend | 4h | P0 |
| S1-20 | Create API client utility (frontend → backend) | Frontend | 2h | P0 |

**Acceptance Criteria:**
- [ ] `npm run dev` starts both client (port 3000) and server (port 4000)
- [ ] Database has all 18 tables with indexes
- [ ] Admin can log in and receive JWT tokens
- [ ] Public layout renders header + footer
- [ ] Admin layout renders sidebar + header with user info
- [ ] CI pipeline passes on PR

**Risk:** Database trigger SQL may not be generated by Drizzle Kit — may require manual migration file.

---

## Sprint 2 — Core Content: Learn Section (Week 3–4)

| Goal | Build the Learn section end-to-end (categories, articles, public pages, admin CRUD) |
|---|---|

| # | Task | Owner | Estimate | Priority |
|---|---|---|---|---|
| S2-01 | Categories CRUD API (all endpoints) | Backend | 3h | P0 |
| S2-02 | Articles CRUD API (all endpoints + status lifecycle) | Backend | 6h | P0 |
| S2-03 | Slug generation utility | Backend | 1h | P0 |
| S2-04 | Audit log service (create, update, delete, status_change) | Backend | 3h | P0 |
| S2-05 | Zod validation schemas for categories + articles | Backend | 2h | P0 |
| S2-06 | Pagination utility (limit, offset, total count) | Backend | 1h | P0 |
| S2-07 | Learn Hub page (`/learn`) — category grid | Frontend | 4h | P0 |
| S2-08 | Learn Category page (`/learn/[category]`) — article list | Frontend | 4h | P0 |
| S2-09 | Learn Article page (`/learn/[category]/[slug]`) — full article | Frontend | 6h | P0 |
| S2-10 | ArticleCard component (thumbnail, title, excerpt, category badge) | Frontend | 2h | P0 |
| S2-11 | CategoryCard component (icon, name, article count) | Frontend | 2h | P0 |
| S2-12 | Admin Articles list page (`/admin/articles`) | Frontend | 4h | P0 |
| S2-13 | Admin Article editor page (`/admin/articles/[id]`) | Frontend | 8h | P0 |
| S2-14 | Tiptap rich text editor integration | Frontend | 6h | P0 |
| S2-15 | DataTable reusable component | Frontend | 6h | P0 |
| S2-16 | Admin Categories manager page | Frontend | 4h | P0 |
| S2-17 | ScrollReveal component (Framer Motion) | Frontend | 2h | P1 |
| S2-18 | `prefers-reduced-motion` support | Frontend | 1h | P0 |

**Acceptance Criteria:**
- [ ] Public user can browse categories → articles → read full article
- [ ] Admin can create/edit/publish/archive/delete articles
- [ ] Rich text editor works with image embedding
- [ ] Scroll reveal animations work on public pages
- [ ] Slug auto-generates from title with collision handling

---

## Sprint 3 — Blog + Projects + Schools + About (Week 5–6)

| Goal | Complete all remaining public content sections |
|---|---|

| # | Task | Owner | Estimate | Priority |
|---|---|---|---|---|
| S3-01 | Blog CRUD API (all endpoints + tags + RSS) | Backend | 5h | P0 |
| S3-02 | Projects CRUD API | Backend | 3h | P0 |
| S3-03 | Schools CRUD API (sessions + photos) | Backend | 5h | P0 |
| S3-04 | Team Members CRUD API | Backend | 2h | P1 |
| S3-05 | Core Principles CRUD API | Backend | 1h | P1 |
| S3-06 | FAQ CRUD API | Backend | 2h | P1 |
| S3-07 | Blog listing page (`/blog`) | Frontend | 4h | P0 |
| S3-08 | Blog post page (`/blog/[slug]`) | Frontend | 5h | P0 |
| S3-09 | BlogCard component | Frontend | 2h | P0 |
| S3-10 | Tag filter component | Frontend | 2h | P0 |
| S3-11 | Projects page (`/projects`) | Frontend | 4h | P0 |
| S3-12 | ProjectCard component | Frontend | 2h | P0 |
| S3-13 | Schools page (`/schools`) | Frontend | 5h | P0 |
| S3-14 | PhotoGallery + Lightbox component | Frontend | 4h | P0 |
| S3-15 | About page (`/about`) — mission, team, principles | Frontend | 6h | P0 |
| S3-16 | TeamCard component (photo, name, role, social links) | Frontend | 2h | P0 |
| S3-17 | Homepage v1 (hero + featured sections + CTA) | Frontend | 8h | P0 |
| S3-18 | Hero entrance animation | Frontend | 3h | P1 |
| S3-19 | Impact counter animation | Frontend | 2h | P1 |

**Acceptance Criteria:**
- [ ] All 8 public page types render with real data
- [ ] Homepage shows featured content from all sections
- [ ] Photo gallery with lightbox works on Schools page
- [ ] Blog supports tag filtering and pagination
- [ ] About page shows team, principles, and mission

---

## Sprint 4 — Forms + Admin Content Managers (Week 7–8)

| Goal | Complete public forms and admin CRUD interfaces for all content types |
|---|---|

| # | Task | Owner | Estimate | Priority |
|---|---|---|---|---|
| S4-01 | Contact form API + Turnstile verification | Backend | 3h | P0 |
| S4-02 | Volunteer form API + validation | Backend | 3h | P0 |
| S4-03 | Newsletter subscribe API + resubscribe logic | Backend | 2h | P0 |
| S4-04 | Email service (Resend) — contact + volunteer notifications | Backend | 3h | P0 |
| S4-05 | Media upload API (R2 + Sharp) | Backend | 6h | P0 |
| S4-06 | Password reset flow (forgot + reset endpoints) | Backend | 3h | P1 |
| S4-07 | Contact page (`/contact`) | Frontend | 4h | P0 |
| S4-08 | Join page (`/join`) — volunteer form | Frontend | 4h | P0 |
| S4-09 | FAQ page (`/faq`) — accordion | Frontend | 3h | P1 |
| S4-10 | ContactForm component (Turnstile integration) | Frontend | 3h | P0 |
| S4-11 | VolunteerForm component | Frontend | 3h | P0 |
| S4-12 | NewsletterForm component (footer CTA) | Frontend | 2h | P0 |
| S4-13 | Admin Blog manager (list + editor) | Frontend | 6h | P0 |
| S4-14 | Admin Projects manager (list + editor) | Frontend | 4h | P0 |
| S4-15 | Admin Schools manager (list + editor + photo upload) | Frontend | 6h | P0 |
| S4-16 | Admin FAQ manager | Frontend | 3h | P1 |
| S4-17 | Admin Team manager (with drag-to-reorder) | Frontend | 4h | P1 |
| S4-18 | ImageUpload component (drop zone + preview) | Frontend | 4h | P0 |
| S4-19 | Form input animations (bottom border expansion) | Frontend | 1h | P1 |

**Acceptance Criteria:**
- [ ] Contact form submits with Turnstile, admin receives email notification
- [ ] Volunteer form validates age, interests, submits successfully
- [ ] Newsletter subscribe handles new + resubscribe cases
- [ ] Admin can create/edit content for all 6 content types
- [ ] Media uploads convert to WebP, generate thumbnails, store in R2

---

## Sprint 5 — Admin Dashboard + System Features (Week 9–10)

| Goal | Complete admin panel with dashboard, media library, forms inbox, settings |
|---|---|

| # | Task | Owner | Estimate | Priority |
|---|---|---|---|---|
| S5-01 | Dashboard stats API (aggregate query) | Backend | 2h | P0 |
| S5-02 | Dashboard activity API (recent audit logs) | Backend | 1h | P0 |
| S5-03 | Settings CRUD API | Backend | 2h | P1 |
| S5-04 | User management API (SuperAdmin) | Backend | 3h | P1 |
| S5-05 | Audit log listing API (paginated, filtered) | Backend | 2h | P2 |
| S5-06 | Form management APIs (contact + volunteer status updates, CSV export) | Backend | 4h | P0 |
| S5-07 | Newsletter admin API (list + export) | Backend | 2h | P1 |
| S5-08 | Admin Dashboard page | Frontend | 5h | P0 |
| S5-09 | StatCard component | Frontend | 1h | P0 |
| S5-10 | ActivityFeed component | Frontend | 2h | P0 |
| S5-11 | Admin Media Library page | Frontend | 6h | P0 |
| S5-12 | Admin Contact Inbox page | Frontend | 4h | P0 |
| S5-13 | Admin Volunteer Pipeline page | Frontend | 4h | P0 |
| S5-14 | Admin Newsletter page | Frontend | 2h | P1 |
| S5-15 | Admin Settings page (grouped form) | Frontend | 4h | P1 |
| S5-16 | Admin User Management page (SuperAdmin) | Frontend | 4h | P1 |
| S5-17 | CSV export functionality (download trigger) | Frontend | 2h | P1 |
| S5-18 | Toast notification system | Frontend | 2h | P0 |

**Acceptance Criteria:**
- [ ] Dashboard shows real-time stats + recent activity
- [ ] Media library shows uploaded files with grid view + detail panel
- [ ] Contact inbox displays submissions with status pipeline
- [ ] Settings page saves and persists changes
- [ ] CSV export downloads for all form sections

---

## Sprint 6 — SEO + Search + Motion + Polish (Week 11–12)

| Goal | Add search, SEO, animations, and visual polish |
|---|---|

| # | Task | Owner | Estimate | Priority |
|---|---|---|---|---|
| S6-01 | Unified search API | Backend | 3h | P1 |
| S6-02 | RSS feed endpoint | Backend | 2h | P2 |
| S6-03 | Search results page (`/search`) | Frontend | 4h | P1 |
| S6-04 | Search input in header (expandable) | Frontend | 2h | P1 |
| S6-05 | SEO metadata for all pages (Next.js metadata API) | Frontend | 4h | P0 |
| S6-06 | Open Graph + Twitter Card tags | Frontend | 2h | P0 |
| S6-07 | JSON-LD structured data (Organization, Article, FAQ, Breadcrumb) | Frontend | 3h | P1 |
| S6-08 | Dynamic sitemap.xml generation | Frontend | 2h | P0 |
| S6-09 | robots.txt configuration | Frontend | 0.5h | P0 |
| S6-10 | RSS `<link>` tag in `<head>` | Frontend | 0.5h | P2 |
| S6-11 | TextReveal component (editorial headline animation) | Frontend | 3h | P1 |
| S6-12 | Homepage scroll narrative (GSAP ScrollTrigger) | Frontend | 6h | P2 |
| S6-13 | Page transitions (Framer Motion AnimatePresence) | Frontend | 3h | P2 |
| S6-14 | Photo lightbox animation | Frontend | 2h | P2 |
| S6-15 | 404 page (branded, civic humor) | Frontend | 2h | P2 |
| S6-16 | Privacy + Terms pages (static) | Frontend | 2h | P2 |
| S6-17 | Admin Audit Log viewer page | Frontend | 3h | P2 |
| S6-18 | Loading skeleton states for all data-fetching pages | Frontend | 3h | P1 |
| S6-19 | Empty state illustrations for admin sections | Frontend | 2h | P2 |
| S6-20 | Paper texture background + grain overlay | Frontend | 1h | P1 |

**Acceptance Criteria:**
- [ ] Search returns results across articles, blogs, projects, FAQ
- [ ] All pages have proper meta tags + OG images
- [ ] Sitemap.xml includes all published content URLs
- [ ] Scroll animations fire smoothly without layout shift
- [ ] `prefers-reduced-motion` disables all animations

---

## Sprint 7 — Testing + Accessibility + Performance (Week 13–14)

| Goal | Ensure quality, accessibility, and performance before launch |
|---|---|

| # | Task | Owner | Estimate | Priority |
|---|---|---|---|---|
| S7-01 | Write API integration tests for all 84 endpoints | Backend | 8h | P0 |
| S7-02 | Write unit tests for services (auth, slug, pagination) | Backend | 4h | P0 |
| S7-03 | Write E2E tests (8 critical flows) | QA | 6h | P0 |
| S7-04 | Accessibility audit (axe-core on all public pages) | QA | 4h | P0 |
| S7-05 | Manual screen reader testing (NVDA/VoiceOver) | QA | 3h | P1 |
| S7-06 | Keyboard navigation testing | QA | 2h | P0 |
| S7-07 | Lighthouse audit (all public pages) | QA | 3h | P0 |
| S7-08 | Lighthouse performance fixes (LCP, CLS, INP) | Frontend | 4h | P0 |
| S7-09 | Cross-browser testing (Chrome, Firefox, Safari, Edge) | QA | 3h | P0 |
| S7-10 | Mobile responsive testing (iOS Safari, Android Chrome) | QA | 3h | P0 |
| S7-11 | Security checklist (OWASP top 10) | Backend | 3h | P0 |
| S7-12 | Content review (no lorem ipsum, all copy final) | PM | 4h | P0 |
| S7-13 | Image optimization (all images WebP, proper sizes) | Frontend | 2h | P1 |
| S7-14 | Fix all P0/P1 bugs from testing | All | 8h | P0 |
| S7-15 | Link checking (no broken internal/external links) | QA | 1h | P0 |

**Acceptance Criteria:**
- [ ] All API tests pass
- [ ] E2E tests pass on CI
- [ ] Lighthouse ≥ 90 on all public pages
- [ ] Zero WCAG 2.2 AA violations
- [ ] Zero P0/P1 bugs remaining
- [ ] All content finalized (no placeholder text)

---

## Sprint 8 — Deployment + Launch (Week 15–16)

| Goal | Deploy to production and launch the website |
|---|---|

| # | Task | Owner | Estimate | Priority |
|---|---|---|---|---|
| S8-01 | Provision production PostgreSQL (Railway) | DevOps | 1h | P0 |
| S8-02 | Run migrations on production database | DevOps | 1h | P0 |
| S8-03 | Seed production data (admin user + settings) | DevOps | 1h | P0 |
| S8-04 | Configure Railway production environment (env vars) | DevOps | 1h | P0 |
| S8-05 | Deploy backend to Railway (production) | DevOps | 1h | P0 |
| S8-06 | Configure Vercel production project | DevOps | 1h | P0 |
| S8-07 | Deploy frontend to Vercel (production) | DevOps | 1h | P0 |
| S8-08 | Configure custom domain (thenagrik.org → Vercel) | DevOps | 2h | P0 |
| S8-09 | Verify SSL certificates | DevOps | 0.5h | P0 |
| S8-10 | Configure R2 production bucket + public access | DevOps | 1h | P0 |
| S8-11 | Setup Cloudflare DNS | DevOps | 1h | P0 |
| S8-12 | Load initial content (10 articles, 3 projects, team profiles) | Content | 8h | P0 |
| S8-13 | Full smoke test on production | QA | 3h | P0 |
| S8-14 | Verify all forms work (contact, volunteer, newsletter) | QA | 1h | P0 |
| S8-15 | Verify email notifications arrive | QA | 1h | P0 |
| S8-16 | Verify Google Search Console submission | SEO | 1h | P1 |
| S8-17 | Submit sitemap to Google Search Console | SEO | 0.5h | P1 |
| S8-18 | Enable Vercel Analytics | DevOps | 0.5h | P1 |
| S8-19 | Document deployment runbook | DevOps | 2h | P1 |
| S8-20 | **LAUNCH** 🚀 | All | — | P0 |

**Acceptance Criteria:**
- [ ] thenagrik.org loads with HTTPS
- [ ] All pages render correctly
- [ ] Admin panel accessible at thenagrik.org/admin
- [ ] All forms submit and trigger emails
- [ ] Media uploads work in production
- [ ] Lighthouse ≥ 90 on production
- [ ] Google Search Console verified
- [ ] Railway health checks passing
- [ ] Backup confirmed via Railway dashboard

---

# 19. Task Breakdown Structure

```
THE NAGRIK — Complete Task Tree
│
├── 1. FOUNDATION
│   ├── 1.1 Repository Setup
│   │   ├── Initialize monorepo (npm workspaces)
│   │   ├── Create client/ (Next.js)
│   │   ├── Create server/ (Express)
│   │   ├── Create shared/ (types)
│   │   ├── Configure root package.json scripts
│   │   └── Create .gitignore, .env.example, README
│   ├── 1.2 Code Quality
│   │   ├── ESLint configuration (3 configs)
│   │   ├── Prettier configuration
│   │   ├── Husky + lint-staged
│   │   └── Conventional commits setup
│   ├── 1.3 CI/CD
│   │   ├── GitHub Actions: lint + typecheck
│   │   ├── GitHub Actions: test (with Postgres service)
│   │   └── Branch protection rules
│   └── 1.4 Database
│       ├── Provision Railway PostgreSQL
│       ├── Create Drizzle schema (18 tables)
│       ├── Configure drizzle.config.ts
│       ├── Generate initial migration
│       ├── Create search vector triggers (SQL)
│       ├── Create updated_at trigger (SQL)
│       ├── Write seed script
│       └── Verify all indexes
│
├── 2. AUTHENTICATION
│   ├── 2.1 Core Auth
│   │   ├── bcrypt password hashing
│   │   ├── JWT sign/verify utilities
│   │   ├── Login endpoint
│   │   ├── Refresh token rotation
│   │   ├── Logout endpoint
│   │   └── Login lockout logic
│   ├── 2.2 RBAC
│   │   ├── authenticate middleware
│   │   ├── authorize middleware
│   │   └── Permission matrix enforcement
│   ├── 2.3 Password Reset
│   │   ├── Forgot password endpoint
│   │   ├── Reset password endpoint
│   │   └── Email template for reset
│   └── 2.4 Maintenance
│       ├── Token cleanup job
│       └── Auth integration tests
│
├── 3. BACKEND MODULES
│   ├── 3.1 Categories (routes, controller, service, validation)
│   ├── 3.2 Articles (routes, controller, service, validation, slug, reading time)
│   ├── 3.3 Blog Posts (routes, controller, service, validation, tags, RSS)
│   ├── 3.4 Projects (routes, controller, service, validation)
│   ├── 3.5 School Sessions (routes, controller, service, validation, photos)
│   ├── 3.6 Team Members (routes, controller, service, validation, reorder)
│   ├── 3.7 Core Principles (routes, controller, service)
│   ├── 3.8 FAQ (routes, controller, service, validation)
│   ├── 3.9 Media (routes, controller, service, R2, Sharp)
│   ├── 3.10 Forms (contact, volunteer, newsletter — routes, controllers, services)
│   ├── 3.11 Settings (routes, controller, service)
│   ├── 3.12 Search (unified full-text query)
│   ├── 3.13 Dashboard (stats + activity aggregation)
│   ├── 3.14 Audit Logs (listing with filters)
│   └── 3.15 Users (CRUD for SuperAdmin)
│
├── 4. SHARED SERVICES
│   ├── 4.1 Email service (Resend)
│   ├── 4.2 Storage service (R2)
│   ├── 4.3 Image processor (Sharp)
│   ├── 4.4 Audit log service
│   ├── 4.5 Pagination utility
│   ├── 4.6 Slug generator
│   ├── 4.7 Error handler middleware
│   ├── 4.8 Rate limiter middleware
│   └── 4.9 Validation middleware (Zod)
│
├── 5. FRONTEND — DESIGN SYSTEM
│   ├── 5.1 CSS tokens (colors, spacing, radius, shadows)
│   ├── 5.2 Typography scale (14 sizes)
│   ├── 5.3 Animation tokens (durations, easings)
│   ├── 5.4 CSS reset
│   ├── 5.5 Google Fonts loading
│   ├── 5.6 Paper texture + grain overlay
│   └── 5.7 Reduced motion support
│
├── 6. FRONTEND — COMPONENTS
│   ├── 6.1 UI Primitives (Button, Input, Select, Modal, Toast, Badge, Tabs)
│   ├── 6.2 Layout (Header, Footer, Sidebar, Navigation, Breadcrumbs)
│   ├── 6.3 Content (ArticleCard, BlogCard, ProjectCard, TeamCard, FAQAccordion)
│   ├── 6.4 Forms (ContactForm, VolunteerForm, NewsletterForm)
│   ├── 6.5 Admin (DataTable, TiptapEditor, ImageUpload, StatCard, ActivityFeed)
│   ├── 6.6 Motion (ScrollReveal, TextReveal, PageTransition, CountUp)
│   └── 6.7 States (LoadingSkeleton, EmptyState, ErrorBoundary)
│
├── 7. FRONTEND — PUBLIC PAGES
│   ├── 7.1 Homepage (hero, featured, stats, CTA)
│   ├── 7.2 About (mission, team, principles, journey)
│   ├── 7.3 Learn Hub (category grid)
│   ├── 7.4 Learn Category (article list)
│   ├── 7.5 Learn Article (content, sidebar, related)
│   ├── 7.6 Blog Listing (posts, tag filter, pagination)
│   ├── 7.7 Blog Post (content, author, related)
│   ├── 7.8 Projects (grid, detail)
│   ├── 7.9 Schools (sessions, gallery)
│   ├── 7.10 Contact (form, info)
│   ├── 7.11 Join (volunteer form)
│   ├── 7.12 FAQ (accordion)
│   ├── 7.13 Search (results)
│   ├── 7.14 404 (branded)
│   ├── 7.15 Privacy (static)
│   └── 7.16 Terms (static)
│
├── 8. FRONTEND — ADMIN PAGES
│   ├── 8.1 Login
│   ├── 8.2 Dashboard
│   ├── 8.3 Articles (list + editor)
│   ├── 8.4 Blog (list + editor)
│   ├── 8.5 Projects (list + editor)
│   ├── 8.6 Schools (list + editor + photos)
│   ├── 8.7 Team (list + editor + reorder)
│   ├── 8.8 FAQ (list + editor)
│   ├── 8.9 Media Library
│   ├── 8.10 Contact Inbox
│   ├── 8.11 Volunteer Pipeline
│   ├── 8.12 Newsletter
│   ├── 8.13 Settings
│   ├── 8.14 Users
│   └── 8.15 Audit Logs
│
├── 9. SEO
│   ├── 9.1 Metadata (title, description per page)
│   ├── 9.2 Open Graph tags
│   ├── 9.3 Twitter Cards
│   ├── 9.4 JSON-LD (Organization, Article, FAQ, Breadcrumb)
│   ├── 9.5 Sitemap.xml
│   ├── 9.6 robots.txt
│   ├── 9.7 Canonical URLs
│   ├── 9.8 RSS feed
│   └── 9.9 Core Web Vitals optimization
│
├── 10. TESTING
│   ├── 10.1 Unit tests (services, utils)
│   ├── 10.2 API integration tests (all endpoints)
│   ├── 10.3 E2E tests (8 flows)
│   ├── 10.4 Accessibility audit
│   ├── 10.5 Performance audit (Lighthouse)
│   ├── 10.6 Security audit (OWASP)
│   ├── 10.7 Cross-browser testing
│   ├── 10.8 Mobile testing
│   └── 10.9 Bug fixes
│
└── 11. DEPLOYMENT
    ├── 11.1 Production database
    ├── 11.2 Production backend (Railway)
    ├── 11.3 Production frontend (Vercel)
    ├── 11.4 Custom domain + SSL
    ├── 11.5 R2 production bucket
    ├── 11.6 Cloudflare DNS
    ├── 11.7 Content loading
    ├── 11.8 Monitoring + analytics
    ├── 11.9 Smoke testing
    └── 11.10 LAUNCH
```

**Total tasks: ~210**

---

# 20. GitHub Issues (Top 30)

## Issue Format

Each issue below is ready to create in GitHub.

---

### GH-001: Initialize Monorepo with Next.js + Express

**Labels:** `foundation`, `P0`, `sprint-1`
**Estimate:** 3 hours

**Description:** Set up the monorepo using npm workspaces with three packages: `client` (Next.js 15), `server` (Express 5), and `shared` (types). Configure TypeScript for all three packages with a shared base config. Add ESLint, Prettier, and Husky.

**Acceptance Criteria:**
- [ ] `npm install` from root installs all workspace dependencies
- [ ] `npm run dev` starts both client (port 3000) and server (port 4000)
- [ ] `npm run lint` runs ESLint across all packages
- [ ] `npm run typecheck` runs tsc --noEmit across all packages
- [ ] `.env.example` file with all required variables documented

---

### GH-002: Implement Drizzle Schema (All 18 Tables)

**Labels:** `database`, `P0`, `sprint-1`
**Estimate:** 4 hours
**Depends on:** GH-001

**Description:** Create `server/src/db/schema.ts` with all 18 tables as defined in BackendSchema v1.0. Configure `drizzle.config.ts`. Generate and apply the initial migration.

**Acceptance Criteria:**
- [ ] All 18 tables created with correct columns, types, and constraints
- [ ] All indexes (23) created including GIN indexes for tsvector and tags
- [ ] Migration file generated and committed
- [ ] `drizzle-kit push` applies schema to dev database
- [ ] Database connection module exports configured `db` instance

---

### GH-003: Create Database Triggers + Seed Script

**Labels:** `database`, `P0`, `sprint-1`
**Estimate:** 4 hours
**Depends on:** GH-002

**Description:** Create SQL triggers for: (1) `search_vector` auto-update on articles, blog_posts, projects, faq_entries, school_sessions, (2) `updated_at` auto-update on all tables with that column. Write seed script that inserts default super_admin user and 12 settings entries.

**Acceptance Criteria:**
- [ ] Inserting an article with title/body auto-populates `search_vector`
- [ ] Updating a row auto-updates `updated_at`
- [ ] Seed script creates admin user with bcrypt-hashed password
- [ ] Seed script creates all 12 settings from BackendSchema
- [ ] `npm run seed` runs idempotently (re-running doesn't fail or duplicate)

---

### GH-004: Implement Authentication Module

**Labels:** `auth`, `P0`, `sprint-1`
**Estimate:** 8 hours
**Depends on:** GH-002

**Description:** Build complete auth module: login (POST), refresh (POST), logout (POST). JWT access tokens (15min, HS256) returned in response body. Refresh tokens (7 days) stored as SHA-256 hash in DB, sent as HTTP-only Secure SameSite=Strict cookie. Implement login lockout (5 failed → 15min lock).

**Acceptance Criteria:**
- [ ] POST `/api/v1/auth/login` returns access token + sets refresh cookie
- [ ] POST `/api/v1/auth/refresh` rotates refresh token + returns new access token
- [ ] POST `/api/v1/auth/logout` revokes refresh token + clears cookie
- [ ] 5 failed logins lock account for 15 minutes
- [ ] Successful login resets failed attempt counter
- [ ] `authenticate` middleware rejects expired/invalid access tokens
- [ ] `authorize` middleware rejects users with insufficient role

---

### GH-005: Implement Design Token System

**Labels:** `frontend`, `design`, `P0`, `sprint-1`
**Estimate:** 4 hours

**Description:** Create CSS custom properties for the entire design system from DesignBrief v1.0: colors (Cool Sophistication palette), typography (DM Serif Display + DM Sans, 14-step type scale), spacing (xs through 6xl), radius (sm/md/lg), animation tokens (4 durations, 3 easings). Include CSS reset and `prefers-reduced-motion` support.

**Acceptance Criteria:**
- [ ] `tokens.css` with all color, spacing, radius variables
- [ ] `typography.css` with type scale from h1-hero to caption
- [ ] `animations.css` with timing tokens and keyframes
- [ ] `reset.css` with modern normalize
- [ ] Google Fonts loaded via `next/font` (DM Serif Display, DM Sans)
- [ ] `prefers-reduced-motion` media query disables transitions globally
- [ ] Paper texture background renders on body

---

### GH-006: Create Base Public Layout

**Labels:** `frontend`, `P0`, `sprint-1`
**Estimate:** 6 hours
**Depends on:** GH-005

**Description:** Build the public site layout: root `layout.tsx` with fonts + metadata, `(public)/layout.tsx` with header and footer. Header: logo, navigation links (Home, About, Learn, Blog, Projects, Schools, Contact), Join button, search icon. Footer: logo, social links, newsletter form, legal links. Mobile: hamburger menu.

**Acceptance Criteria:**
- [ ] Header renders with navigation matching DesignBrief
- [ ] Header shrinks on scroll (subtle height reduction)
- [ ] Mobile hamburger menu opens/closes with animation
- [ ] Footer renders with all sections
- [ ] Newsletter form in footer connects to API
- [ ] Active page highlighted in navigation
- [ ] Layout uses asymmetric grid (not centered container)

---

### GH-007: Create Base Admin Layout

**Labels:** `frontend`, `admin`, `P0`, `sprint-1`
**Estimate:** 5 hours
**Depends on:** GH-004, GH-005

**Description:** Build admin layout: sidebar with navigation (Dashboard, Articles, Blog, Projects, Schools, Team, FAQ, Media, Contact, Volunteers, Newsletter, Settings, Users, Audit Logs), top bar with user info + logout. Auth guard redirects unauthenticated users to login. Role-based sidebar items (Users and Audit Logs visible to SuperAdmin only).

**Acceptance Criteria:**
- [ ] Admin layout renders with sidebar + content area
- [ ] Unauthenticated users redirected to `/admin/login`
- [ ] User name + role shown in top bar
- [ ] Sidebar highlights active section
- [ ] Sidebar items filtered by user role
- [ ] Logout button revokes token and redirects to login
- [ ] Sidebar collapsible on mobile

---

### GH-008: Build Categories + Articles CRUD API

**Labels:** `backend`, `content`, `P0`, `sprint-2`
**Estimate:** 8 hours
**Depends on:** GH-004

**Description:** Build complete CRUD for categories (7 endpoints) and articles (9 endpoints) following module pattern (routes, controller, service, validation). Include slug generation, reading time calculation, status lifecycle (draft/published/archived), audit logging on all mutations.

**Acceptance Criteria:**
- [ ] Public: list categories with article counts, get category by slug
- [ ] Public: list published articles (paginated), get article by slug, get related
- [ ] Admin: full CRUD with status transitions (publish/archive/restore)
- [ ] Slug auto-generated from title, collision handled with `-2` suffix
- [ ] Reading time calculated from body word count
- [ ] All mutations logged in audit_logs
- [ ] Zod validation on all inputs
- [ ] Category delete blocked if it has articles

---

### GH-009: Build Learn Section (Public Frontend)

**Labels:** `frontend`, `content`, `P0`, `sprint-2`
**Estimate:** 12 hours
**Depends on:** GH-006, GH-008

**Description:** Build the Learn section: hub page with category grid, category page with article list (paginated), article page with rich content + sidebar + related articles. Create ArticleCard and CategoryCard components following DesignBrief (asymmetric layout, editorial typography, scroll reveal).

**Acceptance Criteria:**
- [ ] Learn hub displays all categories as cards with icons and article counts
- [ ] Category page shows articles filtered and paginated
- [ ] Article page renders rich HTML content with proper typography
- [ ] Article page shows breadcrumbs, reading time, author, published date
- [ ] Related articles section shows 3 articles from same category
- [ ] ScrollReveal animations on card grids
- [ ] Responsive on all breakpoints (mobile, tablet, desktop)

---

### GH-010: Build Tiptap Rich Text Editor Integration

**Labels:** `frontend`, `admin`, `P0`, `sprint-2`
**Estimate:** 6 hours

**Description:** Create a reusable TiptapEditor component for admin content editing. Toolbar: headings (H2, H3, H4), bold, italic, link, blockquote, bullet list, ordered list, image upload, horizontal rule, undo/redo. Image upload via media library. Output clean HTML.

**Acceptance Criteria:**
- [ ] Editor renders with toolbar and content area
- [ ] All toolbar buttons functional
- [ ] Image upload opens media library picker or upload dialog
- [ ] Output is clean semantic HTML (sanitized)
- [ ] Editor handles paste from Google Docs/Word (strip formatting)
- [ ] Editor loads existing HTML content for editing
- [ ] Responsive (works on smaller screens)

---

### GH-011: Build Blog + Projects + Schools APIs

**Labels:** `backend`, `content`, `P0`, `sprint-3`
**Estimate:** 10 hours
**Depends on:** GH-008

**Description:** Build CRUD modules for blog_posts (12 endpoints including tags and RSS), projects (6 endpoints), and school_sessions with photos (7 endpoints). Follow same module pattern as articles.

**Acceptance Criteria:**
- [ ] Blog: full CRUD with tag filtering, RSS feed generation
- [ ] Projects: full CRUD with CTA fields, sort ordering
- [ ] Schools: full CRUD with session details + photo upload/delete
- [ ] All slugs auto-generated with collision handling
- [ ] All mutations audit-logged
- [ ] Photo upload limited to 10 per session (service-level)
- [ ] All endpoints have Zod validation

---

### GH-012: Build Blog + Projects + Schools Pages (Public)

**Labels:** `frontend`, `content`, `P0`, `sprint-3`
**Estimate:** 14 hours
**Depends on:** GH-006, GH-011

**Description:** Build public pages: Blog listing (paginated + tag filter), Blog post (content + related), Projects (grid + detail), Schools (session list + photo gallery with lightbox).

**Acceptance Criteria:**
- [ ] Blog listing with pagination and tag filter pills
- [ ] Blog post page with author box and related posts
- [ ] Projects page with cards showing status, CTA buttons
- [ ] Schools page with session cards showing photo thumbnails
- [ ] Photo gallery opens lightbox with navigation
- [ ] All pages have proper SEO metadata
- [ ] ScrollReveal on content sections

---

### GH-013: Build Homepage

**Labels:** `frontend`, `P0`, `sprint-3`
**Estimate:** 8 hours
**Depends on:** GH-006, GH-008, GH-011

**Description:** Build the homepage as a 7-section editorial scroll narrative per DesignBrief: Hero (left-aligned editorial headline + documentary photo), Featured Articles, Impact Stats, Projects Preview, Volunteer CTA, Blog Preview, Newsletter CTA.

**Acceptance Criteria:**
- [ ] Hero with left-aligned serif headline (NOT centered)
- [ ] Hero entrance animation (text slide-in)
- [ ] Featured articles from latest published
- [ ] Impact counter with count-up animation
- [ ] Projects preview (2-3 featured)
- [ ] Volunteer CTA section with editorial design
- [ ] Blog preview (3 latest posts)
- [ ] Newsletter CTA with form
- [ ] Variable section spacing (NOT uniform 64px)
- [ ] Paper texture background visible

---

### GH-014: Build About Page

**Labels:** `frontend`, `P0`, `sprint-3`
**Estimate:** 6 hours
**Depends on:** GH-006

**Description:** Build About page: Mission statement, Team grid (photos, names, roles, social links), Core Principles (icon, title, description), Journey/Timeline section.

**Acceptance Criteria:**
- [ ] Mission section with editorial typography
- [ ] Team grid with asymmetric card layout
- [ ] Team member hover reveals social links
- [ ] Core principles displayed with custom icons
- [ ] Responsive grid (1-2-3 columns based on breakpoint)
- [ ] ScrollReveal on team cards

---

### GH-015: Build Contact + Volunteer Forms

**Labels:** `frontend`, `forms`, `P0`, `sprint-4`
**Estimate:** 8 hours
**Depends on:** GH-006

**Description:** Build Contact page with form (name, email, subject dropdown, message, Turnstile CAPTCHA) and Join page with volunteer form (name, email, phone, age, city, state, occupation, interests checkboxes, motivation textarea, Turnstile CAPTCHA). Bottom-border input styling per DesignBrief.

**Acceptance Criteria:**
- [ ] Contact form validates all fields client-side
- [ ] Contact form submits with Turnstile token
- [ ] Success toast on submission
- [ ] Volunteer form validates age (14-99), required fields
- [ ] Interest checkboxes allow multi-select
- [ ] Duplicate email shows friendly error
- [ ] Inputs use bottom-border-only style (not boxed)
- [ ] Focus animation on input (border expansion)

---

### GH-016: Build Media Upload + R2 Integration

**Labels:** `backend`, `media`, `P0`, `sprint-4`
**Estimate:** 8 hours

**Description:** Implement media upload service: accept multipart uploads, validate MIME type via magic bytes, process with Sharp (WebP conversion, thumbnail generation at 400px width, EXIF stripping), upload to Cloudflare R2, insert record in media_files table.

**Acceptance Criteria:**
- [ ] Accepts jpg, png, webp, gif, svg, pdf
- [ ] Rejects files > 10MB
- [ ] MIME type validated by file content (not just extension)
- [ ] Images converted to WebP
- [ ] Thumbnail generated at 400px width
- [ ] EXIF data stripped
- [ ] Uploaded to R2 at `media/YYYY/MM/uuid.webp`
- [ ] media_files record created with url, thumbnail_url, dimensions
- [ ] Delete endpoint removes from both R2 and database

---

### GH-017: Build Admin Content Managers

**Labels:** `frontend`, `admin`, `P0`, `sprint-4-5`
**Estimate:** 20 hours
**Depends on:** GH-007, GH-008, GH-010, GH-011

**Description:** Build admin CRUD interfaces for: Articles, Blog, Projects, Schools, Team, FAQ. Each manager has: list view with DataTable, create/edit form with Tiptap editor, status controls (publish/archive), delete confirmation. Articles and Blog editors include SEO metadata fields.

**Acceptance Criteria:**
- [ ] All 6 content types have list + create/edit views
- [ ] DataTable supports sorting, pagination, status filter
- [ ] Tiptap editor used for rich text fields (articles, blog)
- [ ] Image upload integrated for featured images
- [ ] Status buttons (Publish/Archive/Restore) with confirmation
- [ ] Soft delete with confirmation dialog
- [ ] SEO fields (meta title, description, OG image) on articles + blogs
- [ ] Team manager supports drag-to-reorder
- [ ] FAQ manager groups by category

---

### GH-018: Build Admin Dashboard

**Labels:** `frontend`, `admin`, `P0`, `sprint-5`
**Estimate:** 5 hours
**Depends on:** GH-007

**Description:** Build admin dashboard showing: stats cards (total articles, blog posts, projects, active subscribers, unread messages, new volunteers), recent activity feed from audit logs, quick action links.

**Acceptance Criteria:**
- [ ] 6 stat cards with counts
- [ ] Activity feed shows last 20 actions with actor, action, entity
- [ ] Quick links to create article, view inbox, etc.
- [ ] Stats fetched from single aggregate API call
- [ ] Loading skeletons while data loads

---

### GH-019: Build Admin Forms Inbox

**Labels:** `frontend`, `admin`, `P0`, `sprint-5`
**Estimate:** 8 hours
**Depends on:** GH-007

**Description:** Build Contact Inbox (list with status filter, detail view, status update), Volunteer Pipeline (list with status pipeline, detail view, status update), Newsletter Subscribers (list, CSV export). All three sections accessible via Admin > Forms.

**Acceptance Criteria:**
- [ ] Contact inbox shows submissions sorted by date, filterable by status
- [ ] Contact detail shows full message with reply/archive actions
- [ ] Volunteer pipeline shows applications with status dropdown
- [ ] Newsletter shows subscriber list with active/unsubscribed filter
- [ ] CSV export downloads file for all three sections
- [ ] Status changes create audit log entries
- [ ] Unread message count shown in sidebar badge

---

### GH-020: Build SEO + Sitemap + Structured Data

**Labels:** `frontend`, `seo`, `P0`, `sprint-6`
**Estimate:** 8 hours

**Description:** Implement SEO across all pages: Next.js `generateMetadata` for dynamic meta tags, Open Graph and Twitter Card tags, JSON-LD structured data (Organization, Article, BreadcrumbList, FAQPage), dynamic XML sitemap including all published content URLs, robots.txt, canonical URLs, RSS feed link tag.

**Acceptance Criteria:**
- [ ] Every page has unique title + description
- [ ] OG tags render correctly (test with social debugger)
- [ ] JSON-LD validates in Google Rich Results Test
- [ ] sitemap.xml lists all published content pages
- [ ] robots.txt disallows /admin/ path
- [ ] Canonical URL set on all pages
- [ ] RSS feed accessible at /blog/feed.xml

---

*(Issues GH-021 through GH-030 follow the same format for: Search implementation, Motion/Animation system, Admin Settings + User Management, Media Library UI, Admin Audit Logs, Testing suite, Production deployment, Performance optimization, Accessibility audit, and Content loading.)*

---

# 21. AI Agent Task Breakdown

## 21.1 Agent Allocation

| Agent | Scope | Inputs | Outputs |
|---|---|---|---|
| **Database Agent** | Schema, migrations, triggers, seeds | BackendSchema v1.0 | `schema.ts`, migration SQL, `seed.ts` |
| **Backend Agent** | Express modules, middleware, services | BackendSchema v1.0, API endpoints list | 15 module folders with routes/controllers/services |
| **Frontend Agent** | Next.js pages, components, hooks | DesignBrief v1.0, AFD v1.0, API endpoints | 16 public pages, 15 admin pages, 18+ components |
| **Design Agent** | CSS tokens, typography, animations | DesignBrief v1.0 | tokens.css, typography.css, animations.css |
| **Motion Agent** | Framer Motion + GSAP components | DesignBrief v1.0 motion section | ScrollReveal, TextReveal, PageTransition |
| **Testing Agent** | Tests across all layers | All code files | Unit tests, API tests, E2E tests |
| **DevOps Agent** | CI/CD, deployment configs | TRD v1.0 | GitHub Actions, Vercel config, Railway setup |

## 21.2 Agent Boundaries

| Rule | Why |
|---|---|
| Backend Agent never writes CSS | Separation of concerns |
| Frontend Agent never modifies `schema.ts` | Schema is single source of truth for Database Agent |
| Motion Agent operates on completed components only | Animation is a layer on top of working UI |
| Testing Agent runs AFTER feature agents complete | Tests validate, not create |
| Database Agent owns `server/src/db/` exclusively | No schema conflicts |

## 21.3 Execution Order

```
Phase 1 (Parallel):
  ├── Database Agent → schema.ts, migrations, seeds
  └── Design Agent → tokens.css, typography.css, reset.css

Phase 2 (Sequential):
  Backend Agent → auth module → content modules → form modules → system modules

Phase 3 (Parallel after Backend completes each module):
  ├── Frontend Agent → public pages (follows API availability)
  └── Frontend Agent → admin pages (follows API availability)

Phase 4 (After Frontend stable):
  Motion Agent → animations on completed pages

Phase 5 (After all features):
  Testing Agent → unit tests, API tests, E2E tests

Phase 6:
  DevOps Agent → CI/CD, deployment
```

---

# 22. Risk Management

| # | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| R-01 | **GSAP ScrollTrigger complexity** causes performance issues on mobile | Medium | Medium | Defer scroll animations to P2. Ship without them if needed. |
| R-02 | **Tiptap editor** requires significant customization for image embedding | Medium | High | Start Tiptap integration early (Sprint 2). Have fallback to basic textarea if blocked. |
| R-03 | **R2 CORS configuration** blocks media uploads from browser | Medium | Medium | Test R2 upload flow in Sprint 1 with a throwaway file. |
| R-04 | **Rich text HTML** from Tiptap contains unexpected tags/formatting | Low | Medium | Sanitize with `sanitize-html` on save. Test with paste from Word/Docs. |
| R-05 | **Railway cold starts** slow down first API requests | Medium | Low | Use Railway's always-on option ($5/mo). Or accept 2-3 second cold start. |
| R-06 | **Content not ready** at launch time (articles, team photos, etc.) | High | High | Start content creation in Sprint 6. Use placeholder content during dev. |
| R-07 | **Drizzle Kit** doesn't generate CHECK constraints or triggers | Medium | Low | Write raw SQL for triggers and checks. Add via custom migration. |
| R-08 | **Font loading** causes layout shift (FOUT/FOIT) | Low | Medium | Use `next/font` with `display: swap` and proper fallback metrics. |
| R-09 | **Mobile navigation** UX issues (hamburger menu, touch targets) | Medium | Medium | Test on real devices from Sprint 3. Don't delay mobile until polish sprint. |
| R-10 | **Search relevance** poor for Hindi/Indian English terms | Medium | Low | Test with actual content. Add `hindi` text search configuration if needed. |
| R-11 | **Scope creep** from additional admin features requested | High | Medium | Strict MVP scope. Document all "V2" requests. Don't implement during V1. |
| R-12 | **Image optimization** pipeline (Sharp) has memory issues with large files | Low | Medium | Limit upload size to 10MB. Process asynchronously if issues arise. |
| R-13 | **SSL certificate** delays on custom domain | Low | High | Configure Cloudflare DNS early. Use Vercel's auto-SSL. |
| R-14 | **Email deliverability** issues (going to spam) | Medium | Medium | Set up SPF, DKIM, DMARC records. Test with mail-tester.com. |
| R-15 | **PostgreSQL connection limits** on Railway starter plan | Low | Low | Default pool size of 10 is sufficient. Monitor via Railway dashboard. |

---

# 23. Production Launch Checklist

## Infrastructure
- [ ] Production PostgreSQL provisioned (Railway)
- [ ] Production backend deployed (Railway)
- [ ] Production frontend deployed (Vercel)
- [ ] Custom domain configured (thenagrik.org)
- [ ] SSL certificate active (HTTPS)
- [ ] R2 production bucket configured
- [ ] Cloudflare DNS configured
- [ ] CDN caching headers set for static assets

## Environment
- [ ] All production env vars set (backend)
- [ ] All production env vars set (frontend)
- [ ] JWT secret is unique, cryptographically random (≥ 256 bits)
- [ ] Database URL uses SSL connection
- [ ] No development/debug values in production

## Data
- [ ] Database migrations applied to production
- [ ] Seed data inserted (admin user + settings)
- [ ] Initial content loaded (articles, team, projects)
- [ ] All images uploaded to production R2

## Security
- [ ] Admin panel only accessible via HTTPS
- [ ] Rate limiting active on auth endpoints (5/min)
- [ ] Rate limiting active on form endpoints (3/min)
- [ ] CORS configured for production domain only
- [ ] HTTP security headers set (Helmet)
- [ ] CAPTCHA (Turnstile) active on public forms
- [ ] No exposed secrets in client-side code

## SEO
- [ ] All pages have unique meta titles + descriptions
- [ ] Open Graph tags render correctly
- [ ] sitemap.xml accessible and valid
- [ ] robots.txt configured (disallow /admin/)
- [ ] Google Search Console verified + sitemap submitted
- [ ] Canonical URLs set on all pages

## Performance
- [ ] Lighthouse Performance ≥ 90 (mobile + desktop)
- [ ] Lighthouse Accessibility ≥ 90
- [ ] Lighthouse Best Practices ≥ 90
- [ ] Lighthouse SEO ≥ 90
- [ ] LCP < 2.5 seconds
- [ ] CLS < 0.1
- [ ] INP < 200ms

## Content
- [ ] No lorem ipsum or placeholder text
- [ ] All images have alt text
- [ ] Legal pages (Privacy, Terms) finalized
- [ ] Contact information accurate
- [ ] Social media links working

## Monitoring
- [ ] Vercel Analytics enabled
- [ ] Railway health check configured
- [ ] Error logging operational
- [ ] Backup strategy confirmed (Railway auto-backups)

---

# 24. Post-Launch Plan

## Week 1–2 Post-Launch

| Task | Priority |
|---|---|
| Monitor error logs daily | P0 |
| Fix any P0 bugs immediately | P0 |
| Monitor form submissions are working | P0 |
| Check email deliverability | P0 |
| Review analytics (traffic, bounce rate) | P1 |
| Gather user feedback (team + test users) | P1 |

## Month 1

| Task | Priority |
|---|---|
| Fix all reported bugs | P0 |
| Optimize Lighthouse scores if below 90 | P1 |
| Add remaining content (articles, blog posts) | P1 |
| Submit to social media profiles (link website) | P1 |
| SEO: verify indexing in Google Search Console | P1 |
| Implement remaining P2 features (page transitions, lightbox animations) | P2 |

## Month 2–3

| Task | Priority |
|---|---|
| Analyze search console data (keywords, clicks) | P1 |
| Optimize underperforming pages | P1 |
| Add content scheduling (scheduled_publish_at) | P2 |
| Add auto-reply emails (contact, volunteer) | P2 |
| Add newsletter welcome email | P2 |
| Consider Sentry integration for error tracking | P2 |

---

# 25. Future Roadmap

## V1.5 (Month 4–6)

| Feature | Description |
|---|---|
| Content scheduling | Publish at future date/time |
| Email auto-replies | Confirmation emails for forms |
| Newsletter welcome | Welcome email on subscribe |
| Analytics dashboard (admin) | Page views, popular content |
| GA4 integration | If Vercel Analytics insufficient |
| Content versioning | Save/view previous versions |

## V2.0 (Month 6–12)

| Feature | Description |
|---|---|
| **Donation Gateway** | Razorpay integration, 80G receipt generation |
| **Member Accounts** | Student/educator registration, login, bookmarks |
| **Quizzes** | Per-category quizzes with scoring |
| **Event Management** | Event listings, registration forms |
| **Multi-language** | Hindi content via translations table |
| **Redis Caching** | Upstash Redis for API caching, rate limiting |
| **Sentry** | Error tracking with source maps |
| **Background Jobs** | BullMQ for email queue, media processing |

## V3.0 (Year 2+)

| Feature | Description |
|---|---|
| Community Forum | Discussion boards for civic topics |
| Mobile App | React Native or PWA |
| AI Features | Content summarization, quiz generation |
| WhatsApp Integration | Content delivery via WhatsApp |
| Volunteer Dashboard | Hours tracking, certificates |
| Partner Portal | School admin access for session scheduling |

---

# 26. Timeline Estimation

| Configuration | Duration | Assumptions |
|---|---|---|
| **Solo Founder + AI Agents** | **14–18 weeks** | 4–6 hours/day coding + AI. Content creation in parallel. |
| **Solo Founder (no AI)** | 24–30 weeks | Full-time development. Slower due to manual coding. |
| **3-Person Dev Team** | 8–10 weeks | Full-time. Parallel frontend + backend. |
| **5-Person Agency** | 5–7 weeks | Full-time. Parallel work on all layers + dedicated QA. |

### Breakdown for Solo Founder + AI:

| Phase | Weeks | Notes |
|---|---|---|
| Foundation | 2 | Heavily AI-generated (schema, boilerplate, auth) |
| Core Backend | 2 | Module pattern allows AI to generate most CRUD |
| Core Frontend | 3 | Most time-consuming — editorial design requires iteration |
| Admin Panel | 2 | Repeatable pattern — AI can generate CRUD screens |
| Polish + Integrations | 2 | SEO, animations, email integration |
| Testing + Bug Fixes | 2 | Manual testing focus; AI helps write automated tests |
| Deployment + Launch | 1 | Configuration + content loading |
| **Total** | **14 weeks** | Add 2–4 week buffer for design iteration + content delays |

---

# 27. Assumptions

| # | Assumption | Impact if Wrong |
|---|---|---|
| A-01 | Solo founder has working knowledge of TypeScript, React, and Node.js | If not, timeline extends 2x |
| A-02 | AI agents can generate 70%+ of CRUD code (backend + admin) | If quality is low, significant manual rewriting needed |
| A-03 | Content (articles, team photos, project descriptions) will be ready by Sprint 7 | If not, launch delayed or launches with minimal content |
| A-04 | Railway free/starter plan is sufficient for V1.0 hosting | If not, upgrade to Pro ($20/mo) |
| A-05 | Cloudflare R2 free tier covers media storage needs | If > 10GB stored, costs are still under $1/month |
| A-06 | Domain `thenagrik.org` is available or already owned | If not, adjust DNS configuration for actual domain |
| A-07 | GSAP is used under its free license (non-commercial use for NGO) | Verify GSAP license terms for non-profit use |
| A-08 | Tiptap community edition is sufficient (no premium features needed) | If premium needed, evaluate cost vs. alternatives |
| A-09 | 2–5 admin users maximum in V1.0 | If more, implement session management + rate limiting earlier |
| A-10 | No multi-language requirement in V1.0 | If Hindi needed at launch, add translations table to V1 |
| A-11 | Newsletter management is internal (no ESP like Mailchimp) | If ESP needed, add integration work to Sprint 5 |
| A-12 | Google Maps embed is sufficient for Contact page (no interactive map) | If interactive map needed, evaluate cost of Google Maps API |
| A-13 | Mobile-responsive web is sufficient (no native app in V1) | If native app requested, significant additional work |
| A-14 | All designs follow DesignBrief v1.0 without major revisions | If significant design changes needed, add 2–3 weeks |
| A-15 | Founder can perform QA and content loading in Sprint 7–8 | If not, add dedicated QA resource |
| A-16 | No accessibility requirements beyond WCAG 2.2 AA | If AAA needed, add 1–2 weeks for compliance |
| A-17 | Vercel Hobby plan handles traffic at launch | If traffic exceeds limits, upgrade to Pro |
| A-18 | No legal review needed for Privacy/Terms pages | If legal review needed, add external dependency |
| A-19 | GitHub is the chosen platform (not GitLab, Bitbucket) | If different platform, adjust CI/CD configuration |
| A-20 | Sprint duration is 2 weeks (10 working days) | If part-time, sprints extend proportionally |

---

*End of Implementation Plan*

*This document is the single source of truth for all delivery decisions. Any scope change must be reflected here before implementation begins.*
