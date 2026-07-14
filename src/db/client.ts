import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

const configuredDatabaseUrl = process.env.DATABASE_URL;
const isProductionBuild =
  process.env.NEXT_PHASE === "phase-production-build";
const isProductionRuntime =
  process.env.NODE_ENV === "production" && !isProductionBuild;

if (isProductionRuntime && !configuredDatabaseUrl) {
  throw new Error("DATABASE_URL is required in production.");
}

const buildSafeDatabaseUrl =
  configuredDatabaseUrl ??
  "postgresql://placeholder:placeholder@localhost:5432/placeholder";

export const isDatabaseConfigured = Boolean(configuredDatabaseUrl);

export const db = drizzle(buildSafeDatabaseUrl, { schema });

export function requireDatabaseConfiguration() {
  if (!configuredDatabaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and add your Neon connection string.",
    );
  }
}
