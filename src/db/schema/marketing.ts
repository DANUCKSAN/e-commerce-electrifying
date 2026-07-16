import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { orders } from "./commerce";
import { auditTimestamps, primaryId } from "./common";
import { user } from "./user";

export const promotions = pgTable(
  "promotions",
  {
    id: primaryId(),
    name: varchar("name", { length: 180 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 24 }).notNull().default("draft"),
    priority: integer("priority").notNull().default(0),
    conditions: jsonb("conditions").$type<Record<string, unknown>>().notNull(),
    effects: jsonb("effects").$type<Record<string, unknown>>().notNull(),
    isCombinable: boolean("is_combinable").notNull().default(false),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [
    index("promotions_active_idx").on(table.status, table.startsAt, table.endsAt),
    check(
      "promotions_status_check",
      sql`${table.status} in ('draft', 'active', 'paused', 'ended')`,
    ),
    check(
      "promotions_period_check",
      sql`${table.endsAt} is null or ${table.endsAt} > ${table.startsAt}`,
    ),
  ],
);

export const promotionCodes = pgTable(
  "promotion_codes",
  {
    id: primaryId(),
    promotionId: uuid("promotion_id")
      .notNull()
      .references(() => promotions.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 80 }).notNull(),
    maximumRedemptions: integer("maximum_redemptions"),
    maximumRedemptionsPerUser: integer("maximum_redemptions_per_user"),
    redemptionCount: integer("redemption_count").notNull().default(0),
    status: varchar("status", { length: 24 }).notNull().default("active"),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("promotion_codes_code_uidx").on(table.code),
    check(
      "promotion_codes_counts_check",
      sql`${table.redemptionCount} >= 0
        and (${table.maximumRedemptions} is null or ${table.maximumRedemptions} > 0)
        and (${table.maximumRedemptionsPerUser} is null or ${table.maximumRedemptionsPerUser} > 0)`,
    ),
  ],
);

export const promotionRedemptions = pgTable(
  "promotion_redemptions",
  {
    id: primaryId(),
    promotionCodeId: uuid("promotion_code_id")
      .notNull()
      .references(() => promotionCodes.id, { onDelete: "restrict" }),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    userId: uuid("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    amountMinor: bigint("amount_minor", { mode: "number" }).notNull(),
    redeemedAt: timestamp("redeemed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("promotion_redemptions_order_code_uidx").on(
      table.orderId,
      table.promotionCodeId,
    ),
    index("promotion_redemptions_user_idx").on(table.userId, table.redeemedAt),
    check("promotion_redemptions_amount_check", sql`${table.amountMinor} >= 0`),
  ],
);
