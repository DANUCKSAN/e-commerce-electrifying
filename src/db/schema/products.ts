import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  manufacturer: varchar("manufacturer", { length: 120 }).notNull(),
  specification: varchar("specification", { length: 80 }).notNull(),
  priceCents: integer("price_cents").notNull(),
  stock: integer("stock").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
