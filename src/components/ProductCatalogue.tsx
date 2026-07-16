import { SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";

import ProductCard from "@/components/ProductCard";
import type { ProductSector, StorefrontProduct } from "@/lib/storefront-products";

export type SectorFilter = "all" | ProductSector;
export type PriceFilter = "all" | "under-500" | "500-1000" | "over-1000";
export type SortOrder = "curated" | "price-asc" | "price-desc";

export interface ProductCatalogueProps {
  products: StorefrontProduct[];
  sector?: SectorFilter;
  price?: PriceFilter;
  sort?: SortOrder;
}

const sectorFilters: ReadonlyArray<{
  value: SectorFilter;
  label: string;
}> = [
  { value: "all", label: "All products" },
  { value: "solar", label: "Solar panels" },
  { value: "storage", label: "Energy storage" },
  { value: "charging", label: "EV chargers" },
  { value: "outdoors", label: "Portable coolers" },
];

function matchesPrice(priceCents: number, filter: PriceFilter) {
  if (filter === "under-500") return priceCents < 50_000;
  if (filter === "500-1000") {
    return priceCents >= 50_000 && priceCents <= 100_000;
  }
  if (filter === "over-1000") return priceCents > 100_000;
  return true;
}

function catalogueHref({
  sector,
  price,
  sort,
}: {
  sector: SectorFilter;
  price: PriceFilter;
  sort: SortOrder;
}) {
  const query = new URLSearchParams();
  if (sector !== "all") query.set("sector", sector);
  if (price !== "all") query.set("price", price);
  if (sort !== "curated") query.set("sort", sort);

  const search = query.toString();
  return `/${search ? `?${search}` : ""}#catalogue`;
}

export function ProductCatalogue({
  products,
  sector = "all",
  price = "all",
  sort = "curated",
}: ProductCatalogueProps) {
  const filteredProducts = products.filter(
    (product) =>
      (sector === "all" || product.sector === sector) &&
      matchesPrice(product.priceCents, price),
  );

  if (sort === "price-asc") {
    filteredProducts.sort((a, b) => a.priceCents - b.priceCents);
  } else if (sort === "price-desc") {
    filteredProducts.sort((a, b) => b.priceCents - a.priceCents);
  }

  const hasActiveFilters = sector !== "all" || price !== "all";

  return (
    <section
      id="catalogue"
      aria-labelledby="catalogue-heading"
      className="scroll-mt-20 bg-light-200 px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-[94rem]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-footnote font-semibold uppercase tracking-[0.17em] text-green">
              Live catalogue
            </p>
            <h2
              id="catalogue-heading"
              className="mt-3 text-[clamp(2.25rem,5vw,4.6rem)] font-bold leading-[0.94] tracking-[-0.06em] text-dark-900"
            >
              Shop smarter energy.
            </h2>
          </div>
          <p className="max-w-md text-body leading-7 text-dark-700">
            Browse the current catalogue across the four product sectors PVtoEV
            is built to sell.
          </p>
        </div>

        <div className="mt-9 rounded-[1.6rem] border border-dark-900/8 bg-light-100 p-3 shadow-[0_12px_40px_rgba(17,17,17,0.045)] sm:p-4">
          <div className="flex items-center gap-2 border-b border-light-300 pb-3 text-footnote font-semibold uppercase tracking-[0.13em] text-dark-700 lg:hidden">
            <SlidersHorizontal aria-hidden="true" className="size-4" strokeWidth={1.8} />
            Refine products
          </div>

          <nav
            aria-label="Filter by product sector"
            className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mt-0 lg:flex-wrap"
          >
            {sectorFilters.map((filter) => (
              <Link
                key={filter.value}
                href={catalogueHref({ sector: filter.value, price, sort })}
                aria-current={sector === filter.value ? "page" : undefined}
                className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-caption font-semibold transition-[background-color,color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 ${
                  sector === filter.value
                    ? "bg-dark-900 text-light-100 shadow-[0_8px_20px_rgba(17,17,17,0.14)]"
                    : "bg-light-200 text-dark-700 hover:bg-light-300 hover:text-dark-900"
                }`}
              >
                {filter.label}
              </Link>
            ))}
          </nav>

          <form
            action="/"
            method="get"
            className="mt-3 grid gap-3 border-t border-light-300 pt-3 sm:grid-cols-2 lg:grid-cols-[minmax(11rem,15rem)_minmax(11rem,15rem)_auto_1fr_auto] lg:items-end"
          >
            {sector !== "all" ? (
              <input type="hidden" name="sector" value={sector} />
            ) : null}

            <label className="grid gap-1.5 text-footnote font-medium text-dark-700">
              Price
              <select
                name="price"
                defaultValue={price}
                className="min-h-11 rounded-xl border border-light-300 bg-light-100 px-3 text-caption text-dark-900 outline-none transition-[border-color,box-shadow] focus:border-green focus:ring-2 focus:ring-green/15"
              >
                <option value="all">Any price</option>
                <option value="under-500">Under $500</option>
                <option value="500-1000">$500–$1,000</option>
                <option value="over-1000">Over $1,000</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-footnote font-medium text-dark-700">
              Sort by
              <select
                name="sort"
                defaultValue={sort}
                className="min-h-11 rounded-xl border border-light-300 bg-light-100 px-3 text-caption text-dark-900 outline-none transition-[border-color,box-shadow] focus:border-green focus:ring-2 focus:ring-green/15"
              >
                <option value="curated">Recommended</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </label>

            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-green px-5 text-caption font-semibold text-light-100 transition-colors hover:bg-dark-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
            >
              Apply
            </button>

            <p
              aria-live="polite"
              className="self-center text-caption text-dark-700 sm:col-span-2 lg:col-span-1 lg:justify-self-end"
            >
              Showing {filteredProducts.length} of {products.length} products
            </p>

            {hasActiveFilters ? (
              <Link
                href="/#catalogue"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-light-300 px-4 text-caption font-semibold text-dark-900 transition-colors hover:border-dark-500 hover:bg-light-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
              >
                <X aria-hidden="true" className="size-4" strokeWidth={1.8} />
                Clear
              </Link>
            ) : null}
          </form>
        </div>

        {filteredProducts.length > 0 ? (
          <ul className="mt-7 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:gap-7">
            {filteredProducts.map((product) => (
              <li key={product.id} className="min-w-0">
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-7 rounded-[2rem] border border-dashed border-light-400 bg-light-100 px-5 py-16 text-center sm:px-8">
            <p className="text-heading-3 font-semibold text-dark-900">
              No products match those filters.
            </p>
            <p className="mt-2 text-body text-dark-700">
              Try another price range or return to the complete catalogue.
            </p>
            <Link
              href="/#catalogue"
              className="mt-6 inline-flex min-h-11 items-center rounded-full bg-dark-900 px-5 text-caption font-semibold text-light-100 transition-colors hover:bg-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
            >
              Show all products
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductCatalogue;
