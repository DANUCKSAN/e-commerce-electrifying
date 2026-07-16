import "server-only";

import { and, asc, desc, eq, gt, inArray, isNull, lte, or, sql } from "drizzle-orm";
import { connection } from "next/server";

import { db, requireDatabaseConfiguration } from "@/db";
import {
  brands,
  categories,
  inventoryLevels,
  offerPrices,
  productCategories,
  products,
  productVariants,
  sellerOffers,
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
      priceCents: offerPrices.amountMinor,
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
      sellerOffers,
      and(
        eq(sellerOffers.variantId, productVariants.id),
        eq(sellerOffers.status, "active"),
        isNull(sellerOffers.deletedAt),
      ),
    )
    .innerJoin(
      offerPrices,
      and(
        eq(offerPrices.offerId, sellerOffers.id),
        eq(offerPrices.priceType, "regular"),
        eq(offerPrices.currency, "AUD"),
        lte(offerPrices.startsAt, sql`now()`),
        or(isNull(offerPrices.endsAt), gt(offerPrices.endsAt, sql`now()`)),
      ),
    )
    .leftJoin(inventoryLevels, eq(inventoryLevels.offerId, sellerOffers.id))
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
      offerPrices.id,
    )
    .orderBy(
      desc(products.featured),
      asc(categories.sortOrder),
      asc(products.name),
    );
}
