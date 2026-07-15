"use server";

import { randomUUID } from "node:crypto";

import { APIError } from "better-auth/api";
import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db, requireDatabaseConfiguration } from "@/db";
import { guest } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  GUEST_SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  sessionCookieAttributes,
} from "@/lib/auth/config";
import { signInSchema, signOutSchema, signUpSchema } from "@/lib/auth/validation";

export type AuthActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export type PublicGuestSession = {
  id: string;
  createdAt: string;
  expiresAt: string;
};

export type GuestCartMergeResult = {
  merged: boolean;
};

const uuidSchema = z.uuid();

function publicGuestSession(record: {
  id: string;
  createdAt: Date;
  expiresAt: Date;
}): PublicGuestSession {
  return {
    id: record.id,
    createdAt: record.createdAt.toISOString(),
    expiresAt: record.expiresAt.toISOString(),
  };
}

function validationFailure(error: z.ZodError): AuthActionState {
  return {
    status: "error",
    message: "Check the highlighted fields and try again.",
    fieldErrors: error.flatten().fieldErrors,
  };
}

function authenticationFailure(
  error: unknown,
  mode: "sign-in" | "sign-up",
): AuthActionState {
  if (error instanceof APIError) {
    if (error.statusCode === 429) {
      return {
        status: "error",
        message: "Too many attempts. Wait a moment and try again.",
      };
    }

    if (mode === "sign-in") {
      return {
        status: "error",
        message: "The email address or password is incorrect.",
      };
    }

    const errorCode =
      error.body && "code" in error.body ? error.body.code : undefined;
    if (
      errorCode === "USER_ALREADY_EXISTS" ||
      errorCode === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
    ) {
      return {
        status: "error",
        message: "An account with this email address already exists.",
        fieldErrors: {
          email: ["Use a different email address or sign in instead."],
        },
      };
    }
  }

  console.error(`Unexpected ${mode} failure`, error);

  return {
    status: "error",
    message: "Authentication is temporarily unavailable. Please try again.",
  };
}

async function authenticatedUserId() {
  const authSession = await auth.api.getSession({ headers: await headers() });
  return authSession?.user.id ?? null;
}

async function guestRecord(sessionToken: string) {
  const [record] = await db
    .select({
      id: guest.id,
      createdAt: guest.createdAt,
      expiresAt: guest.expiresAt,
    })
    .from(guest)
    .where(eq(guest.sessionToken, sessionToken))
    .limit(1);

  if (record && record.expiresAt <= new Date()) {
    await db.delete(guest).where(eq(guest.id, record.id));
    return null;
  }

  return record ?? null;
}

async function guestTokenFromCookie() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(GUEST_SESSION_COOKIE_NAME)?.value;

  if (!rawToken) return null;

  const parsed = uuidSchema.safeParse(rawToken);
  if (!parsed.success) {
    cookieStore.delete(GUEST_SESSION_COOKIE_NAME);
    return null;
  }

  return parsed.data;
}

function setGuestCookie(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  sessionToken: string,
  expiresAt: Date,
) {
  cookieStore.set(GUEST_SESSION_COOKIE_NAME, sessionToken, {
    ...sessionCookieAttributes,
    expires: expiresAt,
    maxAge: SESSION_MAX_AGE_SECONDS,
    priority: "high",
  });
}

async function mergeGuestOwnership(userId: string, sessionToken: string | null) {
  if (!sessionToken) return false;

  const parsedUserId = uuidSchema.safeParse(userId);
  if (!parsedUserId.success) {
    throw new Error("Authenticated user ID is not a UUID.");
  }

  const [currentGuest] = await db
    .select({ id: guest.id })
    .from(guest)
    .where(eq(guest.sessionToken, sessionToken))
    .limit(1);

  if (currentGuest) {
    // Cart, wishlist, and other guest-owned schemas do not exist yet. Add
    // their idempotent ownership updates here before this delete. Keeping the
    // transition boundary centralized prevents auth actions from depending on
    // future commerce modules.
    await db.delete(guest).where(eq(guest.id, currentGuest.id));
  }

  (await cookies()).delete(GUEST_SESSION_COOKIE_NAME);
  return Boolean(currentGuest);
}

