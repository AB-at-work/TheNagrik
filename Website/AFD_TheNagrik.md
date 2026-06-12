# App Flow Document (AFD)
## **THE NAGRIK** — Student-Led Civic Literacy Website
### Application Flow Specification v1.0

| Field | Value |
|---|---|
| **Document Version** | 1.0 |
| **Date** | June 6, 2026 |
| **Source PRD** | PRD_TheNagrik.md v1.0 |
| **Source TRD** | TRD_TheNagrik.md v1.0 |
| **Classification** | Internal — Design & Engineering |

---

# 1. App Flow Executive Summary

## 1.1 Product Type

Content-driven civic literacy website for a non-profit. Public-facing informational pages consumed by students, educators, and partners. Admin panel for internal team to manage content, media, forms, and users.

## 1.2 User Journey Philosophy

**"Discover → Understand → Trust → Act"**

Every visitor enters as a stranger and should leave as an advocate. The website is designed around a progressive trust funnel:

1. **Discover** — First impression via search/social → Homepage hero communicates value in < 5 seconds
2. **Understand** — Explore About, Learn, Projects → Builds comprehension of mission and content depth
3. **Trust** — See school sessions, team members, non-partisan stance → Establishes institutional credibility
4. **Act** — Submit volunteer form, contact form, newsletter signup, or take the survey → Converts passive visitor into active participant

Every page has exactly ONE primary conversion goal and ONE fallback action. No dead-ends.

## 1.3 Navigation Strategy

- **Public site**: Linear exploration with hub-and-spoke model. Homepage is the hub. Each section (About, Learn, Projects, Schools, Blog, Join Us) is a spoke with depth (detail pages). User can always return to hub.
- **Admin panel**: Sidebar-driven SPA. Every entity has List → Create → Edit views. Dashboard is the landing page.
- **Cross-linking**: Every page nudges toward the next logical step in the trust funnel. Blog articles link to Learn. Projects link to volunteer forms. School sessions link to partnership forms.

## 1.4 UX Goals

| # | Goal | Metric |
|---|---|---|
| UX-1 | First-time visitor understands Nagrik's purpose within 5 seconds | Bounce rate < 55% |
| UX-2 | Any page reachable within 3 clicks from homepage | Max click depth = 3 |
| UX-3 | Form completion takes under 2 minutes | Form abandonment < 30% |
| UX-4 | Admin can publish content in under 5 minutes | Task completion time |
| UX-5 | Zero confusion on navigation | SUS score > 80 |

## 1.5 Conversion Goals

| Priority | Conversion | Target CTA |
|---|---|---|
| Primary | Volunteer signup | "Get Involved" / "Join Us" on homepage, nav bar |
| Secondary | Newsletter subscription | Footer widget on every page |
| Tertiary | Contact form submission | "Contact Us" in nav and Join Us page |
| Quarterly | Survey participation | "Take Survey" on Civic Literacy Survey project card |
| Institutional | School partnership inquiry | "Partner With Us" on Schools page |

---

# 2. User Roles

## 2.1 Guest (Unauthenticated Public Visitor)

| Attribute | Value |
|---|---|
| **Purpose** | Discover The Nagrik, consume content, engage with CTAs |
| **Authentication** | None required |
| **Permissions** | View all public pages; submit public forms (contact, volunteer, newsletter); use search |
| **Primary Goals** | Learn about civic literacy; find credible information; evaluate the organization |
| **Main Actions** | Browse pages → Read articles → Submit forms → Share content |
| **Restrictions** | Cannot access `/admin/*` routes; cannot edit any content |

## 2.2 Editor (Authenticated — Internal Team)

| Attribute | Value |
|---|---|
| **Purpose** | Create and manage content across all modules |
| **Authentication** | Email + password via `/admin/login` |
| **Permissions** | Create/edit articles, blog posts, school sessions, FAQs; upload media; view limited dashboard |
| **Primary Goals** | Publish new content quickly; keep content library current |
| **Main Actions** | Write articles → Upload media → Save drafts → Request publication |
| **Restrictions** | Cannot publish/delete content; cannot access form submissions, user management, settings, or audit logs |

## 2.3 Admin (Authenticated — Core Team)

| Attribute | Value |
|---|---|
| **Purpose** | Full content management plus form/submission oversight |
| **Authentication** | Email + password via `/admin/login` |
| **Permissions** | Everything Editor can do + publish/delete content + manage categories, projects, team + view/export form submissions |
| **Primary Goals** | Publish content; respond to inquiries; manage volunteer pipeline; oversee content quality |
| **Main Actions** | Publish articles → Review submissions → Export data → Manage projects and categories |
| **Restrictions** | Cannot manage users, system settings, or view audit logs |

## 2.4 Super Admin (Authenticated — Founder/Technical Lead)

| Attribute | Value |
|---|---|
| **Purpose** | Full system control and oversight |
| **Authentication** | Email + password via `/admin/login` |
| **Permissions** | All permissions: user management, system settings, audit logs, all content operations |
| **Primary Goals** | System health; user access control; platform configuration; security monitoring |
| **Main Actions** | Manage users → Configure settings → Review audit logs → All Admin actions |
| **Restrictions** | None. Cannot delete self if last super_admin. |

## 2.5 System (Automated Actor)

| Attribute | Value |
|---|---|
| **Purpose** | Automated background operations |
| **Actions** | Send notification emails (Resend) → Generate thumbnails (Sharp) → Update search vectors (PostgreSQL trigger) → Revalidate ISR cache → Rotate refresh tokens → Clean audit logs |

---

# 3. Global Navigation Structure

## 3.1 Public Navigation (Desktop)

```
┌─────────────────────────────────────────────────────────────────┐
│ [LOGO]    Home   About   Learn   Projects   Schools   Blog   [Join Us] │
└─────────────────────────────────────────────────────────────────┘
```

| Position | Item | Type | Notes |
|---|---|---|---|
| Left | Logo | Image link → `/` | Always links to homepage |
| Center | Home | Nav link → `/` | Active state when on homepage |
| Center | About | Nav link → `/about` | |
| Center | Learn | Nav link → `/learn` | |
| Center | Projects | Nav link → `/projects` | |
| Center | Schools | Nav link → `/schools` | |
| Center | Blog | Nav link → `/blog` | |
| Right | Join Us | **CTA Button** → `/join` | Visually distinct (filled Cool Slate Grey button) |

**Active State Rule**: Current page's nav link shows underline/highlight in `--color-cool-slate`.

## 3.2 Public Navigation (Mobile ≤ 768px)

```
┌──────────────────────────┐
│ [LOGO]           [☰]     │
└──────────────────────────┘

Hamburger opens:
┌──────────────────────────┐
│                    [✕]    │
│   Home                    │
│   About                   │
│   Learn                   │
│   Projects                │
│   Schools                 │
│   Blog                    │
│   Join Us (CTA)           │
│                           │
│   ─────────────           │
│   Instagram  |  Email     │
└──────────────────────────┘
```

- Hamburger menu slides in from right (250ms ease)
- Overlay darkens background (40% black opacity)
- Close on `✕` button, overlay click, or `Escape` key
- "Join Us" remains a CTA button in mobile menu

## 3.3 Footer Navigation

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  [LOGO]                                                          │
│  Student-Led Civic Literacy Initiative                          │
│                                                                  │
│  Explore          Initiatives        Connect                    │
│  ─────────        ───────────        ───────                    │
│  Home             Projects           Join Us                    │
│  About            Schools            Contact                    │
│  Learn            Blog               Newsletter ☐ [Subscribe]  │
│                                                                  │
│  ─────────────────────────────────────────────────────          │
│  [Instagram]  [Email]  [LinkedIn]                               │
│                                                                  │
│  © 2026 The Nagrik. All rights reserved.                        │
│  Privacy Policy  |  Terms of Use                                │
└─────────────────────────────────────────────────────────────────┘
```

## 3.4 Admin Sidebar Navigation

```
┌──────────────┐
│ THE NAGRIK    │
│ Admin Panel   │
├──────────────┤
│ ▸ Dashboard   │
│               │
│ CONTENT       │
│ ▸ Blog Posts  │
│ ▸ Articles    │
│ ▸ Categories  │
│ ▸ Projects    │
│ ▸ Schools     │
│ ▸ Team        │
│ ▸ FAQ         │
│               │
│ MEDIA         │
│ ▸ Library     │
│               │
│ ENGAGEMENT    │
│ ▸ Contact     │
│ ▸ Volunteers  │
│ ▸ Newsletter  │
│               │
│ SYSTEM ▼      │
│ ▸ Users       │  ← SuperAdmin only
│ ▸ Settings    │  ← SuperAdmin only
│ ▸ Audit Logs  │  ← SuperAdmin only
├──────────────┤
│ [▼ User Name] │
│    Profile     │
│    Logout      │
└──────────────┘
```

**Sidebar Rules:**
- Items hidden based on role (Editor doesn't see Forms, Users, Settings, Audit Logs)
- Active item highlighted with left border accent
- Collapsible on mobile admin (hamburger toggle)
- Sticky on desktop; scroll with content on tablet

---

# 4. Site Map

```
THE NAGRIK (thenagrik.org)
│
├── / (Homepage)
│
├── /about
│
├── /learn
│   ├── /learn/constitution
│   │   ├── /learn/constitution/article-1-slug
│   │   ├── /learn/constitution/article-2-slug
│   │   └── ...
│   ├── /learn/fundamental-rights
│   │   └── ...
│   ├── /learn/fundamental-duties
│   ├── /learn/parliament
│   ├── /learn/judiciary
│   ├── /learn/elections
│   ├── /learn/citizenship
│   ├── /learn/public-policy
│   └── /learn/digital-citizenship
│
├── /projects
│   ├── /projects/civic-literacy-survey-2026
│   ├── /projects/state-of-civic-literacy-report
│   └── /projects/school-outreach-program
│
├── /schools
│
├── /blog
│   ├── /blog/post-1-slug
│   ├── /blog/post-2-slug
│   └── ... (paginated: /blog?page=2)
│
├── /join
│
├── /faq (P2)
│
├── /search?q={query}
│
├── /privacy (P1)
│
├── /terms (P1)
│
├── /blog/feed.xml (RSS)
│
├── /sitemap.xml
│
├── /robots.txt
│
└── /admin (Authenticated)
    ├── /admin/login
    ├── /admin/dashboard
    ├── /admin/blog
    │   ├── /admin/blog/new
    │   └── /admin/blog/[id]/edit
    ├── /admin/articles
    │   ├── /admin/articles/new
    │   └── /admin/articles/[id]/edit
    ├── /admin/categories
    ├── /admin/projects
    ├── /admin/schools
    ├── /admin/team
    ├── /admin/faq
    ├── /admin/media
    ├── /admin/forms
    │   ├── /admin/forms/contact
    │   ├── /admin/forms/volunteers
    │   └── /admin/forms/newsletter
    ├── /admin/users (SuperAdmin)
    ├── /admin/settings (SuperAdmin)
    └── /admin/audit-logs (SuperAdmin)
