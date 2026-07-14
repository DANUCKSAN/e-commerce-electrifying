import { asc, desc } from "drizzle-orm";
import {
  ArrowRight,
  ArrowUpRight,
  BatteryCharging,
  CarFront,
  Gauge,
  HousePlug,
  SunMedium,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import BatteryHero from "@/components/BatteryHero";
import Card, { type CardBadgeTone } from "@/components/Card";
import { db, isDatabaseConfigured } from "@/db";
import { sampleProducts } from "@/db/sample-products";
import { products } from "@/db/schema";

export const dynamic = "force-dynamic";

type CatalogueProduct = {
  slug: string;
  name: string;
  description: string;
  category: string;
  manufacturer: string;
  specification: string;
  priceCents: number;
  stock: number;
  featured: boolean;
};

type ProductImage = {
  src: string;
  alt: string;
};

const productImages: Record<string, ProductImage> = {
  "heliomax-450w-solar-panel": {
    src: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1400&q=82",
    alt: "Rows of blue solar panels catching sunlight",
  },
  "voltstream-10kw-hybrid-inverter": {
    src: "https://images.unsplash.com/photo-1521618755572-156ae0cdd74d?auto=format&fit=crop&w=1400&q=82",
    alt: "Close view of a modern solar energy installation",
  },
  "terravault-13-battery": {
    src: "https://images.unsplash.com/photo-1780445392417-68b9dccc45f2?auto=format&fit=crop&w=1400&q=82",
    alt: "Wall-mounted home solar battery and energy storage system",
  },
  "driveray-22kw-ev-charger": {
    src: "https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?auto=format&fit=crop&w=1400&q=82",
    alt: "Electric vehicle connected to a charging cable",
  },
  "sunguide-roof-rail-kit": {
    src: "https://images.unsplash.com/photo-1624397640148-949b1732bb0a?auto=format&fit=crop&w=1400&q=82",
    alt: "Solar installer securing panels on a residential roof",
  },
  "gridguard-smart-meter": {
    src: "https://images.unsplash.com/photo-1527332756452-1ebef4a55fb1?auto=format&fit=crop&w=1400&q=82",
    alt: "Close view of household energy monitoring equipment",
  },
};

const fallbackImage = productImages["heliomax-450w-solar-panel"];

const money = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

const energyFlow = [
  {
    icon: SunMedium,
    step: "01",
    title: "Make it",
    description: "High-yield solar turns your roof into a quiet power station.",
  },
  {
    icon: BatteryCharging,
    step: "02",
    title: "Keep it",
    description: "Smart storage saves your clean energy for evenings and outages.",
  },
  {
    icon: CarFront,
    step: "03",
    title: "Move with it",
    description: "Solar-aware charging sends surplus energy straight to your EV.",
  },
] as const;

async function getCatalogue(): Promise<CatalogueProduct[]> {
  if (!isDatabaseConfigured) return sampleProducts;

  const liveProducts = await db
    .select({
      slug: products.slug,
      name: products.name,
      description: products.description,
      category: products.category,
      manufacturer: products.manufacturer,
      specification: products.specification,
      priceCents: products.priceCents,
      stock: products.stock,
      featured: products.featured,
    })
    .from(products)
    .orderBy(desc(products.featured), asc(products.name))
    .limit(6);

  return liveProducts.length > 0 ? liveProducts : sampleProducts;
}

function productBadge(product: CatalogueProduct): {
  label: string;
  tone: CardBadgeTone;
} {
  if (product.featured) return { label: "Popular", tone: "green" };
  if (product.stock < 20) return { label: "Limited", tone: "orange" };
  return { label: "Ready to ship", tone: "neutral" };
}

export default async function Home() {
  const catalogue = await getCatalogue();

  return (
    <main className="overflow-clip bg-light-100 font-jost text-dark-900">
      <BatteryHero />

      <section
        id="products"
        aria-labelledby="products-heading"
        className="relative z-20 -mt-px scroll-mt-20 rounded-t-[2.25rem] bg-light-100 px-4 py-16 sm:rounded-t-[3.5rem] sm:px-6 sm:py-20 lg:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-[94rem]">
          <div className="reveal-on-scroll grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-footnote font-semibold uppercase tracking-[0.17em] text-green">
                The renewable edit
              </p>
              <h2
                id="products-heading"
                className="mt-4 max-w-[12ch] text-[clamp(2.7rem,7vw,6.8rem)] font-bold leading-[0.88] tracking-[-0.07em] text-dark-900"
              >
                Products that move energy smarter.
              </h2>
            </div>
            <p className="max-w-md text-body text-dark-700 lg:pb-2 lg:text-lead">
              A considered range for generating, storing, monitoring and using
              clean power throughout the whole home.
            </p>
          </div>

          <ul
            aria-label="Product categories"
            className="reveal-on-scroll mt-9 flex flex-wrap gap-2 sm:mt-12"
          >
            {["Solar", "Storage", "Inverters", "EV charging", "Management"].map(
              (category) => (
                <li
                  key={category}
                  className="rounded-full border border-light-300 bg-light-200/70 px-4 py-2.5 text-caption text-dark-700"
                >
                  {category}
                </li>
              ),
            )}
          </ul>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:mt-10 lg:grid-cols-3 lg:gap-7">
            {catalogue.map((product, index) => {
              const image = productImages[product.slug] ?? fallbackImage;

              return (
                <Card
                  key={product.slug}
                  className="reveal-on-scroll"
                  title={product.name}
                  description={product.description}
                  image={image.src}
                  imageAlt={image.alt}
                  href="#contact"
                  eyebrow={product.category}
                  meta={product.specification}
                  price={money.format(product.priceCents / 100)}
                  badge={productBadge(product)}
                  ctaLabel="Plan with this"
                  aspect="landscape"
                  imageFit="cover"
                  imageSizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 33vw"
                  preload={index === 0}
                />
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="solutions"
        aria-labelledby="solutions-heading"
        className="scroll-mt-20 bg-light-100 px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-28"
      >
        <div className="reveal-on-scroll relative mx-auto max-w-[94rem] overflow-hidden rounded-[2.25rem] bg-[#0d1714] px-5 py-10 text-light-100 shadow-[0_36px_90px_rgba(13,23,20,0.16)] sm:rounded-[3.25rem] sm:px-8 sm:py-14 lg:px-14 lg:py-16">
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-28 size-[24rem] rounded-full bg-emerald-400/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-36 left-[28%] size-[24rem] rounded-full bg-cyan-400/10 blur-3xl"
          />

          <div className="relative grid gap-12 xl:grid-cols-[0.72fr_1.28fr] xl:items-end xl:gap-16">
            <div>
              <p className="text-footnote font-semibold uppercase tracking-[0.17em] text-emerald-300">
                One connected system
              </p>
              <h2
                id="solutions-heading"
                className="mt-4 max-w-[9ch] text-[clamp(2.6rem,6vw,5.8rem)] font-bold leading-[0.9] tracking-[-0.065em]"
              >
                Make it. Keep it. Move with it.
              </h2>
              <p className="mt-6 max-w-lg text-body leading-7 text-white/58 sm:text-lead">
                Your panels, battery and charger work as one responsive energy
                loop—automatically choosing the cleanest, lowest-cost path.
              </p>
            </div>

            <ol className="grid gap-3 md:grid-cols-3">
              {energyFlow.map((item, index) => {
                const Icon = item.icon;

                return (
                  <li
                    key={item.title}
                    className="group relative rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-sm transition-[background-color,transform] duration-300 hover:-translate-y-1 hover:bg-white/[0.085] motion-reduce:transition-none sm:p-6"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-300 text-dark-900">
                        <Icon className="size-5" strokeWidth={1.8} />
                      </span>
                      <span className="text-footnote font-medium tracking-[0.15em] text-white/35">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="mt-8 text-2xl font-semibold tracking-[-0.035em]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-body text-white/52">
                      {item.description}
                    </p>

                    {index < energyFlow.length - 1 ? (
                      <ArrowRight
                        aria-hidden="true"
                        className="absolute -right-[1.1rem] top-1/2 z-10 hidden size-5 -translate-y-1/2 text-emerald-300 md:block"
                        strokeWidth={1.6}
                      />
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </div>

          <dl className="relative mt-12 grid grid-cols-2 gap-x-4 gap-y-7 border-t border-white/10 pt-8 sm:grid-cols-4 lg:mt-16">
            {[
              ["22.5%", "panel efficiency"],
              ["13.5 kWh", "modular storage"],
              ["22 kW", "smart EV charging"],
              ["1 app", "whole-home visibility"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="text-footnote uppercase tracking-[0.12em] text-white/38">
                  {label}
                </dt>
                <dd className="mt-2 text-xl font-semibold tracking-[-0.035em] text-white sm:text-2xl">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        id="about"
        aria-labelledby="about-heading"
        className="scroll-mt-20 bg-[#edf7f3] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28"
      >
        <div className="mx-auto grid max-w-[94rem] gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div className="reveal-on-scroll relative min-h-[26rem] overflow-hidden rounded-[2.25rem] bg-dark-900 sm:min-h-[34rem] sm:rounded-[3rem] lg:min-h-[42rem]">
            <Image
              fill
              src="https://images.unsplash.com/photo-1624397640148-949b1732bb0a?auto=format&fit=crop&w=1800&q=84"
              alt="Renewable energy specialist installing solar panels on a roof"
              sizes="(max-width: 1023px) calc(100vw - 2rem), 52vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900/70 via-transparent to-transparent" />
            <div className="absolute inset-x-5 bottom-5 grid grid-cols-2 gap-2 sm:inset-x-7 sm:bottom-7 sm:grid-cols-3">
              {[
                ["NSW", "local support"],
                ["10 yr", "warranty options"],
                ["Clean", "design-led installs"],
              ].map(([value, label], index) => (
                <div
                  key={label}
                  className={`rounded-2xl border border-white/20 bg-white/14 p-4 text-white backdrop-blur-xl ${index === 2 ? "col-span-2 sm:col-span-1" : ""}`}
                >
                  <p className="text-xl font-semibold tracking-[-0.03em]">
                    {value}
                  </p>
                  <p className="mt-1 text-footnote text-white/65">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal-on-scroll lg:pr-8">
            <p className="text-footnote font-semibold uppercase tracking-[0.17em] text-green">
              Built around your home
            </p>
            <h2
              id="about-heading"
              className="mt-4 max-w-[11ch] text-[clamp(2.65rem,6vw,5.8rem)] font-bold leading-[0.9] tracking-[-0.065em]"
            >
              Less energy noise. More everyday control.
            </h2>
            <p className="mt-6 max-w-xl text-body leading-7 text-dark-700 sm:text-lead">
              We pair dependable hardware with practical guidance, so your
              renewable system feels simple from the first conversation to the
              first bill it lowers.
            </p>

            <ul className="mt-9 grid gap-3">
              {[
                {
                  icon: HousePlug,
                  title: "Designed as one system",
                  copy: "Products are selected to communicate, scale and work together.",
                },
                {
                  icon: Gauge,
                  title: "Measured around real use",
                  copy: "Recommendations follow your roof, loads, tariffs and future EV plans.",
                },
                {
                  icon: BatteryCharging,
                  title: "Ready for what comes next",
                  copy: "Start with solar today, then add storage and charging when it suits.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <li
                    key={item.title}
                    className="grid grid-cols-[auto_1fr] gap-4 rounded-[1.5rem] border border-dark-900/8 bg-white/60 p-4 sm:p-5"
                  >
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-dark-900 text-emerald-300">
                      <Icon className="size-5" strokeWidth={1.8} />
                    </span>
                    <div>
                      <h3 className="text-body-medium font-semibold text-dark-900">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-caption text-dark-700">
                        {item.copy}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      <section
        id="journal"
        aria-labelledby="cta-heading"
        className="scroll-mt-20 bg-light-100 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14"
      >
        <div className="reveal-on-scroll mx-auto grid max-w-[94rem] items-center gap-7 rounded-[2.25rem] border border-light-300 bg-[linear-gradient(120deg,#ffffff,#f2f8f5_54%,#e8f5fb)] px-5 py-8 shadow-[0_22px_70px_rgba(17,17,17,0.055)] sm:rounded-[3rem] sm:px-8 sm:py-10 lg:grid-cols-[1fr_auto] lg:px-12 lg:py-12">
          <div>
            <p className="text-footnote font-semibold uppercase tracking-[0.17em] text-green">
              Your energy plan starts here
            </p>
            <h2
              id="cta-heading"
              className="mt-3 max-w-[15ch] text-[clamp(2.2rem,5vw,4.8rem)] font-bold leading-[0.92] tracking-[-0.06em]"
            >
              Ready to make your home work smarter?
            </h2>
          </div>
          <Link
            href="#contact"
            className="group inline-flex min-h-14 w-fit items-center gap-3 rounded-full bg-green px-6 text-caption text-light-100 shadow-[0_14px_32px_rgba(0,125,72,0.2)] transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-dark-900 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
          >
            Start a project
            <ArrowUpRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
              strokeWidth={1.8}
            />
          </Link>
        </div>
      </section>
    </main>
  );
}
