import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  numeric,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { productVariants, taxClasses } from "./catalog";
import { auditTimestamps, primaryId } from "./common";

export const productPrices = pgTable(
  "product_prices",
  {
    id: primaryId(),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
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
    uniqueIndex("product_prices_period_uidx").on(
      table.variantId,
      table.priceType,
      table.currency,
      table.startsAt,
    ),
    index("product_prices_lookup_idx").on(
      table.variantId,
      table.currency,
      table.startsAt,
      table.endsAt,
    ),
    check("product_prices_amount_check", sql`${table.amountMinor} >= 0`),
    check(
      "product_prices_type_check",
      sql`${table.priceType} in ('regular', 'sale')`,
    ),
    check(
      "product_prices_period_check",
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
