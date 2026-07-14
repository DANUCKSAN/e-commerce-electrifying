"use client";

import { useCartStore } from "./cart-provider";

const currency = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function CartSummary() {
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const lines = Object.values(items);
  const itemCount = lines.reduce((total, item) => total + item.quantity, 0);
  const quoteTotal = lines.reduce(
    (total, item) => total + item.quantity * item.priceCents,
    0,
  );

  return (
    <div className="cart-summary" aria-live="polite">
      <span className="cart-summary__label">Project quote</span>
      <strong>
        {itemCount} {itemCount === 1 ? "item" : "items"}
      </strong>
      <span>{currency.format(quoteTotal / 100)}</span>
      <button
        type="button"
        aria-disabled={itemCount === 0}
        onClick={() => {
          if (itemCount > 0) clear();
        }}
      >
        Clear
      </button>
    </div>
  );
}
