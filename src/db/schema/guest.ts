import { index, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

export const guest = pgTable(
  "guest",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionToken: uuid("session_token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (table) => [index("guest_expires_at_idx").on(table.expiresAt)],
);

export type GuestRecord = typeof guest.$inferSelect;
export type NewGuestRecord = typeof guest.$inferInsert;
