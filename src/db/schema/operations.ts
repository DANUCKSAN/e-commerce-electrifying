import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { categories } from "./catalog";
import { refunds, sellerOrders } from "./commerce";
import { auditTimestamps, primaryId } from "./common";
import { warehouses } from "./inventory";
import { sellers } from "./marketplace";
import { sellerOffers } from "./offers";
import { user } from "./user";

export const commissionPlans = pgTable(
  "commission_plans",
  {
    id: primaryId(),
    name: varchar("name", { length: 160 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("AUD"),
    status: varchar("status", { length: 24 }).notNull().default("active"),
    ...auditTimestamps(),
  },
  (table) => [uniqueIndex("commission_plans_name_uidx").on(table.name)],
);

export const commissionRules = pgTable(
  "commission_rules",
  {
    id: primaryId(),
    commissionPlanId: uuid("commission_plan_id")
      .notNull()
      .references(() => commissionPlans.id, { onDelete: "cascade" }),
    sellerId: uuid("seller_id").references(() => sellers.id, {
      onDelete: "cascade",
    }),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "cascade",
    }),
    percentageRate: numeric("percentage_rate", {
      precision: 9,
      scale: 6,
    }).notNull(),
    fixedFeeMinor: bigint("fixed_fee_minor", { mode: "number" })
      .notNull()
      .default(0),
    priority: integer("priority").notNull().default(0),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [
    index("commission_rules_lookup_idx").on(
      table.commissionPlanId,
      table.sellerId,
      table.categoryId,
      table.priority,
    ),
    check(
      "commission_rules_rate_check",
      sql`${table.percentageRate} >= 0 and ${table.percentageRate} <= 1 and ${table.fixedFeeMinor} >= 0`,
    ),
    check(
      "commission_rules_period_check",
      sql`${table.endsAt} is null or ${table.endsAt} > ${table.startsAt}`,
    ),
  ],
);

export const sellerCommissionPlans = pgTable(
  "seller_commission_plans",
  {
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => sellers.id, { onDelete: "cascade" }),
    commissionPlanId: uuid("commission_plan_id")
      .notNull()
      .references(() => commissionPlans.id, { onDelete: "restrict" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
  },
  (table) => [
    primaryKey({ columns: [table.sellerId, table.commissionPlanId, table.startsAt] }),
    index("seller_commission_plans_active_idx").on(table.sellerId, table.startsAt),
  ],
);

export const sellerLedgerEntries = pgTable(
  "seller_ledger_entries",
  {
    id: primaryId(),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => sellers.id, { onDelete: "restrict" }),
    sellerOrderId: uuid("seller_order_id").references(() => sellerOrders.id, {
      onDelete: "restrict",
    }),
    refundId: uuid("refund_id").references(() => refunds.id, {
      onDelete: "restrict",
    }),
    entryType: varchar("entry_type", { length: 32 }).notNull(),
    amountMinor: bigint("amount_minor", { mode: "number" }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    description: text("description"),
    availableAt: timestamp("available_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("seller_ledger_entries_balance_idx").on(
      table.sellerId,
      table.currency,
      table.availableAt,
    ),
    check(
      "seller_ledger_entries_type_check",
      sql`${table.entryType} in ('sale', 'commission', 'payment_fee', 'refund', 'chargeback', 'adjustment', 'payout')`,
    ),
    check("seller_ledger_entries_amount_check", sql`${table.amountMinor} <> 0`),
  ],
);

export const sellerPayouts = pgTable(
  "seller_payouts",
  {
    id: primaryId(),
    payoutNumber: varchar("payout_number", { length: 48 }).notNull(),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => sellers.id, { onDelete: "restrict" }),
    status: varchar("status", { length: 24 }).notNull().default("pending"),
    amountMinor: bigint("amount_minor", { mode: "number" }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    providerReference: varchar("provider_reference", { length: 200 }),
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("seller_payouts_number_uidx").on(table.payoutNumber),
    index("seller_payouts_seller_status_idx").on(table.sellerId, table.status),
    check("seller_payouts_amount_check", sql`${table.amountMinor} > 0`),
    check(
      "seller_payouts_period_check",
      sql`${table.periodEnd} > ${table.periodStart}`,
    ),
  ],
);

export const sellerPayoutItems = pgTable(
  "seller_payout_items",
  {
    payoutId: uuid("payout_id")
      .notNull()
      .references(() => sellerPayouts.id, { onDelete: "restrict" }),
    ledgerEntryId: uuid("ledger_entry_id")
      .notNull()
      .references(() => sellerLedgerEntries.id, { onDelete: "restrict" }),
  },
  (table) => [
    primaryKey({ columns: [table.payoutId, table.ledgerEntryId] }),
    uniqueIndex("seller_payout_items_ledger_uidx").on(table.ledgerEntryId),
  ],
);

export const suppliers = pgTable(
  "suppliers",
  {
    id: primaryId(),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => sellers.id, { onDelete: "restrict" }),
    supplierNumber: varchar("supplier_number", { length: 40 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    contactName: varchar("contact_name", { length: 160 }),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 20 }),
    status: varchar("status", { length: 24 }).notNull().default("active"),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("suppliers_seller_number_uidx").on(
      table.sellerId,
      table.supplierNumber,
    ),
  ],
);

export const purchaseOrders = pgTable(
  "purchase_orders",
  {
    id: primaryId(),
    purchaseOrderNumber: varchar("purchase_order_number", {
      length: 48,
    }).notNull(),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => sellers.id, { onDelete: "restrict" }),
    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => suppliers.id, { onDelete: "restrict" }),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => warehouses.id, { onDelete: "restrict" }),
    status: varchar("status", { length: 24 }).notNull().default("draft"),
    currency: varchar("currency", { length: 3 }).notNull().default("AUD"),
    subtotalMinor: bigint("subtotal_minor", { mode: "number" }).notNull(),
    taxMinor: bigint("tax_minor", { mode: "number" }).notNull(),
    totalMinor: bigint("total_minor", { mode: "number" }).notNull(),
    orderedAt: timestamp("ordered_at", { withTimezone: true }),
    expectedAt: timestamp("expected_at", { withTimezone: true }),
    notes: text("notes"),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("purchase_orders_number_uidx").on(table.purchaseOrderNumber),
    index("purchase_orders_supplier_status_idx").on(
      table.supplierId,
      table.status,
    ),
    check(
      "purchase_orders_amounts_check",
      sql`${table.subtotalMinor} >= 0 and ${table.taxMinor} >= 0 and ${table.totalMinor} >= 0`,
    ),
  ],
);