```

**Depth Analysis:**
- Maximum click depth from homepage: **3** (Home → Learn → Category → Article)
- Every public page is reachable within 3 clicks
- Admin pages are 2 clicks from dashboard (Sidebar → List → Detail)

---

# 5. Master User Journeys

## 5.1 Journey: First-Time Student Visitor

```
ENTRY: Google search "civic literacy India" / Instagram @nagrikindia link
│
▼
┌─────────────────────────────────────────┐
│  HOMEPAGE                                │
│  • Hero: "Don't just live here. Shape it"│
│  • Mission snippet                       │
│  • Featured articles + projects          │
│  • CTA: "Get Involved"                  │
└─────────┬──────────────┬────────────────┘
          │              │
    "Learn More"    "Get Involved"
          │              │
          ▼              ▼
    ┌──────────┐   ┌──────────┐
    │  ABOUT   │   │ JOIN US  │
    │  page    │   │ page     │
    └────┬─────┘   └──────────┘
         │
    "Read content"
         │
         ▼
    ┌──────────┐
    │  LEARN   │
    │ Category │
    │  Grid    │
    └────┬─────┘
         │
    Click category
         │
         ▼
    ┌──────────────┐
    │ CATEGORY     │
    │ Article List │
    └──────┬───────┘
           │
      Click article
           │
           ▼
    ┌──────────────┐
    │ ARTICLE      │
    │ Full Content │
    │ + Share      │
    │ + Related    │
    └──────────────┘
```

**Journey metrics:**
- Entry → Content: 3 clicks
- Entry → Conversion (volunteer): 2 clicks (Home → Join Us → Submit)
- Average expected session: 3–5 pages, 2–4 minutes

## 5.2 Journey: School Administrator Evaluating Partnership

```
ENTRY: Direct link from email / referral
│
▼
┌───────────┐
│ HOMEPAGE  │
└─────┬─────┘
      │
 "Schools" nav
      │
      ▼
┌──────────────────────────────────────┐
│  SCHOOLS PAGE                         │
│  • Why Schools section               │
│  • 100 Schools Initiative            │
│  • Past session write-ups + photos   │
│  • CTA: "Partner With Us"           │
└──────┬──────────────┬────────────────┘
       │              │
  Read sessions   Click CTA
       │              │
       ▼              ▼
  ┌──────────┐  ┌──────────────┐
  │ Session  │  │ Google Form  │
  │ Photos   │  │ (external)   │
  │ Lightbox │  │ Partnership  │
  └──────────┘  └──────────────┘
```

**Trust signals visited:** Homepage (credibility) → Schools (evidence of past work) → Form (action)

## 5.3 Journey: Content Editor Publishing an Article

```
ENTRY: /admin/login
│
▼
┌─────────────────┐
│ ADMIN LOGIN     │
│ Email + Password│
└────────┬────────┘
         │
    Authenticated
         │
         ▼
┌─────────────────┐
│ DASHBOARD       │
│ Stats + Activity│
│ Quick Actions   │
└────────┬────────┘
         │
  "+ New Article"
         │
         ▼
┌──────────────────────────────────┐
│ ARTICLE EDITOR                    │
│ • Title                          │
│ • Category (dropdown)            │
│ • Rich text body (Tiptap)        │
│ • Featured image (upload)        │
│ • SEO fields (meta title, desc)  │
│ • [Save Draft] [Submit]          │
└──────────────┬───────────────────┘
               │
          Save Draft
               │
               ▼
┌──────────────────────────────────┐
│ DRAFT SAVED (toast notification) │
│ Status: Draft                    │
│ Editor cannot publish — Admin    │
│ must review and publish          │
└──────────────────────────────────┘
```

## 5.4 Journey: Admin Publishing & Managing Submissions

```
ENTRY: /admin/login → Dashboard
│
├── Check "Recent Activity" feed
│
├── Click "View Messages" quick action
│   │
│   ▼
│   ┌──────────────────────────────┐
│   │ CONTACT SUBMISSIONS          │
│   │ Filter: New (3 unread)       │
│   │ • Click entry → Expand       │
│   │ • Mark as Read               │
│   │ • Reply externally (email)   │
│   │ • Export CSV                  │
│   └──────────────────────────────┘
│
├── Sidebar → Articles → Article list
│   │
│   ▼
│   ┌──────────────────────────────┐
│   │ ARTICLES LIST                │
│   │ Filter: Status = Draft       │
│   │ • Open article in editor     │
│   │ • Review content             │
│   │ • Click [Publish]            │
│   │ • Confirm dialog             │
│   │ • Article goes live          │
│   │ • ISR revalidation triggered │
│   └──────────────────────────────┘
│
└── Sidebar → Volunteers → Manage pipeline
    │
    ▼
    ┌──────────────────────────────┐
    │ VOLUNTEER LIST               │
    │ Filter: Status = New         │
    │ • Review registration        │
    │ • Update: New → Contacted    │
    │ • Update: Contacted → Accept │
    │ • Export all as CSV           │
    └──────────────────────────────┘
