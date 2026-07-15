import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AuthForm from "@/components/AuthForm";
import { getAuthSession } from "@/lib/auth/guards";
import { parseSafeReturnPath } from "@/lib/auth/validation";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a PVtoEV account and start planning your home energy system.",
};

type SignUpPageProps = {
  searchParams: Promise<{ callbackURL?: string | string[] }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const callbackURL = parseSafeReturnPath(
    Array.isArray(params.callbackURL) ? params.callbackURL[0] : params.callbackURL,
  );

  if (await getAuthSession()) redirect(callbackURL);

  return <AuthForm mode="sign-up" callbackURL={callbackURL} />;
}
