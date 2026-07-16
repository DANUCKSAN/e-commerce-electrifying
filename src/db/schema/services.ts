import { sql } from "drizzle-orm";
import {
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

import {
  brands,
  mediaAssets,
  products,
  productVariants,
} from "./catalog";
import {
  orderItems,
  orders,
  quotes,
  sellerOrders,
} from "./commerce";
import { auditTimestamps, primaryId } from "./common";
import { inventorySerials } from "./inventory";
import { sellers } from "./marketplace";
import { user } from "./user";

export const installationRequests = pgTable(
  "installation_requests",
  {
    id: primaryId(),
    requestNumber: varchar("request_number", { length: 48 }).notNull(),
    orderId: uuid("order_id").references(() => orders.id, {
      onDelete: "restrict",
    }),
    quoteId: uuid("quote_id").references(() => quotes.id, {
      onDelete: "restrict",
    }),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    serviceType: varchar("service_type", { length: 60 }).notNull(),
    status: varchar("status", { length: 32 })
      .notNull()
      .default("requested"),
    siteAddressSnapshot: jsonb("site_address_snapshot")
      .$type<Record<string, unknown>>()
      .notNull(),
    preferredDate: timestamp("preferred_date", { withTimezone: true }),
    customerNotes: text("customer_notes"),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("installation_requests_number_uidx").on(table.requestNumber),
    index("installation_requests_user_status_idx").on(table.userId, table.status),
    index("installation_requests_order_id_idx").on(table.orderId),
    check(
      "installation_requests_source_check",
      sql`num_nonnulls(${table.orderId}, ${table.quoteId}) >= 1`,
    ),
    check(
      "installation_requests_status_check",
      sql`${table.status} in ('requested', 'assessment_required', 'quoted', 'scheduled', 'in_progress', 'completed', 'cancelled')`,
    ),
  ],
);

export const siteAssessments = pgTable(
  "site_assessments",
  {
    id: primaryId(),
    installationRequestId: uuid("installation_request_id")
      .notNull()
      .references(() => installationRequests.id, { onDelete: "restrict" }),
    assessorSellerId: uuid("assessor_seller_id")
      .notNull()
      .references(() => sellers.id, { onDelete: "restrict" }),
    status: varchar("status", { length: 32 }).notNull().default("scheduled"),
    supplyPhase: varchar("supply_phase", { length: 40 }),
    switchboardType: varchar("switchboard_type", { length: 100 }),
    roofType: varchar("roof_type", { length: 100 }),
    findings: jsonb("findings").$type<Record<string, unknown>>().notNull().default({}),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [
    index("site_assessments_request_idx").on(table.installationRequestId),
    index("site_assessments_seller_status_idx").on(
      table.assessorSellerId,
      table.status,
    ),
  ],
);

export const installationJobs = pgTable(
  "installation_jobs",
  {
    id: primaryId(),
    jobNumber: varchar("job_number", { length: 48 }).notNull(),
    installationRequestId: uuid("installation_request_id")
      .notNull()
      .references(() => installationRequests.id, { onDelete: "restrict" }),
    sellerOrderId: uuid("seller_order_id").references(() => sellerOrders.id, {
      onDelete: "restrict",
    }),
    installerSellerId: uuid("installer_seller_id")
      .notNull()
      .references(() => sellers.id, { onDelete: "restrict" }),
    status: varchar("status", { length: 32 }).notNull().default("scheduled"),
    scheduledStart: timestamp("scheduled_start", { withTimezone: true }),
    scheduledEnd: timestamp("scheduled_end", { withTimezone: true }),
    actualStart: timestamp("actual_start", { withTimezone: true }),
    actualEnd: timestamp("actual_end", { withTimezone: true }),
    completionNotes: text("completion_notes"),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("installation_jobs_number_uidx").on(table.jobNumber),
    index("installation_jobs_installer_status_idx").on(
      table.installerSellerId,
      table.status,
      table.scheduledStart,
    ),
    check(
      "installation_jobs_schedule_check",
      sql`${table.scheduledEnd} is null or ${table.scheduledStart} is null or ${table.scheduledEnd} > ${table.scheduledStart}`,
    ),
  ],
);

export const installationAppointments = pgTable(
  "installation_appointments",
  {
    id: primaryId(),
    installationJobId: uuid("installation_job_id")
      .notNull()
      .references(() => installationJobs.id, { onDelete: "cascade" }),
    appointmentType: varchar("appointment_type", { length: 40 }).notNull(),
    assignedUserId: uuid("assigned_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    status: varchar("status", { length: 24 }).notNull().default("scheduled"),
    notes: text("notes"),
    ...auditTimestamps(),
  },
  (table) => [
    index("installation_appointments_job_time_idx").on(
      table.installationJobId,
      table.startsAt,
    ),
    check(
      "installation_appointments_period_check",
      sql`${table.endsAt} > ${table.startsAt}`,
    ),
  ],
);

export const installedAssets = pgTable(
  "installed_assets",
  {
    id: primaryId(),
    installationJobId: uuid("installation_job_id")
      .notNull()
      .references(() => installationJobs.id, { onDelete: "restrict" }),
    orderItemId: uuid("order_item_id")
      .notNull()
      .references(() => orderItems.id, { onDelete: "restrict" }),
    inventorySerialId: uuid("inventory_serial_id").references(
      () => inventorySerials.id,
      { onDelete: "restrict" },
    ),
    serialNumber: varchar("serial_number", { length: 180 }),
    installationLocation: varchar("installation_location", { length: 240 }),
    installedAt: timestamp("installed_at", { withTimezone: true }).notNull(),
    commissionedAt: timestamp("commissioned_at", { withTimezone: true }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    ...auditTimestamps(),
  },
  (table) => [
    index("installed_assets_job_idx").on(table.installationJobId),
    index("installed_assets_order_item_idx").on(table.orderItemId),
    uniqueIndex("installed_assets_inventory_serial_uidx")
      .on(table.inventorySerialId)
      .where(sql`${table.inventorySerialId} is not null`),
  ],
);

export const installationDocuments = pgTable(
  "installation_documents",
  {
    id: primaryId(),
    installationJobId: uuid("installation_job_id")
      .notNull()
      .references(() => installationJobs.id, { onDelete: "restrict" }),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "restrict" }),
    documentType: varchar("document_type", { length: 60 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("installation_documents_job_idx").on(table.installationJobId)],
);

export const warrantyPolicies = pgTable(
  "warranty_policies",
  {
    id: primaryId(),
    brandId: uuid("brand_id").references(() => brands.id, {
      onDelete: "restrict",
    }),
    sellerId: uuid("seller_id").references(() => sellers.id, {
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
    index("warranty_policies_seller_idx").on(table.sellerId),
    check(
      "warranty_policies_owner_check",
      sql`num_nonnulls(${table.brandId}, ${table.sellerId}) >= 1`,
    ),
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
    installedAssetId: uuid("installed_asset_id").references(
      () => installedAssets.id,
      { onDelete: "restrict" },
    ),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
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
