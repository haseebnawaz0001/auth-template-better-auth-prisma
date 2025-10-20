import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionServer } from ".";
import type { AppRole } from "./config";
import { hasRole } from "./rbac";

export default async function RequireRole({
  role,
  fallback = "/sign-in",
  children,
}: {
  role: AppRole;
  fallback?: string;
  children: React.ReactNode;
}) {
  const session = await getSessionServer(headers);
  if (!session) return redirect(fallback);
  if (!hasRole(session, role)) return redirect("/");
  return <>{children}</>;
}
