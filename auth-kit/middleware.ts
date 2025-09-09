// Optional fast-redirect middleware helper.
// NOTE: Always re-check auth/roles in server code (RSC/API) for real security.
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSessionCookie, getCookieCache } from "better-auth/cookies";

export async function authMiddleware(req: NextRequest) {
  const cookie = getSessionCookie(req);
  if (!cookie) {
    const next = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(new URL(`/sign-in?next=${next}`, req.url));
  }
  // Do not enforce roles here to avoid stale cookie-cache decisions.
  // Role authorization is enforced in server components/route handlers.
  return NextResponse.next();
}
