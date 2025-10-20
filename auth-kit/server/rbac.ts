// Tiny role helpers for server/API usage.
import type { AppRole } from "./config";

export function hasRole(session: any, role: AppRole) {
  const current = session?.user?.role as AppRole | undefined;
  return (
    !!current && (current === role || (role === "USER" && current === "ADMIN"))
  );
}

export function assertRole(session: any, role: AppRole) {
  if (!hasRole(session, role)) {
    const e = new Error("forbidden");
    (e as any).status = 403;
    throw e;
  }
}
