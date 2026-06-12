# The Nagrik — Civic Literacy Initiative

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![Architecture](https://img.shields.io/badge/architecture-locked-blue.svg)

This repository contains the complete source code for **The Nagrik**, a content-driven public website and custom admin CMS for a student-led civic literacy non-profit organization operating in India.

## 🏗 Locked Architecture

This stack is officially **locked**. Do not introduce new frameworks or languages without a formal architectural review.

- **Frontend:** Next.js 15 (App Router), TypeScript, Vanilla CSS (Design Tokens), Framer Motion, GSAP
- **Backend:** Express 5, TypeScript
- **Database:** PostgreSQL 16
- **ORM:** Drizzle ORM
- **Authentication:** Custom JWT + bcrypt
- **Storage:** Cloudflare R2 + Sharp (image processing)
- **Email:** Resend
- **Security:** Cloudflare Turnstile
- **Hosting:** Vercel (Frontend), Railway (Backend & DB)

## 📁 Folder Structure

```
thenagrik-website/
├── client/                 # Next.js frontend application
│   ├── src/app/            # App Router pages (public + admin)
│   ├── src/components/     # UI components and layout
│   └── src/styles/         # CSS design tokens and typography
├── server/                 # Express backend application
│   ├── src/db/             # Drizzle schema, migrations, seed scripts
│   ├── src/modules/        # API routes, controllers, and services
│   └── src/middleware/     # Auth, RBAC, and validation middleware
├── shared/                 # Shared TypeScript types between client/server
└── README.md               # You are here
```

## 🚀 How to Run Locally

### Prerequisites
- Node.js 20+
- PostgreSQL 16 (Running locally or via Docker)

### 1. Install Dependencies
From the root directory, install all workspace dependencies:
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` in the root directory and update the `DATABASE_URL` and other required keys.

### 3. Database Setup
```bash
# Push schema to database
npm run db:push --workspace=server

# Seed initial admin user and settings
npm run db:seed --workspace=server
```

### 4. Start Development Servers
Start both the Next.js frontend and Express backend concurrently:
```bash
npm run dev
```
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000

## 🔧 Environment Variables
The application requires the following core environment variables. Check `.env.example` for the complete list.

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secure 256-bit secret for token signing
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`: Cloudflare R2 credentials
- `RESEND_API_KEY`: For transactional emails

## 📝 Coding Standards

- **Vertical Slicing:** Build features top-to-bottom (DB → API → UI) rather than layer-by-layer.
- **Type Safety:** Ensure end-to-end type safety using Zod validation and shared Drizzle types.
- **CSS:** Use Vanilla CSS with explicit design tokens. Avoid Tailwind CSS.
- **API Versioning:** All endpoints must be prefixed with `/api/v1/`.

## 🌿 Branch Strategy

- `main` - Production-ready code. Auto-deploys to Vercel/Railway production environments.
- `develop` - Integration branch. Auto-deploys to staging environments.
- `feature/*` - Feature branches. PRs must merge into `develop`.
- `fix/*` - Bug fix branches.

## 🚀 Deployment

Deployment is fully automated via GitHub Actions and hosting platform integrations:
1. Pushing to `develop` triggers staging deployments.
2. Merging a PR into `main` triggers production deployments on Vercel (Frontend) and Railway (Backend).
