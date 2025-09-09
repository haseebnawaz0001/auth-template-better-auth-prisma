/* 
// Server-side client for SERVICE MODE (separate backend).
// Keep this file in your repo so switching later is trivial.

import { createAuthClient } from "better-auth/client";

// Where your auth service is hosted (public URL):
const baseURL =
  process.env.NEXT_PUBLIC_AUTH_BASE_URL ||
  process.env.BETTER_AUTH_URL || // server-side env
  "https://auth.example.com/api/auth";

// A server-safe client. We will forward the user's cookies below.
export const serverAuthClient = createAuthClient({
  baseURL,
  fetchOptions: { credentials: "include" },
});

// Call this from RSC/API by passing Next.js headers():
//   const session = await getRemoteSession(headers);
export async function getRemoteSession(headersFn: () => Promise<Headers>) {
  const hdrs = await headersFn();
  const res = await serverAuthClient.getSession({
    fetchOptions: { headers: hdrs },
  });
  return res.data; // null or Session
}
*/
export {}; // keep as a module for now