```

---

# 6. Screen Inventory

## 6.1 Public Screens (15 screens)

| # | Screen Name | Route | Purpose | Primary CTA | Secondary CTA |
|---|---|---|---|---|---|
| S-01 | Homepage | `/` | First impression; value prop; funnel entry | "Get Involved" → `/join` | "Learn More" → `/about` |
| S-02 | About | `/about` | Organization story, values, mission, team | "Join Us" → `/join` | Browse team |
| S-03 | Learn Hub | `/learn` | Category grid; entry to content library | Click category | Search |
| S-04 | Category Page | `/learn/[cat]` | Article listing within a category | Click article | Breadcrumb nav |
| S-05 | Article Detail | `/learn/[cat]/[slug]` | Full article content | Share buttons | Related articles |
| S-06 | Projects Hub | `/projects` | Project cards with status badges | CTA per project card | — |
| S-07 | Project Detail | `/projects/[slug]` | Full project description | Project-specific CTA | Back to projects |
| S-08 | Schools | `/schools` | School outreach info, sessions, partnership | "Partner With Us" | Browse sessions |
| S-09 | Blog Listing | `/blog` | Paginated blog post grid | Click post | Category filter |
| S-10 | Blog Detail | `/blog/[slug]` | Full blog post | Share buttons | Related posts |
| S-11 | Join Us / Contact | `/join` | Contact form + volunteer CTA + social links | Submit contact form | "Volunteer" → scroll to section |
| S-12 | FAQ | `/faq` | Accordion Q&A | — | Contact link |
| S-13 | Search Results | `/search?q=` | Search results across all content types | Click result | Refine search |
| S-14 | Privacy Policy | `/privacy` | Legal: data handling disclosure | — | — |
| S-15 | Terms of Use | `/terms` | Legal: usage terms | — | — |

## 6.2 Error/State Screens (4 screens)

| # | Screen Name | Route | Purpose |
|---|---|---|---|
| S-16 | 404 Not Found | `/*` (catch-all) | Friendly error with navigation options |
| S-17 | 500 Server Error | Error boundary | "Something went wrong" with retry |
| S-18 | Offline | — | "No internet connection" with retry |
| S-19 | Volunteer Success | `/join` (state) | Confirmation after volunteer form submission |

## 6.3 Admin Screens (19 screens)

| # | Screen Name | Route | Purpose | Access |
|---|---|---|---|---|
| S-20 | Admin Login | `/admin/login` | Authentication | Public |
| S-21 | Dashboard | `/admin/dashboard` | Overview stats, activity, quick actions | Editor+ |
| S-22 | Blog List | `/admin/blog` | Manage blog posts (table view) | Editor+ |
| S-23 | Blog Editor | `/admin/blog/new` or `/admin/blog/[id]/edit` | Create/edit blog post | Editor+ |
| S-24 | Article List | `/admin/articles` | Manage learn articles (table view) | Editor+ |
| S-25 | Article Editor | `/admin/articles/new` or `/admin/articles/[id]/edit` | Create/edit article | Editor+ |
| S-26 | Category Manager | `/admin/categories` | Manage categories (inline edit table) | Admin+ |
| S-27 | Project List | `/admin/projects` | Manage projects (table view) | Admin+ |
| S-28 | Project Editor | `/admin/projects/new` or `/admin/projects/[id]/edit` | Create/edit project | Admin+ |
| S-29 | School Session List | `/admin/schools` | Manage sessions + photo galleries | Editor+ |
| S-30 | School Session Editor | `/admin/schools/new` or `/admin/schools/[id]/edit` | Create/edit session with photo upload | Editor+ |
| S-31 | Team Manager | `/admin/team` | Manage team members (drag-sort list) | Admin+ |
| S-32 | FAQ Manager | `/admin/faq` | Manage FAQs (grouped accordion editor) | Editor+ |
| S-33 | Media Library | `/admin/media` | Grid of uploaded files; upload, search, delete | Editor+ |
| S-34 | Contact Inbox | `/admin/forms/contact` | View/manage contact submissions | Admin+ |
| S-35 | Volunteer Inbox | `/admin/forms/volunteers` | View/manage volunteer registrations | Admin+ |
| S-36 | Newsletter Subscribers | `/admin/forms/newsletter` | View/export subscriber list | Admin+ |
| S-37 | User Management | `/admin/users` | Create/edit/deactivate users + assign roles | SuperAdmin |
| S-38 | Settings | `/admin/settings` | General, SEO, social, contact, analytics config | SuperAdmin |
| S-39 | Audit Logs | `/admin/audit-logs` | Read-only timeline of all admin actions | SuperAdmin |

**Total screens: 38**

---

# 7. Detailed Screen Flows

## 7.1 S-01: Homepage

```
USER ENTERS: Direct URL / Search engine / Social link / Referral
│
▼
SYSTEM LOADS:
├── Fetch hero content from Settings API (or static)
├── Fetch latest 3 published blog posts
├── Fetch latest 2 active projects
├── Render SSG/ISR page (< 100ms from CDN)
│
▼
SCREEN DISPLAYS:
┌──────────────────────────────────────────────┐
│ [Navigation Bar]                              │
│                                               │
│ ┌───────────────────────────────────────────┐ │
│ │ HERO SECTION                              │ │
│ │ "Don't just live here. Shape it."         │ │
│ │ "Welcome to The Nagrik"                   │ │
│ │ [Get Involved]  [Learn More]              │ │
│ └───────────────────────────────────────────┘ │
│                                               │
│ ┌───────────────────────────────────────────┐ │
│ │ ABOUT SNIPPET                             │ │
│ │ Brief intro paragraph → [Know More]       │ │
│ └───────────────────────────────────────────┘ │
│                                               │
│ ┌───────────────────────────────────────────┐ │
│ │ BENTO GRID (3 cards)                      │ │
│ │ ┌──────┐ ┌──────┐ ┌──────────────────┐   │ │
│ │ │ Why  │ │Stud. │ │  Impact at       │   │ │
│ │ │civic │ │power.│ │  scale.          │   │ │
│ │ │lit?  │ │      │ │                  │   │ │
│ │ └──────┘ └──────┘ └──────────────────┘   │ │
│ └───────────────────────────────────────────┘ │
│                                               │
│ ┌───────────────────────────────────────────┐ │
│ │ MISSION STATEMENT BLOCK                   │ │
│ │ "To build a generation of informed..."    │ │
│ └───────────────────────────────────────────┘ │
│                                               │
│ ┌───────────────────────────────────────────┐ │
│ │ FEATURED CONTENT                          │ │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐     │ │
│ │ │ Blog 1  │ │ Blog 2  │ │ Blog 3  │     │ │
│ │ └─────────┘ └─────────┘ └─────────┘     │ │
│ │ ┌──────────────┐ ┌──────────────┐        │ │
│ │ │ Project 1    │ │ Project 2    │        │ │
│ │ └──────────────┘ └──────────────┘        │ │
│ └───────────────────────────────────────────┘ │
│                                               │
│ ┌───────────────────────────────────────────┐ │
│ │ CTA BANNER                                │ │
│ │ "Become a champion for civic literacy."   │ │
│ │ [Get Involved]                            │ │
│ └───────────────────────────────────────────┘ │
│                                               │
│ [Footer with newsletter widget]               │
└──────────────────────────────────────────────┘
```

**User Actions & Exits:**

| Action | Destination |
|---|---|
| Click "Get Involved" (hero) | `/join` |
| Click "Learn More" (hero) | `/about` |
| Click "Know More" (about snippet) | `/about` |
| Click blog post card | `/blog/[slug]` |
| Click project card | `/projects/[slug]` |
| Click "Get Involved" (bottom CTA) | `/join` |
| Enter email in newsletter widget | Subscribe API → success toast |
| Click nav item | Respective page |

## 7.2 S-03: Learn Hub

```
USER ENTERS: Nav → "Learn" / Internal link / Direct URL
│
▼
SYSTEM LOADS:
├── Fetch all categories with article counts
├── Render SSG page
│
▼
SCREEN DISPLAYS:
┌──────────────────────────────────────────────┐
│ [Navigation Bar]                              │
│                                               │
│ Learn                                         │
│ "Explore civic literacy topics"               │
│                                               │
│ [Search bar: "Search articles..."]            │
│                                               │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│ │ 📜   │ │ ⚖️   │ │ 🏛️   │ │ 🗳️   │        │
│ │Const.│ │Rights│ │Parl. │ │Elect.│        │
│ │ (12) │ │  (8) │ │  (5) │ │  (7) │        │
│ └──────┘ └──────┘ └──────┘ └──────┘        │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│ │ 🔨   │ │ 🌐   │ │ 📋   │ │ 💻   │        │
│ │Judic.│ │Citiz.│ │Policy│ │Digi. │        │
│ │  (3) │ │  (4) │ │  (6) │ │  (2) │        │
│ └──────┘ └──────┘ └──────┘ └──────┘        │
│                + More categories (if > 9)    │
│                                               │
│ [Footer]                                      │
└──────────────────────────────────────────────┘
```

**Interactions:**

| Action | Result |
|---|---|
| Click category card | Navigate to `/learn/[category-slug]` |
| Type in search bar | Navigate to `/search?q=[query]` (debounced 300ms) |
| Hover on card | Subtle scale up (1.02) + shadow increase |

## 7.3 S-05: Article Detail

```
USER ENTERS: Category page → Click article / Search result / Direct URL
│
▼
SYSTEM LOADS:
├── Fetch article by slug (only if status = published)
├── Fetch 3 related articles from same category
├── Calculate read time
│
▼
SCREEN DISPLAYS:
┌──────────────────────────────────────────────┐
│ [Navigation Bar]                              │
│                                               │
│ Learn > Constitution > Article Title          │  ← Breadcrumb
│                                               │
│ [Category Badge]   5 min read   Jun 5, 2026  │
│                                               │
│ ┌───────────────────────────────────────────┐ │
│ │          FEATURED IMAGE                    │ │
│ └───────────────────────────────────────────┘ │
│                                               │
│ # Article Title                               │
│ By Author Name                                │
│                                               │
│ [Article body — rich text]                    │
│ Headings, paragraphs, images, lists, quotes  │
│                                               │
│ ─────────────────────────────────             │
│ Share: [Twitter] [LinkedIn] [Copy Link]       │
│                                               │
│ ┌───────────────────────────────────────────┐ │
│ │ RELATED ARTICLES                           │ │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐     │ │
│ │ │Related 1│ │Related 2│ │Related 3│     │ │
│ │ └─────────┘ └─────────┘ └─────────┘     │ │
│ └───────────────────────────────────────────┘ │
│                                               │
│ ┌───────────────────────────────────────────┐ │
│ │ NEWSLETTER CTA (inline)                    │ │
│ │ "Liked this? Subscribe for more."          │ │
│ │ [email input] [Subscribe]                  │ │
│ └───────────────────────────────────────────┘ │
│                                               │
│ [Footer]                                      │
└──────────────────────────────────────────────┘
```

**Exit Points:** Related article click, breadcrumb nav, share action, newsletter subscribe, nav bar.

## 7.4 S-08: Schools Page

```
USER ENTERS: Nav → "Schools" / Internal link
│
▼
SCREEN DISPLAYS:
┌──────────────────────────────────────────────┐
│ [Navigation Bar]                              │
│                                               │
│ HERO: "Bringing civic literacy beyond        │
│        textbooks."                            │
│                                               │
│ ┌───────────────────────────────────────────┐ │
│ │ WHY SCHOOLS                                │ │
│ │ "Every student learns about democracy.     │ │
│ │  Few learn how to engage with it..."       │ │
│ └───────────────────────────────────────────┘ │
│                                               │
│ ┌───────────────────────────────────────────┐ │
│ │ 100 SCHOOLS INITIATIVE                     │ │
│ │ Banner: "Launching July 2026"             │ │
│ │ Program description                        │ │
│ └───────────────────────────────────────────┘ │
│                                               │
│ [Partner With Us] ← CTA button               │
│                                               │
│ ┌───────────────────────────────────────────┐ │
│ │ SCHOOL SESSIONS                            │ │
│ │                                            │ │
│ │ ┌────────────────────────────────────┐    │ │
│ │ │ Session Title                      │    │ │
│ │ │ School Name  •  Date              │    │ │
│ │ │ Description text...               │    │ │
│ │ │ [📷 Photo gallery — click to view]│    │ │
│ │ └────────────────────────────────────┘    │ │
│ │                                            │ │
│ │ ┌────────────────────────────────────┐    │ │
│ │ │ Next session card...               │    │ │
│ │ └────────────────────────────────────┘    │ │
│ └───────────────────────────────────────────┘ │
│                                               │
│ [Footer]                                      │
└──────────────────────────────────────────────┘
```

**Photo Gallery Interaction:**
- Click photo → Opens lightbox overlay
- Lightbox: Left/right arrows, close button, image counter
- Swipe gestures on mobile
- `Escape` key or overlay click to close

## 7.5 S-11: Join Us / Contact Page

```
USER ENTERS: Nav "Join Us" CTA / Homepage CTA / Internal link
│
▼
SCREEN DISPLAYS:
┌──────────────────────────────────────────────┐
│ [Navigation Bar]                              │
│                                               │
│ HERO: "Help build India's most informed      │
│        generation."                           │
│                                               │
│ ┌─────────────────┐ ┌─────────────────────┐  │
│ │ CONTACT INFO    │ │ CONTACT FORM        │  │
│ │                 │ │                     │  │
│ │ 📧 Email        │ │ Full Name *         │  │
│ │ 📸 Instagram    │ │ Email *             │  │
│ │ 💼 LinkedIn     │ │ Subject * [▼]       │  │
│ │                 │ │ Message *           │  │
│ │ Social icons    │ │ [honeypot field]    │  │
│ │                 │ │                     │  │
│ │                 │ │ [Send Message]      │  │
│ └─────────────────┘ └─────────────────────┘  │
│                                               │
│ ─────────────── OR ─────────────────          │
│                                               │
│ ┌───────────────────────────────────────────┐ │
│ │ VOLUNTEER SECTION                          │ │
│ │ "Want to contribute directly?"             │ │
│ │ [Become a Volunteer] ← opens form below   │ │
│ └───────────────────────────────────────────┘ │
│                                               │
│ ┌───────────────────────────────────────────┐ │
│ │ VOLUNTEER FORM (expandable / separate)     │ │
│ │ Full Name *     Email *     Phone          │ │
│ │ Age *           City/State *               │ │
│ │ Occupation * [▼]                           │ │
│ │ Areas of Interest ☐ Content ☐ Research     │ │
│ │   ☐ Social Media ☐ Outreach ☐ Design      │ │
│ │   ☐ Technology ☐ Other                     │ │
│ │ Why volunteer? (optional)                  │ │
│ │ ☐ I agree to the Terms *                   │ │
│ │ [Submit Application]                       │ │
│ └───────────────────────────────────────────┘ │
│                                               │
│ [Footer]                                      │
└──────────────────────────────────────────────┘
```

## 7.6 S-21: Admin Dashboard

```
USER ENTERS: /admin/login → Successful auth → Redirect to /admin/dashboard
│
▼
SYSTEM LOADS:
├── GET /api/v1/dashboard/stats
├── GET /api/v1/dashboard/activity
│
▼
SCREEN DISPLAYS:
┌──────────┬───────────────────────────────────────────────┐
│ [Sidebar]│                                               │
│          │  Dashboard                                    │
│          │                                               │
│          │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│          │  │Posts │ │Learn │ │Proj. │ │Subs  │       │
│          │  │  12  │ │  45  │ │   3  │ │ 234  │       │
│          │  └──────┘ └──────┘ └──────┘ └──────┘       │
│          │  ┌──────┐ ┌──────┐                          │
│          │  │Msgs  │ │Vols  │                          │
│          │  │  18  │ │  27  │                          │
│          │  └──────┘ └──────┘                          │
│          │                                               │
│          │  Recent Activity                              │
│          │  ─────────────────                            │
│          │  • User published "What is RTI?" — 2h ago    │
│          │  • New contact submission — 5h ago            │
│          │  • User edited "Judiciary 101" — 1d ago      │
│          │  ...                                          │
│          │                                               │
│          │  Quick Actions                                │
│          │  [+ New Blog Post]  [+ New Article]           │
│          │  [View Messages]    [View Volunteers]         │
└──────────┴───────────────────────────────────────────────┘
```

## 7.7 S-23: Blog Editor (Create/Edit)

```
USER ENTERS: Dashboard "New Blog Post" / Blog list "Edit" button
│
▼
SCREEN DISPLAYS:
┌──────────┬───────────────────────────────────────────────┐
│ [Sidebar]│                                               │
│          │  ← Back to Blog Posts                         │
│          │                                               │
│          │  ┌───────────────────────────────────────┐    │
│          │  │ Title *                               │    │
│          │  │ [___________________________________] │    │
│          │  │                                       │    │
│          │  │ Slug: /blog/auto-generated-slug       │    │
│          │  │       [Edit slug]                     │    │
│          │  │                                       │    │
│          │  │ Category [▼ Select category]          │    │
│          │  │                                       │    │
│          │  │ Featured Image                        │    │
│          │  │ ┌─────────────────────┐              │    │
│          │  │ │  [Drop image here]  │   [Browse]   │    │
│          │  │ └─────────────────────┘              │    │
│          │  │                                       │    │
│          │  │ ┌─────────────────────────────────┐  │    │
│          │  │ │ RICH TEXT EDITOR (Tiptap)       │  │    │
│          │  │ │ B I U H1 H2 • — "" 🔗 📷 ⟩   │  │    │
│          │  │ │                                 │  │    │
│          │  │ │                                 │  │    │
│          │  │ │                                 │  │    │
│          │  │ └─────────────────────────────────┘  │    │
│          │  │                                       │    │
│          │  │ Excerpt (optional)                    │    │
│          │  │ [___________________________________] │    │
│          │  │                                       │    │
│          │  │ Tags                                  │    │
│          │  │ [tag input with chips]                │    │
│          │  │                                       │    │
│          │  │ ▾ SEO Settings                        │    │
│          │  │   Meta Title [_____________________]  │    │
│          │  │   Meta Description [_______________]  │    │
│          │  │   OG Image [Upload]                   │    │
│          │  │                                       │    │
│          │  │ Status: Draft                         │    │
│          │  │                                       │    │
│          │  │ [Save Draft]  [Publish] (Admin+)      │    │
│          │  └───────────────────────────────────────┘    │
└──────────┴───────────────────────────────────────────────┘
```

**Editor Flow:**

| Action | Result |
|---|---|
| Type title | Auto-generate slug (debounced) |
| Click "Edit slug" | Slug becomes editable input |
| Drop image | Upload to R2 → Show preview thumbnail |
| Click [Save Draft] | POST/PUT to API → toast "Draft saved" → Stay on page |
| Click [Publish] (Admin+) | Confirm dialog → PATCH status → toast "Published!" → Redirect to list |
| Click [Publish] (Editor) | **Button hidden** — Editor sees only [Save Draft] |
| Navigate away with unsaved changes | Browser `beforeunload` warning |

---

# 8. Authentication Flow

## 8.1 Admin Login Flow

```
USER: Navigate to /admin or /admin/login
│
├── Already authenticated (valid JWT in memory)?
│   ├── YES → Redirect to /admin/dashboard
│   └── NO → Show login form
│
▼
┌─────────────────────────────┐
│ THE NAGRIK — Admin           │
│                              │
│ Email *                      │
│ [________________________]   │
│                              │
│ Password *                   │
│ [________________________]   │
│                              │
│ [Forgot Password?]          │
│                              │
│ [Sign In]                   │
└─────────────────────────────┘
│
▼ Submit
│
├── Validate inputs (client-side: Zod)
│   ├── FAIL → Inline error messages
│   └── PASS ↓
│
├── POST /api/v1/auth/login
│   │
│   ├── 200 OK → Store access token in memory
│   │            → Refresh token set as HTTP-only cookie
│   │            → Redirect to /admin/dashboard
│   │
│   ├── 401 Unauthorized → "Invalid email or password"
│   │                     → Increment failed_login_attempts
│   │
│   ├── 423 Locked → "Account locked. Try again in 15 minutes."
│   │               → (after 5 failed attempts)
│   │
│   └── 500 Error → "Something went wrong. Please try again."
```

## 8.2 Token Refresh Flow (Background)

```
Access token expires (15 min)
│
▼
SWR/fetch interceptor detects 401
│
▼
POST /api/v1/auth/refresh (cookie auto-sent)
│
├── 200 → New access token stored → Retry original request
│
├── 401 → Refresh token expired/invalid
│        → Clear auth state
│        → Redirect to /admin/login
│        → Toast: "Session expired. Please log in again."
```

## 8.3 Forgot Password Flow

```
User clicks "Forgot Password?" on login page
│
▼
┌─────────────────────────────┐
│ Reset Password               │
│                              │
│ Enter your email address     │
│ [________________________]   │
│                              │
│ [Send Reset Link]           │
│ [← Back to Login]           │
└─────────────────────────────┘
│
▼ Submit
│
POST /api/v1/auth/forgot-password
│
▼ ALWAYS responds 200 (no email enumeration)
│
Show: "If that email exists in our system, we've sent a reset link."
│
▼ User receives email with link: /admin/reset-password?token=xxx
│
▼
┌─────────────────────────────┐
│ Set New Password             │
│                              │
│ New Password *               │
│ [________________________]   │
│                              │
│ Confirm Password *           │
│ [________________________]   │
│                              │
│ [Reset Password]            │
└─────────────────────────────┘
│
▼ Submit
│
POST /api/v1/auth/reset-password
│
├── 200 → "Password reset successful" → Redirect to /admin/login
├── 400 → "Invalid or expired reset link" → Show error + link to try again
```

## 8.4 Logout Flow

```
User clicks dropdown → "Logout"
│
▼
POST /api/v1/auth/logout
│
▼
Clear access token from memory
Clear refresh token cookie
│
▼
Redirect to /admin/login
Toast: "Logged out successfully"
```

---

# 9. Volunteer Registration Flow

```
USER: Clicks "Get Involved" / "Become a Volunteer" / "Join Us" nav
│
▼
Navigate to /join → Scroll to Volunteer section
│
▼
USER: Fills volunteer form
│
├── Full Name * → validate on blur (min 2 chars, max 200)
├── Email * → validate on blur (email format)
├── Phone → validate on blur (Indian format, optional)
├── Age * → validate (14-99)
├── City/State * → validate (non-empty)
├── Occupation * → dropdown selection
├── Areas of Interest → multi-select checkboxes (at least 1)
├── Why volunteer? → optional textarea (max 500 chars)
├── Terms checkbox * → must be checked
│
▼ Click [Submit Application]
│
├── Client validation
│   ├── FAIL → Highlight invalid fields, scroll to first error
│   │         → Inline error messages below each field
│   └── PASS ↓
│
├── Disable submit button → Show spinner
│
├── POST /api/v1/volunteers
│   │
│   ├── 201 Created
│   │   ├── Show success state on page:
│   │   │   ┌───────────────────────────────────────┐
│   │   │   │ ✅ Welcome aboard!                     │
│   │   │   │ Thank you for volunteering with       │
│   │   │   │ The Nagrik. We'll reach out shortly.  │
│   │   │   │                                       │
│   │   │   │ [Back to Home]                        │
│   │   │   └───────────────────────────────────────┘
│   │   │
│   │   ├── System: Send admin notification email
│   │   └── System: Create volunteer record (status: "new")
│   │
│   ├── 409 Conflict (duplicate email)
│   │   → "This email is already registered. Contact us if you need help."
│   │
│   ├── 429 Rate Limited
│   │   → "Please wait before submitting again."
│   │
│   └── 500 Error
│       → "Something went wrong. Please try again or email us directly."
│       → Show email link: thenagrik.org@gmail.com
```

---

# 10. Contact Form Flow

```
USER: Navigate to /join → Contact form section
│
▼
USER: Fills contact form
│
├── Full Name * → validate on blur
├── Email * → validate on blur (email format)
├── Subject * → dropdown: General | Partnership | Volunteer | Media | Other
├── Message * → validate (min 20, max 5000 chars)
├── [honeypot field] → hidden, must remain empty
│
▼ Click [Send Message]
│
├── Client validation → FAIL: inline errors
│                     → PASS: continue
│
├── Honeypot check → filled = silently reject (fake success shown)
│
├── Disable button → spinner
│
├── POST /api/v1/contact
│   │
│   ├── 201 Created
│   │   ├── Replace form with success banner:
│   │   │   "✅ Thank you! We'll get back to you soon."
│   │   │
│   │   ├── System: Store submission (status: "new")
│   │   ├── System: Send email notification to admin
│   │   └── System: (P1) Send auto-reply to submitter
│   │
│   ├── 429 Rate Limited
│   │   → "You've reached the submission limit. Try again in 1 hour."
│   │
│   └── 500 Error
│       → "Unable to send message. Please email us directly at..."
```

---

# 11. Donation Flow

> [!NOTE]
> Donations are NOT in MVP or V1.0. This section documents the planned V2.0 flow for future implementation.

```
(V2.0 — Future)

USER: Clicks "Donate" (new nav item)
│
▼
┌───────────────────────────────────────┐
│ Support The Nagrik                     │
│                                       │
│ Select Amount:                        │
│ [₹100] [₹500] [₹1000] [Custom: ___] │
│                                       │
│ Name * [_________________________]    │
│ Email * [________________________]    │
│ PAN (optional for 80G) [_________]   │
│                                       │
│ [Donate Now → Razorpay]              │
└───────────────────────────────────────┘
│
▼ Click Donate Now
│
├── Razorpay checkout modal opens
│   ├── Success → /donate/thank-you
│   │             → Receipt emailed
│   │             → Admin notified
│   │
│   ├── Failure → "Payment failed. No amount was charged."
│   │            → [Try Again]
│   │
│   └── Cancel → Close modal, return to form
```

---

# 12. Blog Flow

```
USER: Nav → Blog / Homepage "Featured" card / Search result
│
▼
S-09: BLOG LISTING
│
├── System loads: GET /api/v1/blog?page=1&per_page=9&status=published
│
├── Display: Grid of blog post cards
│   Each card: Featured image, title, date, author, category badge, excerpt
│
├── Interactions:
│   ├── Click card → Navigate to /blog/[slug]
│   ├── Click category filter → Reload with ?category=slug
│   ├── Click pagination (1, 2, 3...) → Reload with ?page=N
│   └── No posts? → Empty state: "No blog posts yet. Check back soon!"
│
▼ Click a blog post card
│
S-10: BLOG DETAIL
│
├── System loads: GET /api/v1/blog/[slug]
│                GET /api/v1/blog/[slug]/related
│
├── Display: Full article (see Section 7.3 for layout)
│
├── Interactions:
│   ├── Click share button (Twitter/LinkedIn/Copy) → Open share dialog / copy URL
│   ├── Click related article → Navigate to /blog/[related-slug]
│   ├── Subscribe in inline CTA → POST /api/v1/newsletter/subscribe
│   ├── Click breadcrumb "Blog" → Navigate to /blog
│   └── Click category badge → Navigate to /blog?category=slug
│
├── Scroll behavior:
│   └── Progress bar at top of page shows reading progress (0–100%)
```

---

# 13. Event Flow

> [!NOTE]
> Events are NOT in the current PRD scope. They are planned for V2.0. No screen or flow exists in MVP. The "Projects" module serves as the closest equivalent, with project cards acting as event-like entries.

**Future V2.0 Event Flow:**
```
Browse Events → Event Detail → Register → Confirmation → Calendar .ics download
```

---

# 14. Admin CRUD Flow (Generic Pattern)

Every admin content module follows this standardized flow:

## 14.1 List → Create → Edit → Publish Pattern

```
S-XX: ENTITY LIST
│
├── System loads: GET /api/v1/[entity]?page=1&per_page=20
│
├── Display:
│   ┌──────────────────────────────────────────────────────┐
│   │ Blog Posts                          [+ New Post]     │
│   │                                                      │
│   │ Filter: [All ▼] [Draft ▼] [Published ▼] [Archived]  │
│   │ Search: [________________________] 🔍                │
│   │                                                      │
│   │ ┌─────────────────────────────────────────────────┐  │
│   │ │ Title          │ Status │ Author │ Date │ ⋮    │  │
│   │ ├────────────────┼────────┼────────┼──────┼──────┤  │
│   │ │ What is RTI?   │ ●Pub   │ Aryan  │ Jun 5│ Edit │  │
│   │ │ Judiciary 101  │ ●Draft │ Priya  │ Jun 3│ Edit │  │
│   │ │ Election Guide │ ●Arch  │ Admin  │ May 1│ Edit │  │
│   │ └─────────────────────────────────────────────────┘  │
│   │                                                      │
│   │ ← 1  2  3 →  Showing 1-20 of 45                    │
│   └──────────────────────────────────────────────────────┘
│
├── Actions:
│   ├── Click [+ New Post] → Navigate to /admin/[entity]/new
│   ├── Click [Edit] → Navigate to /admin/[entity]/[id]/edit
│   ├── Click status filter → Reload with ?status=draft
│   ├── Type search → Debounced filter (300ms)
│   └── Click [⋮] → Context menu: Edit | Delete (Admin+)
│
▼ Click [+ New] or [Edit]
│
S-XX: ENTITY EDITOR
│
├── If NEW: Empty form
├── If EDIT: Pre-filled form from GET /api/v1/[entity]/[id]
│
├── User edits content
│
├── Click [Save Draft]:
│   ├── Validate (client-side Zod)
│   ├── POST or PUT /api/v1/[entity] or /[id]
│   ├── Toast: "Draft saved" ✅
│   ├── Stay on editor page
│   └── Audit log: "User saved draft of [entity]"
│
├── Click [Publish] (Admin+ only):
│   ├── Show confirm dialog: "Publish this [entity]? It will be visible to the public."
│   ├── [Cancel] → Close dialog
│   ├── [Confirm] → PATCH /api/v1/[entity]/[id]/status {status: 'published'}
│   ├── Toast: "Published!" ✅
│   ├── Redirect to list page
│   ├── System: Trigger ISR revalidation for affected pages
│   └── Audit log: "User published [entity]"
│
├── Click [Delete] (Admin+ only, from list view ⋮ menu):
│   ├── Show confirm dialog: "Delete this [entity]? This action cannot be undone."
│   ├── [Cancel] → Close dialog
│   ├── [Confirm] → DELETE /api/v1/[entity]/[id]
│   ├── Toast: "[Entity] deleted" ✅
│   ├── Remove from list (optimistic update)
│   └── Audit log: "User deleted [entity]"
```

---

# 15. CMS Content Lifecycle Flow

```
┌────────┐     ┌────────┐     ┌──────────┐     ┌──────────┐
│        │     │        │     │          │     │          │
│  NEW   │────▶│ DRAFT  │────▶│PUBLISHED │────▶│ ARCHIVED │
│        │     │        │     │          │     │          │
└────────┘     └───┬────┘     └─────┬────┘     └──────────┘
                   │                │                │
                   │   ◀────────────┘                │
                   │   (Unpublish → reverts to draft) │
                   │                                  │
                   └──────────────────────────────────┘
                        (Restore from archive)

State Transitions:
─────────────────
NEW → DRAFT         : User creates content and saves
DRAFT → DRAFT       : User edits and saves again
DRAFT → PUBLISHED   : Admin clicks "Publish" (sets publish_date = now)
PUBLISHED → DRAFT   : Admin clicks "Unpublish" (content removed from public)
PUBLISHED → ARCHIVED: Admin clicks "Archive" (hidden from public, retained)
ARCHIVED → DRAFT    : Admin clicks "Restore" (moves back to draft for re-editing)
ANY → DELETED       : Admin clicks "Delete" (soft delete: sets deleted_at)
```

**Who can perform each transition:**

| Transition | Editor | Admin | SuperAdmin |
|---|---|---|---|
| Create (→ Draft) | ✅ | ✅ | ✅ |
| Edit Draft | ✅ | ✅ | ✅ |
| Publish | ❌ | ✅ | ✅ |
| Unpublish | ❌ | ✅ | ✅ |
| Archive | ❌ | ✅ | ✅ |
| Restore | ❌ | ✅ | ✅ |
| Delete | ❌ | ✅ | ✅ |

---

# 16. CRUD Flow Matrix

| Entity | Create | Read (Public) | Read (Admin) | Update | Publish | Archive | Delete | Restore | Audit |
|---|---|---|---|---|---|---|---|---|---|
| **Articles** | Editor+ | Published only | All statuses | Editor+ | Admin+ | Admin+ | Admin+ (soft) | Admin+ | ✅ |
| **Blog Posts** | Editor+ | Published only | All statuses | Editor+ | Admin+ | Admin+ | Admin+ (soft) | Admin+ | ✅ |
| **Categories** | Admin+ | All | All | Admin+ | N/A | N/A | Admin+ (if empty) | N/A | ✅ |
| **Projects** | Admin+ | All | All | Admin+ | N/A | N/A | Admin+ | N/A | ✅ |
| **School Sessions** | Editor+ | All | All | Editor+ | N/A | N/A | Admin+ | N/A | ✅ |
| **Session Photos** | Editor+ | Via session | Via session | Editor+ | N/A | N/A | Editor+ | N/A | ✅ |
| **Team Members** | Admin+ | Active only | All | Admin+ | N/A | N/A | Admin+ | N/A | ✅ |
| **Core Principles** | Admin+ | All | All | Admin+ | N/A | N/A | Admin+ | N/A | ✅ |
| **FAQ Entries** | Editor+ | Active only | All | Editor+ | N/A | N/A | Admin+ | N/A | ✅ |
| **Contact Submissions** | Public (form) | N/A | Admin+ | Admin+ (status) | N/A | Admin+ | Admin+ (hard) | N/A | ✅ |
| **Volunteer Registrations** | Public (form) | N/A | Admin+ | Admin+ (status) | N/A | N/A | Admin+ (hard) | N/A | ✅ |
| **Newsletter Subscribers** | Public (form) | N/A | Admin+ | N/A | N/A | N/A | Admin+ | N/A | ✅ |
| **Media Files** | Editor+ | Via content | Editor+ | Editor+ (metadata) | N/A | N/A | Admin+ | N/A | ✅ |
| **Users** | SuperAdmin | N/A | SuperAdmin | SuperAdmin | N/A | N/A | SuperAdmin | N/A | ✅ |
| **Settings** | N/A | Public (cached) | SuperAdmin | SuperAdmin | N/A | N/A | N/A | N/A | ✅ |
| **Audit Logs** | System (auto) | N/A | SuperAdmin | N/A | N/A | N/A | System (12mo) | N/A | N/A |

---

# 17. Navigation Rules

## 17.1 Breadcrumbs

| Page | Breadcrumb |
|---|---|
| Homepage | *(none)* |
| About | Home > About |
| Learn Hub | Home > Learn |
| Category Page | Home > Learn > {Category Name} |
| Article Detail | Home > Learn > {Category Name} > {Article Title} |
| Projects Hub | Home > Projects |
| Project Detail | Home > Projects > {Project Title} |
| Blog Listing | Home > Blog |
| Blog Detail | Home > Blog > {Post Title} |
| Schools | Home > Schools |
| Join Us | Home > Join Us |
| FAQ | Home > FAQ |
| Search Results | Home > Search |

**Breadcrumb rules:**
- Each segment is a clickable link (except the current page)
- Truncate long titles to 40 characters with ellipsis
- On mobile: show only parent and current (e.g., "Learn > Article Title")

## 17.2 Back Button Behavior

| Context | Back Button Action |
|---|---|
| Article detail | Returns to category page (browser history) |
| Blog detail | Returns to blog listing (browser history) |
| Project detail | Returns to projects hub |
| Admin editor | [← Back to List] link at top of editor; browser back also works |
| Admin login | Browser back goes to previous public page |
| Search results | Browser back returns to previous page |

## 17.3 Deep Linking & Direct URL Access

| URL | Behavior |
|---|---|
| `/learn/constitution/article-slug` | Works directly (SSG page); no need to navigate through hierarchy |
| `/blog/post-slug` | Works directly |
| `/admin/dashboard` | Requires auth; if not logged in → redirect to `/admin/login` with `?redirect=/admin/dashboard` |
| `/admin/blog/[id]/edit` | Requires auth + Editor+ role; redirect if unauthorized |
| `/admin/users` | Requires auth + SuperAdmin; redirect + toast "Access denied" if wrong role |

## 17.4 Redirect Rules

| Condition | From | To |
|---|---|---|
| Authenticated admin visits `/admin/login` | `/admin/login` | `/admin/dashboard` |
| Unauthenticated user visits any `/admin/*` | `/admin/*` | `/admin/login?redirect=original_url` |
| After successful login | `/admin/login` | `redirect` param or `/admin/dashboard` |
| After logout | Any admin page | `/admin/login` |
| Deleted/archived content accessed by public | `/blog/deleted-slug` | 404 page |
| Draft content accessed by public | `/learn/cat/draft-article` | 404 page |

## 17.5 404 Flow

```
User accesses non-existent URL
│
▼
┌──────────────────────────────────────┐
│ [Navigation Bar]                      │
│                                       │
│         ┌────┐                        │
│         │ 😕 │                        │
│         └────┘                        │
│                                       │
│   Oops! This page doesn't exist.     │
│                                       │
│   The page you're looking for may    │
│   have been moved or doesn't exist.  │
│                                       │
│   [Go to Homepage]  [Search]          │
│                                       │
│ [Footer]                              │
└──────────────────────────────────────┘
```

---

# 18. User States

| # | State | Description | Visual Indicator | Allowed Actions |
|---|---|---|---|---|
| US-01 | **Guest** | Unauthenticated public visitor | No auth UI shown | Browse, search, submit forms |
| US-02 | **First Visit** | No cookies/history detected | Show newsletter prompt after 30s | Same as Guest |
| US-03 | **Returning Visit** | Has visited before (analytics cookie) | No special UI change | Same as Guest |
| US-04 | **Authenticated (Editor)** | Logged into admin as Editor | Sidebar shows limited items | Create/edit content |
| US-05 | **Authenticated (Admin)** | Logged into admin as Admin | Sidebar shows content + forms | All content + form management |
| US-06 | **Authenticated (SuperAdmin)** | Logged into admin as SuperAdmin | Full sidebar visible | Everything |
| US-07 | **Session Expiring** | Access token expired, refresh token valid | Auto-refresh in background (invisible) | Continues normally after refresh |
| US-08 | **Session Expired** | Both tokens expired | Redirect to login; toast notification | Must re-authenticate |
| US-09 | **Account Locked** | 5+ failed login attempts | Login form shows lockout message + countdown | Wait 15 minutes |
| US-10 | **Account Inactive** | Admin set user status to inactive | Login fails with "Account deactivated" | Contact super admin |
| US-11 | **Empty Content State** | A content section has 0 entries | Empty state illustration + message + action | Create first entry (admin) |
| US-12 | **Offline** | Network connection lost | Toast: "You're offline. Some features may not work." | Read cached SSG pages only |

---

# 19. Form Behavior

## 19.1 Validation Rules

| Rule | Implementation | Timing |
|---|---|---|
| **Required fields** | Red asterisk (`*`) next to label; error on empty submit | On blur + on submit |
| **Email validation** | Regex + format check | On blur |
| **Inline errors** | Red text below field: "This field is required" | Appears on blur; clears on valid input |
| **Field character counts** | Show `X/300` counter below textareas | Live update as user types |
| **Password strength** | Visual strength bar (weak/medium/strong) | Live update as user types |
| **Duplicate detection** | Volunteer email uniqueness check on submit (server) | On submit (409 response) |

## 19.2 Submit Behavior

| Behavior | Implementation |
|---|---|
| **Disable on submit** | Submit button shows spinner; all inputs disabled |
| **Prevent double submit** | Button disabled after first click until response |
| **Scroll to error** | On validation failure, scroll to first invalid field |
| **Success feedback** | Replace form with success message (public) or toast (admin) |
| **Error feedback** | Inline errors per field; general error toast for server errors |
| **Network failure** | "Unable to submit. Check your connection and try again." + Retry button |

## 19.3 Admin Form Specific

| Behavior | Implementation |
|---|---|
| **Unsaved changes warning** | `beforeunload` event when navigating away with dirty form |
| **Auto-save (P2)** | Save draft every 30 seconds for rich text content |
| **Image upload preview** | Thumbnail preview immediately after file selection |
| **Slug auto-generation** | Title change → auto-update slug (debounced 500ms); manual override available |
| **SEO preview** | Live preview of Google search result appearance |

---

# 20. Error Handling

| # | Error | Screen | Message | Recovery |
|---|---|---|---|---|
| E-01 | **404 Not Found** | Custom 404 page | "This page doesn't exist." | [Go Home] [Search] |
| E-02 | **500 Server Error** | Error boundary | "Something went wrong. We're working on it." | [Try Again] [Go Home] |
| E-03 | **No Internet** | Toast overlay | "You're offline. Check your connection." | Auto-retry when online |
| E-04 | **Server Timeout** | Inline/toast | "Request timed out. Please try again." | [Retry] button |
| E-05 | **Validation Error** | Inline below fields | Per-field: "This field is required" | Fix field → error clears |
| E-06 | **401 Unauthorized** | Redirect | *(silent redirect to login)* | Login again |
| E-07 | **403 Forbidden** | Toast + redirect | "You don't have permission for this action." | Contact admin |
| E-08 | **Session Expired** | Toast + redirect | "Your session has expired. Please log in again." | Login again |
| E-09 | **Empty Search** | Search results page | "No results found for '{query}'." | [Browse categories] [Clear search] |
| E-10 | **Media Upload Fail** | Toast in admin | "Upload failed. File may be too large or unsupported." | [Try Again] — show file constraints |
| E-11 | **Rate Limited** | Toast | "Too many requests. Wait a moment and try again." | Auto-countdown timer |
| E-12 | **Duplicate Entry** | Inline error | "This email is already registered." | Clear or modify field |

---

# 21. Empty States

| Context | Screen | Message | Action |
|---|---|---|---|
| No blog posts | Blog listing | "No blog posts yet. New content is coming soon!" | [Go to Learn] |
| No articles in category | Category page | "No articles in this category yet. Check back soon!" | [Browse other categories] |
| No school sessions | Schools page sessions | "School sessions are coming soon. Partner with us to be first!" | [Partner With Us] |
| No projects | Projects page | "Projects are being prepared. Stay tuned!" | [Subscribe to newsletter] |
| No search results | Search results | "No results found for '{query}'. Try different keywords." | [Browse Learn] [Browse Blog] |
| No FAQ entries | FAQ page | "FAQ is being prepared. Contact us with your questions!" | [Contact Us] |
| No team members | About page team | *(section hidden entirely when empty)* | — |
| No contact submissions | Admin inbox | "No messages yet. Submissions will appear here." | — |
| No volunteers | Admin volunteer list | "No volunteer applications yet." | — |
| No newsletter subscribers | Admin newsletter | "No subscribers yet." | — |
| No media | Admin media library | "Your media library is empty. Upload your first file." | [Upload File] |
| No audit logs | Admin audit logs | "No activity recorded yet." | — |
| Admin dashboard (fresh) | Dashboard | All stats show "0" with subtle animation | Quick action buttons visible |

---

# 22. Notification Flows

## 22.1 Email Notifications

| Trigger | Recipient | Email Content | Timing |
|---|---|---|---|
| Contact form submitted | Admin email | Name, email, subject, message, timestamp | Immediate |
| Volunteer registered | Admin email | Name, email, age, city, interests | Immediate |
| Contact form submitted | Submitter (P1) | "Thank you for reaching out. We'll respond within 48 hours." | Immediate |
| Volunteer registered | Volunteer (P1) | "Welcome aboard! We'll contact you shortly." | Immediate |
| Password reset requested | User | Reset link (valid 1 hour) | Immediate |
| Newsletter subscribed | Subscriber (P2) | "You're subscribed! Here's what to expect." | Immediate |

## 22.2 In-App Notifications

| Trigger | Recipient | Display | Duration |
|---|---|---|---|
| Draft saved | Current admin user | Toast (success, green) | 3 seconds |
| Content published | Current admin user | Toast (success, green) | 3 seconds |
| Content deleted | Current admin user | Toast (neutral) | 3 seconds |
| Form submission export | Current admin user | Toast + download trigger | Until dismissed |
| Validation errors | Current user | Inline field errors | Until corrected |
| Session expired | Current admin user | Toast (warning) + redirect | 5 seconds |
| Rate limit hit | Current user | Toast (warning) | 5 seconds |
| Network error | Current user | Toast (error, red) | Until dismissed |

---

# 23. Mobile Responsive Flow

## 23.1 Breakpoint Behavior

| Breakpoint | Navigation | Layout | Forms | Tables |
|---|---|---|---|---|
| Desktop (≥ 1200px) | Full horizontal nav | Multi-column grids | Side-by-side fields | Full table |
| Laptop (992–1199px) | Full nav, slightly compressed | 3-col → 2-col grids | Side-by-side | Full table |
| Tablet (768–991px) | Hamburger menu | 2-col grids | Stacked fields | Scrollable table |
| Mobile (< 768px) | Hamburger menu | Single column | Stacked fields | Card layout (no table) |

## 23.2 Mobile-Specific Interactions

| Element | Mobile Behavior |
|---|---|
| **Navigation** | Hamburger → slide-in overlay menu |
| **Hero CTA** | Stacked vertically; both remain above fold |
| **Category grid** | 2-col grid (5 rows) instead of 3x3 |
| **Blog post grid** | Single-column card list |
| **Photo gallery** | Swipe gestures; full-screen lightbox |
| **Contact form** | Full-width fields, stacked |
| **Footer** | Single-column, stacked sections |
| **Admin sidebar** | Hidden by default; hamburger toggle |
| **Admin data tables** | Transform into card layout per row |
| **Rich text editor** | Full-width; simplified toolbar |
| **Search** | Full-screen search overlay on mobile |

## 23.3 Sticky Elements

| Element | Desktop | Mobile |
|---|---|---|
| Navigation bar | Sticky top | Sticky top (compact) |
| "Back to top" button | Appears after 500px scroll | Appears after 300px scroll |
| Admin sidebar | Sticky (full height) | Hidden (toggle) |
| Newsletter footer | Static | Static |

---

# 24. Accessibility Flow

## 24.1 Keyboard Navigation Order

```
[Skip to Content Link] (visible on focus)
│
▼
[Logo] (Tab → activates home link)
│
▼
[Nav Items] (Tab through: Home, About, Learn, Projects, Schools, Blog, Join Us)
│
▼
[Search Icon] (if visible)
│
▼
[Main Content] (#main-content)
│
├── Interactive elements within content (links, buttons, cards)
│
▼
[Footer Links]
│
▼
[Newsletter Input] → [Subscribe Button]
```

## 24.2 Focus Management Rules

| Context | Focus Behavior |
|---|---|
| **Page load** | Focus on `<main>` (screen readers announce page title) |
| **Modal/dialog opens** | Focus trapped within modal; focus on first interactive element |
| **Modal closes** | Focus returns to trigger element |
| **Form submission error** | Focus moves to first invalid field |
| **Form submission success** | Focus moves to success message |
| **Lightbox opens** | Focus on close button; trap focus within lightbox |
| **Mobile menu opens** | Focus on close button; trap focus within menu |
| **Toast notification** | `role="alert"` auto-announced; no focus steal |

## 24.3 Screen Reader Announcements

| Event | Announcement |
|---|---|
| Page navigation | `<title>` tag read automatically |
| Form error | `role="alert"`: "3 errors found. Please fix the highlighted fields." |
| Content published | `role="status"`: "Article published successfully." |
| Loading state | `aria-busy="true"` on container; `aria-live="polite"` for updates |
| Empty state | Descriptive text within `<main>` |
| Image | `alt` text (required in CMS); decorative images: `alt=""` |

## 24.4 Color & Contrast

| Combination | Contrast Ratio | WCAG Level |
|---|---|---|
| Deep Navy (#1A2332) on Off-White (#F5F5F0) | 13.5:1 | AAA ✅ |
| Cool Slate (#6B8A9E) on Off-White (#F5F5F0) | 3.8:1 | AA (large text) ✅ |
| White (#FFFFFF) on Cool Slate (#6B8A9E) | 3.4:1 | AA (large text) ✅ |
| Deep Navy (#1A2332) on Pastel Green (#B5D5B0) | 7.2:1 | AAA ✅ |
| Error Red (#E53E3E) on White (#FFFFFF) | 4.6:1 | AA ✅ |

> [!IMPORTANT]
> Cool Slate (#6B8A9E) as body text on white backgrounds does NOT meet AA for normal text (4.5:1 required). **Use only for large text (18px+), headings, or decorative elements.** Body text must use Deep Navy (#1A2332).

---

# 25. Future User Journeys

## 25.1 V2.0 — Volunteer Dashboard

```
Volunteer logs in (new public auth system)
│
▼ /volunteer/dashboard
│
├── View assigned tasks
├── Track hours contributed
├── Update profile
├── View upcoming events
└── Message coordinator
```

## 25.2 V2.0 — Member Portal (Student Accounts)

```
Student signs up → Email verification → Login
│
▼ /member/dashboard
│
├── Reading history (bookmarked articles)
├── Quiz scores (per category)
├── Certificate generation (completed modules)
├── Community forum access
└── Event registration
```

## 25.3 V2.0 — Multi-Language Support

```
Language selector in nav bar: [EN ▼] [HI]
│
├── All routes prefixed: /en/learn/... or /hi/learn/...
├── Content stored per-locale in CMS
├── SEO: hreflang tags for each locale
└── Default: English
```

## 25.4 V2.0+ — Mobile App (React Native / PWA)

```
Same API backend serves mobile clients
│
├── PWA with offline reading (Service Worker)
├── Push notifications for new articles
├── Quiz module with offline support
└── Deep links from social media
```

---

# 26. App Flow Diagrams

## 26.1 Public Site — Complete Navigation Map

```
                              ┌──────────┐
                         ┌────│ HOMEPAGE │────┐
                         │    └────┬─────┘    │
                         │         │          │
                    "Learn More"   │    "Get Involved"
                         │         │          │
                         ▼         │          ▼
                    ┌──────┐       │     ┌─────────┐
                    │ABOUT │       │     │ JOIN US │
                    └──────┘       │     │ Contact │
                                   │     │ Voluntr │
            ┌──────────────────────┼─────┴─────────┤
            │                      │               │
            ▼                      ▼               ▼
       ┌─────────┐          ┌──────────┐    ┌──────────┐
       │  LEARN  │          │ PROJECTS │    │  SCHOOLS │
       │ Cat Grid│          │  Cards   │    │ Sessions │
       └────┬────┘          └────┬─────┘    └────┬─────┘
            │                    │               │
       Click category       Click card      Click session
            │                    │               │
            ▼                    ▼               ▼
       ┌─────────┐         ┌──────────┐    ┌──────────┐
       │CATEGORY │         │ PROJECT  │    │ SESSION  │
       │ Articles│         │ DETAIL   │    │ PHOTOS   │
       └────┬────┘         └──────────┘    │ Lightbox │
            │                               └──────────┘
       Click article
            │
            ▼
       ┌──────────┐
       │ ARTICLE  │─── Share ──→ Social Media
       │ DETAIL   │
       │          │─── Related ──→ Another Article
       └──────────┘

                              ┌──────────┐
                              │   BLOG   │
                              │ Listing  │
                              └────┬─────┘
                                   │
                              Click post
                                   │
                                   ▼
                              ┌──────────┐
                              │   BLOG   │
                              │  DETAIL  │
                              └──────────┘

       ┌──────────┐    ┌──────────┐    ┌──────────┐
       │  SEARCH  │    │   FAQ    │    │ PRIVACY/ │
       │ RESULTS  │    │ Accordn  │    │  TERMS   │
       └──────────┘    └──────────┘    └──────────┘
```

## 26.2 Admin Panel — Navigation Map

```
                         ┌─────────────┐
                         │ ADMIN LOGIN │
                         └──────┬──────┘
                                │
                           Auth success
                                │
                                ▼
                         ┌─────────────┐
                    ┌────│  DASHBOARD  │────┐
                    │    └──────┬──────┘    │
                    │           │           │
            Quick Action    Sidebar     Quick Action
            "New Post"     Navigation    "View Msgs"
                    │           │           │
                    ▼           │           ▼
              ┌──────────┐     │     ┌──────────────┐
              │ BLOG     │     │     │ CONTACT      │
              │ EDITOR   │     │     │ SUBMISSIONS  │
              └──────────┘     │     └──────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │         │        │        │         │
            ▼         ▼        ▼        ▼         ▼
       ┌────────┐┌────────┐┌──────┐┌──────┐┌──────────┐
       │ARTICLES││PROJECTS││SCHOOL││ TEAM ││   FAQ    │
       │ LIST   ││  LIST  ││ LIST ││ LIST ││  LIST   │
       └───┬────┘└───┬────┘└──┬───┘└──┬───┘└──┬──────┘
           │         │        │       │       │
           ▼         ▼        ▼       ▼       ▼
       ┌────────┐┌────────┐┌──────┐┌──────┐┌──────────┐
       │ARTICLE ││PROJECT ││SESSN ││MEMBER││   FAQ    │
       │ EDITOR ││ EDITOR ││EDITOR││EDITOR││  EDITOR  │
       └────────┘└────────┘└──────┘└──────┘└──────────┘

       ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
       │ MEDIA        │  │ VOLUNTEERS   │  │ NEWSLETTER   │
       │ LIBRARY      │  │ LIST         │  │ SUBSCRIBERS  │
       └──────────────┘  └──────────────┘  └──────────────┘

       SuperAdmin Only:
       ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
       │ USER MGMT    │  │  SETTINGS    │  │ AUDIT LOGS   │
       └──────────────┘  └──────────────┘  └──────────────┘
```

---

# 27. Decision Trees

## 27.1 Authentication Gate

```
User accesses /admin/* route
│
├── Has valid access token in memory?
│   ├── YES → Check role against route requirement
│   │         ├── Role sufficient → Allow access
│   │         └── Role insufficient → 403 → Redirect to /admin/dashboard
│   │                                       + Toast "Access denied"
│   │
│   └── NO → Has refresh token cookie?
│            ├── YES → Attempt refresh (POST /auth/refresh)
│            │         ├── Success → Store new token → Allow access
│            │         └── Failure → Redirect to /admin/login
│            │
│            └── NO → Redirect to /admin/login?redirect=original_url
```

## 27.2 Content Visibility

```
Public user requests content page (/blog/slug or /learn/cat/slug)
│
├── Content exists in database?
│   ├── NO → 404 page
│   │
│   └── YES → Is status = 'published'?
│             ├── NO (draft/archived) → 404 page
│             │
│             └── YES → Is deleted_at NULL?
│                       ├── NO (soft-deleted) → 404 page
│                       └── YES → Serve content ✅
```

## 27.3 Form Submission

```
User clicks Submit on any public form
│
├── Client-side validation passes?
│   ├── NO → Show inline errors, scroll to first error, STOP
│   │
│   └── YES → Is honeypot field empty?
│             ├── NO (bot) → Show fake success message, STOP (no API call)
│             │
│             └── YES → POST to API
│                       ├── 201 → Show success message
│                       ├── 409 → Show "already exists" error
│                       ├── 429 → Show "too many requests" error
│                       └── 5xx → Show "something went wrong" + email fallback
```

## 27.4 Admin Delete Operation

```
Admin clicks delete on any entity
│
├── Is entity a Category?
│   ├── YES → Does category have articles?
│   │         ├── YES → Show error: "Cannot delete category with articles. 
│   │         │         Move or delete articles first."
│   │         └── NO → Show confirm dialog → Delete
│   │
│   └── NO → Show confirm dialog:
│            "Are you sure? This cannot be undone."
│            ├── [Cancel] → Close dialog
│            └── [Confirm] → DELETE API call
│                            ├── Success → Remove from UI, toast
│                            └── Failure → Toast "Delete failed"
```

---

# 28. Edge Cases

| # | Edge Case | Handling |
|---|---|---|
| EC-01 | **User opens article in new tab, article gets deleted by admin** | Next load returns 404; user sees 404 page |
| EC-02 | **User submits form, then clicks back and submits again** | Submit button disabled after first click; if somehow double-submitted, server returns 409 for volunteer (unique email) or creates duplicate contact (acceptable) |
| EC-03 | **Admin starts editing article, another admin publishes it simultaneously** | Last write wins; audit log tracks both changes; no real-time conflict resolution in MVP |
| EC-04 | **User refreshes page during form submission** | `beforeunload` warning shown; if refreshed, form data lost; submission may or may not have completed |
| EC-05 | **Admin deletes media file used in published article** | Dependency check: show warning "This file is used in 3 articles. Deleting will show broken images." Proceed or cancel. |
| EC-06 | **Search query is empty or single character** | Minimum 2 characters enforced; show helper text "Type at least 2 characters to search" |
| EC-07 | **User accesses Learn category with 0 articles** | Empty state: "No articles in this category yet. Check back soon!" |
| EC-08 | **Newsletter subscribe with already-subscribed email** | Silently succeed (don't leak subscription status); show same success message |
| EC-09 | **Admin tries to delete last super_admin user** | API returns 400: "Cannot delete the last Super Admin account." |
| EC-10 | **Extremely long article title (200 chars)** | Truncate in cards (40 chars + ellipsis); full title on detail page; slug auto-truncated to 220 chars |
| EC-11 | **User uploads 11th photo to school session** | Upload rejected with error: "Maximum 10 photos per session." Show count: "10/10 photos" |
| EC-12 | **Password reset link clicked after 1 hour** | "This reset link has expired. Please request a new one." + link to forgot password |
| EC-13 | **Browser tab left open for 8+ days (refresh token expired)** | Next API call fails → auto-redirect to login with "Session expired" toast |
| EC-14 | **User has JavaScript disabled** | SSG pages render fully without JS (Server Components); forms require JS — show `<noscript>` message: "JavaScript is required for forms. Email us at..." |
| EC-15 | **Admin uploads 15MB image (exceeds 10MB limit)** | Client-side check: "File too large. Maximum size is 10MB." File not uploaded. |
| EC-16 | **Concurrent ISR revalidation requests** | Next.js handles deduplication automatically; only one revalidation runs |
| EC-17 | **User visits /admin on mobile phone** | Admin panel is functional but optimized for desktop; sidebar collapses; tables become cards; editor simplified |
| EC-18 | **Category slug conflicts with existing route** | Slug generation checks against reserved words (`admin`, `api`, `search`, `join`, `privacy`, `terms`) |
| EC-19 | **Slow network — image upload takes 30+ seconds** | Show progress bar (0–100%); timeout at 60 seconds with retry option |
| EC-20 | **User copies/pastes rich text from Word into Tiptap** | Tiptap strips unsafe HTML by default; preserves basic formatting (bold, italic, lists) |

---

# 29. UX Best Practices Applied

| # | Practice | Implementation |
|---|---|---|
| BP-01 | **Progressive disclosure** | SEO fields hidden behind collapsible section in editor; advanced filters collapsed by default |
| BP-02 | **Minimal cognitive load** | One primary CTA per page section; consistent card design across all modules |
| BP-03 | **Immediate feedback** | Every action produces visible feedback: toast, inline message, state change, or redirect |
| BP-04 | **Forgiving design** | Undo option on delete (3-second toast with "Undo"); draft auto-save; unsaved changes warning |
| BP-05 | **Consistent patterns** | Every list page has the same layout: title + filter bar + table + pagination |
| BP-06 | **Mobile-first** | All layouts designed for mobile constraints first, then expanded for desktop |
| BP-07 | **Trust signals** | Professional logo, non-partisan declaration, team photos, school session evidence, clear contact info |
| BP-08 | **Loading perception** | Skeleton screens instead of spinners for content; thin progress bar for navigation |
| BP-09 | **Clear error recovery** | Every error message includes a next step: retry, go home, contact us, or try again later |
| BP-10 | **Content scannability** | Short paragraphs (3–4 lines max), bullet lists, subheadings every 200 words, visual breaks |
| BP-11 | **Social proof** | Survey response counter on project card; school session count visible; newsletter subscriber count (admin) |
| BP-12 | **Reduce form friction** | Minimum required fields; smart defaults; dropdowns over free text; progress indicators for multi-step (future) |
| BP-13 | **Accessibility-first** | Skip navigation, focus management, ARIA labels, contrast compliance — not an afterthought |
| BP-14 | **Performance perception** | Above-fold content renders in < 1s (SSG); below-fold lazy-loaded; images blur-up from placeholder |

---

# 30. Assumptions

| # | Assumption | Impact if Wrong |
|---|---|---|
| AF-01 | Public users never need authentication (no member accounts in MVP) | If member accounts needed, add entire auth flow for public users |
| AF-02 | The "Join Us" page combines contact AND volunteer into one page | If separate pages needed, split into `/contact` and `/volunteer` routes |
| AF-03 | School partnership form links to external Google Form (not native) | If native form needed, add a new form entity + submission management |
| AF-04 | Blog and Learn articles share the category taxonomy but are separate content types | If unified, collapse blog_posts and articles into one table |
| AF-05 | Admin panel is primarily used on desktop screens | If heavy mobile admin usage, invest in responsive admin optimization |
| AF-06 | No real-time features needed (no live notifications, no collaborative editing) | If needed, add WebSocket infrastructure |
| AF-07 | Photo lightbox is sufficient for school session galleries (no video) | If video needed, add video player component + video upload support |
| AF-08 | The newsletter widget in the footer is the primary subscription touchpoint | If popup/modal subscription needed, add timed popup flow |
| AF-09 | A single newsletter list is sufficient (no segmentation) | If segmented lists needed, add list management to newsletter module |
| AF-10 | RSS feed is auto-generated and not customizable by admin | If customizable, add RSS settings to admin |
| AF-11 | Max 10 photos per school session is sufficient | If more needed, increase limit and add pagination within gallery |
| AF-12 | The search function covers articles, blog posts, projects, school sessions, and FAQ | If additional types needed (team, settings), extend search index |
| AF-13 | There is no approval workflow beyond Draft → Publish (no "pending review" state) | If multi-stage review needed, add approval queue and reviewer role |
| AF-14 | Admin forms do not auto-save in MVP (user must click Save Draft) | If auto-save expected, implement debounced auto-save to API |
| AF-15 | The "Back to top" button is the only scroll-triggered UI element | If reading progress bar or sticky CTA needed, add scroll observers |

---

*End of App Flow Document*

*This document should be reviewed alongside the PRD and TRD before wireframe generation or development begins. All assumptions should be validated with the product owner.*
