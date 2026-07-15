import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

const configuredDatabaseUrl = process.env.DATABASE_URL;
const isProductionBuild =
  process.env.NEXT_PHASE === "phase-production-build";
const isProductionRuntime =
  process.env.NODE_ENV === "production" && !isProductionBuild;

function databaseConfigurationIssue(databaseUrl: string | undefined) {
  if (!databaseUrl) return "DATABASE_URL is not set";

  try {
    const parsed = new URL(databaseUrl);

    if (!new Set(["postgres:", "postgresql:"]).has(parsed.protocol)) {
      return "DATABASE_URL must use the postgres or postgresql protocol";
    }

    if (
      parsed.hostname === "your-neon-host.neon.tech" ||
      parsed.hostname.includes("placeholder")
    ) {
      return "DATABASE_URL still contains a placeholder hostname";
    }
  } catch {
    return "DATABASE_URL is not a valid URL";
  }

  return null;
}

const configurationIssue = databaseConfigurationIssue(configuredDatabaseUrl);

if (isProductionRuntime && configurationIssue) {
  throw new Error(`Invalid database configuration: ${configurationIssue}.`);
}

export const isDatabaseConfigured = configurationIssue === null;

const buildSafeDatabaseUrl = isDatabaseConfigured
  ? configuredDatabaseUrl!
  : "postgresql://placeholder:placeholder@localhost:5432/placeholder";

export const db = drizzle(buildSafeDatabaseUrl, { schema });

export function requireDatabaseConfiguration() {
  if (configurationIssue) {
    throw new Error(
      `Invalid database configuration: ${configurationIssue}. Set a valid PostgreSQL connection string in .env.local.`,
    );
  }
}
