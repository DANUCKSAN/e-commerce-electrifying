import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { user } from "./user";
import { auditTimestamps, primaryId } from "./common";

export const measurementUnits = pgTable("measurement_units", {
  code: varchar("code", { length: 16 }).primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  symbol: varchar("symbol", { length: 24 }).notNull(),
  dimension: varchar("dimension", { length: 40 }).notNull(),
  conversionFactor: numeric("conversion_factor", {
    precision: 24,
    scale: 12,
  })
    .notNull()
    .default("1"),
});

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: primaryId(),
    storageProvider: varchar("storage_provider", { length: 40 }).notNull(),
    bucket: varchar("bucket", { length: 120 }).notNull(),
    storageKey: text("storage_key").notNull(),
    mimeType: varchar("mime_type", { length: 120 }).notNull(),
    fileSizeBytes: integer("file_size_bytes").notNull(),
    sha256: varchar("sha256", { length: 64 }),
    width: integer("width"),
    height: integer("height"),
    altText: text("alt_text"),
    uploadedBy: uuid("uploaded_by").references(() => user.id, {
      onDelete: "set null",
    }),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("media_assets_storage_uidx").on(
      table.storageProvider,
      table.bucket,
      table.storageKey,
    ),
    check("media_assets_file_size_check", sql`${table.fileSizeBytes} >= 0`),
  ],
);

export const brands = pgTable(
  "brands",
  {
    id: primaryId(),
    parentBrandId: uuid("parent_brand_id").references(
      (): AnyPgColumn => brands.id,
      { onDelete: "restrict" },
    ),
    name: varchar("name", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 180 }).notNull(),
    legalName: varchar("legal_name", { length: 200 }),
    description: text("description"),
    websiteUrl: text("website_url"),
    logoAssetId: uuid("logo_asset_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    status: varchar("status", { length: 24 }).notNull().default("active"),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("brands_slug_uidx").on(table.slug),
    index("brands_parent_brand_id_idx").on(table.parentBrandId),
    check(
      "brands_status_check",
      sql`${table.status} in ('draft', 'active', 'archived')`,
    ),
    check(
      "brands_parent_check",
      sql`${table.parentBrandId} is null or ${table.parentBrandId} <> ${table.id}`,
    ),
  ],
);

export const categories = pgTable(
  "categories",
  {
    id: primaryId(),
    parentId: uuid("parent_id").references(
      (): AnyPgColumn => categories.id,
      { onDelete: "restrict" },
    ),
    name: varchar("name", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 180 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 24 }).notNull().default("active"),
    sortOrder: integer("sort_order").notNull().default(0),
    seoTitle: varchar("seo_title", { length: 180 }),
    seoDescription: varchar("seo_description", { length: 320 }),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("categories_slug_uidx").on(table.slug),
    index("categories_parent_id_idx").on(table.parentId),
    index("categories_status_sort_idx").on(table.status, table.sortOrder),
    check(
      "categories_status_check",
      sql`${table.status} in ('draft', 'active', 'archived')`,
    ),
    check(
      "categories_parent_check",
      sql`${table.parentId} is null or ${table.parentId} <> ${table.id}`,
    ),
  ],
);

