import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth, prisma } from "@/auth-kit/server/config";
import { hasRole } from "@/auth-kit/server/rbac";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !hasRole(session, "ADMIN")) {
    return NextResponse.json(
      { error: "forbidden" },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { userId, role } = await req.json();
  if (!["ADMIN", "USER"].includes(role)) {
    return NextResponse.json(
      { error: "invalid role" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  await prisma.user.update({ where: { id: userId }, data: { role } as any });
  return NextResponse.json(
    { ok: true },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
