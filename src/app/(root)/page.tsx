import {
  ArrowDown,
  BatteryCharging,
  CarFront,
  Snowflake,
  SunMedium,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

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

const sectorLinks: ReadonlyArray<{
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
}> = [
  {
    label: "Solar panels",
    description: "Generate",
    href: "/?sector=solar#catalogue",
    icon: SunMedium,
  },
  {
    label: "Energy storage",
    description: "Store",
    href: "/?sector=storage#catalogue",
    icon: BatteryCharging,
  },
  {
    label: "EV chargers",
    description: "Charge",
    href: "/?sector=charging#catalogue",
    icon: CarFront,
  },
  {
    label: "Portable coolers",
    description: "Explore",
    href: "/?sector=outdoors#catalogue",
    icon: Snowflake,
  },
];

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
      <section className="relative isolate overflow-hidden bg-[#0d1714] px-4 pb-12 pt-14 text-light-100 sm:px-6 sm:pb-16 sm:pt-18 lg:px-8 lg:pb-20 lg:pt-24">
        <div
          aria-hidden="true"
          className="absolute -right-32 -top-48 size-[34rem] rounded-full border border-white/10 sm:-right-20 sm:size-[42rem]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-12 -top-20 size-[22rem] rounded-full border border-emerald-300/16 sm:size-[30rem]"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-48 left-[20%] size-[30rem] rounded-full bg-green/28 blur-[110px]"
        />

        <div className="relative mx-auto max-w-[94rem]">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)] lg:items-end lg:gap-16">
            <div>
              <p className="flex items-center gap-2 text-footnote font-semibold uppercase tracking-[0.19em] text-emerald-300">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-300" />
                Four focused product sectors
              </p>
              <h1 className="mt-5 max-w-[10ch] text-[clamp(3.25rem,8vw,7.8rem)] font-bold leading-[0.84] tracking-[-0.075em]">
                Better energy, without the noise.
              </h1>
            </div>

            <div className="lg:pb-2">
              <p className="max-w-xl text-body leading-7 text-white/62 sm:text-lead sm:leading-8">
                Shop solar panels, energy storage, EV chargers and portable
                coolers in one focused renewable marketplace.
              </p>
              <Link
                href="#catalogue"
                className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-full bg-emerald-300 px-5 text-caption font-semibold text-dark-900 shadow-[0_14px_34px_rgba(110,231,183,0.18)] transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-light-100 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-100 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1714]"
              >
                Shop live catalogue
                <ArrowDown aria-hidden="true" className="size-4" strokeWidth={1.8} />
              </Link>
            </div>
          </div>

          <nav aria-label="Shop by product sector" className="mt-12 sm:mt-16 lg:mt-20">
            <ul className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
              {sectorLinks.map((sector, index) => {
                const Icon = sector.icon;

                return (
                  <li key={sector.href}>
                    <Link
                      href={sector.href}
                      className="group flex min-h-24 items-center gap-3 rounded-[1.35rem] border border-white/10 bg-white/[0.055] p-3.5 backdrop-blur-sm transition-[background-color,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.09] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:min-h-28 sm:gap-4 sm:p-4"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/9 text-emerald-300 transition-colors duration-300 group-hover:bg-emerald-300 group-hover:text-dark-900 sm:size-11 sm:rounded-2xl">
                        <Icon aria-hidden="true" className="size-5" strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-footnote uppercase tracking-[0.12em] text-white/40">
                          0{index + 1} · {sector.description}
                        </span>
                        <span className="mt-1 block text-caption font-semibold text-light-100 sm:text-body-medium">
                          {sector.label}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </section>

      <Suspense fallback={<CatalogueSkeleton />}>
        <CatalogueContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
