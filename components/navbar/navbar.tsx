"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { NavMenu } from "./navmenu";
import { NavSheet } from "./navsheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/auth-kit/client";

type UserLike = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: "ADMIN" | "USER" | string | null;
};

const Navbar = () => {
  const [user, setUser] = useState<UserLike | null>(null);

  useEffect(() => {
    let mounted = true;
    authClient.getSession().then((res) => {
      if (!mounted) return;
      setUser((res.data?.user as UserLike) ?? null);
    });
    return () => {
      mounted = false;
    };
  }, []);

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
};

function UserDropdown({ user }: { user: UserLike }) {
  const initials = useMemo(() => {
    const base = (user.name ?? user.email ?? "?").trim();
    if (!base) return "?";
    const parts = base.split(" ");
    const first = parts[0]?.[0];
    const second = parts[1]?.[0];
    return (first ?? "?").toUpperCase() + (second ? second.toUpperCase() : "");
  }, [user.name, user.email]);

  async function signOut() {
    await authClient.signOut();
    // Hard reload to ensure menu/session reflect immediately
    window.location.href = "/";
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="User menu"
          className="outline-none rounded-full focus-visible:ring-2 focus-visible:ring-ring shrink-0"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={user.image ?? undefined}
              alt={user.name ?? user.email ?? "User"}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-56">
        <div className="px-2 py-1.5 text-sm">
          <div className="font-medium leading-5">
            {user.name ?? "Signed in"}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {user.email}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        {user.role === "ADMIN" && (
          <DropdownMenuItem asChild>
            <Link href="/admin">Admin</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="text-red-600">
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Navbar;
