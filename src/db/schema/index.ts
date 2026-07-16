import { relations } from "drizzle-orm";

import { account } from "./account";
import { brands, products, productVariants } from "./catalog";
import { carts, orderItems, orders, sellerOrders } from "./commerce";
import { inventoryLevels, warehouses } from "./inventory";
import { customerProfiles, sellers } from "./marketplace";
import { offerPrices, sellerOffers } from "./offers";
import { session } from "./session";
import { user } from "./user";

export * from "./account";
export * from "./catalog";
export * from "./commerce";
export * from "./fulfillment";
export * from "./guest";
export * from "./inventory";
export * from "./marketing";
export * from "./marketplace";
export * from "./offers";
export * from "./operations";
export * from "./session";
export * from "./services";
export * from "./user";
export * from "./verification";

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
    offers: many(sellerOffers),
  }),
);

export const sellerRelations = relations(sellers, ({ many }) => ({
  offers: many(sellerOffers),
  warehouses: many(warehouses),
  sellerOrders: many(sellerOrders),
}));

export const sellerOfferRelations = relations(
  sellerOffers,
  ({ many, one }) => ({
    seller: one(sellers, {
      fields: [sellerOffers.sellerId],
      references: [sellers.id],
    }),
    variant: one(productVariants, {
      fields: [sellerOffers.variantId],
      references: [productVariants.id],
    }),
    prices: many(offerPrices),
    inventoryLevels: many(inventoryLevels),
  }),
);

export const orderRelations = relations(orders, ({ many }) => ({
  sellerOrders: many(sellerOrders),
  items: many(orderItems),
}));
