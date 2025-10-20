"use client";
import { authClient } from ".";

export function SignOutButton({
  redirectTo = "/sign-in",
}: {
  redirectTo?: string;
}) {
  async function handle() {
    const { error } = await authClient.signOut();
    if (error) alert(error.message);
    else window.location.assign(redirectTo);
  }
  return <button onClick={handle}>Sign out</button>;
}
