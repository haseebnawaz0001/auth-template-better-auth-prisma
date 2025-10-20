import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionServer } from "@/auth-kit/server";
import { hasRole } from "@/auth-kit/server/rbac";
import DashboardTemplate from "@/app/(protected)/dashboard/DashboardTemplate";

export default async function DashboardPage() {
  const session = await getSessionServer(headers);
  if (!session) {
    redirect("/sign-in");
    return null;
  }
  if (!hasRole(session, "USER")) {
    redirect("/");
    return null;
  }

  const role = (session.user as any)?.role ?? null;
  return <DashboardTemplate role={role} text="Dashboard" />;
}
