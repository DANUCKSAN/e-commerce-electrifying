import { createStore } from "zustand/vanilla";

export type QuoteProduct = {
  id: string;
  name: string;
  priceCents: number;
};

type QuoteLine = QuoteProduct & {
  quantity: number;
};

export type CartState = {
  items: Record<string, QuoteLine>;
};

export type CartActions = {
  addItem: (product: QuoteProduct) => void;
  clear: () => void;
};

export type CartStore = CartState & CartActions;

const defaultState: CartState = {
  items: {},
};

export const createCartStore = (initialState: CartState = defaultState) =>
  createStore<CartStore>()((set) => ({
    ...initialState,
    addItem: (product) =>
      set((state) => {
        const current = state.items[product.id];

        return {
          items: {
            ...state.items,
            [product.id]: {
              ...product,
              quantity: (current?.quantity ?? 0) + 1,
            },
          },
        };
      }),
    clear: () => set(defaultState),
  }));
