import { relations } from "drizzle-orm";

import { account } from "./account";
import { brands, products, productVariants } from "./catalog";
import { carts, orderItems, orders } from "./commerce";
import { customerProfiles } from "./customers";
import { inventoryLevels } from "./inventory";
import { productPrices } from "./pricing";
import { session } from "./session";
import { user } from "./user";

export * from "./account";
export * from "./catalog";
export * from "./commerce";
export * from "./customers";
export * from "./fulfillment";
export * from "./guest";
export * from "./inventory";
export * from "./marketing";
export * from "./operations";
export * from "./pricing";
export * from "./session";
export * from "./user";
export * from "./verification";
export * from "./warranty";

export const userRelations = relations(user, ({ many, one }) => ({
  accounts: many(account),
  sessions: many(session),
  carts: many(carts),
  customerProfile: one(customerProfiles),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const customerProfileRelations = relations(
  customerProfiles,
  ({ one }) => ({
    user: one(user, {
      fields: [customerProfiles.userId],
      references: [user.id],
    }),
  }),
);

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const productsRelations = relations(products, ({ many, one }) => ({
  variants: many(productVariants),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
}));

export const productVariantRelations = relations(
  productVariants,
  ({ many, one }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    prices: many(productPrices),
    inventoryLevels: many(inventoryLevels),
  }),
);

export const orderRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));
