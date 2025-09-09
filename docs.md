Auth Kit Starter — Project Documentation

Overview

- Purpose: A minimal, server-first Next.js 15 starter with built-in authentication (email + password), role-based access control (USER/ADMIN), Prisma for persistence, and a small UI layer you can keep or replace.
- Design goals: Keep the folder structure simple, favor server-side authorization, and let you start building immediately without restructuring. Optional knobs exist to later switch to a separate auth backend.

Quick Start

- Prerequisites: Node 18+, SQLite (bundled) for dev; Postgres/MySQL recommended for prod.
- Setup
  - Copy `.env` and set these values:
    - `BETTER_AUTH_SECRET=<random-32+ chars>`
    - `BETTER_AUTH_URL="http://localhost:3000"`
    - `DATABASE_URL="file:./dev.db"` (default dev DB)
  - Install and prepare DB:
    - `npm install`
    - `npx prisma db push` (or `npx prisma migrate dev`)
    - Optional: `npm run seed`
  - Run locally: `npm run dev` and open `http://localhost:3000`
- Production
  - `npm run build` then `npm run start`
  - Use a real DB and update `DATABASE_URL`. Consider pooling/Prisma Accelerate.

Project Structure (What Each File Does)

- `app/layout.tsx`: Root HTML and fonts; global CSS. No global client providers to keep JS lean.
- `app/page.tsx`: Marketing home. Composes `Navbar`, `Hero`, `Features`, `Testimonial`, `Footer`.
- `app/(auth)/sign-in/page.tsx`: Server page that parses `?next=...` then renders the client form component.
- `app/(auth)/sign-in/client.tsx`: Client page logic. Calls `authClient.signIn.email(...)`, shows toasts via a lazy `ToasterProvider`.
- `app/(auth)/sign-up/page.tsx`: Client page. Calls `authClient.signUp.email(...)`, displays toasts.
- `app/(protected)/dashboard/page.tsx`: Server component. Reads session and redirects if not USER/ADMIN.
- `app/(protected)/dashboard/DashboardTemplate.tsx`: Client view for the dashboard shell (pure UI props).
- `app/(protected)/admin/page.tsx`: Server component. Requires ADMIN; redirects otherwise.
- `app/(protected)/admin/AdminTemplate.tsx`: Client view for admin.
- `app/api/auth/[...all]/route.ts`: Auth handler bridge: wraps `better-auth` for Next.js routing.
- `app/api/admin/assign-role/route.ts`: POST endpoint to change a user’s role. Re-validates server-side and returns `Cache-Control: no-store`.

- `auth-kit/config.ts`: Single source of truth for `better-auth` + Prisma. Adds user fields `role` and `active`. Cookie sessions with a small cache by default.
- `auth-kit/server.ts`: Server helpers and `handler` used by the auth route. Exposes `getSessionServer(headers)` for reading the session securely in RSC/API.
- `auth-kit/client.ts`: Minimal `authClient` for client-side sign-in/sign-out. Same-origin in this starter.
- `auth-kit/rbac.ts`: `hasRole` and `assertRole` helpers.
- `auth-kit/require-role.tsx`: A small server component wrapper to enforce a role on a subtree (redirects if missing).
- `auth-kit/remote.ts`: Commented “service-mode” server client to call a remote auth backend; keep as-is until needed.
- `auth-kit/sign-out.tsx`: Simple client sign-out button using `authClient.signOut()`.

- `components/navbar/navbar.tsx`: Server component Navbar that reads session on the server and renders links accordingly.
- `components/navbar/user-dropdown.tsx`: Client dropdown with sign-out.
- `components/auth/signin.tsx`, `components/auth/signup.tsx`: Client forms using React Hook Form + Zod.
- `components/ui/toaster-provider.tsx`: Client-only Toaster wrapper (on-demand toasts).
- `components/template/*`: Optional marketing blocks (Hero, Features, Testimonials, Footer). `testimonials.tsx` is client due to carousel.

- `prisma/schema.prisma`: Prisma models for User/Session/Account/Verification.
- `prisma/seed.ts`: Example seed script. Extend to add admin users, test accounts, etc.

- `hooks/use-mobile.ts`: Utility hook to detect mobile viewport.
- `lib/utils.ts`: Tailwind `cn` helper.
- `next.config.ts`: Next.js config (currently minimal).
- `tsconfig.json`: TypeScript config with `@/*` alias to project root.

Authentication and Authorization

