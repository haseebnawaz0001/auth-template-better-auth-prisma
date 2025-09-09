Performance Improvement Report (improve.md)

Scope

- App stack: Next.js 15, React 19, Tailwind CSS 4, Prisma 6, better-auth 1.3.x, Radix UI, lucide-react.
- Goal: Reduce TTFB, improve LCP/INP, lower JS payload, and avoid unnecessary work on the server/edge while keeping auth correct.

Top Priorities (Impact → Effort)

1. Server-first rendering for marketing pages (Home)
   - Why: `app/page.tsx` pulls multiple client components (`Navbar`, `Hero`, `Features`, `Testimonial`, `Footer`). This makes the whole tree client-heavy and dynamic, inflating JS and hurting LCP.
   - Fix:
     - Convert static blocks to server components. Only mark islands that need interactivity with "use client" (e.g., menus, carousels).
     - Keep `Navbar` mostly server. Split interactive parts (e.g., navsheet/menu toggles) into small client children.
     - Mark the marketing route segment as static so it’s prerendered and CDN-cached.
       - After refactor: add in `app/page.tsx`: `export const dynamic = 'force-static'` and optionally `export const revalidate = 3600`.
     - If you keep client-only features like carousels, lazy-load them with `next/dynamic`.

2. Minimize Middleware work or remove it
   - Why: Middleware bundle is ~35 kB. Even tiny middleware adds a hop on every matched request. We already enforce auth/roles on the server pages, which is the canonical source of truth.
   - Fix options:
     - Option A (recommended): Drop Middleware entirely and rely on server checks in `app/(protected)/*`. This maximizes cache/CDN efficiency and reduces latency.
     - Option B: Keep only the minimal “not signed-in → /sign-in” redirect. Avoid any role checks and avoid importing heavy deps.
   - Measure: After change, check the bundle size reported for “ƒ Middleware” in `next build`. Aim for single-digit kilobytes or zero if removed.

3. Reduce client JS on every page
   - Why: Root layout renders `<Toaster />` (sonner) globally, forcing client JS everywhere.
   - Fix:
     - Move `<Toaster />` into a small client wrapper and mount it only on pages that use toasts or lazy-load it with `next/dynamic`.
     - Review "use client" usage across `components/*` and keep it to the smallest leaf nodes that require event handlers.

4. Adopt Partial Prerendering (PPR) for authenticated shells
   - Why: Parts of protected pages are static (layout, chromes). PPR lets you prerender static shells while streaming the dynamic auth/state subtrees.
   - Fix:
     - Ensure protected pages isolate dynamic regions behind `Suspense` and fetch session data inside the suspended subtree.
     - Keep the outer layout static or force-static where possible, and let the inner auth block be dynamic.

5. Images and icons
   - Why: Proper image optimization is critical for LCP.
   - Fix:
     - Use `next/image` for raster images. Configure `images.remotePatterns` if loading external avatars.
     - Provide `sizes` and use `priority` for the LCP hero image.
     - Import lucide icons individually (already done). Avoid wildcard imports.

6. Database connections and query performance
   - Why: Production (serverless) needs pooling to avoid connection storms; DB latency drives TTFB.
   - Fix:
     - Use a pooled DB (e.g., Postgres + Prisma Accelerate or Data Proxy) in production. Keep SQLite only for local dev.
     - Reuse the Prisma client safely (singleton) in dev. In production serverless, prefer Accelerate for connection management and caching.
     - Add indexes as needed for new queries. Current schema is minimal and fine for auth.

7. API and caching
   - Why: Align caching with semantics to avoid stale UX and reduce server work.
   - Fix:
     - For protected/mutation endpoints (e.g., `/api/admin/assign-role`), set `Cache-Control: no-store` and short-circuit early for unauthenticated.
     - For public, pure GET APIs (if added later), set proper `s-maxage` to leverage CDN.

8. Bundle analysis and React performance
   - Why: Validate changes, find unexpected regressions.
   - Fix:
     - Add `@next/bundle-analyzer` and run a report. Investigate large client chunks.
     - Consider React Compiler (when stable for your stack) to auto-memoize client components with lots of props/state.

Concrete Changes (File-by-file Suggestions)

- `app/layout.tsx`
  - Move `<Toaster />` out of the root layout. Create `components/ui/ToasterProvider.tsx` (client) and include it only where needed or load with `next/dynamic`.

- `app/page.tsx` and `components/template/*`
  - Convert `Hero`, `Features`, and `Footer` to server components (no "use client" at top) since they don’t need event handlers.
  - Keep `Testimonial` as a small client island and lazy-load it: `const Testimonials = dynamic(() => import('.../testimonials'), { ssr: false })` or load on viewport.
  - After refactor, mark home static: `export const dynamic = 'force-static'` and optionally `export const revalidate = 3600`.

- `components/navbar/*`
  - Make `navbar.tsx` a server component. Keep toggle/menu behaviors in `navmenu.tsx`/`navsheet.tsx` as client islands.
  - Ensure no server-incompatible hooks in `navbar.tsx` (no state/effects).

- `auth-kit/middleware.ts` and `/middleware.ts`
  - Prefer removing Middleware entirely (Option A) or keep only the minimal sign-in redirect (Option B, already trimmed). Avoid importing broad modules; stick to light helpers.

- `components/ui/*`
  - Ensure each component that starts with "use client" truly needs it. Many Radix UI wrappers do, but verify per file.

- `components/template/testimonials.tsx`
  - Currently client-only with a carousel. Lazy-load on intersection with the viewport to avoid affecting the initial route’s LCP.

- `next.config.ts`
  - If you adopt external images with `next/image`, configure `images.remotePatterns` for domains like `randomuser.me`.
  - Add bundle analyzer integration for CI profiling.

- `app/api/admin/assign-role/route.ts`
  - Add `headers: { 'Cache-Control': 'no-store' }` to responses. Consider returning early with 401/403 before parsing the body to save work.

Operational and Build Improvements

- Use `next build` defaults for optimal code-splitting and minification (already in use).
- CI: cache `node_modules`/pnpm store and `.next/cache` to speed builds.
- Preload critical fonts via `next/font` (already used). Avoid custom font CSS.

Guardrails and Testing

- Measure with Web Vitals (LCP, INP, TTFB). Use Lighthouse/Pagespeed and Next.js’ telemetry.
- Turn on the bundle analyzer during optimization iterations.
- Add trace markers (e.g., `server-timing` headers) to profile slow paths in protected pages.

Final improvments

- [ ] Move `<Toaster />` out of `app/layout.tsx` or lazy-load it
- [ ] Make `Navbar` server and keep interactivity in client children
- [ ] Drop Middleware entirely and rely on server checks in `app/(protected)/`
- [ ] Add `Cache-Control: no-store` to mutation APIs
