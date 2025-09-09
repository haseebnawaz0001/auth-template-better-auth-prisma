"use client";
import { useMemo } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/auth-kit/client";

export type UserLike = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: "ADMIN" | "USER" | string | null;
};

export default function UserDropdown({ user }: { user: UserLike }) {
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
          <div className="font-medium leading-5">{user.name ?? "Signed in"}</div>
          <div className="text-xs text-muted-foreground truncate">{user.email}</div>
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

