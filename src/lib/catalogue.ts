import "server-only";

import { and, asc, desc, eq, gt, inArray, isNull, lte, or, sql } from "drizzle-orm";
import { connection } from "next/server";

import { db, requireDatabaseConfiguration } from "@/db";
import {
  brands,
  categories,
  inventoryLevels,
  productCategories,
  productPrices,
  products,
  productVariants,
} from "@/db/schema";

export type CatalogueProduct = {
  slug: string;
  name: string;
  categorySlug: string;
  manufacturer: string;
  specification: string;
  priceCents: number;
  stock: number;
  featured: boolean;
};

export const storefrontCategorySlugs = [
  "solar-panels",
  "expansion-battery-modules",
  "portable-power-stations",
  "wall-mounted-ev-chargers",
  "portable-coolers",
] as const;

export async function getCatalogue(): Promise<CatalogueProduct[]> {
  await connection();
  requireDatabaseConfiguration();

  return db
    .select({
      slug: products.slug,
      name: products.name,
      categorySlug: categories.slug,
      manufacturer: brands.name,
      specification: sql<string>`coalesce(${productVariants.specificationSummary}, ${productVariants.name})`,
      priceCents: productPrices.amountMinor,
      stock:
        sql<number>`coalesce(sum(greatest(${inventoryLevels.onHand} - ${inventoryLevels.reserved} - ${inventoryLevels.safetyStock}, 0)), 0)::int`.mapWith(
          Number,
        ),
      featured: products.featured,
    })
    .from(products)
    .innerJoin(brands, eq(products.brandId, brands.id))
    .innerJoin(
      productCategories,
      and(
        eq(productCategories.productId, products.id),
        eq(productCategories.isPrimary, true),
      ),
    )
    .innerJoin(categories, eq(productCategories.categoryId, categories.id))
    .innerJoin(
      productVariants,
      and(
        eq(productVariants.productId, products.id),
        eq(productVariants.isDefault, true),
        eq(productVariants.status, "active"),
        isNull(productVariants.deletedAt),
      ),
    )
    .innerJoin(
      productPrices,
      and(
        eq(productPrices.variantId, productVariants.id),
        eq(productPrices.priceType, "regular"),
        eq(productPrices.currency, "AUD"),
        lte(productPrices.startsAt, sql`now()`),
        or(isNull(productPrices.endsAt), gt(productPrices.endsAt, sql`now()`)),
      ),
    )
    .leftJoin(inventoryLevels, eq(inventoryLevels.variantId, productVariants.id))
    .where(
      and(
        eq(products.status, "active"),
        isNull(products.deletedAt),
        eq(categories.status, "active"),
        inArray(categories.slug, storefrontCategorySlugs),
      ),
    )
    .groupBy(
      products.id,
      categories.id,
      brands.id,
      productVariants.id,
      productPrices.id,
    )
    .orderBy(
      desc(products.featured),
      asc(categories.sortOrder),
      asc(products.name),
    );
}
