# GitHub Issues Breakdown
## **THE NAGRIK** — Civic Literacy Initiative

This document maps the 8 sprints into concrete Epics and Tasks, ready to be imported into GitHub Issues or a project management tool.

---

## Epic 1: Foundation (Sprint 1)
**Description:** Initialize repository, set up database schema, implement core authentication, and build base layouts.

**Tasks:**
- [ ] Initialize Monorepo with Next.js + Express
- [ ] Implement Drizzle Schema (All 18 Tables)
- [ ] Create Database Triggers + Seed Script
- [ ] Implement Authentication APIs (Login, Refresh, Logout)
- [ ] Implement RBAC Middleware
- [ ] Implement Design Token System
- [ ] Create Base Public Layout
- [ ] Create Base Admin Layout

---

## Epic 2: Core Content - Learn Section (Sprint 2)
**Description:** Build the educational content section end-to-end (categories, articles, public pages, admin CRUD).

**Tasks:**
- [ ] Build Categories + Articles CRUD APIs
- [ ] Build Learn Hub + Category Pages (Public)
- [ ] Build Article Page (Public)
- [ ] Integrate Tiptap Rich Text Editor
- [ ] Build Admin Articles Manager (List + Editor)
- [ ] Build Admin Categories Manager

---

## Epic 3: Core Content - Remaining Sections (Sprint 3)
**Description:** Complete all remaining public content sections including Blog, Projects, Schools, and About.

**Tasks:**
- [ ] Build Blog CRUD APIs (Tags, RSS)
- [ ] Build Projects + Schools CRUD APIs
- [ ] Build Blog Pages (Public)
- [ ] Build Projects + Schools Pages (Public)
- [ ] Build Homepage (Editorial Scroll Narrative)
- [ ] Build About Page

---

## Epic 4: Forms & Admin Managers (Sprint 4)
**Description:** Complete public forms, media upload integration, and admin CRUD interfaces for the remaining content types.

**Tasks:**
- [ ] Build Contact + Volunteer Form APIs (with Turnstile)
- [ ] Build Media Upload API + R2 Integration
- [ ] Build Contact + Join Pages (Public)
- [ ] Build Admin Blog + Projects Managers
- [ ] Build Admin Schools + FAQ Managers
- [ ] Build Admin Media Library

---

## Epic 5: System Features & Dashboard (Sprint 5)
**Description:** Complete the admin panel with a dashboard, forms inbox, and settings management.

**Tasks:**
- [ ] Build Dashboard Stats & Activity APIs
- [ ] Build Admin Dashboard UI
- [ ] Build Admin Contact + Volunteer Inbox UI
- [ ] Build Admin Newsletter Manager UI
- [ ] Build Admin Settings Manager UI
- [ ] Build Admin User Manager UI (SuperAdmin)

---

## Epic 6: SEO, Search & Polish (Sprint 6)
**Description:** Add unified search, comprehensive SEO, and editorial motion/animations.

**Tasks:**
- [ ] Build Unified Search API
- [ ] Build Search Results Page
- [ ] Implement SEO Metadata & JSON-LD
- [ ] Generate Dynamic Sitemap & RSS Feed
- [ ] Implement Editorial Motion System (TextReveal, PageTransitions)
- [ ] Implement Homepage GSAP Scroll Narrative
- [ ] Add 404, Privacy, and Terms Pages

---

## Epic 7: Testing & QA (Sprint 7)
**Description:** Ensure quality, accessibility, and performance before launch.

**Tasks:**
- [ ] Write API Integration Tests
- [ ] Write Critical Flow E2E Tests (Playwright)
- [ ] Perform WCAG 2.2 AA Accessibility Audit
- [ ] Optimize Core Web Vitals (Lighthouse)
- [ ] Execute Security Review (OWASP Top 10)
- [ ] Final Content Loading & Review

---

## Epic 8: Deployment & Launch (Sprint 8)
**Description:** Deploy to production infrastructure and launch the website.

**Tasks:**
- [ ] Provision Production Database
- [ ] Deploy Express Backend
- [ ] Deploy Next.js Frontend
- [ ] Configure Custom Domain & SSL
- [ ] Setup Production CDN & Media Bucket
- [ ] Enable Analytics & Monitoring
- [ ] Launch Final Smoke Test
