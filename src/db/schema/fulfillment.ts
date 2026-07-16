import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { orderItems, orders, refunds, sellerOrders } from "./commerce";
import { auditTimestamps, primaryId } from "./common";
import { warehouses } from "./inventory";
import { sellers } from "./marketplace";
import { user } from "./user";

export const shippingZones = pgTable(
  "shipping_zones",
  {
    id: primaryId(),
    sellerId: uuid("seller_id").references(() => sellers.id, {
      onDelete: "cascade",
    }),
    name: varchar("name", { length: 160 }).notNull(),
    status: varchar("status", { length: 24 }).notNull().default("active"),
    ...auditTimestamps(),
  },
  (table) => [index("shipping_zones_seller_status_idx").on(table.sellerId, table.status)],
);

export const shippingZoneRegions = pgTable(
  "shipping_zone_regions",
  {
    id: primaryId(),
    shippingZoneId: uuid("shipping_zone_id")
      .notNull()
      .references(() => shippingZones.id, { onDelete: "cascade" }),
    countryCode: varchar("country_code", { length: 2 }).notNull(),
    stateCode: varchar("state_code", { length: 16 }),
    postcodeFrom: varchar("postcode_from", { length: 16 }),
    postcodeTo: varchar("postcode_to", { length: 16 }),
  },
  (table) => [index("shipping_zone_regions_zone_idx").on(table.shippingZoneId)],
);

export const shippingMethods = pgTable(
  "shipping_methods",
  {
    id: primaryId(),
    sellerId: uuid("seller_id").references(() => sellers.id, {
      onDelete: "cascade",
    }),
    name: varchar("name", { length: 160 }).notNull(),
    carrier: varchar("carrier", { length: 100 }),
    serviceCode: varchar("service_code", { length: 100 }),
    minDeliveryDays: integer("min_delivery_days"),
    maxDeliveryDays: integer("max_delivery_days"),
    supportsTracking: boolean("supports_tracking").notNull().default(true),
    supportsDangerousGoods: boolean("supports_dangerous_goods")
      .notNull()
      .default(false),
    status: varchar("status", { length: 24 }).notNull().default("active"),
    ...auditTimestamps(),
  },
  (table) => [
    index("shipping_methods_seller_status_idx").on(table.sellerId, table.status),
    check(
      "shipping_methods_delivery_check",
      sql`(${table.minDeliveryDays} is null or ${table.minDeliveryDays} >= 0)
        and (${table.maxDeliveryDays} is null or ${table.maxDeliveryDays} >= ${table.minDeliveryDays})`,
    ),
  ],
);

