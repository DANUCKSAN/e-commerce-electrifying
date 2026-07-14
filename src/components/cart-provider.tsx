"use client";

import { createContext, useContext, useState } from "react";
import { useStore } from "zustand";

import {
  createCartStore,
  type CartStore,
} from "@/stores/cart-store";

type CartStoreApi = ReturnType<typeof createCartStore>;

const CartStoreContext = createContext<CartStoreApi | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => createCartStore());

  return (
    <CartStoreContext.Provider value={store}>
      {children}
    </CartStoreContext.Provider>
  );
}

export function useCartStore<T>(selector: (store: CartStore) => T) {
  const store = useContext(CartStoreContext);

  if (!store) {
    throw new Error("useCartStore must be used inside CartProvider.");
  }

  return useStore(store, selector);
}
