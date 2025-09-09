// Server-side helpers (RSC, Route Handlers, Server Actions).
import { auth } from "./config";

export const handler = auth.handler;

// Use in RSC/route handlers to read session securely.
export async function getSessionServer(headersFn: () => Promise<Headers>) {
  const headers = await headersFn();
  return auth.api.getSession({ headers });
}

export { auth };
