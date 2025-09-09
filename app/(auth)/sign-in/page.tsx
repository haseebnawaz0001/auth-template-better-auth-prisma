// app/(auth)/sign-in/page.tsx
import SignInPageClient from "./client";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const nextParam = params?.next;
  const next = Array.isArray(nextParam) ? nextParam[0] : nextParam;
  const callbackURL = next ?? "/dashboard";

  return <SignInPageClient initialNext={callbackURL} />;
}
