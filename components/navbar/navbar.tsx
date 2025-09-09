import Link from "next/link";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { NavMenu } from "./navmenu";
import { NavSheet } from "./navsheet";
import UserDropdown, { type UserLike } from "./user-dropdown";
import { getSessionServer } from "@/auth-kit/server";

export default async function Navbar() {
  const session = await getSessionServer(headers);
  const user = (session?.user as UserLike | undefined) ?? null;

  return (
    <div>
      <nav className="fixed top-6 inset-x-4 z-50 h-14 bg-background border dark:border-slate-700/70 max-w-(--breakpoint-xl) mx-auto rounded-xl">
        <div className="h-full flex items-center justify-between mx-auto px-4 min-w-0">
          <Logo />

          {/* Desktop Menu */}
          <NavMenu className="hidden md:block" />

          <div className="flex items-center gap-3 shrink-0">
            {!user ? (
              <>
                <Button
                  variant="outline"
                  className="hidden sm:inline-flex rounded-full"
                  asChild
                >
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button className="rounded-full" asChild>
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </>
            ) : (
              <UserDropdown user={user} />
            )}

            {/* Mobile Menu */}
            <div className="md:hidden">
              <NavSheet />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
