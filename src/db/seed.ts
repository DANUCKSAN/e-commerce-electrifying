import { and, eq } from "drizzle-orm";
import { config } from "dotenv";

import { demoProducts } from "./sample-products";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

const publishedAt = new Date("2026-01-01T00:00:00.000Z");
const priceStartsAt = new Date("2026-01-01T00:00:00.000Z");
const taxValidFrom = new Date("2000-07-01T00:00:00.000Z");

const units = [
  { code: "W", name: "watt", symbol: "W", dimension: "power", conversionFactor: "1" },
  { code: "kW", name: "kilowatt", symbol: "kW", dimension: "power", conversionFactor: "1000" },
  { code: "Wh", name: "watt-hour", symbol: "Wh", dimension: "energy", conversionFactor: "1" },
  { code: "kWh", name: "kilowatt-hour", symbol: "kWh", dimension: "energy", conversionFactor: "1000" },
  { code: "L", name: "litre", symbol: "L", dimension: "volume", conversionFactor: "1" },
  { code: "PCT", name: "percent", symbol: "%", dimension: "ratio", conversionFactor: "0.01" },
  { code: "YEAR", name: "year", symbol: "yr", dimension: "duration", conversionFactor: "1" },
  { code: "CELSIUS", name: "degree Celsius", symbol: "°C", dimension: "temperature", conversionFactor: "1" },
] as const;

const brandsSeed = [
  { slug: "aiko", name: "AIKO" },
  { slug: "jinkosolar", name: "JinkoSolar" },
  { slug: "yingli-solar", name: "Yingli Solar" },
  { slug: "anker-solix", name: "Anker SOLIX" },
  { slug: "bluetti", name: "BLUETTI" },
  { slug: "tesla", name: "Tesla" },
  { slug: "goodwe", name: "GoodWe" },
  { slug: "sungrow", name: "Sungrow" },
] as const;

const categoriesSeed = [
  { slug: "renewable-energy", name: "Renewable Energy", parentSlug: null, sortOrder: 10 },
  { slug: "solar-panels", name: "Solar Panels", parentSlug: "renewable-energy", sortOrder: 10 },
  { slug: "energy-storage", name: "Energy Storage", parentSlug: null, sortOrder: 20 },
  { slug: "portable-power-stations", name: "Portable Power Stations", parentSlug: "energy-storage", sortOrder: 10 },
  { slug: "expansion-battery-modules", name: "Expansion Battery Modules", parentSlug: "energy-storage", sortOrder: 20 },
  { slug: "ev-charging", name: "EV Charging", parentSlug: null, sortOrder: 30 },
  { slug: "portable-ev-chargers", name: "Portable EV Chargers", parentSlug: "ev-charging", sortOrder: 10 },
  { slug: "wall-mounted-ev-chargers", name: "Wall-mounted EV Chargers", parentSlug: "ev-charging", sortOrder: 20 },
  { slug: "outdoor-appliances", name: "Outdoor Appliances", parentSlug: null, sortOrder: 40 },
  { slug: "portable-coolers", name: "Portable Coolers", parentSlug: "outdoor-appliances", sortOrder: 10 },
] as const;

