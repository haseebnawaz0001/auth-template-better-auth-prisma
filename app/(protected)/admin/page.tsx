import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionServer } from "@/auth-kit/server";
import { hasRole } from "@/auth-kit/server/rbac";
import AdminTemplate from "@/app/(protected)/admin/AdminTemplate";

export default async function AdminPage() {
  const session = await getSessionServer(headers);
  if (!session) {
    redirect("/sign-in");
    return null;
  }
  if (!hasRole(session, "ADMIN")) {
    redirect("/");
    return null;
  }

  const role = (session.user as any)?.role ?? null;
  return <AdminTemplate role={role} text="Admin" />;
}
