import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { mediaAssets } from "./catalog";
import { auditTimestamps, primaryId } from "./common";
import { user } from "./user";

export const customerProfiles = pgTable(
  "customer_profiles",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),
    customerNumber: varchar("customer_number", { length: 32 }).notNull(),
    customerType: varchar("customer_type", { length: 20 })
      .notNull()
      .default("individual"),
    phoneE164: varchar("phone_e164", { length: 20 }),
    companyName: varchar("company_name", { length: 200 }),
    abn: varchar("abn", { length: 11 }),
    defaultCurrency: varchar("default_currency", { length: 3 })
      .notNull()
      .default("AUD"),
    marketingConsentAt: timestamp("marketing_consent_at", {
      withTimezone: true,
    }),
    termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("customer_profiles_number_uidx").on(table.customerNumber),
    check(
      "customer_profiles_type_check",
      sql`${table.customerType} in ('individual', 'business')`,
    ),
  ],
);

export const customerAddresses = pgTable(
  "customer_addresses",
  {
    id: primaryId(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 80 }),
    recipientName: varchar("recipient_name", { length: 180 }).notNull(),
    companyName: varchar("company_name", { length: 200 }),
    addressLine1: varchar("address_line_1", { length: 200 }).notNull(),
    addressLine2: varchar("address_line_2", { length: 200 }),
    suburb: varchar("suburb", { length: 120 }).notNull(),
    state: varchar("state", { length: 80 }).notNull(),
    postcode: varchar("postcode", { length: 16 }).notNull(),
    countryCode: varchar("country_code", { length: 2 })
      .notNull()
      .default("AU"),
    phoneE164: varchar("phone_e164", { length: 20 }),
    deliveryInstructions: text("delivery_instructions"),
    isDefaultShipping: boolean("is_default_shipping")
      .notNull()
      .default(false),
    isDefaultBilling: boolean("is_default_billing")
      .notNull()
      .default(false),
    ...auditTimestamps(),
  },
  (table) => [
    index("customer_addresses_user_id_idx").on(table.userId),
    uniqueIndex("customer_addresses_default_shipping_uidx")
      .on(table.userId)
      .where(sql`${table.isDefaultShipping} = true`),
    uniqueIndex("customer_addresses_default_billing_uidx")
      .on(table.userId)
      .where(sql`${table.isDefaultBilling} = true`),
  ],
);

export const customerConsents = pgTable(
  "customer_consents",
  {
    id: primaryId(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    consentType: varchar("consent_type", { length: 60 }).notNull(),
    version: varchar("version", { length: 40 }).notNull(),
    granted: boolean("granted").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    source: varchar("source", { length: 60 }),
    ipAddress: varchar("ip_address", { length: 64 }),
  },
  (table) => [
    index("customer_consents_user_type_idx").on(
      table.userId,
      table.consentType,
      table.occurredAt,
    ),
  ],
);

export const roles = pgTable("roles", {
  id: primaryId(),
  code: varchar("code", { length: 60 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
  ...auditTimestamps(),
});

export const userRoles = pgTable(
  "user_roles",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    assignedBy: uuid("assigned_by").references(() => user.id, {
      onDelete: "set null",
    }),
    assignedAt: timestamp("assigned_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.roleId] }),
    index("user_roles_role_id_idx").on(table.roleId),
  ],
);

export const sellers = pgTable(
  "sellers",
  {
    id: primaryId(),
    sellerNumber: varchar("seller_number", { length: 32 }).notNull(),
    slug: varchar("slug", { length: 180 }).notNull(),
    legalName: varchar("legal_name", { length: 200 }).notNull(),
    tradingName: varchar("trading_name", { length: 200 }).notNull(),
    abn: varchar("abn", { length: 11 }),
    gstRegistered: boolean("gst_registered").notNull().default(false),
    status: varchar("status", { length: 24 })
      .notNull()
      .default("onboarding"),
    supportEmail: varchar("support_email", { length: 320 }).notNull(),
    supportPhone: varchar("support_phone", { length: 20 }),
    websiteUrl: text("website_url"),
    defaultCurrency: varchar("default_currency", { length: 3 })
      .notNull()
      .default("AUD"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    suspendedAt: timestamp("suspended_at", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("sellers_number_uidx").on(table.sellerNumber),
    uniqueIndex("sellers_slug_uidx").on(table.slug),
    index("sellers_status_idx").on(table.status),
    check(
      "sellers_status_check",
      sql`${table.status} in ('onboarding', 'active', 'suspended', 'closed')`,
    ),
  ],
);

export const sellerMemberships = pgTable(
  "seller_memberships",
  {
    id: primaryId(),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => sellers.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 32 }).notNull(),
    status: varchar("status", { length: 24 }).notNull().default("invited"),
    invitedAt: timestamp("invited_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("seller_memberships_seller_user_uidx").on(
      table.sellerId,
      table.userId,
    ),
    index("seller_memberships_user_id_idx").on(table.userId),
    check(
      "seller_memberships_role_check",
      sql`${table.role} in ('owner', 'admin', 'catalogue', 'fulfilment', 'finance')`,
    ),
    check(
      "seller_memberships_status_check",
      sql`${table.status} in ('invited', 'active', 'suspended', 'removed')`,
    ),
  ],
);

export const sellerLocations = pgTable(
  "seller_locations",
  {
    id: primaryId(),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => sellers.id, { onDelete: "cascade" }),
    locationType: varchar("location_type", { length: 24 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    addressLine1: varchar("address_line_1", { length: 200 }).notNull(),
    addressLine2: varchar("address_line_2", { length: 200 }),
    suburb: varchar("suburb", { length: 120 }).notNull(),
    state: varchar("state", { length: 80 }).notNull(),
    postcode: varchar("postcode", { length: 16 }).notNull(),
    countryCode: varchar("country_code", { length: 2 })
      .notNull()
      .default("AU"),
    phoneE164: varchar("phone_e164", { length: 20 }),
    isPrimary: boolean("is_primary").notNull().default(false),
    ...auditTimestamps(),
  },
  (table) => [
    index("seller_locations_seller_id_idx").on(table.sellerId),
    uniqueIndex("seller_locations_primary_type_uidx")
      .on(table.sellerId, table.locationType)
      .where(sql`${table.isPrimary} = true`),
    check(
      "seller_locations_type_check",
      sql`${table.locationType} in ('registered', 'returns', 'warehouse', 'showroom')`,
    ),
  ],
);

export const sellerVerificationDocuments = pgTable(
  "seller_verification_documents",
  {
    id: primaryId(),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => sellers.id, { onDelete: "cascade" }),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "restrict" }),
    documentType: varchar("document_type", { length: 60 }).notNull(),
    status: varchar("status", { length: 24 }).notNull().default("pending"),
    verifiedBy: uuid("verified_by").references(() => user.id, {
      onDelete: "set null",
    }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [
    index("seller_verification_documents_seller_idx").on(
      table.sellerId,
      table.status,
    ),
    check(
      "seller_verification_documents_status_check",
      sql`${table.status} in ('pending', 'verified', 'rejected', 'expired')`,
    ),
  ],
);
