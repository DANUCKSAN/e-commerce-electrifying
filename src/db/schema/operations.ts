import {
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

import { primaryId } from "./common";
import { user } from "./user";

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: primaryId(),
    actorUserId: uuid("actor_user_id").references(() => user.id, {
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
