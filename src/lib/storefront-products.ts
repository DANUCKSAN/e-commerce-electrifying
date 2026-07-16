import type { CatalogueProduct } from "@/lib/catalogue";

export type ProductSector = "solar" | "storage" | "charging" | "outdoors";

export type StorefrontProduct = {
  id: string;
  name: string;
  brand: string;
  sector: ProductSector;
  sectorLabel: string;
  specification: string;
  priceCents: number;
  stock: number;
  featured: boolean;
};

const categoryPresentation: Record<
  string,
  Pick<StorefrontProduct, "sector" | "sectorLabel">
> = {
  "solar-panels": { sector: "solar", sectorLabel: "Solar panels" },
  "expansion-battery-modules": {
    sector: "storage",
    sectorLabel: "Energy storage",
  },
  "portable-power-stations": {
    sector: "storage",
    sectorLabel: "Energy storage",
  },
  "wall-mounted-ev-chargers": {
    sector: "charging",
    sectorLabel: "EV chargers",
  },
  "portable-coolers": {
    sector: "outdoors",
    sectorLabel: "Portable coolers",
  },
};

function removeSeedMarker(value: string) {
  return value
    .replace(/\s+—\s+Demo$/i, "")
    .replace(/^Demo\s+/i, "")
    .replace(/\s*·?\s*demo(?:\s+configuration)?/gi, "")
    .replace(/\s*·\s*·\s*/g, " · ")
    .trim();
}

export function createStorefrontProducts(
  products: CatalogueProduct[],
): StorefrontProduct[] {
  return products.flatMap((product) => {
    const presentation = categoryPresentation[product.categorySlug];
    if (!presentation) return [];

    return [
      {
        id: product.slug,
        name: removeSeedMarker(product.name),
        brand: product.manufacturer,
        sector: presentation.sector,
        sectorLabel: presentation.sectorLabel,
        specification: removeSeedMarker(product.specification),
        priceCents: product.priceCents,
        stock: product.stock,
        featured: product.featured,
      },
    ];
  });
}
