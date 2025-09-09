Auth Template — Next.js 15 + Better Auth + Prisma

Overview

- Full-stack auth starter using Next.js App Router (15), React 19, Prisma, and better-auth for email/password authentication with roles.
- Provides protected routes for USER and ADMIN, server-side authorization, and a minimal UI built with Tailwind and Shadcn UI.

Features

- Email/password auth via better-auth with cookie-based sessions.
- Role-based access: USER and ADMIN with server-side checks.
- Protected pages: `/dashboard` (USER+), `/admin` (ADMIN only).
- API routes: `api/auth/[...all]` (auth handler), `api/admin/assign-role` (change user role).
- Server-first UI: Navbar as a server component; interactive bits are client islands.

Tech Stack

- Next.js 15 (App Router), React 19
- better-auth 1.3.x
- Prisma 6 with SQLite (dev) — switch to Postgres/MySQL for prod
- Tailwind CSS 4, Shadcn UI, lucide-react

Project Structure

- `app/`: App Router pages and API route handlers
- `auth-kit/`: Auth config, server helpers, RBAC utilities
- `components/`: UI components (client and server), navbar, forms
- `prisma/`: Prisma schema, migrations, seed script
- `hooks/`, `lib/`: utilities and hooks

Environment

- Create `.env` in project root:
  - `BETTER_AUTH_SECRET=<random-32+ chars>`
  - `BETTER_AUTH_URL=http://localhost:3000`
  - `DATABASE_URL="file:./dev.db"` (dev) or your Postgres/MySQL URL in prod

Getting Started

- Install deps: `npm install`
- Generate DB and client:
  - Dev DB: `npx prisma migrate dev --name init` (or `npx prisma db push`)
  - Seed: `npm run seed`
- Run dev: `npm run dev`
- Build: `npm run build`
- Start: `npm run start`

Authentication

- Central config: `auth-kit/config.ts`
  - Extends user with `role` (default USER) and `active`.
  - Sessions use cookie-based storage; a short-lived cookie cache is enabled by default.
- Route handler: `app/api/auth/[...all]/route.ts` via `better-auth/next-js`.
- Client: `auth-kit/client.ts` exposes `authClient` for sign-in/sign-out.
- Server: `auth-kit/server.ts` exposes `getSessionServer(headers)` to read session in Server Components and route handlers.

Authorization

- RBAC helpers: `auth-kit/rbac.ts` and `auth-kit/require-role.tsx`.
- Server-side checks on pages:
  - `app/(protected)/dashboard/page.tsx` — requires USER or ADMIN.
  - `app/(protected)/admin/page.tsx` — requires ADMIN.
- No root Middleware is used; authorization is enforced in server components/route handlers to avoid cache staleness.

Key Routes

- Pages
  - `/` Home (marketing)
  - `/sign-in`, `/sign-up` Auth pages (client forms, on-demand toasts)
  - `/dashboard` Protected (USER+)
  - `/admin` Protected (ADMIN)
- APIs
  - `GET/POST /api/auth/[...all]` Auth endpoints handled by better-auth
  - `POST /api/admin/assign-role` Change a user’s role (ADMIN only)

Role Management

- Example request to promote a user:

```bash
curl -X POST http://localhost:3000/api/admin/assign-role \
  -H "Content-Type: application/json" \
  -d '{"userId":"<uuid>", "role":"ADMIN"}'
```

Database

- Prisma schema: `prisma/schema.prisma` with `User`, `Session`, `Account`, `Verification`.
- Dev uses SQLite; for production, use Postgres/MySQL and pooling (Prisma Accelerate/Data Proxy or managed DB with pool).

Performance Notes

- Server-first rendering for static sections; client islands only where needed.
- Toaster loaded lazily via `components/ui/toaster-provider`.
- No global Middleware; server-side checks keep latency lower and avoid stale decisions.
- See `improve.md` for a prioritized optimization plan (PPR, image optimization, bundle analysis, etc.).

Deployment

- Ensure environment variables are set in your platform.
- For separate auth domain or subdomain usage, see the commented presets in `auth-kit/config.ts` (cross-site cookie attributes, cross-subdomain cookies).
- Configure a production database and update `DATABASE_URL`.
- If using external images, configure `images.remotePatterns` in `next.config.ts` for `next/image`.

Scripts

- `npm run dev` Start dev server
- `npm run build` Production build
- `npm run start` Start production server
- `npm run seed` Seed the database (`prisma/seed.ts`)

Documentation

- Full project docs and usage examples: [docs.md](docs.md)
