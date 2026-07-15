import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { parseSafeReturnPath } from "@/lib/auth/validation";

export async function getAuthSession() {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * Call this from the future checkout page before reading checkout data.
 * The destination is restricted to a local path to prevent open redirects.
 */
export async function requireAuthenticatedUser(returnTo = "/checkout") {
  const safeReturnTo = parseSafeReturnPath(returnTo, "/checkout");
  const authSession = await getAuthSession();

  if (!authSession) {
    redirect(`/sign-in?callbackURL=${encodeURIComponent(safeReturnTo)}`);
  }

  return authSession;
}