export const taxClasses = pgTable(
  "tax_classes",
  {
    id: primaryId(),
    code: varchar("code", { length: 60 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    ...auditTimestamps(),
  },
  (table) => [uniqueIndex("tax_classes_code_uidx").on(table.code)],
);

export const products = pgTable(
  "products",
  {
    id: primaryId(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "restrict" }),
    taxClassId: uuid("tax_class_id")
      .notNull()
      .references(() => taxClasses.id, { onDelete: "restrict" }),
    productType: varchar("product_type", { length: 24 })
      .notNull()
      .default("physical"),
    name: varchar("name", { length: 180 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    modelNumber: varchar("model_number", { length: 120 }),
    shortDescription: varchar("short_description", { length: 420 }).notNull(),
    description: text("description").notNull(),
    status: varchar("status", { length: 24 }).notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    seoTitle: varchar("seo_title", { length: 180 }),
    seoDescription: varchar("seo_description", { length: 320 }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("products_slug_uidx").on(table.slug),
    index("products_brand_id_idx").on(table.brandId),
    index("products_tax_class_id_idx").on(table.taxClassId),
    index("products_catalogue_idx").on(
      table.status,
      table.featured,
      table.publishedAt,
    ),
    check(
      "products_type_check",
      sql`${table.productType} in ('physical', 'service', 'bundle')`,
    ),
    check(
      "products_status_check",
      sql`${table.status} in ('draft', 'active', 'discontinued', 'archived')`,
    ),
  ],
);

export const productCategories = pgTable(
  "product_categories",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    isPrimary: boolean("is_primary").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.categoryId] }),
    index("product_categories_category_id_idx").on(table.categoryId),
    uniqueIndex("product_categories_primary_uidx")
      .on(table.productId)
      .where(sql`${table.isPrimary} = true`),
  ],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: primaryId(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    catalogSku: varchar("catalog_sku", { length: 100 }).notNull(),
    name: varchar("name", { length: 180 }).notNull(),
    specificationSummary: varchar("specification_summary", { length: 220 }),
    manufacturerPartNumber: varchar("manufacturer_part_number", {
      length: 120,
    }),
    gtin: varchar("gtin", { length: 14 }),
    status: varchar("status", { length: 24 }).notNull().default("draft"),
    isDefault: boolean("is_default").notNull().default(false),
    minimumOrderQuantity: integer("minimum_order_quantity")
      .notNull()
      .default(1),
    maximumOrderQuantity: integer("maximum_order_quantity"),
    leadTimeDays: integer("lead_time_days").notNull().default(0),
    trackInventory: boolean("track_inventory").notNull().default(true),
    backorderPolicy: varchar("backorder_policy", { length: 24 })
      .notNull()
      .default("deny"),
    weightG: integer("weight_g"),
    lengthMm: integer("length_mm"),
    widthMm: integer("width_mm"),
    heightMm: integer("height_mm"),
    isDangerousGoods: boolean("is_dangerous_goods")
      .notNull()
      .default(false),
    dangerousGoodsClass: varchar("dangerous_goods_class", { length: 40 }),
    unNumber: varchar("un_number", { length: 16 }),
    batteryEnergyWh: numeric("battery_energy_wh", {
      precision: 12,
      scale: 3,
    }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("product_variants_catalog_sku_uidx").on(table.catalogSku),
    uniqueIndex("product_variants_gtin_uidx")
      .on(table.gtin)
      .where(sql`${table.gtin} is not null`),
    uniqueIndex("product_variants_default_uidx")
      .on(table.productId)
      .where(sql`${table.isDefault} = true`),
    index("product_variants_product_status_idx").on(
      table.productId,
      table.status,
    ),
    check(
      "product_variants_status_check",
      sql`${table.status} in ('draft', 'active', 'discontinued', 'archived')`,
    ),
    check(
      "product_variants_dimensions_check",
      sql`(${table.weightG} is null or ${table.weightG} >= 0)
        and (${table.lengthMm} is null or ${table.lengthMm} >= 0)
        and (${table.widthMm} is null or ${table.widthMm} >= 0)
        and (${table.heightMm} is null or ${table.heightMm} >= 0)`,
    ),
    check(
      "product_variants_order_quantity_check",
      sql`${table.minimumOrderQuantity} > 0
        and (${table.maximumOrderQuantity} is null or ${table.maximumOrderQuantity} >= ${table.minimumOrderQuantity})`,
    ),
    check(
      "product_variants_backorder_check",
      sql`${table.backorderPolicy} in ('deny', 'allow', 'preorder')`,
    ),
    check(
      "product_variants_lead_time_check",
      sql`${table.leadTimeDays} >= 0`,
    ),
  ],
);

export const attributeDefinitions = pgTable(
  "attribute_definitions",
  {
    id: primaryId(),
    code: varchar("code", { length: 100 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    description: text("description"),
    dataType: varchar("data_type", { length: 20 }).notNull(),
    scope: varchar("scope", { length: 20 }).notNull(),
    defaultUnitCode: varchar("default_unit_code", { length: 16 }).references(
      () => measurementUnits.code,
      { onDelete: "restrict" },
    ),
    validationRules: jsonb("validation_rules")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    isFilterable: boolean("is_filterable").notNull().default(false),
    isComparable: boolean("is_comparable").notNull().default(false),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("attribute_definitions_code_uidx").on(table.code),
    check(
      "attribute_definitions_type_check",
      sql`${table.dataType} in ('text', 'number', 'boolean')`,
    ),
    check(
      "attribute_definitions_scope_check",
      sql`${table.scope} in ('product', 'variant')`,
    ),
  ],
);

export const categoryAttributes = pgTable(
  "category_attributes",
  {
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    attributeId: uuid("attribute_id")
      .notNull()
      .references(() => attributeDefinitions.id, { onDelete: "cascade" }),
    isRequired: boolean("is_required").notNull().default(false),
    isVariantAxis: boolean("is_variant_axis").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.categoryId, table.attributeId] }),
    index("category_attributes_attribute_id_idx").on(table.attributeId),
  ],
);

