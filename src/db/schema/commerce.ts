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

import { productVariants } from "./catalog";
import { auditTimestamps, primaryId } from "./common";
import { guest } from "./guest";
import { sellers } from "./marketplace";
import { sellerOffers } from "./offers";
import { user } from "./user";

export const carts = pgTable(
  "carts",
  {
    id: primaryId(),
    userId: uuid("user_id").references(() => user.id, {
      onDelete: "cascade",
    }),
    guestId: uuid("guest_id").references(() => guest.id, {
      onDelete: "cascade",
    }),
    status: varchar("status", { length: 24 }).notNull().default("active"),
    currency: varchar("currency", { length: 3 }).notNull().default("AUD"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    version: integer("version").notNull().default(1),
    ...auditTimestamps(),
  },
  (table) => [
    index("carts_user_status_idx").on(table.userId, table.status),
    index("carts_guest_status_idx").on(table.guestId, table.status),
    index("carts_expiry_idx").on(table.expiresAt),
    uniqueIndex("carts_active_user_uidx")
      .on(table.userId)
      .where(sql`${table.userId} is not null and ${table.status} = 'active'`),
    uniqueIndex("carts_active_guest_uidx")
      .on(table.guestId)
      .where(sql`${table.guestId} is not null and ${table.status} = 'active'`),
    check(
      "carts_owner_check",
      sql`num_nonnulls(${table.userId}, ${table.guestId}) = 1`,
    ),
    check(
      "carts_status_check",
      sql`${table.status} in ('active', 'checkout', 'converted', 'abandoned', 'expired')`,
    ),
  ],
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: primaryId(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    offerId: uuid("offer_id")
      .notNull()
      .references(() => sellerOffers.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    addedUnitAmountMinor: bigint("added_unit_amount_minor", {
      mode: "number",
    }).notNull(),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("cart_items_cart_offer_uidx").on(table.cartId, table.offerId),
    index("cart_items_offer_id_idx").on(table.offerId),
    check("cart_items_quantity_check", sql`${table.quantity} > 0`),
    check(
      "cart_items_amount_check",
      sql`${table.addedUnitAmountMinor} >= 0`,
    ),
  ],
);

export const quoteRequests = pgTable(
  "quote_requests",
  {
    id: primaryId(),
    requestNumber: varchar("request_number", { length: 40 }).notNull(),
    userId: uuid("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    guestId: uuid("guest_id").references(() => guest.id, {
      onDelete: "set null",
    }),
    cartId: uuid("cart_id").references(() => carts.id, {
      onDelete: "set null",
    }),
    customerEmail: varchar("customer_email", { length: 320 }).notNull(),
    projectType: varchar("project_type", { length: 40 }).notNull(),
    status: varchar("status", { length: 24 }).notNull().default("submitted"),
    siteAddressSnapshot: jsonb("site_address_snapshot")
      .$type<Record<string, unknown>>()
      .notNull(),
    notes: text("notes"),
    neededBy: timestamp("needed_by", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("quote_requests_number_uidx").on(table.requestNumber),
    index("quote_requests_user_created_idx").on(
      table.userId,
      table.createdAt,
    ),
    index("quote_requests_status_created_idx").on(
      table.status,
      table.createdAt,
    ),
    check(
      "quote_requests_owner_check",
      sql`num_nonnulls(${table.userId}, ${table.guestId}) >= 1`,
    ),
    check(
      "quote_requests_status_check",
      sql`${table.status} in ('draft', 'submitted', 'reviewing', 'quoted', 'accepted', 'declined', 'expired', 'cancelled')`,
    ),
  ],
);

export const quoteRequestItems = pgTable(
  "quote_request_items",
  {
    id: primaryId(),
    quoteRequestId: uuid("quote_request_id")
      .notNull()
      .references(() => quoteRequests.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),
    preferredOfferId: uuid("preferred_offer_id").references(
      () => sellerOffers.id,
      { onDelete: "set null" },
    ),
    quantity: integer("quantity").notNull(),
    requirements: jsonb("requirements")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    notes: text("notes"),
  },
  (table) => [
    index("quote_request_items_request_idx").on(table.quoteRequestId),
    check("quote_request_items_quantity_check", sql`${table.quantity} > 0`),
  ],
);

export const quotes = pgTable(
  "quotes",
  {
    id: primaryId(),
    quoteNumber: varchar("quote_number", { length: 40 }).notNull(),
    quoteRequestId: uuid("quote_request_id")
      .notNull()
      .references(() => quoteRequests.id, { onDelete: "restrict" }),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => sellers.id, { onDelete: "restrict" }),
    revision: integer("revision").notNull().default(1),
    status: varchar("status", { length: 24 }).notNull().default("draft"),
    currency: varchar("currency", { length: 3 }).notNull().default("AUD"),
    subtotalMinor: bigint("subtotal_minor", { mode: "number" }).notNull(),
    discountMinor: bigint("discount_minor", { mode: "number" })
      .notNull()
      .default(0),
    taxMinor: bigint("tax_minor", { mode: "number" }).notNull(),
    totalMinor: bigint("total_minor", { mode: "number" }).notNull(),
    terms: text("terms"),
    validUntil: timestamp("valid_until", { withTimezone: true }).notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    rejectedAt: timestamp("rejected_at", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("quotes_number_uidx").on(table.quoteNumber),
    uniqueIndex("quotes_request_seller_revision_uidx").on(
      table.quoteRequestId,
      table.sellerId,
      table.revision,
    ),
    index("quotes_seller_status_idx").on(table.sellerId, table.status),
    check(
      "quotes_status_check",
      sql`${table.status} in ('draft', 'sent', 'accepted', 'rejected', 'expired', 'withdrawn')`,
    ),
    check(
      "quotes_amounts_check",
      sql`${table.subtotalMinor} >= 0 and ${table.discountMinor} >= 0
        and ${table.taxMinor} >= 0 and ${table.totalMinor} >= 0`,
    ),
  ],
);

export const quoteItems = pgTable(
  "quote_items",
  {
    id: primaryId(),
    quoteId: uuid("quote_id")
      .notNull()
      .references(() => quotes.id, { onDelete: "cascade" }),
    offerId: uuid("offer_id").references(() => sellerOffers.id, {
      onDelete: "set null",
    }),
    variantId: uuid("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),
    description: text("description").notNull(),
    quantity: integer("quantity").notNull(),
    unitPriceMinor: bigint("unit_price_minor", { mode: "number" }).notNull(),
    discountMinor: bigint("discount_minor", { mode: "number" })
      .notNull()
      .default(0),
    taxMinor: bigint("tax_minor", { mode: "number" }).notNull(),
    lineTotalMinor: bigint("line_total_minor", { mode: "number" }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    index("quote_items_quote_sort_idx").on(table.quoteId, table.sortOrder),
    check("quote_items_quantity_check", sql`${table.quantity} > 0`),
    check(
      "quote_items_amounts_check",
      sql`${table.unitPriceMinor} >= 0 and ${table.discountMinor} >= 0
        and ${table.taxMinor} >= 0 and ${table.lineTotalMinor} >= 0`,
    ),
  ],
);

export const quoteEvents = pgTable(
  "quote_events",
  {
    id: primaryId(),
    quoteRequestId: uuid("quote_request_id")
      .notNull()
      .references(() => quoteRequests.id, { onDelete: "cascade" }),
    quoteId: uuid("quote_id").references(() => quotes.id, {
      onDelete: "cascade",
    }),
    actorUserId: uuid("actor_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    eventType: varchar("event_type", { length: 60 }).notNull(),
    fromStatus: varchar("from_status", { length: 24 }),
    toStatus: varchar("to_status", { length: 24 }),
    note: text("note"),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("quote_events_request_time_idx").on(
      table.quoteRequestId,
      table.occurredAt,
    ),
  ],
);

export const checkoutSessions = pgTable(
  "checkout_sessions",
  {
    id: primaryId(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "restrict" }),
    quoteId: uuid("quote_id").references(() => quotes.id, {
      onDelete: "restrict",
    }),
    userId: uuid("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    guestId: uuid("guest_id").references(() => guest.id, {
      onDelete: "set null",
    }),
    status: varchar("status", { length: 24 }).notNull().default("open"),
    currency: varchar("currency", { length: 3 }).notNull().default("AUD"),
    idempotencyKey: varchar("idempotency_key", { length: 160 }).notNull(),
    pricingSnapshotHash: varchar("pricing_snapshot_hash", { length: 64 }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("checkout_sessions_idempotency_uidx").on(table.idempotencyKey),
    index("checkout_sessions_cart_idx").on(table.cartId, table.status),
    index("checkout_sessions_expiry_idx").on(table.status, table.expiresAt),
    check(
      "checkout_sessions_owner_check",
      sql`num_nonnulls(${table.userId}, ${table.guestId}) >= 1`,
    ),
    check(
      "checkout_sessions_status_check",
      sql`${table.status} in ('open', 'processing', 'completed', 'expired', 'cancelled')`,
    ),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id: primaryId(),
    orderNumber: varchar("order_number", { length: 40 }).notNull(),
    checkoutSessionId: uuid("checkout_session_id")
      .notNull()
      .references(() => checkoutSessions.id, { onDelete: "restrict" }),
    userId: uuid("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    guestId: uuid("guest_id").references(() => guest.id, {
      onDelete: "set null",
    }),
    customerEmail: varchar("customer_email", { length: 320 }).notNull(),
    status: varchar("status", { length: 32 })
      .notNull()
      .default("pending_payment"),
    paymentStatus: varchar("payment_status", { length: 32 })
      .notNull()
      .default("unpaid"),
    fulfillmentStatus: varchar("fulfillment_status", { length: 32 })
      .notNull()
      .default("unfulfilled"),
    currency: varchar("currency", { length: 3 }).notNull().default("AUD"),
    subtotalMinor: bigint("subtotal_minor", { mode: "number" }).notNull(),
    discountMinor: bigint("discount_minor", { mode: "number" })
      .notNull()
      .default(0),
    shippingMinor: bigint("shipping_minor", { mode: "number" })
      .notNull()
      .default(0),
    taxMinor: bigint("tax_minor", { mode: "number" }).notNull(),
    totalMinor: bigint("total_minor", { mode: "number" }).notNull(),
    customerNotes: text("customer_notes"),
    placedAt: timestamp("placed_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    version: integer("version").notNull().default(1),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("orders_number_uidx").on(table.orderNumber),
    uniqueIndex("orders_checkout_session_uidx").on(table.checkoutSessionId),
    index("orders_user_created_idx").on(table.userId, table.createdAt),
    index("orders_status_created_idx").on(table.status, table.createdAt),
    check(
      "orders_amounts_check",
      sql`${table.subtotalMinor} >= 0 and ${table.discountMinor} >= 0
        and ${table.shippingMinor} >= 0 and ${table.taxMinor} >= 0
        and ${table.totalMinor} >= 0`,
    ),
    check(
      "orders_status_check",
      sql`${table.status} in ('pending_payment', 'confirmed', 'processing', 'partially_fulfilled', 'fulfilled', 'completed', 'cancelled')`,
    ),
    check(
      "orders_payment_status_check",
      sql`${table.paymentStatus} in ('unpaid', 'authorized', 'paid', 'partially_refunded', 'refunded', 'failed', 'cancelled')`,
    ),
    check(
      "orders_fulfillment_status_check",
      sql`${table.fulfillmentStatus} in ('unfulfilled', 'partially_fulfilled', 'fulfilled', 'returned')`,
    ),
  ],
);

export const sellerOrders = pgTable(
  "seller_orders",
  {
    id: primaryId(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => sellers.id, { onDelete: "restrict" }),
    sellerOrderNumber: varchar("seller_order_number", { length: 48 }).notNull(),
    status: varchar("status", { length: 32 })
      .notNull()
      .default("pending"),
    fulfillmentStatus: varchar("fulfillment_status", { length: 32 })
      .notNull()
      .default("unfulfilled"),
    currency: varchar("currency", { length: 3 }).notNull().default("AUD"),
    subtotalMinor: bigint("subtotal_minor", { mode: "number" }).notNull(),
    discountMinor: bigint("discount_minor", { mode: "number" })
      .notNull()
      .default(0),
    shippingMinor: bigint("shipping_minor", { mode: "number" })
      .notNull()
      .default(0),
    taxMinor: bigint("tax_minor", { mode: "number" }).notNull(),
    totalMinor: bigint("total_minor", { mode: "number" }).notNull(),
    commissionMinor: bigint("commission_minor", { mode: "number" })
      .notNull()
      .default(0),
    payoutStatus: varchar("payout_status", { length: 24 })
      .notNull()
      .default("pending"),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("seller_orders_number_uidx").on(table.sellerOrderNumber),
    uniqueIndex("seller_orders_order_seller_uidx").on(
      table.orderId,
      table.sellerId,
    ),
    index("seller_orders_seller_status_idx").on(
      table.sellerId,
      table.status,
      table.createdAt,
    ),
    check(
      "seller_orders_status_check",
      sql`${table.status} in ('pending', 'accepted', 'processing', 'partially_fulfilled', 'fulfilled', 'completed', 'cancelled')`,
    ),
    check(
      "seller_orders_fulfillment_status_check",
      sql`${table.fulfillmentStatus} in ('unfulfilled', 'partially_fulfilled', 'fulfilled', 'returned')`,
    ),
    check(
      "seller_orders_payout_status_check",
      sql`${table.payoutStatus} in ('pending', 'available', 'processing', 'paid', 'held', 'reversed')`,
    ),
    check(
      "seller_orders_amounts_check",
      sql`${table.subtotalMinor} >= 0 and ${table.discountMinor} >= 0
        and ${table.shippingMinor} >= 0 and ${table.taxMinor} >= 0
        and ${table.totalMinor} >= 0 and ${table.commissionMinor} >= 0`,
    ),
  ],
);

export const orderAddresses = pgTable(
  "order_addresses",
  {
    id: primaryId(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    addressType: varchar("address_type", { length: 16 }).notNull(),
    recipientName: varchar("recipient_name", { length: 180 }).notNull(),
    companyName: varchar("company_name", { length: 200 }),
    addressLine1: varchar("address_line_1", { length: 200 }).notNull(),
    addressLine2: varchar("address_line_2", { length: 200 }),
    suburb: varchar("suburb", { length: 120 }).notNull(),
    state: varchar("state", { length: 80 }).notNull(),
    postcode: varchar("postcode", { length: 16 }).notNull(),
    countryCode: varchar("country_code", { length: 2 }).notNull(),
    phoneE164: varchar("phone_e164", { length: 20 }),
    deliveryInstructions: text("delivery_instructions"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("order_addresses_order_type_uidx").on(
      table.orderId,
      table.addressType,
    ),
    check(
      "order_addresses_type_check",
      sql`${table.addressType} in ('billing', 'shipping', 'site')`,
    ),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: primaryId(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    sellerOrderId: uuid("seller_order_id")
      .notNull()
      .references(() => sellerOrders.id, { onDelete: "restrict" }),
    offerId: uuid("offer_id").references(() => sellerOffers.id, {
      onDelete: "set null",
    }),
    variantId: uuid("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),
    productName: varchar("product_name", { length: 180 }).notNull(),
    variantName: varchar("variant_name", { length: 180 }).notNull(),
    brandName: varchar("brand_name", { length: 160 }).notNull(),
    sku: varchar("sku", { length: 100 }).notNull(),
    quantity: integer("quantity").notNull(),
    unitPriceMinor: bigint("unit_price_minor", { mode: "number" }).notNull(),
    unitCostMinor: bigint("unit_cost_minor", { mode: "number" }),
    discountMinor: bigint("discount_minor", { mode: "number" })
      .notNull()
      .default(0),
    taxMinor: bigint("tax_minor", { mode: "number" }).notNull(),
    lineTotalMinor: bigint("line_total_minor", { mode: "number" }).notNull(),
    productSnapshot: jsonb("product_snapshot")
      .$type<Record<string, unknown>>()
      .notNull(),
    fulfillmentStatus: varchar("fulfillment_status", { length: 32 })
      .notNull()
      .default("unfulfilled"),
    returnableUntil: timestamp("returnable_until", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [
    index("order_items_order_id_idx").on(table.orderId),
    index("order_items_seller_order_idx").on(table.sellerOrderId),
    index("order_items_offer_id_idx").on(table.offerId),
    check("order_items_quantity_check", sql`${table.quantity} > 0`),
    check(
      "order_items_amounts_check",
      sql`${table.unitPriceMinor} >= 0
        and (${table.unitCostMinor} is null or ${table.unitCostMinor} >= 0)
        and ${table.discountMinor} >= 0 and ${table.taxMinor} >= 0
        and ${table.lineTotalMinor} >= 0`,
    ),
  ],
);

export const orderAdjustments = pgTable(
  "order_adjustments",
  {
    id: primaryId(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    orderItemId: uuid("order_item_id").references(() => orderItems.id, {
      onDelete: "restrict",
    }),
    adjustmentType: varchar("adjustment_type", { length: 32 }).notNull(),
    code: varchar("code", { length: 80 }),
    label: varchar("label", { length: 200 }).notNull(),
    amountMinor: bigint("amount_minor", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("order_adjustments_order_id_idx").on(table.orderId)],
);

export const orderTaxLines = pgTable(
  "order_tax_lines",
  {
    id: primaryId(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    orderItemId: uuid("order_item_id").references(() => orderItems.id, {
      onDelete: "restrict",
    }),
    taxName: varchar("tax_name", { length: 100 }).notNull(),
    jurisdiction: varchar("jurisdiction", { length: 100 }).notNull(),
    rate: numeric("rate", { precision: 9, scale: 6 }).notNull(),
    taxableAmountMinor: bigint("taxable_amount_minor", {
      mode: "number",
    }).notNull(),
    taxAmountMinor: bigint("tax_amount_minor", { mode: "number" }).notNull(),
  },
  (table) => [
    index("order_tax_lines_order_id_idx").on(table.orderId),
    check(
      "order_tax_lines_amounts_check",
      sql`${table.rate} >= 0 and ${table.taxableAmountMinor} >= 0 and ${table.taxAmountMinor} >= 0`,
    ),
  ],
);

export const orderStatusHistory = pgTable(
  "order_status_history",
  {
    id: primaryId(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    sellerOrderId: uuid("seller_order_id").references(() => sellerOrders.id, {
      onDelete: "restrict",
    }),
    actorUserId: uuid("actor_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    statusType: varchar("status_type", { length: 32 }).notNull(),
    fromStatus: varchar("from_status", { length: 32 }),
    toStatus: varchar("to_status", { length: 32 }).notNull(),
    reason: text("reason"),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("order_status_history_order_time_idx").on(
      table.orderId,
      table.occurredAt,
    ),
  ],
);

export const paymentIntents = pgTable(
  "payment_intents",
  {
    id: primaryId(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    provider: varchar("provider", { length: 40 }).notNull(),
    providerIntentId: varchar("provider_intent_id", { length: 200 }),
    status: varchar("status", { length: 32 }).notNull().default("created"),
    amountMinor: bigint("amount_minor", { mode: "number" }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    idempotencyKey: varchar("idempotency_key", { length: 160 }).notNull(),
    failureCode: varchar("failure_code", { length: 100 }),
    failureMessage: text("failure_message"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("payment_intents_idempotency_uidx").on(table.idempotencyKey),
    uniqueIndex("payment_intents_provider_id_uidx")
      .on(table.provider, table.providerIntentId)
      .where(sql`${table.providerIntentId} is not null`),
    index("payment_intents_order_id_idx").on(table.orderId),
    check("payment_intents_amount_check", sql`${table.amountMinor} >= 0`),
    check(
      "payment_intents_status_check",
      sql`${table.status} in ('created', 'requires_action', 'authorized', 'captured', 'failed', 'cancelled', 'expired')`,
    ),
  ],
);

export const paymentTransactions = pgTable(
  "payment_transactions",
  {
    id: primaryId(),
    paymentIntentId: uuid("payment_intent_id")
      .notNull()
      .references(() => paymentIntents.id, { onDelete: "restrict" }),
    transactionType: varchar("transaction_type", { length: 24 }).notNull(),
    providerTransactionId: varchar("provider_transaction_id", {
      length: 200,
    }),
    status: varchar("status", { length: 24 }).notNull(),
    amountMinor: bigint("amount_minor", { mode: "number" }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    providerResponse: jsonb("provider_response").$type<
      Record<string, unknown>
    >(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [
    index("payment_transactions_intent_idx").on(table.paymentIntentId),
    uniqueIndex("payment_transactions_provider_uidx")
      .on(table.providerTransactionId)
      .where(sql`${table.providerTransactionId} is not null`),
    check(
      "payment_transactions_type_check",
      sql`${table.transactionType} in ('authorize', 'capture', 'void', 'refund', 'chargeback')`,
    ),
    check("payment_transactions_amount_check", sql`${table.amountMinor} >= 0`),
  ],
);

export const refunds = pgTable(
  "refunds",
  {
    id: primaryId(),
    refundNumber: varchar("refund_number", { length: 40 }).notNull(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    paymentIntentId: uuid("payment_intent_id")
      .notNull()
      .references(() => paymentIntents.id, { onDelete: "restrict" }),
    providerRefundId: varchar("provider_refund_id", { length: 200 }),
    status: varchar("status", { length: 24 }).notNull().default("requested"),
    reason: text("reason").notNull(),
    amountMinor: bigint("amount_minor", { mode: "number" }).notNull(),
    requestedBy: uuid("requested_by").references(() => user.id, {
      onDelete: "set null",
    }),
    approvedBy: uuid("approved_by").references(() => user.id, {
      onDelete: "set null",
    }),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("refunds_number_uidx").on(table.refundNumber),
    uniqueIndex("refunds_provider_id_uidx")
      .on(table.providerRefundId)
      .where(sql`${table.providerRefundId} is not null`),
    index("refunds_order_id_idx").on(table.orderId),
    check("refunds_amount_check", sql`${table.amountMinor} >= 0`),
    check(
      "refunds_status_check",
      sql`${table.status} in ('requested', 'approved', 'processing', 'succeeded', 'failed', 'cancelled')`,
    ),
  ],
);

export const refundItems = pgTable(
  "refund_items",
  {
    refundId: uuid("refund_id")
      .notNull()
      .references(() => refunds.id, { onDelete: "restrict" }),
    orderItemId: uuid("order_item_id")
      .notNull()
      .references(() => orderItems.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    amountMinor: bigint("amount_minor", { mode: "number" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.refundId, table.orderItemId] }),
    check("refund_items_quantity_check", sql`${table.quantity} > 0`),
    check("refund_items_amount_check", sql`${table.amountMinor} >= 0`),
  ],
);

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: primaryId(),
    provider: varchar("provider", { length: 40 }).notNull(),
    providerEventId: varchar("provider_event_id", { length: 200 }).notNull(),
    eventType: varchar("event_type", { length: 120 }).notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    status: varchar("status", { length: 24 }).notNull().default("received"),
    attemptCount: integer("attempt_count").notNull().default(0),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }),
    lastError: text("last_error"),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("webhook_events_provider_event_uidx").on(
      table.provider,
      table.providerEventId,
    ),
    index("webhook_events_processing_idx").on(
      table.status,
      table.nextAttemptAt,
    ),
  ],
);

export type Cart = typeof carts.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