export async function guestSession(): Promise<PublicGuestSession | null> {
  requireDatabaseConfiguration();

  if (await authenticatedUserId()) return null;

  const sessionToken = await guestTokenFromCookie();
  if (!sessionToken) return null;

  const record = await guestRecord(sessionToken);
  if (!record) {
    (await cookies()).delete(GUEST_SESSION_COOKIE_NAME);
    return null;
  }

  return publicGuestSession(record);
}

export async function createGuestSession(): Promise<PublicGuestSession | null> {
  requireDatabaseConfiguration();

  if (await authenticatedUserId()) return null;

  const existingToken = await guestTokenFromCookie();
  if (existingToken) {
    const existingRecord = await guestRecord(existingToken);
    if (existingRecord) return publicGuestSession(existingRecord);
  }

  const sessionToken = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1_000);
  const [created] = await db
    .insert(guest)
    .values({ sessionToken, expiresAt })
    .returning({
      id: guest.id,
      createdAt: guest.createdAt,
      expiresAt: guest.expiresAt,
    });

  if (!created) {
    throw new Error("Failed to create a guest session.");
  }

  setGuestCookie(await cookies(), sessionToken, expiresAt);
  return publicGuestSession(created);
}

export async function mergeGuestCartWithUserCart(): Promise<GuestCartMergeResult> {
  requireDatabaseConfiguration();

  const userId = await authenticatedUserId();
  if (!userId) {
    throw new Error("Authentication is required to merge a guest session.");
  }

  const merged = await mergeGuestOwnership(userId, await guestTokenFromCookie());
  return { merged };
}

/**
 * Attach this action to the future cart's checkout form. It establishes a
 * guest identity before sending anonymous shoppers to auth and performs the
 * same idempotent merge for already authenticated shoppers.
 */
export async function beginCheckout(): Promise<never> {
  requireDatabaseConfiguration();

  const userId = await authenticatedUserId();
  if (!userId) {
    await createGuestSession();
    redirect("/sign-in?callbackURL=%2Fcheckout");
  }

  await mergeGuestOwnership(userId, await guestTokenFromCookie());
  redirect("/checkout");
}

export async function signUp(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    terms: formData.get("terms"),
    callbackURL: formData.get("callbackURL") ?? "/",
  });

  if (!parsed.success) return validationFailure(parsed.error);

  const guestToken = await guestTokenFromCookie();
  let userId: string;

  try {
    requireDatabaseConfiguration();
    const result = await auth.api.signUpEmail({
      headers: await headers(),
      body: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        rememberMe: true,
      },
    });
    userId = result.user.id;
  } catch (error) {
    return authenticationFailure(error, "sign-up");
  }

  await mergeGuestOwnership(userId, guestToken);
  redirect(parsed.data.callbackURL);
}

export async function signIn(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    callbackURL: formData.get("callbackURL") ?? "/",
  });

  if (!parsed.success) return validationFailure(parsed.error);

  const guestToken = await guestTokenFromCookie();
  let userId: string;

  try {
    requireDatabaseConfiguration();
    const result = await auth.api.signInEmail({
      headers: await headers(),
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
        rememberMe: true,
      },
    });
    userId = result.user.id;
  } catch (error) {
    return authenticationFailure(error, "sign-in");
  }

  await mergeGuestOwnership(userId, guestToken);
  redirect(parsed.data.callbackURL);
}

export async function signOut(formData?: FormData): Promise<never> {
  const parsed = signOutSchema.safeParse({
    callbackURL: formData?.get("callbackURL") ?? "/",
  });
  const callbackURL = parsed.success ? parsed.data.callbackURL : "/";

  await auth.api.signOut({ headers: await headers() });
  redirect(callbackURL);
}