export const variantAttributeValues = pgTable(
  "variant_attribute_values",
  {
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    attributeId: uuid("attribute_id")
      .notNull()
      .references(() => attributeDefinitions.id, { onDelete: "restrict" }),
    valueText: text("value_text"),
    valueNumber: numeric("value_number", { precision: 24, scale: 6 }),
    valueBoolean: boolean("value_boolean"),
    unitCode: varchar("unit_code", { length: 16 }).references(
      () => measurementUnits.code,
      { onDelete: "restrict" },
    ),
  },
  (table) => [
    primaryKey({ columns: [table.variantId, table.attributeId] }),
    index("variant_attribute_values_attribute_idx").on(
      table.attributeId,
      table.valueNumber,
    ),
    check(
      "variant_attribute_values_one_value_check",
      sql`num_nonnulls(${table.valueText}, ${table.valueNumber}, ${table.valueBoolean}) = 1`,
    ),
  ],
);

export const productMedia = pgTable(
  "product_media",
  {
    id: primaryId(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").references(() => productVariants.id, {
      onDelete: "cascade",
    }),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "restrict" }),
    mediaRole: varchar("media_role", { length: 24 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    index("product_media_product_sort_idx").on(
      table.productId,
      table.sortOrder,
    ),
    uniqueIndex("product_media_asset_uidx").on(
      table.productId,
      table.variantId,
      table.assetId,
    ),
    check(
      "product_media_role_check",
      sql`${table.mediaRole} in ('primary', 'gallery', 'diagram', 'video')`,
    ),
  ],
);

export const productDocuments = pgTable(
  "product_documents",
  {
    id: primaryId(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").references(() => productVariants.id, {
      onDelete: "cascade",
    }),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "restrict" }),
    documentType: varchar("document_type", { length: 40 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    version: varchar("version", { length: 40 }),
    validFrom: timestamp("valid_from", { withTimezone: true }),
    validTo: timestamp("valid_to", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [index("product_documents_product_id_idx").on(table.productId)],
);

export const productCertifications = pgTable(
  "product_certifications",
  {
    id: primaryId(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").references(() => productVariants.id, {
      onDelete: "cascade",
    }),
    scheme: varchar("scheme", { length: 100 }).notNull(),
    certificateNumber: varchar("certificate_number", { length: 160 }),
    issuer: varchar("issuer", { length: 200 }),
    status: varchar("status", { length: 24 }).notNull().default("active"),
    validFrom: timestamp("valid_from", { withTimezone: true }),
    validTo: timestamp("valid_to", { withTimezone: true }),
    documentAssetId: uuid("document_asset_id").references(
      () => mediaAssets.id,
      { onDelete: "set null" },
    ),
    ...auditTimestamps(),
  },
  (table) => [
    index("product_certifications_product_id_idx").on(table.productId),
    uniqueIndex("product_certifications_number_uidx")
      .on(table.scheme, table.certificateNumber)
      .where(sql`${table.certificateNumber} is not null`),
  ],
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
