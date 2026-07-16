import { timestamp, uuid } from "drizzle-orm/pg-core";

export const primaryId = () => uuid("id").defaultRandom().primaryKey();

export const auditTimestamps = () => ({
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
