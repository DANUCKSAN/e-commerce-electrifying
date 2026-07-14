import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

async function seed() {
  const [{ db, requireDatabaseConfiguration }, { sampleProducts }, { products }] =
    await Promise.all([
      import("./client"),
      import("./sample-products"),
      import("./schema"),
    ]);

  requireDatabaseConfiguration();

  const inserted = await db
    .insert(products)
    .values(sampleProducts)
    .onConflictDoNothing({ target: products.slug })
    .returning({ id: products.id, name: products.name });

  console.log(
    inserted.length > 0
      ? `Seeded ${inserted.length} solar products.`
      : "Solar products are already seeded.",
  );
}

seed().catch((error: unknown) => {
  console.error("Unable to seed the database.", error);
  process.exitCode = 1;
});
