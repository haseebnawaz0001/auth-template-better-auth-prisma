// app/(auth)/sign-up/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SignUp from "@/components/auth/signup"; // your block with email+password
import { authClient } from "@/auth-kit/client";
import { toast } from "sonner";

export default function Page() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSubmit(values: { email: string; password: string }) {
    setPending(true);

    // 👇 add a name (derive from email or use a fallback)
    const name = values.email.split("@")[0]?.trim() || "User";

    const { error } = await authClient.signUp.email({
      name, // <-- REQUIRED
      email: values.email,
      password: values.password,
      callbackURL: "/",
    });

    setPending(false);

    if (error) {
      toast.error("Sign up failed", { description: error.message });
    } else {
      toast.success("Account created");
      router.push("/");
    }
  }

  return (
    <SignUp onSubmit={handleSubmit} pending={pending} switchHref="/sign-in" />
  );
}