const attributesSeed = [
  { code: "rated_power_w", name: "Rated power", dataType: "number", defaultUnitCode: "W", isFilterable: true },
  { code: "efficiency_pct", name: "Module efficiency", dataType: "number", defaultUnitCode: "PCT", isFilterable: true },
  { code: "cell_technology", name: "Cell technology", dataType: "text", defaultUnitCode: null, isFilterable: true },
  { code: "product_warranty_years", name: "Product warranty", dataType: "number", defaultUnitCode: "YEAR", isFilterable: true },
  { code: "performance_warranty_years", name: "Performance warranty", dataType: "number", defaultUnitCode: "YEAR", isFilterable: true },
  { code: "usable_capacity_wh", name: "Usable capacity", dataType: "number", defaultUnitCode: "Wh", isFilterable: true },
  { code: "battery_chemistry", name: "Battery chemistry", dataType: "text", defaultUnitCode: null, isFilterable: true },
  { code: "rated_output_w", name: "Rated output", dataType: "number", defaultUnitCode: "W", isFilterable: true },
  { code: "cycle_life", name: "Cycle life", dataType: "number", defaultUnitCode: null, isFilterable: true },
  { code: "expandable", name: "Expandable", dataType: "boolean", defaultUnitCode: null, isFilterable: true },
  { code: "ip_rating", name: "IP rating", dataType: "text", defaultUnitCode: null, isFilterable: true },
  { code: "max_power_kw", name: "Maximum charging power", dataType: "number", defaultUnitCode: "kW", isFilterable: true },
  { code: "supply_phase", name: "Supply phase", dataType: "text", defaultUnitCode: null, isFilterable: true },
  { code: "connector_type", name: "Connector type", dataType: "text", defaultUnitCode: null, isFilterable: true },
  { code: "solar_aware", name: "Solar-aware charging", dataType: "boolean", defaultUnitCode: null, isFilterable: true },
  { code: "volume_l", name: "Volume", dataType: "number", defaultUnitCode: "L", isFilterable: true },
  { code: "temperature_zones", name: "Temperature zones", dataType: "number", defaultUnitCode: null, isFilterable: true },
  { code: "minimum_temperature_c", name: "Minimum temperature", dataType: "number", defaultUnitCode: "CELSIUS", isFilterable: true },
  { code: "maximum_temperature_c", name: "Maximum temperature", dataType: "number", defaultUnitCode: "CELSIUS", isFilterable: true },
  { code: "battery_compatible", name: "Battery compatible", dataType: "boolean", defaultUnitCode: null, isFilterable: true },
] as const;

const categoryAttributeCodes: Record<string, string[]> = {
  "solar-panels": [
    "rated_power_w",
    "efficiency_pct",
    "cell_technology",
    "product_warranty_years",
    "performance_warranty_years",
  ],
  "portable-power-stations": [
    "usable_capacity_wh",
    "battery_chemistry",
    "rated_output_w",
    "cycle_life",
    "expandable",
    "ip_rating",
  ],
  "expansion-battery-modules": [
    "usable_capacity_wh",
    "battery_chemistry",
    "rated_output_w",
    "cycle_life",
    "expandable",
    "ip_rating",
  ],
  "portable-ev-chargers": [
    "max_power_kw",
    "supply_phase",
    "connector_type",
    "solar_aware",
    "ip_rating",
  ],
  "wall-mounted-ev-chargers": [
    "max_power_kw",
    "supply_phase",
    "connector_type",
    "solar_aware",
    "ip_rating",
  ],
  "portable-coolers": [
    "volume_l",
    "temperature_zones",
    "minimum_temperature_c",
    "maximum_temperature_c",
    "battery_compatible",
  ],
};