export const shippingRates = pgTable(
  "shipping_rates",
  {
    id: primaryId(),
    shippingMethodId: uuid("shipping_method_id")
      .notNull()
      .references(() => shippingMethods.id, { onDelete: "cascade" }),
    shippingZoneId: uuid("shipping_zone_id")
      .notNull()
      .references(() => shippingZones.id, { onDelete: "cascade" }),
    minWeightG: integer("min_weight_g"),
    maxWeightG: integer("max_weight_g"),
    minOrderMinor: bigint("min_order_minor", { mode: "number" }),
    maxOrderMinor: bigint("max_order_minor", { mode: "number" }),
    amountMinor: bigint("amount_minor", { mode: "number" }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("AUD"),
    requiresFreight: boolean("requires_freight").notNull().default(false),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [
    index("shipping_rates_lookup_idx").on(
      table.shippingZoneId,
      table.shippingMethodId,
      table.startsAt,
    ),
    check("shipping_rates_amount_check", sql`${table.amountMinor} >= 0`),
    check(
      "shipping_rates_period_check",
      sql`${table.endsAt} is null or ${table.endsAt} > ${table.startsAt}`,
    ),
  ],
);

export const shipments = pgTable(
  "shipments",
  {
    id: primaryId(),
    sellerOrderId: uuid("seller_order_id")
      .notNull()
      .references(() => sellerOrders.id, { onDelete: "restrict" }),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => warehouses.id, { onDelete: "restrict" }),
    shipmentNumber: varchar("shipment_number", { length: 48 }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    carrier: varchar("carrier", { length: 100 }),
    service: varchar("service", { length: 100 }),
    trackingNumber: varchar("tracking_number", { length: 160 }),
    trackingUrl: text("tracking_url"),
    shippedAt: timestamp("shipped_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("shipments_number_uidx").on(table.shipmentNumber),
    uniqueIndex("shipments_carrier_tracking_uidx")
      .on(table.carrier, table.trackingNumber)
      .where(sql`${table.trackingNumber} is not null`),
    index("shipments_seller_order_idx").on(table.sellerOrderId, table.status),
    check(
      "shipments_status_check",
      sql`${table.status} in ('pending', 'packed', 'shipped', 'in_transit', 'delivered', 'failed', 'cancelled', 'returned')`,
    ),
  ],
);

export const shipmentItems = pgTable(
  "shipment_items",
  {
    shipmentId: uuid("shipment_id")
      .notNull()
      .references(() => shipments.id, { onDelete: "restrict" }),
    orderItemId: uuid("order_item_id")
      .notNull()
      .references(() => orderItems.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.shipmentId, table.orderItemId] }),
    check("shipment_items_quantity_check", sql`${table.quantity} > 0`),
  ],
);

export const trackingEvents = pgTable(
  "tracking_events",
  {
    id: primaryId(),
    shipmentId: uuid("shipment_id")
      .notNull()
      .references(() => shipments.id, { onDelete: "restrict" }),
    carrierEventId: varchar("carrier_event_id", { length: 200 }),
    eventCode: varchar("event_code", { length: 80 }),
    status: varchar("status", { length: 80 }).notNull(),
    description: text("description"),
    location: varchar("location", { length: 200 }),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("tracking_events_shipment_time_idx").on(
      table.shipmentId,
      table.occurredAt,
    ),
    uniqueIndex("tracking_events_carrier_event_uidx")
      .on(table.carrierEventId)
      .where(sql`${table.carrierEventId} is not null`),
  ],
);

export const returns = pgTable(
  "returns",
  {
    id: primaryId(),
    returnNumber: varchar("return_number", { length: 48 }).notNull(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    sellerOrderId: uuid("seller_order_id")
      .notNull()
      .references(() => sellerOrders.id, { onDelete: "restrict" }),
    refundId: uuid("refund_id").references(() => refunds.id, {
      onDelete: "set null",
    }),
    requestedBy: uuid("requested_by").references(() => user.id, {
      onDelete: "set null",
    }),
    status: varchar("status", { length: 32 }).notNull().default("requested"),
    reason: text("reason").notNull(),
    requestedResolution: varchar("requested_resolution", {
      length: 32,
    }).notNull(),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    receivedAt: timestamp("received_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("returns_number_uidx").on(table.returnNumber),
    index("returns_order_id_idx").on(table.orderId),
    index("returns_seller_status_idx").on(table.sellerOrderId, table.status),
    check(
      "returns_status_check",
      sql`${table.status} in ('requested', 'approved', 'rejected', 'in_transit', 'received', 'inspected', 'completed', 'cancelled')`,
    ),
    check(
      "returns_resolution_check",
      sql`${table.requestedResolution} in ('refund', 'replacement', 'repair', 'store_credit')`,
    ),
  ],
);

export const returnItems = pgTable(
  "return_items",
  {
    returnId: uuid("return_id")
      .notNull()
      .references(() => returns.id, { onDelete: "restrict" }),
    orderItemId: uuid("order_item_id")
      .notNull()
      .references(() => orderItems.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    reasonCode: varchar("reason_code", { length: 80 }).notNull(),
    condition: varchar("condition", { length: 80 }),
    inspectionNotes: text("inspection_notes"),
    restockDecision: varchar("restock_decision", { length: 32 }),
  },
  (table) => [
    primaryKey({ columns: [table.returnId, table.orderItemId] }),
    check("return_items_quantity_check", sql`${table.quantity} > 0`),
  ],
);

export const returnEvents = pgTable(
  "return_events",
  {
    id: primaryId(),
    returnId: uuid("return_id")
      .notNull()
      .references(() => returns.id, { onDelete: "restrict" }),
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
    index("return_events_return_time_idx").on(table.returnId, table.occurredAt),
  ],
);
