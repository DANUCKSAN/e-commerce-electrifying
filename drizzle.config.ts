import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

const databaseCommands = new Set(["migrate", "push", "pull", "studio"]);
const requiresDatabase = process.argv.some((argument) =>
  databaseCommands.has(argument),
);

if (requiresDatabase && !process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is required for Drizzle commands that connect to PostgreSQL.",
  );
}

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://schema-generation:only@localhost:5432/placeholder";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
});
