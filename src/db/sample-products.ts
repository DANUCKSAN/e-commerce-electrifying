export type DemoAttributeValue =
  | { code: string; number: string; unitCode?: string }
  | { code: string; text: string }
  | { code: string; boolean: boolean };

export type DemoProduct = {
  brandSlug: string;
  categorySlug: string;
  product: {
    slug: string;
    name: string;
    modelNumber: string;
    shortDescription: string;
    description: string;
    featured: boolean;
  };
  variant: {
    catalogSku: string;
    sellerSku: string;
    name: string;
    specificationSummary: string;
    weightG: number;
    isDangerousGoods?: boolean;
    dangerousGoodsClass?: string;
    unNumber?: string;
    batteryEnergyWh?: string;
  };
  priceCents: number;
  stock: number;
  attributes: DemoAttributeValue[];
};

// Replace these records with verified manufacturer data before launch. Slugs and
// SKUs are stable natural keys, so rerunning the seed updates the demo records.
export const demoProducts = [
  {
    brandSlug: "aiko",
    categorySlug: "solar-panels",
    product: {
      slug: "demo-aiko-450w-solar-panel",
      name: "AIKO 450W Solar Panel — Demo",
      modelNumber: "DEMO-AIKO-450",
      shortDescription:
        "Demo high-efficiency rooftop solar panel listing for the PVtoEV catalogue.",
      description:
        "Replace this demonstration record with the verified AIKO model, datasheet, certifications, dimensions and warranty before launch.",
      featured: true,
    },
    variant: {
      catalogSku: "CAT-DEMO-AIKO-450",
      sellerSku: "PV-DEMO-AIKO-450",
      name: "450W",
      specificationSummary: "450W · 22.5% demo efficiency",
      weightG: 22000,
    },
    priceCents: 32900,
    stock: 84,
    attributes: [
      { code: "rated_power_w", number: "450", unitCode: "W" },
      { code: "efficiency_pct", number: "22.5", unitCode: "PCT" },
      { code: "cell_technology", text: "Demo back-contact monocrystalline" },
      { code: "product_warranty_years", number: "25", unitCode: "YEAR" },
      { code: "performance_warranty_years", number: "30", unitCode: "YEAR" },
    ],
  },
  {
    brandSlug: "jinkosolar",
    categorySlug: "solar-panels",
    product: {
      slug: "demo-jinko-440w-solar-panel",
      name: "JinkoSolar 440W Solar Panel — Demo",
      modelNumber: "DEMO-JINKO-440",
      shortDescription:
        "Demo residential solar module with replaceable technical and compliance data.",
      description:
        "Demonstration catalogue entry only. Replace all specifications with an approved Australian JinkoSolar product record.",
      featured: true,
    },
    variant: {
      catalogSku: "CAT-DEMO-JINKO-440",
      sellerSku: "PV-DEMO-JINKO-440",
      name: "440W",
      specificationSummary: "440W · 22.0% demo efficiency",
      weightG: 21800,
    },
    priceCents: 29900,
    stock: 60,
    attributes: [
      { code: "rated_power_w", number: "440", unitCode: "W" },
      { code: "efficiency_pct", number: "22.0", unitCode: "PCT" },
      { code: "cell_technology", text: "Demo N-type monocrystalline" },
      { code: "product_warranty_years", number: "25", unitCode: "YEAR" },
      { code: "performance_warranty_years", number: "30", unitCode: "YEAR" },
    ],
  },
  {
    brandSlug: "yingli-solar",
    categorySlug: "solar-panels",
    product: {
      slug: "demo-yingli-430w-solar-panel",
      name: "Yingli Solar 430W Panel — Demo",
      modelNumber: "DEMO-YINGLI-430",
      shortDescription:
        "Demo value-focused solar panel record for testing catalogue and quote flows.",
      description:
        "Demonstration catalogue entry only. Replace with an approved Yingli Solar product and verified documentation.",
      featured: false,
    },
    variant: {
      catalogSku: "CAT-DEMO-YINGLI-430",
      sellerSku: "PV-DEMO-YINGLI-430",
      name: "430W",
      specificationSummary: "430W · 21.5% demo efficiency",
      weightG: 22000,
    },
    priceCents: 26900,
    stock: 72,
    attributes: [
      { code: "rated_power_w", number: "430", unitCode: "W" },
      { code: "efficiency_pct", number: "21.5", unitCode: "PCT" },
      { code: "cell_technology", text: "Demo monocrystalline" },
      { code: "product_warranty_years", number: "15", unitCode: "YEAR" },
      { code: "performance_warranty_years", number: "25", unitCode: "YEAR" },
    ],
  },
  {
    brandSlug: "anker-solix",
    categorySlug: "expansion-battery-modules",
    product: {
      slug: "demo-anker-solix-2kwh-battery-module",
      name: "Anker SOLIX 2kWh Battery Module — Demo",
      modelNumber: "DEMO-SOLIX-BAT-2K",
      shortDescription:
        "Demo modular portable battery expansion listing with replaceable capacity data.",
      description:
        "Demonstration listing only. Confirm compatibility, chemistry, transport classification and warranty before launch.",
      featured: true,
    },
    variant: {
      catalogSku: "CAT-DEMO-SOLIX-BAT-2K",
      sellerSku: "PV-DEMO-SOLIX-BAT-2K",
      name: "2kWh module",
      specificationSummary: "2,048Wh · LFP · expandable",
      weightG: 22000,
      isDangerousGoods: true,
      dangerousGoodsClass: "9",
      unNumber: "UN3480",
      batteryEnergyWh: "2048",
    },
    priceCents: 179900,
    stock: 18,
    attributes: [
      { code: "usable_capacity_wh", number: "2048", unitCode: "Wh" },
      { code: "battery_chemistry", text: "LFP (demo)" },
      { code: "rated_output_w", number: "2400", unitCode: "W" },
      { code: "cycle_life", number: "3000" },
      { code: "expandable", boolean: true },
      { code: "ip_rating", text: "Demo — verify" },
    ],
  },
  {
    brandSlug: "bluetti",
    categorySlug: "portable-power-stations",
    product: {
      slug: "demo-bluetti-1500wh-portable-battery",
      name: "BLUETTI 1.5kWh Portable Battery — Demo",
      modelNumber: "DEMO-BLUETTI-1500",
      shortDescription:
        "Demo portable power station record for testing battery sales and dangerous-goods fulfilment.",
      description:
        "Demonstration listing only. Replace with a verified BLUETTI product, compatibility list and shipping documentation.",
      featured: false,
    },
    variant: {
      catalogSku: "CAT-DEMO-BLUETTI-1500",
      sellerSku: "PV-DEMO-BLUETTI-1500",
      name: "1.5kWh",
      specificationSummary: "1,500Wh · LFP · 2,000W output",
      weightG: 17000,
      isDangerousGoods: true,
      dangerousGoodsClass: "9",
      unNumber: "UN3480",
      batteryEnergyWh: "1500",
    },
    priceCents: 149900,
    stock: 14,
    attributes: [
      { code: "usable_capacity_wh", number: "1500", unitCode: "Wh" },
      { code: "battery_chemistry", text: "LFP (demo)" },
      { code: "rated_output_w", number: "2000", unitCode: "W" },
      { code: "cycle_life", number: "3000" },
      { code: "expandable", boolean: false },
      { code: "ip_rating", text: "Demo — verify" },
    ],
  },
  {
    brandSlug: "tesla",
    categorySlug: "wall-mounted-ev-chargers",
    product: {
      slug: "demo-tesla-wall-ev-charger",
      name: "Tesla Wall EV Charger — Demo",
      modelNumber: "DEMO-TESLA-WC",
      shortDescription:
        "Demo wall-mounted EV charging listing for quote, shipping and installation workflows.",
      description:
        "Demonstration listing only. Replace power, compatibility and installation requirements with verified model data.",
      featured: true,
    },
    variant: {
      catalogSku: "CAT-DEMO-TESLA-WC-11",
      sellerSku: "PV-DEMO-TESLA-WC-11",
      name: "11kW demo configuration",
      specificationSummary: "11kW · 3 phase · Type 2",
      weightG: 6800,
    },
    priceCents: 79900,
    stock: 25,
    attributes: [
      { code: "max_power_kw", number: "11", unitCode: "kW" },
      { code: "supply_phase", text: "3 phase" },
      { code: "connector_type", text: "Type 2" },
      { code: "solar_aware", boolean: false },
      { code: "ip_rating", text: "Demo — verify" },
    ],
  },
  {
    brandSlug: "goodwe",
    categorySlug: "wall-mounted-ev-chargers",
    product: {
      slug: "demo-goodwe-22kw-ev-charger",
      name: "GoodWe 22kW EV Charger — Demo",
      modelNumber: "DEMO-GOODWE-22",
      shortDescription:
        "Demo three-phase smart EV charger configured for installation quote testing.",
      description:
        "Demonstration listing only. Replace with verified GoodWe specifications, certifications and compatibility.",
      featured: false,
    },
    variant: {
      catalogSku: "CAT-DEMO-GOODWE-22",
      sellerSku: "PV-DEMO-GOODWE-22",
      name: "22kW",
      specificationSummary: "22kW · 3 phase · solar-aware demo",
      weightG: 7500,
    },
    priceCents: 129900,
    stock: 20,
    attributes: [
      { code: "max_power_kw", number: "22", unitCode: "kW" },
      { code: "supply_phase", text: "3 phase" },
      { code: "connector_type", text: "Type 2" },
      { code: "solar_aware", boolean: true },
      { code: "ip_rating", text: "Demo — verify" },
    ],
  },
  {
    brandSlug: "sungrow",
    categorySlug: "wall-mounted-ev-chargers",
    product: {
      slug: "demo-sungrow-11kw-ev-charger",
      name: "Sungrow 11kW EV Charger — Demo",
      modelNumber: "DEMO-SUNGROW-11",
      shortDescription:
        "Demo solar-aware EV charger listing for testing product comparison and installation.",
      description:
        "Demonstration listing only. Replace with verified Sungrow product data before accepting customer orders.",
      featured: false,
    },
    variant: {
      catalogSku: "CAT-DEMO-SUNGROW-11",
      sellerSku: "PV-DEMO-SUNGROW-11",
      name: "11kW",
      specificationSummary: "11kW · 3 phase · Type 2",
      weightG: 6500,
    },
    priceCents: 119900,
    stock: 16,
    attributes: [
      { code: "max_power_kw", number: "11", unitCode: "kW" },
      { code: "supply_phase", text: "3 phase" },
      { code: "connector_type", text: "Type 2" },
      { code: "solar_aware", boolean: true },
      { code: "ip_rating", text: "Demo — verify" },
    ],
  },
  {
    brandSlug: "anker-solix",
    categorySlug: "portable-coolers",
    product: {
      slug: "demo-anker-solix-40l-portable-cooler",
      name: "Anker SOLIX 40L Portable Cooler — Demo",
      modelNumber: "DEMO-SOLIX-COOL-40",
      shortDescription:
        "Demo battery-compatible portable cooler record with replaceable runtime specifications.",
      description:
        "Demonstration listing only. Confirm exact capacity, temperature range, battery compatibility and warranty.",
      featured: false,
    },
    variant: {
      catalogSku: "CAT-DEMO-SOLIX-COOL-40",
      sellerSku: "PV-DEMO-SOLIX-COOL-40",
      name: "40L",
      specificationSummary: "40L · dual-zone demo · battery compatible",
      weightG: 24000,
    },
    priceCents: 119900,
    stock: 10,
    attributes: [
      { code: "volume_l", number: "40", unitCode: "L" },
      { code: "temperature_zones", number: "2" },
      { code: "minimum_temperature_c", number: "-20", unitCode: "CELSIUS" },
      { code: "maximum_temperature_c", number: "20", unitCode: "CELSIUS" },
      { code: "battery_compatible", boolean: true },
    ],
  },
] satisfies DemoProduct[];

export const sampleProducts = demoProducts.map((item) => ({
  slug: item.product.slug,
  name: item.product.name,
  description: item.product.shortDescription,
  category: item.categorySlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" "),
  manufacturer: item.brandSlug,
  specification: item.variant.specificationSummary,
  priceCents: item.priceCents,
  stock: item.stock,
  featured: item.product.featured,
}));
