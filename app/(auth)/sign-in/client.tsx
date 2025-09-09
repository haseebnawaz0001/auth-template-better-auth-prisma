"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SignIn from "@/components/auth/signin";
import { authClient } from "@/auth-kit/client";
import { toast } from "sonner";

export default function SignInPageClient({
  initialNext,
}: {
  initialNext: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSubmit(values: { email: string; password: string }) {
    setPending(true);
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: initialNext,
      rememberMe: true,
    });
    setPending(false);

    if (error) {
      toast.error("Sign in failed", { description: error.message });
    } else {
      toast.success("Signed in!");
      router.push(initialNext);
    }
  }

  return (
    <SignIn onSubmit={handleSubmit} pending={pending} switchHref="/sign-up" />
  );
}

