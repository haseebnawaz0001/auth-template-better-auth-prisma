// Central Better Auth config (single source of truth).
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
// If you use Server Actions that set cookies later, enable the plugin below:
// import { nextCookies } from "better-auth/next-js";

export const prisma = new PrismaClient();

export type AppRole = "ADMIN" | "USER";

export const auth = betterAuth({
  // Embedded mode: omit baseURL (Next.js infers the origin).
  // Service mode (later): set BETTER_AUTH_URL in the server env OR pass baseURL explicitly.
  // baseURL: process.env.BETTER_AUTH_URL,

  database: prismaAdapter(prisma, {
    // Dev: SQLite. Prod: change to "postgresql" | "mysql" and update DATABASE_URL.
    provider: "sqlite",
  }),

  // Extend user with role/active flags (exposed on session.user)
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "USER", input: false },
      active: { type: "boolean", defaultValue: true, input: false },
    },
  },

  // Cookie-based sessions with a short-lived, signed cookie cache (DB offload).
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh daily
    cookieCache: { enabled: true, maxAge: 60 * 5 }, // 5 min cache
  },

  // Credentials (email + password)
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,

    // Correct signature + placement for password reset email
    async sendResetPassword({ user, url, token }, _req) {
      console.log("[DEV] Reset", user.email, url, token);
      // e.g. sendMail({ to: user.email, subject: "Reset your password", html: `<a href="${url}">Reset</a>` })
    },

    async onPasswordReset({ user }, _req) {
      console.log("[DEV] Password reset for", user.email);
    },

    // Optional: block sign-in until verified
    // requireEmailVerification: true,
  },

  // Email verification (dev logs for now — wire your provider later)
  emailVerification: {
    sendOnSignUp: true,
    // sendOnSignIn: true, // optionally email unverified users on sign-in
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60, // 1 hour

    // Correct signature includes token
    async sendVerificationEmail({ user, url, token }, _req) {
      console.log("[DEV] Verify", user.email, url, token);
      // e.g. sendMail({ to: user.email, subject: "Verify your email", html: `<a href="${url}">Verify</a>` })
    },
  },

  // Basic protection against brute-force
  rateLimit: { enabled: true },

  // Enable ONLY when you start setting cookies inside Next.js Server Actions:
  // plugins: [nextCookies()],

  /* ──────────────────────────────────────────────────────────────────────────
   Service mode presets (commented for now)

   1) Different ROOT domains (e.g., app.com ⇄ auth.net):
      // advanced: {
      //   // Cross-site cookies require HTTPS
      //   defaultCookieAttributes: { sameSite: "none", secure: true, partitioned: true },
      // }

   2) SUBDOMAINS (e.g., app.example.com ⇄ auth.example.com):
      // advanced: {
      //   crossSubDomainCookies: { enabled: true, domain: process.env.COOKIE_DOMAIN! },
      // }
  ─────────────────────────────────────────────────────────────────────────── */
});