- Config: Edit `auth-kit/config.ts`
  - Database adapter: SQLite in dev. For prod, change `provider` and `DATABASE_URL` to Postgres/MySQL.
  - Sessions: Cookie-based with optional cookie cache. Adjust TTLs and `cookieCache` as needed.
  - Email/password: `sendResetPassword` and `sendVerificationEmail` log tokens in dev; wire your email service in prod.
- Client usage
  - Sign in (client):
    ```ts
    const { error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
      rememberMe: true,
    });
    ```
  - Sign up (client):
    ```ts
    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "/",
    });
    ```
  - Sign out (client):
    ```ts
    const { error } = await authClient.signOut();
    ```
- Server usage
  - Read session in a server component or route handler:
    ```ts
    import { headers } from "next/headers";
    import { getSessionServer } from "@/auth-kit/server";
    const session = await getSessionServer(headers); // null or session
    ```
  - Enforce roles with helpers:
    ```ts
    import { hasRole, assertRole } from "@/auth-kit/rbac";
    if (!hasRole(session, "ADMIN")) {
      /* redirect or throw */
    }
    ```
  - Component-level guard (server component):
    ```tsx
    import RequireRole from "@/auth-kit/require-role";
    export default async function Page() {
      return (
        <RequireRole role="ADMIN">
          <AdminSection />
        </RequireRole>
      );
    }
    ```

Protecting New Pages (Examples)

- Example: Create a new user-only page at `app/(protected)/account/page.tsx`:
  ```tsx
  import { headers } from "next/headers";
  import { redirect } from "next/navigation";
  import { getSessionServer } from "@/auth-kit/server";
  import { hasRole } from "@/auth-kit/rbac";
  export default async function AccountPage() {
    const session = await getSessionServer(headers);
    if (!session) redirect("/sign-in");
    if (!hasRole(session, "USER")) redirect("/");
    return <div>My Account</div>;
  }
  ```

Role Management (API Example)

- Promote a user to ADMIN via the built-in API:
  ```bash
  curl -X POST http://localhost:3000/api/admin/assign-role \
    -H "Content-Type: application/json" \
    -b "<your-session-cookie>" \
    -d '{"userId":"<user-id>", "role":"ADMIN"}'
  ```

UI Notes

- Navbar runs on the server and is fast by default. The dropdown and mobile menu are client islands.
- Toasts are loaded on-demand by pages that trigger notifications (sign-in/up). You can import `ToasterProvider` in any page that needs it.
- Marketing components are optional. You can keep them, hide them behind a flag, or replace them.

Production and Deployment

- Database: Use Postgres/MySQL with pooling. For serverless, consider Prisma Accelerate or a managed database with connection pooling.
- Email: Replace the dev console loggers with your email provider in `auth-kit/config.ts`.
- Caching: Protected pages are dynamic (they call `headers()`), so they’re server-rendered per request. Public pages can be made static and cached.
- Middleware: Not used by default. Authorization lives in server components and route handlers to avoid stale cookie decisions and reduce latency.

Optional: Service Mode (Separate Auth Backend)

- When you need a shared auth service, you can keep this structure and flip a few envs/lines (no file moves):
  - Disable the local auth route at `app/api/auth/[...all]/route.ts` (comment out `export const { GET, POST } = ...` or guard by env).
  - In `auth-kit/client.ts`, set `baseURL` from `NEXT_PUBLIC_AUTH_BASE_URL` so the client points to your auth service.
  - In `auth-kit/remote.ts`, uncomment the exported client and `getRemoteSession(headers)`; use it in server code instead of `getSessionServer(headers)`.
  - For cross-site cookies, set cookie attributes in the auth service config and add CSRF protections (Origin/Referer checks and/or double-submit token).

Common Customizations

- Add `.env.example` listing required variables and service-mode settings.
- Add `auth-kit/types.ts` for `AppUser`, `AppSession` and use those types across the app.
- Add Playwright tests for sign-in, sign-up, protected routes, and admin role changes.
- Move to Postgres/MySQL before production; update Prisma provider and run migrations.

Troubleshooting

- Admin role change not reflected immediately:
  - Sessions use a short-lived cookie cache (see `auth-kit/config.ts` → `session.cookieCache`). After changing a user’s role, you may see the old role briefly. Options:
    - Wait for the cache TTL, or sign out/in to refresh.
    - Reduce or disable `cookieCache` if you require immediate role reflection.
- Server-only helpers:
  - `getSessionServer(headers)` and `RequireRole` are server-only. Use them in Server Components or Route Handlers, not in client components.
- Static home vs dynamic navbar:
  - The navbar reads the session on the server, making pages that include it dynamic. To make home fully static, split navbar into a public shell and an auth island or move session reads to a client island.
