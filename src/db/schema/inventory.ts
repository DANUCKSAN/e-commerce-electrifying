import { sql } from "drizzle-orm";
import {
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

import { productVariants } from "./catalog";
import { checkoutSessions, orderItems } from "./commerce";
import { auditTimestamps, primaryId } from "./common";
import { user } from "./user";

export const warehouses = pgTable(
  "warehouses",
  {
    id: primaryId(),
    code: varchar("code", { length: 40 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    locationType: varchar("location_type", { length: 24 })
      .notNull()
      .default("office"),
    pickupEnabled: boolean("pickup_enabled").notNull().default(true),
    deliveryEnabled: boolean("delivery_enabled").notNull().default(true),
    addressLine1: varchar("address_line_1", { length: 200 }).notNull(),
    addressLine2: varchar("address_line_2", { length: 200 }),
    suburb: varchar("suburb", { length: 120 }).notNull(),
    state: varchar("state", { length: 80 }).notNull(),
    postcode: varchar("postcode", { length: 16 }).notNull(),
    countryCode: varchar("country_code", { length: 2 })
      .notNull()
      .default("AU"),
    timezone: varchar("timezone", { length: 64 })
      .notNull()
      .default("Australia/Sydney"),
    status: varchar("status", { length: 24 }).notNull().default("active"),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("warehouses_code_uidx").on(table.code),
    index("warehouses_status_idx").on(table.status),
    check(
      "warehouses_location_type_check",
      sql`${table.locationType} in ('office', 'warehouse')`,
    ),
    check(
      "warehouses_status_check",
      sql`${table.status} in ('active', 'inactive', 'closed')`,
    ),
  ],
);

export const inventoryLevels = pgTable(
  "inventory_levels",
  {
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => warehouses.id, { onDelete: "restrict" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),
    onHand: integer("on_hand").notNull().default(0),
    reserved: integer("reserved").notNull().default(0),
    incoming: integer("incoming").notNull().default(0),
    safetyStock: integer("safety_stock").notNull().default(0),
    version: integer("version").notNull().default(1),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    primaryKey({ columns: [table.warehouseId, table.variantId] }),
    index("inventory_levels_variant_id_idx").on(table.variantId),
    check(
      "inventory_levels_nonnegative_check",
      sql`${table.onHand} >= 0 and ${table.reserved} >= 0
        and ${table.incoming} >= 0 and ${table.safetyStock} >= 0`,
    ),
    check(
      "inventory_levels_reserved_check",
      sql`${table.reserved} <= ${table.onHand}`,
    ),
  ],
);

export const inventoryReservations = pgTable(
  "inventory_reservations",
  {
    id: primaryId(),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => warehouses.id, { onDelete: "restrict" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),
    checkoutSessionId: uuid("checkout_session_id")
      .notNull()
      .references(() => checkoutSessions.id, { onDelete: "restrict" }),
    orderItemId: uuid("order_item_id").references(() => orderItems.id, {
      onDelete: "restrict",
    }),
    quantity: integer("quantity").notNull(),
    status: varchar("status", { length: 24 }).notNull().default("active"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    committedAt: timestamp("committed_at", { withTimezone: true }),
    releasedAt: timestamp("released_at", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [
    index("inventory_reservations_checkout_idx").on(table.checkoutSessionId),
    index("inventory_reservations_expiry_idx").on(
      table.status,
      table.expiresAt,
    ),
    index("inventory_reservations_level_idx").on(
      table.warehouseId,
      table.variantId,
      table.status,
    ),
    check("inventory_reservations_quantity_check", sql`${table.quantity} > 0`),
    check(
      "inventory_reservations_status_check",
      sql`${table.status} in ('active', 'committed', 'released', 'expired')`,
    ),
  ],
);

export const inventoryMovements = pgTable(
  "inventory_movements",
  {
    id: primaryId(),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => warehouses.id, { onDelete: "restrict" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),
    movementType: varchar("movement_type", { length: 32 }).notNull(),
    quantityDelta: integer("quantity_delta").notNull(),
    balanceAfter: integer("balance_after").notNull(),
    reservationId: uuid("reservation_id").references(
      () => inventoryReservations.id,
      { onDelete: "restrict" },
    ),
    orderItemId: uuid("order_item_id").references(() => orderItems.id, {
      onDelete: "restrict",
    }),
    referenceType: varchar("reference_type", { length: 60 }),
    referenceId: uuid("reference_id"),
    reason: text("reason"),
    performedBy: uuid("performed_by").references(() => user.id, {
      onDelete: "set null",
    }),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("inventory_movements_level_time_idx").on(
      table.warehouseId,
      table.variantId,
      table.occurredAt,
    ),
    index("inventory_movements_reference_idx").on(
      table.referenceType,
      table.referenceId,
    ),
    uniqueIndex("inventory_movements_reference_uidx")
      .on(
        table.warehouseId,
        table.variantId,
        table.movementType,
        table.referenceType,
        table.referenceId,
      )
      .where(sql`${table.referenceId} is not null`),
    check(
      "inventory_movements_type_check",
      sql`${table.movementType} in ('receipt', 'reservation', 'release', 'sale', 'return', 'adjustment', 'transfer_in', 'transfer_out')`,
    ),
    check(
      "inventory_movements_delta_check",
      sql`${table.quantityDelta} <> 0 and ${table.balanceAfter} >= 0`,
    ),
  ],
);

export const inventorySerials = pgTable(
  "inventory_serials",
  {
    id: primaryId(),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => warehouses.id, { onDelete: "restrict" }),
    serialNumber: varchar("serial_number", { length: 180 }).notNull(),
    status: varchar("status", { length: 24 }).notNull().default("in_stock"),
    orderItemId: uuid("order_item_id").references(() => orderItems.id, {
      onDelete: "restrict",
    }),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull(),
    soldAt: timestamp("sold_at", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("inventory_serials_variant_serial_uidx").on(
      table.variantId,
      table.serialNumber,
    ),
    index("inventory_serials_warehouse_status_idx").on(
      table.warehouseId,
      table.status,
    ),
    check(
      "inventory_serials_status_check",
      sql`${table.status} in ('in_stock', 'reserved', 'sold', 'returned', 'damaged', 'retired')`,
    ),
  ],
);
