import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local", quiet: true });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set in .env.local.");
}

let parsedDatabaseUrl: URL;

try {
  parsedDatabaseUrl = new URL(databaseUrl);
} catch {
  throw new Error("DATABASE_URL in .env.local is not a valid URL.");
}

if (!new Set(["postgres:", "postgresql:"]).has(parsedDatabaseUrl.protocol)) {
  throw new Error("DATABASE_URL must use the postgres or postgresql protocol.");
}

if (
  parsedDatabaseUrl.hostname === "your-neon-host.neon.tech" ||
  parsedDatabaseUrl.hostname.includes("placeholder")
) {
  throw new Error(
    "DATABASE_URL still contains a placeholder. Copy a connection string from the Neon dashboard.",
  );
}

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  entities: {
    roles: {
      provider: "neon",
    },
  },
});
