import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  numeric,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { productVariants, taxClasses } from "./catalog";
import { auditTimestamps, primaryId } from "./common";
import { sellers } from "./marketplace";

export const sellerOffers = pgTable(
  "seller_offers",
  {
    id: primaryId(),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => sellers.id, { onDelete: "restrict" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),
    sellerSku: varchar("seller_sku", { length: 100 }).notNull(),
    status: varchar("status", { length: 24 }).notNull().default("draft"),
    condition: varchar("condition", { length: 24 })
      .notNull()
      .default("new"),
    fulfillmentType: varchar("fulfillment_type", { length: 24 })
      .notNull()
      .default("platform"),
    minimumOrderQuantity: integer("minimum_order_quantity")
      .notNull()
      .default(1),
    maximumOrderQuantity: integer("maximum_order_quantity"),
    leadTimeDays: integer("lead_time_days").notNull().default(0),
    trackInventory: boolean("track_inventory").notNull().default(true),
    backorderPolicy: varchar("backorder_policy", { length: 24 })
      .notNull()
      .default("deny"),
    version: integer("version").notNull().default(1),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("seller_offers_seller_sku_uidx").on(
      table.sellerId,
      table.sellerSku,
    ),
    uniqueIndex("seller_offers_variant_condition_uidx").on(
      table.sellerId,
      table.variantId,
      table.condition,
    ),
    index("seller_offers_variant_status_idx").on(
      table.variantId,
      table.status,
    ),
    index("seller_offers_seller_status_idx").on(table.sellerId, table.status),
    check(
      "seller_offers_status_check",
      sql`${table.status} in ('draft', 'active', 'paused', 'ended')`,
    ),
    check(
      "seller_offers_condition_check",
      sql`${table.condition} in ('new', 'refurbished')`,
    ),
    check(
      "seller_offers_fulfillment_check",
      sql`${table.fulfillmentType} in ('platform', 'seller', 'drop_ship')`,
    ),
    check(
      "seller_offers_backorder_check",
      sql`${table.backorderPolicy} in ('deny', 'allow', 'preorder')`,
    ),
    check(
      "seller_offers_quantity_check",
      sql`${table.minimumOrderQuantity} > 0
        and (${table.maximumOrderQuantity} is null or ${table.maximumOrderQuantity} >= ${table.minimumOrderQuantity})`,
    ),
    check(
      "seller_offers_lead_time_check",
      sql`${table.leadTimeDays} >= 0`,
    ),
  ],
);

export const offerPrices = pgTable(
  "offer_prices",
  {
    id: primaryId(),
    offerId: uuid("offer_id")
      .notNull()
      .references(() => sellerOffers.id, { onDelete: "cascade" }),
    priceType: varchar("price_type", { length: 24 })
      .notNull()
      .default("regular"),
    amountMinor: bigint("amount_minor", { mode: "number" }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("AUD"),
    taxInclusive: boolean("tax_inclusive").notNull().default(true),
    startsAt: timestamp("starts_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("offer_prices_period_uidx").on(
      table.offerId,
      table.priceType,
      table.currency,
      table.startsAt,
    ),
    index("offer_prices_lookup_idx").on(
      table.offerId,
      table.currency,
      table.startsAt,
      table.endsAt,
    ),
    check("offer_prices_amount_check", sql`${table.amountMinor} >= 0`),
    check(
      "offer_prices_type_check",
      sql`${table.priceType} in ('regular', 'sale', 'wholesale')`,
    ),
    check(
      "offer_prices_period_check",
      sql`${table.endsAt} is null or ${table.endsAt} > ${table.startsAt}`,
    ),
  ],
);

export const taxRates = pgTable(
  "tax_rates",
  {
    id: primaryId(),
    taxClassId: uuid("tax_class_id")
      .notNull()
      .references(() => taxClasses.id, { onDelete: "restrict" }),
    countryCode: varchar("country_code", { length: 2 }).notNull(),
    stateCode: varchar("state_code", { length: 16 }),
    name: varchar("name", { length: 100 }).notNull(),
    rate: numeric("rate", { precision: 9, scale: 6 }).notNull(),
    validFrom: timestamp("valid_from", { withTimezone: true }).notNull(),
    validTo: timestamp("valid_to", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [
    index("tax_rates_lookup_idx").on(
      table.taxClassId,
      table.countryCode,
      table.stateCode,
      table.validFrom,
    ),
    check("tax_rates_rate_check", sql`${table.rate} >= 0 and ${table.rate} <= 1`),
    check(
      "tax_rates_period_check",
      sql`${table.validTo} is null or ${table.validTo} > ${table.validFrom}`,
    ),
  ],
);
