import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth/minimal";

import { db } from "@/db/client";
import * as schema from "@/db/schema";

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
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret:
    process.env.BETTER_AUTH_SECRET ??
    "pvtoev-development-only-secret-change-before-deploy",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
});
