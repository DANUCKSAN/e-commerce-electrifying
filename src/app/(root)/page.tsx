import { Suspense } from "react";

import HeroExperience from "@/components/HeroExperience";
import ProductCatalogue, {
  type PriceFilter,
  type SectorFilter,
  type SortOrder,
} from "@/components/ProductCatalogue";
import { getCatalogue } from "@/lib/catalogue";
import {
  createStorefrontProducts,
  type ProductSector,
} from "@/lib/storefront-products";

type StorefrontSearchParams = Promise<{
  sector?: string | string[];
  price?: string | string[];
  sort?: string | string[];
}>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function readSector(value: string | undefined): SectorFilter {
  return ["solar", "storage", "charging", "outdoors"].includes(value ?? "")
    ? (value as ProductSector)
    : "all";
}

function readPrice(value: string | undefined): PriceFilter {
  return ["under-500", "500-1000", "over-1000"].includes(value ?? "")
    ? (value as PriceFilter)
    : "all";
}

function readSort(value: string | undefined): SortOrder {
  return ["price-asc", "price-desc"].includes(value ?? "")
    ? (value as SortOrder)
    : "curated";
}

function CatalogueSkeleton() {
  return (
    <section
      aria-label="Loading products"
      aria-busy="true"
      className="bg-light-200 px-4 py-14 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-[94rem] animate-pulse">
        <div className="h-3 w-28 rounded-full bg-dark-900/10" />
        <div className="mt-4 h-12 max-w-lg rounded-2xl bg-dark-900/10 sm:h-16" />
        <div className="mt-9 h-36 rounded-[1.6rem] bg-dark-900/8" />
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[0.78] rounded-[1.75rem] bg-dark-900/8"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

async function CatalogueContent({
  searchParams,
}: {
  searchParams: StorefrontSearchParams;
}) {
  const [query, catalogue] = await Promise.all([searchParams, getCatalogue()]);
  const products = createStorefrontProducts(catalogue);

  return (
    <ProductCatalogue
      products={products}
      sector={readSector(firstValue(query.sector))}
      price={readPrice(firstValue(query.price))}
      sort={readSort(firstValue(query.sort))}
    />
  );
}

export default function StorefrontPage({
  searchParams,
}: {
  searchParams: StorefrontSearchParams;
}) {
  return (
    <main className="overflow-clip bg-light-200 font-jost text-dark-900">
      <HeroExperience />

      <Suspense fallback={<CatalogueSkeleton />}>
        <CatalogueContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
