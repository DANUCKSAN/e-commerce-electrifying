import {
  BatteryCharging,
  CarFront,
  PackageCheck,
  Snowflake,
  SunMedium,
  type LucideIcon,
} from "lucide-react";

import type { ProductSector, StorefrontProduct } from "@/lib/storefront-products";

export interface ProductCardProps {
  product: StorefrontProduct;
  className?: string;
}

const money = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

const sectorStyles: Record<
  ProductSector,
  {
    icon: LucideIcon;
    image: string;
    label: string;
    accent: string;
    iconSurface: string;
  }
> = {
  solar: {
    icon: SunMedium,
    image: "from-amber-50 via-orange-50 to-white",
    label: "bg-amber-100 text-amber-950 ring-amber-200",
    accent: "bg-amber-400",
    iconSurface: "bg-amber-400 text-amber-950",
  },
  storage: {
    icon: BatteryCharging,
    image: "from-emerald-50 via-teal-50 to-white",
    label: "bg-emerald-100 text-emerald-950 ring-emerald-200",
    accent: "bg-emerald-400",
    iconSurface: "bg-emerald-400 text-emerald-950",
  },
  charging: {
    icon: CarFront,
    image: "from-cyan-50 via-sky-50 to-white",
    label: "bg-cyan-100 text-cyan-950 ring-cyan-200",
    accent: "bg-cyan-400",
    iconSurface: "bg-cyan-400 text-cyan-950",
  },
  outdoors: {
    icon: Snowflake,
    image: "from-lime-50 via-emerald-50 to-white",
    label: "bg-lime-100 text-lime-950 ring-lime-200",
    accent: "bg-lime-400",
    iconSurface: "bg-lime-400 text-lime-950",
  },
};

export function ProductCard({ product, className = "" }: ProductCardProps) {
  const styles = sectorStyles[product.sector];
  const Icon = styles.icon;
  const isOutOfStock = product.stock <= 0;
  const badge = isOutOfStock
    ? "Out of stock"
    : product.stock <= 20
      ? "Limited stock"
      : product.featured
        ? "Featured"
        : "In stock";

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-dark-900/8 bg-light-100 shadow-[0_16px_50px_rgba(17,17,17,0.055)] transition-[transform,box-shadow,border-color] duration-500 ease-out motion-reduce:transition-none motion-safe:hover:-translate-y-1.5 motion-safe:hover:border-dark-900/15 motion-safe:hover:shadow-[0_24px_70px_rgba(17,17,17,0.11)] ${className}`}
    >
      <div
        className={`relative isolate aspect-[4/3] overflow-hidden bg-gradient-to-br ${styles.image}`}
      >
        <span
          aria-hidden="true"
          className={`absolute -right-12 -top-12 size-40 rounded-full opacity-30 blur-3xl transition-transform duration-700 motion-reduce:transition-none motion-safe:group-hover:-translate-x-4 motion-safe:group-hover:translate-y-4 ${styles.accent}`}
        />
        <span
          aria-hidden="true"
          className="absolute -bottom-20 -left-12 size-48 rounded-full border-[2.5rem] border-white/45"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-5 right-5 text-[clamp(3.5rem,8vw,5.5rem)] font-bold leading-none tracking-[-0.08em] text-dark-900/[0.055]"
        >
          {product.brand.slice(0, 2).toUpperCase()}
        </span>

        <span
          className={`absolute left-3 top-3 inline-flex min-h-8 items-center rounded-full px-3 text-footnote font-semibold ring-1 ring-inset sm:left-4 sm:top-4 ${styles.label}`}
        >
          {product.sectorLabel}
        </span>

        <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 sm:inset-x-6 sm:bottom-6">
          <span
            className={`flex size-14 items-center justify-center rounded-[1.1rem] shadow-[0_12px_28px_rgba(17,17,17,0.12)] ${styles.iconSurface}`}
          >
            <Icon aria-hidden="true" className="size-6" strokeWidth={1.7} />
          </span>
          <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-dark-900/86 px-3 text-footnote font-medium text-light-100 backdrop-blur-md">
            <span
              aria-hidden="true"
              className={`size-1.5 rounded-full ${isOutOfStock ? "bg-red" : "bg-emerald-300"}`}
            />
            {badge}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-footnote font-semibold uppercase tracking-[0.15em] text-green">
          {product.brand}
        </p>
        <h3 className="mt-2 text-[1.35rem] font-semibold leading-[1.15] tracking-[-0.035em] text-dark-900 sm:text-[1.5rem]">
          {product.name}
        </h3>

        <div className="mt-5 border-t border-light-300 pt-4">
          <p className="text-footnote uppercase tracking-[0.13em] text-dark-500">
            Key specification
          </p>
          <p className="mt-1.5 text-caption font-semibold text-dark-900">
            {product.specification}
          </p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <div>
            <p className="text-footnote text-dark-700">Price from</p>
            <p className="mt-0.5 text-[1.7rem] font-bold leading-none tracking-[-0.05em] text-dark-900">
              {money.format(product.priceCents / 100)}
            </p>
          </div>
          <p className="flex items-center gap-1.5 text-right text-footnote text-dark-700">
            <PackageCheck
              aria-hidden="true"
              className="size-4 shrink-0 text-green"
              strokeWidth={1.8}
            />
            {isOutOfStock ? "Unavailable" : `${product.stock} available`}
          </p>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
