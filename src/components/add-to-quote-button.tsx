"use client";

import { useCartStore } from "./cart-provider";

type AddToQuoteButtonProps = {
  disabled?: boolean;
  product: {
    id: string;
    name: string;
    priceCents: number;
  };
};

export function AddToQuoteButton({
  disabled = false,
  product,
}: AddToQuoteButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const quantity = useCartStore(
    (state) => state.items[product.id]?.quantity ?? 0,
  );

  return (
    <button
      className="quote-button"
      type="button"
      disabled={disabled}
      onClick={() => addItem(product)}
      aria-label={
        disabled
          ? `${product.name} is out of stock`
          : `Add ${product.name} to quote`
      }
    >
      <span>
        {disabled
          ? "Out of stock"
          : quantity > 0
            ? `${quantity} in quote`
            : "Add to quote"}
      </span>
      <span aria-hidden="true">+</span>
    </button>
  );
}
