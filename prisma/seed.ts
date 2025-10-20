import { PrismaClient } from "@prisma/client";
// Reuse your centralized config (same instance the app uses)
import { auth, prisma as sharedPrisma } from "@/auth-kit/server/config";

const prisma =
  sharedPrisma instanceof PrismaClient ? sharedPrisma : new PrismaClient();

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@admin.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "12345678";
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? "Admin";

async function ensureAdmin() {
  // 1) Try to create the user through Better Auth's server API
  //    This ensures the password is hashed & the "credential" account is created correctly.
  //    Docs show: auth.api.signUpEmail({ body: { name, email, password, ... } })
  //    https: // www.better-auth.com/docs/authentication/email-password
  try {
    await auth.api.signUpEmail({
      body: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
    });
    console.log(`✅ Created user ${ADMIN_EMAIL}`);
  } catch (e: any) {
    // If the user already exists, Better Auth will throw (email conflict).
    // That's fine; we’ll just continue and ensure the role is ADMIN.
    const msg = String(e?.message ?? e);
    if (/already exists|conflict|409/i.test(msg)) {
      console.log(
        `ℹ️  User ${ADMIN_EMAIL} already exists, will just ensure ADMIN role.`
      );
    } else {
      console.warn(`⚠️  signUpEmail error (continuing to set role): ${msg}`);
    }
  }

  // 2) Promote to ADMIN (role lives on the User table via additionalFields)
  const user = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!user) {
    throw new Error(
      `User not found after sign-up attempt. Check DATABASE_URL and migrations; ` +
        `make sure the app and seed point to the same DB.`
    );
  }

  if ((user as any).role !== "ADMIN") {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" } as any,
    });
    console.log(`✅ Promoted ${ADMIN_EMAIL} to ADMIN`);
  } else {
    console.log(`✅ ${ADMIN_EMAIL} is already ADMIN`);
  }
}

ensureAdmin()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
