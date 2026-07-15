import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AuthForm from "@/components/AuthForm";
import { getAuthSession } from "@/lib/auth/guards";
import { parseSafeReturnPath } from "@/lib/auth/validation";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to continue planning your PVtoEV home energy project.",
};

type SignInPageProps = {
  searchParams: Promise<{ callbackURL?: string | string[] }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const callbackURL = parseSafeReturnPath(
    Array.isArray(params.callbackURL) ? params.callbackURL[0] : params.callbackURL,
  );

  if (await getAuthSession()) redirect(callbackURL);

  return <AuthForm mode="sign-in" callbackURL={callbackURL} />;
}
