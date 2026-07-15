import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/db/client";
import * as schema from "@/db/schema";
import {
  AUTH_SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  sessionCookieAttributes,
} from "@/lib/auth/config";

const isProductionBuild =
  process.env.NEXT_PHASE === "phase-production-build";
const isProductionRuntime =
  process.env.NODE_ENV === "production" && !isProductionBuild;

if (isProductionRuntime && !process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is required in production.");
}

if (isProductionRuntime && !process.env.BETTER_AUTH_URL) {
  throw new Error("BETTER_AUTH_URL is required in production.");
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
  secret:
    process.env.BETTER_AUTH_SECRET ??
    "pvtoev-development-only-secret-change-before-deploy",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: SESSION_MAX_AGE_SECONDS,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 10 },
      "/sign-up/email": { window: 60, max: 5 },
    },
  },
  advanced: {
    // Keep the exact required cookie name while applying Secure explicitly.
    // Better Auth otherwise prefixes secure cookies with `__Secure-`.
    useSecureCookies: false,
    database: {
      generateId: "uuid",
    },
    defaultCookieAttributes: sessionCookieAttributes,
    cookies: {
      session_token: {
        name: AUTH_SESSION_COOKIE_NAME,
        attributes: {
          ...sessionCookieAttributes,
          maxAge: SESSION_MAX_AGE_SECONDS,
        },
      },
    },
  },
  plugins: [nextCookies()],
});
