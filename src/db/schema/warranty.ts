import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { brands, products, productVariants } from "./catalog";
import { orderItems } from "./commerce";
import { auditTimestamps, primaryId } from "./common";
import { user } from "./user";

export const warrantyPolicies = pgTable(
  "warranty_policies",
  {
    id: primaryId(),
    brandId: uuid("brand_id").references(() => brands.id, {
      onDelete: "restrict",
    }),
    name: varchar("name", { length: 200 }).notNull(),
    warrantyType: varchar("warranty_type", { length: 40 }).notNull(),
    termMonths: integer("term_months").notNull(),
    coverage: text("coverage").notNull(),
    exclusions: text("exclusions"),
    claimWindowDays: integer("claim_window_days"),
    status: varchar("status", { length: 24 }).notNull().default("active"),
    ...auditTimestamps(),
  },
  (table) => [
    index("warranty_policies_brand_idx").on(table.brandId),
    check("warranty_policies_term_check", sql`${table.termMonths} > 0`),
  ],
);

export const productWarranties = pgTable(
  "product_warranties",
  {
    id: primaryId(),
    warrantyPolicyId: uuid("warranty_policy_id")
      .notNull()
      .references(() => warrantyPolicies.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "cascade",
    }),
    variantId: uuid("variant_id").references(() => productVariants.id, {
      onDelete: "cascade",
    }),
    isDefault: boolean("is_default").notNull().default(true),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("product_warranties_product_uidx")
      .on(table.warrantyPolicyId, table.productId)
      .where(sql`${table.productId} is not null`),
    uniqueIndex("product_warranties_variant_uidx")
      .on(table.warrantyPolicyId, table.variantId)
      .where(sql`${table.variantId} is not null`),
    check(
      "product_warranties_target_check",
      sql`num_nonnulls(${table.productId}, ${table.variantId}) = 1`,
    ),
  ],
);

export const warrantyRegistrations = pgTable(
  "warranty_registrations",
  {
    id: primaryId(),
    registrationNumber: varchar("registration_number", { length: 48 }).notNull(),
    warrantyPolicyId: uuid("warranty_policy_id")
      .notNull()
      .references(() => warrantyPolicies.id, { onDelete: "restrict" }),
    orderItemId: uuid("order_item_id")
      .notNull()
      .references(() => orderItems.id, { onDelete: "restrict" }),
    userId: uuid("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    customerEmail: varchar("customer_email", { length: 320 }).notNull(),
    status: varchar("status", { length: 24 }).notNull().default("active"),
    manufacturerReference: varchar("manufacturer_reference", { length: 160 }),
    registeredAt: timestamp("registered_at", { withTimezone: true }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("warranty_registrations_number_uidx").on(
      table.registrationNumber,
    ),
    index("warranty_registrations_user_idx").on(table.userId, table.status),
    index("warranty_registrations_email_idx").on(table.customerEmail),
    check(
      "warranty_registrations_period_check",
      sql`${table.expiresAt} > ${table.registeredAt}`,
    ),
  ],
);

export const warrantyClaims = pgTable(
  "warranty_claims",
  {
    id: primaryId(),
    claimNumber: varchar("claim_number", { length: 48 }).notNull(),
    warrantyRegistrationId: uuid("warranty_registration_id")
      .notNull()
      .references(() => warrantyRegistrations.id, { onDelete: "restrict" }),
    status: varchar("status", { length: 32 }).notNull().default("submitted"),
    issueDescription: text("issue_description").notNull(),
    requestedResolution: varchar("requested_resolution", {
      length: 40,
    }).notNull(),
    resolutionNotes: text("resolution_notes"),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("warranty_claims_number_uidx").on(table.claimNumber),
    index("warranty_claims_registration_idx").on(
      table.warrantyRegistrationId,
      table.status,
    ),
    check(
      "warranty_claims_status_check",
      sql`${table.status} in ('submitted', 'reviewing', 'approved', 'rejected', 'in_progress', 'resolved', 'cancelled')`,
    ),
  ],
);

export const warrantyClaimEvents = pgTable(
  "warranty_claim_events",
  {
    id: primaryId(),
    warrantyClaimId: uuid("warranty_claim_id")
      .notNull()
      .references(() => warrantyClaims.id, { onDelete: "restrict" }),
    actorUserId: uuid("actor_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    fromStatus: varchar("from_status", { length: 32 }),
    toStatus: varchar("to_status", { length: 32 }).notNull(),
    note: text("note"),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("warranty_claim_events_claim_time_idx").on(
      table.warrantyClaimId,
      table.occurredAt,
    ),
  ],
);