export const purchaseOrderItems = pgTable(
  "purchase_order_items",
  {
    id: primaryId(),
    purchaseOrderId: uuid("purchase_order_id")
      .notNull()
      .references(() => purchaseOrders.id, { onDelete: "restrict" }),
    offerId: uuid("offer_id")
      .notNull()
      .references(() => sellerOffers.id, { onDelete: "restrict" }),
    quantityOrdered: integer("quantity_ordered").notNull(),
    quantityReceived: integer("quantity_received").notNull().default(0),
    unitCostMinor: bigint("unit_cost_minor", { mode: "number" }).notNull(),
    taxMinor: bigint("tax_minor", { mode: "number" }).notNull().default(0),
  },
  (table) => [
    uniqueIndex("purchase_order_items_offer_uidx").on(
      table.purchaseOrderId,
      table.offerId,
    ),
    check(
      "purchase_order_items_quantity_check",
      sql`${table.quantityOrdered} > 0 and ${table.quantityReceived} >= 0
        and ${table.quantityReceived} <= ${table.quantityOrdered}`,
    ),
  ],
);

export const goodsReceipts = pgTable(
  "goods_receipts",
  {
    id: primaryId(),
    receiptNumber: varchar("receipt_number", { length: 48 }).notNull(),
    purchaseOrderId: uuid("purchase_order_id")
      .notNull()
      .references(() => purchaseOrders.id, { onDelete: "restrict" }),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => warehouses.id, { onDelete: "restrict" }),
    receivedBy: uuid("received_by").references(() => user.id, {
      onDelete: "set null",
    }),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull(),
    notes: text("notes"),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("goods_receipts_number_uidx").on(table.receiptNumber),
    index("goods_receipts_purchase_order_idx").on(table.purchaseOrderId),
  ],
);

export const goodsReceiptItems = pgTable(
  "goods_receipt_items",
  {
    goodsReceiptId: uuid("goods_receipt_id")
      .notNull()
      .references(() => goodsReceipts.id, { onDelete: "restrict" }),
    purchaseOrderItemId: uuid("purchase_order_item_id")
      .notNull()
      .references(() => purchaseOrderItems.id, { onDelete: "restrict" }),
    quantityReceived: integer("quantity_received").notNull(),
    notes: text("notes"),
  },
  (table) => [
    primaryKey({ columns: [table.goodsReceiptId, table.purchaseOrderItemId] }),
    check("goods_receipt_items_quantity_check", sql`${table.quantityReceived} > 0`),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: primaryId(),
    actorUserId: uuid("actor_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    sellerId: uuid("seller_id").references(() => sellers.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    entityId: uuid("entity_id"),
    before: jsonb("before").$type<Record<string, unknown>>(),
    after: jsonb("after").$type<Record<string, unknown>>(),
    ipAddress: varchar("ip_address", { length: 64 }),
    requestId: varchar("request_id", { length: 100 }),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("audit_logs_entity_time_idx").on(
      table.entityType,
      table.entityId,
      table.occurredAt,
    ),
    index("audit_logs_actor_time_idx").on(table.actorUserId, table.occurredAt),
  ],
);

export const outboxEvents = pgTable(
  "outbox_events",
  {
    id: primaryId(),
    aggregateType: varchar("aggregate_type", { length: 80 }).notNull(),
    aggregateId: uuid("aggregate_id").notNull(),
    eventType: varchar("event_type", { length: 120 }).notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    status: varchar("status", { length: 24 }).notNull().default("pending"),
    attemptCount: integer("attempt_count").notNull().default(0),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("outbox_events_processing_idx").on(
      table.status,
      table.nextAttemptAt,
      table.createdAt,
    ),
    index("outbox_events_aggregate_idx").on(
      table.aggregateType,
      table.aggregateId,
    ),
  ],
);

export const idempotencyKeys = pgTable(
  "idempotency_keys",
  {
    id: primaryId(),
    operation: varchar("operation", { length: 100 }).notNull(),
    key: varchar("key", { length: 180 }).notNull(),
    userId: uuid("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    requestHash: varchar("request_hash", { length: 64 }).notNull(),
    responseCode: integer("response_code"),
    responseBody: jsonb("response_body").$type<Record<string, unknown>>(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("idempotency_keys_operation_key_uidx").on(
      table.operation,
      table.key,
    ),
    index("idempotency_keys_expiry_idx").on(table.expiresAt),
  ],
);