async function seed() {
  const [{ db, requireDatabaseConfiguration }, schema] = await Promise.all([
    import("./client"),
    import("./schema"),
  ]);

  requireDatabaseConfiguration();

  for (const unit of units) {
    await db
      .insert(schema.measurementUnits)
      .values(unit)
      .onConflictDoUpdate({
        target: schema.measurementUnits.code,
        set: {
          name: unit.name,
          symbol: unit.symbol,
          dimension: unit.dimension,
          conversionFactor: unit.conversionFactor,
        },
      });
  }

  const [taxClass] = await db
    .insert(schema.taxClasses)
    .values({
      code: "standard-gst",
      name: "Standard GST",
      description: "Standard Australian taxable goods.",
    })
    .onConflictDoUpdate({
      target: schema.taxClasses.code,
      set: { name: "Standard GST" },
    })
    .returning({ id: schema.taxClasses.id });

  const existingTaxRate = await db
    .select({ id: schema.taxRates.id })
    .from(schema.taxRates)
    .where(
      and(
        eq(schema.taxRates.taxClassId, taxClass.id),
        eq(schema.taxRates.countryCode, "AU"),
        eq(schema.taxRates.validFrom, taxValidFrom),
      ),
    )
    .limit(1);

  if (existingTaxRate.length === 0) {
    await db.insert(schema.taxRates).values({
      taxClassId: taxClass.id,
      countryCode: "AU",
      name: "GST",
      rate: "0.1",
      validFrom: taxValidFrom,
    });
  }

  const brandIds = new Map<string, string>();

  for (const brand of brandsSeed) {
    const [record] = await db
      .insert(schema.brands)
      .values({ ...brand, status: "active" })
      .onConflictDoUpdate({
        target: schema.brands.slug,
        set: { name: brand.name, status: "active" },
      })
      .returning({ id: schema.brands.id, slug: schema.brands.slug });

    brandIds.set(record.slug, record.id);
  }

  const categoryIds = new Map<string, string>();

  for (const category of categoriesSeed) {
    const parentId = category.parentSlug
      ? categoryIds.get(category.parentSlug)
      : undefined;

    if (category.parentSlug && !parentId) {
      throw new Error(`Missing parent category ${category.parentSlug}.`);
    }

    const [record] = await db
      .insert(schema.categories)
      .values({
        parentId,
        slug: category.slug,
        name: category.name,
        status: "active",
        sortOrder: category.sortOrder,
      })
      .onConflictDoUpdate({
        target: schema.categories.slug,
        set: {
          parentId,
          name: category.name,
          status: "active",
          sortOrder: category.sortOrder,
        },
      })
      .returning({ id: schema.categories.id, slug: schema.categories.slug });

    categoryIds.set(record.slug, record.id);
  }

  const attributeIds = new Map<string, string>();

  for (const attribute of attributesSeed) {
    const [record] = await db
      .insert(schema.attributeDefinitions)
      .values({
        ...attribute,
        scope: "variant",
        isComparable: true,
      })
      .onConflictDoUpdate({
        target: schema.attributeDefinitions.code,
        set: {
          name: attribute.name,
          dataType: attribute.dataType,
          scope: "variant",
          defaultUnitCode: attribute.defaultUnitCode,
          isFilterable: attribute.isFilterable,
          isComparable: true,
        },
      })
      .returning({
        id: schema.attributeDefinitions.id,
        code: schema.attributeDefinitions.code,
      });

    attributeIds.set(record.code, record.id);
  }

  for (const [categorySlug, codes] of Object.entries(categoryAttributeCodes)) {
    const categoryId = categoryIds.get(categorySlug);
    if (!categoryId) throw new Error(`Missing category ${categorySlug}.`);

    for (const [sortOrder, code] of codes.entries()) {
      const attributeId = attributeIds.get(code);
      if (!attributeId) throw new Error(`Missing attribute ${code}.`);

      await db
        .insert(schema.categoryAttributes)
        .values({
          categoryId,
          attributeId,
          isRequired: true,
          sortOrder,
        })
        .onConflictDoUpdate({
          target: [
            schema.categoryAttributes.categoryId,
            schema.categoryAttributes.attributeId,
          ],
          set: { isRequired: true, sortOrder },
        });
    }
  }

  for (const role of [
    ["store_admin", "Store administrator"],
    ["support", "Customer support"],
    ["catalogue_manager", "Catalogue manager"],
    ["finance", "Finance manager"],
  ] as const) {
    await db
      .insert(schema.roles)
      .values({ code: role[0], name: role[1] })
      .onConflictDoUpdate({
        target: schema.roles.code,
        set: { name: role[1] },
      });
  }

  const [warehouse] = await db
    .insert(schema.warehouses)
    .values({
      code: "SYD-OFFICE",
      name: "Sydney office",
      locationType: "office",
      pickupEnabled: true,
      deliveryEnabled: true,
      addressLine1: "1 Demo Street",
      suburb: "Sydney",
      state: "NSW",
      postcode: "2000",
      countryCode: "AU",
      timezone: "Australia/Sydney",
      status: "active",
    })
    .onConflictDoUpdate({
      target: schema.warehouses.code,
      set: {
        name: "Sydney office",
        locationType: "office",
        pickupEnabled: true,
        deliveryEnabled: true,
        status: "active",
      },
    })
    .returning({ id: schema.warehouses.id });

  for (const demo of demoProducts) {
    const brandId = brandIds.get(demo.brandSlug);
    const categoryId = categoryIds.get(demo.categorySlug);

    if (!brandId || !categoryId) {
      throw new Error(`Missing brand or category for ${demo.product.slug}.`);
    }

    const [product] = await db
      .insert(schema.products)
      .values({
        brandId,
        taxClassId: taxClass.id,
        productType: "physical",
        ...demo.product,
        status: "active",
        publishedAt,
      })
      .onConflictDoUpdate({
        target: schema.products.slug,
        set: {
          brandId,
          taxClassId: taxClass.id,
          name: demo.product.name,
          modelNumber: demo.product.modelNumber,
          shortDescription: demo.product.shortDescription,
          description: demo.product.description,
          featured: demo.product.featured,
          status: "active",
        },
      })
      .returning({ id: schema.products.id });

    await db
      .insert(schema.productCategories)
      .values({ productId: product.id, categoryId, isPrimary: true })
      .onConflictDoUpdate({
        target: [
          schema.productCategories.productId,
          schema.productCategories.categoryId,
        ],
        set: { isPrimary: true },
      });

    const [variant] = await db
      .insert(schema.productVariants)
      .values({
        productId: product.id,
        ...demo.variant,
        status: "active",
        isDefault: true,
        publishedAt,
      })
      .onConflictDoUpdate({
        target: schema.productVariants.catalogSku,
        set: {
          productId: product.id,
          name: demo.variant.name,
          specificationSummary: demo.variant.specificationSummary,
          weightG: demo.variant.weightG,
          isDangerousGoods: demo.variant.isDangerousGoods ?? false,
          dangerousGoodsClass: demo.variant.dangerousGoodsClass,
          unNumber: demo.variant.unNumber,
          batteryEnergyWh: demo.variant.batteryEnergyWh,
          status: "active",
          isDefault: true,
        },
      })
      .returning({ id: schema.productVariants.id });

    for (const attribute of demo.attributes) {
      const attributeId = attributeIds.get(attribute.code);
      if (!attributeId) throw new Error(`Missing attribute ${attribute.code}.`);

      const value = {
        variantId: variant.id,
        attributeId,
        valueText: "text" in attribute ? attribute.text : null,
        valueNumber: "number" in attribute ? attribute.number : null,
        valueBoolean: "boolean" in attribute ? attribute.boolean : null,
        unitCode: "unitCode" in attribute ? attribute.unitCode : null,
      };

      await db
        .insert(schema.variantAttributeValues)
        .values(value)
        .onConflictDoUpdate({
          target: [
            schema.variantAttributeValues.variantId,
            schema.variantAttributeValues.attributeId,
          ],
          set: value,
        });
    }

    await db
      .insert(schema.productPrices)
      .values({
        variantId: variant.id,
        priceType: "regular",
        amountMinor: demo.priceCents,
        currency: "AUD",
        taxInclusive: true,
        startsAt: priceStartsAt,
      })
      .onConflictDoUpdate({
        target: [
          schema.productPrices.variantId,
          schema.productPrices.priceType,
          schema.productPrices.currency,
          schema.productPrices.startsAt,
        ],
        set: { amountMinor: demo.priceCents, taxInclusive: true },
      });

    await db
      .insert(schema.inventoryLevels)
      .values({
        warehouseId: warehouse.id,
        variantId: variant.id,
        onHand: demo.stock,
        reserved: 0,
        incoming: 0,
        safetyStock: 0,
      })
      .onConflictDoUpdate({
        target: [
          schema.inventoryLevels.warehouseId,
          schema.inventoryLevels.variantId,
        ],
        set: { onHand: demo.stock, reserved: 0 },
      });

    await db
      .insert(schema.inventoryMovements)
      .values({
        warehouseId: warehouse.id,
        variantId: variant.id,
        movementType: "receipt",
        quantityDelta: demo.stock,
        balanceAfter: demo.stock,
        referenceType: "demo_seed_product",
        referenceId: product.id,
        reason: "Replaceable demonstration opening stock",
        occurredAt: publishedAt,
      })
      .onConflictDoNothing();
  }

  console.log(
    `Seeded ${demoProducts.length} replaceable demo products across ${brandsSeed.length} brands.`,
  );
}

seed().catch((error: unknown) => {
  console.error("Unable to seed the database.", error);
  process.exitCode = 1;
});
