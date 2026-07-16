CREATE TABLE "account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"id_token" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attribute_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" varchar(160) NOT NULL,
	"description" text,
	"data_type" varchar(20) NOT NULL,
	"scope" varchar(20) NOT NULL,
	"default_unit_code" varchar(16),
	"validation_rules" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_filterable" boolean DEFAULT false NOT NULL,
	"is_comparable" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attribute_definitions_type_check" CHECK ("attribute_definitions"."data_type" in ('text', 'number', 'boolean')),
	CONSTRAINT "attribute_definitions_scope_check" CHECK ("attribute_definitions"."scope" in ('product', 'variant'))
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_brand_id" uuid,
	"name" varchar(160) NOT NULL,
	"slug" varchar(180) NOT NULL,
	"legal_name" varchar(200),
	"description" text,
	"website_url" text,
	"logo_asset_id" uuid,
	"status" varchar(24) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "brands_status_check" CHECK ("brands"."status" in ('draft', 'active', 'archived')),
	CONSTRAINT "brands_parent_check" CHECK ("brands"."parent_brand_id" is null or "brands"."parent_brand_id" <> "brands"."id")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"name" varchar(160) NOT NULL,
	"slug" varchar(180) NOT NULL,
	"description" text,
	"status" varchar(24) DEFAULT 'active' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"seo_title" varchar(180),
	"seo_description" varchar(320),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_status_check" CHECK ("categories"."status" in ('draft', 'active', 'archived')),
	CONSTRAINT "categories_parent_check" CHECK ("categories"."parent_id" is null or "categories"."parent_id" <> "categories"."id")
);
--> statement-breakpoint
CREATE TABLE "category_attributes" (
	"category_id" uuid NOT NULL,
	"attribute_id" uuid NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"is_variant_axis" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "category_attributes_category_id_attribute_id_pk" PRIMARY KEY("category_id","attribute_id")
);
--> statement-breakpoint
CREATE TABLE "measurement_units" (
	"code" varchar(16) PRIMARY KEY NOT NULL,
	"name" varchar(80) NOT NULL,
	"symbol" varchar(24) NOT NULL,
	"dimension" varchar(40) NOT NULL,
	"conversion_factor" numeric(24, 12) DEFAULT '1' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"storage_provider" varchar(40) NOT NULL,
	"bucket" varchar(120) NOT NULL,
	"storage_key" text NOT NULL,
	"mime_type" varchar(120) NOT NULL,
	"file_size_bytes" integer NOT NULL,
	"sha256" varchar(64),
	"width" integer,
	"height" integer,
	"alt_text" text,
	"uploaded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_assets_file_size_check" CHECK ("media_assets"."file_size_bytes" >= 0)
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"product_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "product_categories_product_id_category_id_pk" PRIMARY KEY("product_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "product_certifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid,
	"scheme" varchar(100) NOT NULL,
	"certificate_number" varchar(160),
	"issuer" varchar(200),
	"status" varchar(24) DEFAULT 'active' NOT NULL,
	"valid_from" timestamp with time zone,
	"valid_to" timestamp with time zone,
	"document_asset_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid,
	"asset_id" uuid NOT NULL,
	"document_type" varchar(40) NOT NULL,
	"title" varchar(200) NOT NULL,
	"version" varchar(40),
	"valid_from" timestamp with time zone,
	"valid_to" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid,
	"asset_id" uuid NOT NULL,
	"media_role" varchar(24) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "product_media_role_check" CHECK ("product_media"."media_role" in ('primary', 'gallery', 'diagram', 'video'))
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"catalog_sku" varchar(100) NOT NULL,
	"name" varchar(180) NOT NULL,
	"specification_summary" varchar(220),
	"manufacturer_part_number" varchar(120),
	"gtin" varchar(14),
	"status" varchar(24) DEFAULT 'draft' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"minimum_order_quantity" integer DEFAULT 1 NOT NULL,
	"maximum_order_quantity" integer,
	"lead_time_days" integer DEFAULT 0 NOT NULL,
	"track_inventory" boolean DEFAULT true NOT NULL,
	"backorder_policy" varchar(24) DEFAULT 'deny' NOT NULL,
	"weight_g" integer,
	"length_mm" integer,
	"width_mm" integer,
	"height_mm" integer,
	"is_dangerous_goods" boolean DEFAULT false NOT NULL,
	"dangerous_goods_class" varchar(40),
	"un_number" varchar(16),
	"battery_energy_wh" numeric(12, 3),
	"published_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_variants_status_check" CHECK ("product_variants"."status" in ('draft', 'active', 'discontinued', 'archived')),
	CONSTRAINT "product_variants_dimensions_check" CHECK (("product_variants"."weight_g" is null or "product_variants"."weight_g" >= 0)
        and ("product_variants"."length_mm" is null or "product_variants"."length_mm" >= 0)
        and ("product_variants"."width_mm" is null or "product_variants"."width_mm" >= 0)
        and ("product_variants"."height_mm" is null or "product_variants"."height_mm" >= 0)),
	CONSTRAINT "product_variants_order_quantity_check" CHECK ("product_variants"."minimum_order_quantity" > 0
        and ("product_variants"."maximum_order_quantity" is null or "product_variants"."maximum_order_quantity" >= "product_variants"."minimum_order_quantity")),
	CONSTRAINT "product_variants_backorder_check" CHECK ("product_variants"."backorder_policy" in ('deny', 'allow', 'preorder')),
	CONSTRAINT "product_variants_lead_time_check" CHECK ("product_variants"."lead_time_days" >= 0)
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"tax_class_id" uuid NOT NULL,
	"product_type" varchar(24) DEFAULT 'physical' NOT NULL,
	"name" varchar(180) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"model_number" varchar(120),
	"short_description" varchar(420) NOT NULL,
	"description" text NOT NULL,
	"status" varchar(24) DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"seo_title" varchar(180),
	"seo_description" varchar(320),
	"published_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_type_check" CHECK ("products"."product_type" in ('physical', 'service', 'bundle')),
	CONSTRAINT "products_status_check" CHECK ("products"."status" in ('draft', 'active', 'discontinued', 'archived'))
);
--> statement-breakpoint
CREATE TABLE "tax_classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(60) NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "variant_attribute_values" (
	"variant_id" uuid NOT NULL,
	"attribute_id" uuid NOT NULL,
	"value_text" text,
	"value_number" numeric(24, 6),
	"value_boolean" boolean,
	"unit_code" varchar(16),
	CONSTRAINT "variant_attribute_values_variant_id_attribute_id_pk" PRIMARY KEY("variant_id","attribute_id"),
	CONSTRAINT "variant_attribute_values_one_value_check" CHECK (num_nonnulls("variant_attribute_values"."value_text", "variant_attribute_values"."value_number", "variant_attribute_values"."value_boolean") = 1)
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cart_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"added_unit_amount_minor" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cart_items_quantity_check" CHECK ("cart_items"."quantity" > 0),
	CONSTRAINT "cart_items_amount_check" CHECK ("cart_items"."added_unit_amount_minor" >= 0)
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"guest_id" uuid,
	"status" varchar(24) DEFAULT 'active' NOT NULL,
	"currency" varchar(3) DEFAULT 'AUD' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "carts_owner_check" CHECK (num_nonnulls("carts"."user_id", "carts"."guest_id") = 1),
	CONSTRAINT "carts_status_check" CHECK ("carts"."status" in ('active', 'checkout', 'converted', 'abandoned', 'expired'))
);
--> statement-breakpoint
CREATE TABLE "checkout_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cart_id" uuid NOT NULL,
	"user_id" uuid,
	"guest_id" uuid,
	"fulfillment_type" varchar(20) NOT NULL,
	"status" varchar(24) DEFAULT 'open' NOT NULL,
	"currency" varchar(3) DEFAULT 'AUD' NOT NULL,
	"idempotency_key" varchar(160) NOT NULL,
	"pricing_snapshot_hash" varchar(64),
	"expires_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "checkout_sessions_owner_check" CHECK (num_nonnulls("checkout_sessions"."user_id", "checkout_sessions"."guest_id") >= 1),
	CONSTRAINT "checkout_sessions_fulfillment_check" CHECK ("checkout_sessions"."fulfillment_type" in ('pickup', 'delivery')),
	CONSTRAINT "checkout_sessions_status_check" CHECK ("checkout_sessions"."status" in ('open', 'processing', 'completed', 'expired', 'cancelled'))
);
--> statement-breakpoint
CREATE TABLE "order_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"address_type" varchar(16) NOT NULL,
	"recipient_name" varchar(180) NOT NULL,
	"company_name" varchar(200),
	"address_line_1" varchar(200) NOT NULL,
	"address_line_2" varchar(200),
	"suburb" varchar(120) NOT NULL,
	"state" varchar(80) NOT NULL,
	"postcode" varchar(16) NOT NULL,
	"country_code" varchar(2) NOT NULL,
	"phone_e164" varchar(20),
	"delivery_instructions" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_addresses_type_check" CHECK ("order_addresses"."address_type" in ('billing', 'shipping'))
);
--> statement-breakpoint
CREATE TABLE "order_adjustments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"order_item_id" uuid,
	"adjustment_type" varchar(32) NOT NULL,
	"code" varchar(80),
	"label" varchar(200) NOT NULL,
	"amount_minor" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"variant_id" uuid,
	"product_name" varchar(180) NOT NULL,
	"variant_name" varchar(180) NOT NULL,
	"brand_name" varchar(160) NOT NULL,
	"sku" varchar(100) NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price_minor" bigint NOT NULL,
	"unit_cost_minor" bigint,
	"discount_minor" bigint DEFAULT 0 NOT NULL,
	"tax_minor" bigint NOT NULL,
	"line_total_minor" bigint NOT NULL,
	"product_snapshot" jsonb NOT NULL,
	"fulfillment_status" varchar(32) DEFAULT 'unfulfilled' NOT NULL,
	"returnable_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_items_quantity_check" CHECK ("order_items"."quantity" > 0),
	CONSTRAINT "order_items_amounts_check" CHECK ("order_items"."unit_price_minor" >= 0
        and ("order_items"."unit_cost_minor" is null or "order_items"."unit_cost_minor" >= 0)
        and "order_items"."discount_minor" >= 0 and "order_items"."tax_minor" >= 0
        and "order_items"."line_total_minor" >= 0)
);
--> statement-breakpoint
CREATE TABLE "order_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"actor_user_id" uuid,
	"status_type" varchar(32) NOT NULL,
	"from_status" varchar(32),
	"to_status" varchar(32) NOT NULL,
	"reason" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_tax_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"order_item_id" uuid,
	"tax_name" varchar(100) NOT NULL,
	"jurisdiction" varchar(100) NOT NULL,
	"rate" numeric(9, 6) NOT NULL,
	"taxable_amount_minor" bigint NOT NULL,
	"tax_amount_minor" bigint NOT NULL,
	CONSTRAINT "order_tax_lines_amounts_check" CHECK ("order_tax_lines"."rate" >= 0 and "order_tax_lines"."taxable_amount_minor" >= 0 and "order_tax_lines"."tax_amount_minor" >= 0)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar(40) NOT NULL,
	"checkout_session_id" uuid NOT NULL,
	"user_id" uuid,
	"guest_id" uuid,
	"customer_email" varchar(320) NOT NULL,
	"fulfillment_type" varchar(20) NOT NULL,
	"status" varchar(32) DEFAULT 'pending_payment' NOT NULL,
	"payment_status" varchar(32) DEFAULT 'unpaid' NOT NULL,
	"fulfillment_status" varchar(32) DEFAULT 'unfulfilled' NOT NULL,
	"currency" varchar(3) DEFAULT 'AUD' NOT NULL,
	"subtotal_minor" bigint NOT NULL,
	"discount_minor" bigint DEFAULT 0 NOT NULL,
	"shipping_minor" bigint DEFAULT 0 NOT NULL,
	"tax_minor" bigint NOT NULL,
	"total_minor" bigint NOT NULL,
	"customer_notes" text,
	"placed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_amounts_check" CHECK ("orders"."subtotal_minor" >= 0 and "orders"."discount_minor" >= 0
        and "orders"."shipping_minor" >= 0 and "orders"."tax_minor" >= 0
        and "orders"."total_minor" >= 0),
	CONSTRAINT "orders_fulfillment_type_check" CHECK ("orders"."fulfillment_type" in ('pickup', 'delivery')),
	CONSTRAINT "orders_status_check" CHECK ("orders"."status" in ('pending_payment', 'confirmed', 'processing', 'partially_fulfilled', 'fulfilled', 'completed', 'cancelled')),
	CONSTRAINT "orders_payment_status_check" CHECK ("orders"."payment_status" in ('unpaid', 'authorized', 'paid', 'partially_refunded', 'refunded', 'failed', 'cancelled')),
	CONSTRAINT "orders_fulfillment_status_check" CHECK ("orders"."fulfillment_status" in ('unfulfilled', 'preparing', 'ready_for_pickup', 'partially_fulfilled', 'fulfilled', 'returned'))
);
--> statement-breakpoint
CREATE TABLE "payment_intents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"provider" varchar(40) NOT NULL,
	"provider_intent_id" varchar(200),
	"status" varchar(32) DEFAULT 'created' NOT NULL,
	"amount_minor" bigint NOT NULL,
	"currency" varchar(3) NOT NULL,
	"idempotency_key" varchar(160) NOT NULL,
	"failure_code" varchar(100),
	"failure_message" text,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_intents_amount_check" CHECK ("payment_intents"."amount_minor" >= 0),
	CONSTRAINT "payment_intents_status_check" CHECK ("payment_intents"."status" in ('created', 'requires_action', 'authorized', 'captured', 'failed', 'cancelled', 'expired'))
);
--> statement-breakpoint
CREATE TABLE "payment_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_intent_id" uuid NOT NULL,
	"transaction_type" varchar(24) NOT NULL,
	"provider_transaction_id" varchar(200),
	"status" varchar(24) NOT NULL,
	"amount_minor" bigint NOT NULL,
	"currency" varchar(3) NOT NULL,
	"provider_response" jsonb,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_transactions_type_check" CHECK ("payment_transactions"."transaction_type" in ('authorize', 'capture', 'void', 'refund', 'chargeback')),
	CONSTRAINT "payment_transactions_amount_check" CHECK ("payment_transactions"."amount_minor" >= 0)
);
--> statement-breakpoint
CREATE TABLE "refund_items" (
	"refund_id" uuid NOT NULL,
	"order_item_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"amount_minor" bigint NOT NULL,
	CONSTRAINT "refund_items_refund_id_order_item_id_pk" PRIMARY KEY("refund_id","order_item_id"),
	CONSTRAINT "refund_items_quantity_check" CHECK ("refund_items"."quantity" > 0),
	CONSTRAINT "refund_items_amount_check" CHECK ("refund_items"."amount_minor" >= 0)
);
--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"refund_number" varchar(40) NOT NULL,
	"order_id" uuid NOT NULL,
	"payment_intent_id" uuid NOT NULL,
	"provider_refund_id" varchar(200),
	"status" varchar(24) DEFAULT 'requested' NOT NULL,
	"reason" text NOT NULL,
	"amount_minor" bigint NOT NULL,
	"requested_by" uuid,
	"approved_by" uuid,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "refunds_amount_check" CHECK ("refunds"."amount_minor" >= 0),
	CONSTRAINT "refunds_status_check" CHECK ("refunds"."status" in ('requested', 'approved', 'processing', 'succeeded', 'failed', 'cancelled'))
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" varchar(40) NOT NULL,
	"provider_event_id" varchar(200) NOT NULL,
	"event_type" varchar(120) NOT NULL,
	"payload" jsonb NOT NULL,
	"status" varchar(24) DEFAULT 'received' NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"next_attempt_at" timestamp with time zone,
	"last_error" text,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "customer_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"label" varchar(80),
	"recipient_name" varchar(180) NOT NULL,
	"company_name" varchar(200),
	"address_line_1" varchar(200) NOT NULL,
	"address_line_2" varchar(200),
	"suburb" varchar(120) NOT NULL,
	"state" varchar(80) NOT NULL,
	"postcode" varchar(16) NOT NULL,
	"country_code" varchar(2) DEFAULT 'AU' NOT NULL,
	"phone_e164" varchar(20),
	"delivery_instructions" text,
	"is_default_shipping" boolean DEFAULT false NOT NULL,
	"is_default_billing" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"consent_type" varchar(60) NOT NULL,
	"version" varchar(40) NOT NULL,
	"granted" boolean NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source" varchar(60),
	"ip_address" varchar(64)
);
--> statement-breakpoint
CREATE TABLE "customer_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"customer_number" varchar(32) NOT NULL,
	"customer_type" varchar(20) DEFAULT 'individual' NOT NULL,
	"phone_e164" varchar(20),
	"company_name" varchar(200),
	"abn" varchar(11),
	"default_currency" varchar(3) DEFAULT 'AUD' NOT NULL,
	"marketing_consent_at" timestamp with time zone,
	"terms_accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customer_profiles_type_check" CHECK ("customer_profiles"."customer_type" in ('individual', 'business'))
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(60) NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"assigned_by" uuid,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "order_pickups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"pickup_number" varchar(48) NOT NULL,
	"status" varchar(24) DEFAULT 'preparing' NOT NULL,
	"contact_name" varchar(180) NOT NULL,
	"contact_phone_e164" varchar(20),
	"pickup_code_hash" varchar(128) NOT NULL,
	"ready_at" timestamp with time zone,
	"collected_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_pickups_status_check" CHECK ("order_pickups"."status" in ('preparing', 'ready', 'collected', 'expired', 'cancelled'))
);
--> statement-breakpoint
CREATE TABLE "return_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"return_id" uuid NOT NULL,
	"actor_user_id" uuid,
	"from_status" varchar(32),
	"to_status" varchar(32) NOT NULL,
	"note" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "return_items" (
	"return_id" uuid NOT NULL,
	"order_item_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"reason_code" varchar(80) NOT NULL,
	"condition" varchar(80),
	"inspection_notes" text,
	"restock_decision" varchar(32),
	CONSTRAINT "return_items_return_id_order_item_id_pk" PRIMARY KEY("return_id","order_item_id"),
	CONSTRAINT "return_items_quantity_check" CHECK ("return_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "returns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"return_number" varchar(48) NOT NULL,
	"order_id" uuid NOT NULL,
	"refund_id" uuid,
	"requested_by" uuid,
	"status" varchar(32) DEFAULT 'requested' NOT NULL,
	"reason" text NOT NULL,
	"requested_resolution" varchar(32) NOT NULL,
	"approved_at" timestamp with time zone,
	"received_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "returns_status_check" CHECK ("returns"."status" in ('requested', 'approved', 'rejected', 'in_transit', 'received', 'inspected', 'completed', 'cancelled')),
	CONSTRAINT "returns_resolution_check" CHECK ("returns"."requested_resolution" in ('refund', 'replacement', 'repair', 'store_credit'))
);
--> statement-breakpoint
CREATE TABLE "shipment_items" (
	"shipment_id" uuid NOT NULL,
	"order_item_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "shipment_items_shipment_id_order_item_id_pk" PRIMARY KEY("shipment_id","order_item_id"),
	CONSTRAINT "shipment_items_quantity_check" CHECK ("shipment_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"shipping_method_id" uuid,
	"shipment_number" varchar(48) NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"carrier" varchar(100),
	"service" varchar(100),
	"tracking_number" varchar(160),
	"tracking_url" text,
	"shipped_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shipments_status_check" CHECK ("shipments"."status" in ('pending', 'packed', 'shipped', 'in_transit', 'delivered', 'failed', 'cancelled', 'returned'))
);
--> statement-breakpoint
CREATE TABLE "shipping_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"method_type" varchar(24) DEFAULT 'carrier' NOT NULL,
	"carrier" varchar(100),
	"service_code" varchar(100),
	"min_delivery_days" integer,
	"max_delivery_days" integer,
	"supports_tracking" boolean DEFAULT true NOT NULL,
	"supports_dangerous_goods" boolean DEFAULT false NOT NULL,
	"status" varchar(24) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shipping_methods_type_check" CHECK ("shipping_methods"."method_type" in ('carrier', 'local_delivery', 'freight')),
	CONSTRAINT "shipping_methods_delivery_check" CHECK (("shipping_methods"."min_delivery_days" is null or "shipping_methods"."min_delivery_days" >= 0)
        and ("shipping_methods"."max_delivery_days" is null or "shipping_methods"."max_delivery_days" >= "shipping_methods"."min_delivery_days"))
);
--> statement-breakpoint
CREATE TABLE "shipping_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipping_method_id" uuid NOT NULL,
	"shipping_zone_id" uuid NOT NULL,
	"min_weight_g" integer,
	"max_weight_g" integer,
	"min_order_minor" bigint,
	"max_order_minor" bigint,
	"amount_minor" bigint NOT NULL,
	"currency" varchar(3) DEFAULT 'AUD' NOT NULL,
	"requires_freight" boolean DEFAULT false NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shipping_rates_amount_check" CHECK ("shipping_rates"."amount_minor" >= 0),
	CONSTRAINT "shipping_rates_period_check" CHECK ("shipping_rates"."ends_at" is null or "shipping_rates"."ends_at" > "shipping_rates"."starts_at")
);
--> statement-breakpoint
CREATE TABLE "shipping_zone_regions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipping_zone_id" uuid NOT NULL,
	"country_code" varchar(2) NOT NULL,
	"state_code" varchar(16),
	"postcode_from" varchar(16),
	"postcode_to" varchar(16)
);
--> statement-breakpoint
CREATE TABLE "shipping_zones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"status" varchar(24) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracking_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_id" uuid NOT NULL,
	"carrier_event_id" varchar(200),
	"event_code" varchar(80),
	"status" varchar(80) NOT NULL,
	"description" text,
	"location" varchar(200),
	"occurred_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guest" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_token" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "guest_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "inventory_levels" (
	"warehouse_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"on_hand" integer DEFAULT 0 NOT NULL,
	"reserved" integer DEFAULT 0 NOT NULL,
	"incoming" integer DEFAULT 0 NOT NULL,
	"safety_stock" integer DEFAULT 0 NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_levels_warehouse_id_variant_id_pk" PRIMARY KEY("warehouse_id","variant_id"),
	CONSTRAINT "inventory_levels_nonnegative_check" CHECK ("inventory_levels"."on_hand" >= 0 and "inventory_levels"."reserved" >= 0
        and "inventory_levels"."incoming" >= 0 and "inventory_levels"."safety_stock" >= 0),
	CONSTRAINT "inventory_levels_reserved_check" CHECK ("inventory_levels"."reserved" <= "inventory_levels"."on_hand")
);
--> statement-breakpoint
CREATE TABLE "inventory_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"movement_type" varchar(32) NOT NULL,
	"quantity_delta" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"reservation_id" uuid,
	"order_item_id" uuid,
	"reference_type" varchar(60),
	"reference_id" uuid,
	"reason" text,
	"performed_by" uuid,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_movements_type_check" CHECK ("inventory_movements"."movement_type" in ('receipt', 'reservation', 'release', 'sale', 'return', 'adjustment', 'transfer_in', 'transfer_out')),
	CONSTRAINT "inventory_movements_delta_check" CHECK ("inventory_movements"."quantity_delta" <> 0 and "inventory_movements"."balance_after" >= 0)
);
--> statement-breakpoint
CREATE TABLE "inventory_reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"checkout_session_id" uuid NOT NULL,
	"order_item_id" uuid,
	"quantity" integer NOT NULL,
	"status" varchar(24) DEFAULT 'active' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"committed_at" timestamp with time zone,
	"released_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_reservations_quantity_check" CHECK ("inventory_reservations"."quantity" > 0),
	CONSTRAINT "inventory_reservations_status_check" CHECK ("inventory_reservations"."status" in ('active', 'committed', 'released', 'expired'))
);
--> statement-breakpoint
CREATE TABLE "inventory_serials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"serial_number" varchar(180) NOT NULL,
	"status" varchar(24) DEFAULT 'in_stock' NOT NULL,
	"order_item_id" uuid,
	"received_at" timestamp with time zone NOT NULL,
	"sold_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_serials_status_check" CHECK ("inventory_serials"."status" in ('in_stock', 'reserved', 'sold', 'returned', 'damaged', 'retired'))
);
--> statement-breakpoint
CREATE TABLE "warehouses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(40) NOT NULL,
	"name" varchar(160) NOT NULL,
	"location_type" varchar(24) DEFAULT 'office' NOT NULL,
	"pickup_enabled" boolean DEFAULT true NOT NULL,
	"delivery_enabled" boolean DEFAULT true NOT NULL,
	"address_line_1" varchar(200) NOT NULL,
	"address_line_2" varchar(200),
	"suburb" varchar(120) NOT NULL,
	"state" varchar(80) NOT NULL,
	"postcode" varchar(16) NOT NULL,
	"country_code" varchar(2) DEFAULT 'AU' NOT NULL,
	"timezone" varchar(64) DEFAULT 'Australia/Sydney' NOT NULL,
	"status" varchar(24) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "warehouses_location_type_check" CHECK ("warehouses"."location_type" in ('office', 'warehouse')),
	CONSTRAINT "warehouses_status_check" CHECK ("warehouses"."status" in ('active', 'inactive', 'closed'))
);
--> statement-breakpoint
CREATE TABLE "promotion_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"promotion_id" uuid NOT NULL,
	"code" varchar(80) NOT NULL,
	"maximum_redemptions" integer,
	"maximum_redemptions_per_user" integer,
	"redemption_count" integer DEFAULT 0 NOT NULL,
	"status" varchar(24) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "promotion_codes_counts_check" CHECK ("promotion_codes"."redemption_count" >= 0
        and ("promotion_codes"."maximum_redemptions" is null or "promotion_codes"."maximum_redemptions" > 0)
        and ("promotion_codes"."maximum_redemptions_per_user" is null or "promotion_codes"."maximum_redemptions_per_user" > 0))
);
--> statement-breakpoint
CREATE TABLE "promotion_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"promotion_code_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"user_id" uuid,
	"amount_minor" bigint NOT NULL,
	"redeemed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "promotion_redemptions_amount_check" CHECK ("promotion_redemptions"."amount_minor" >= 0)
);
--> statement-breakpoint
CREATE TABLE "promotions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(180) NOT NULL,
	"description" text,
	"status" varchar(24) DEFAULT 'draft' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"conditions" jsonb NOT NULL,
	"effects" jsonb NOT NULL,
	"is_combinable" boolean DEFAULT false NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "promotions_status_check" CHECK ("promotions"."status" in ('draft', 'active', 'paused', 'ended')),
	CONSTRAINT "promotions_period_check" CHECK ("promotions"."ends_at" is null or "promotions"."ends_at" > "promotions"."starts_at")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" uuid,
	"before" jsonb,
	"after" jsonb,
	"ip_address" varchar(64),
	"request_id" varchar(100),
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "idempotency_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"operation" varchar(100) NOT NULL,
	"key" varchar(180) NOT NULL,
	"user_id" uuid,
	"request_hash" varchar(64) NOT NULL,
	"response_code" integer,
	"response_body" jsonb,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outbox_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aggregate_type" varchar(80) NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"event_type" varchar(120) NOT NULL,
	"payload" jsonb NOT NULL,
	"status" varchar(24) DEFAULT 'pending' NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"next_attempt_at" timestamp with time zone,
	"processed_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"price_type" varchar(24) DEFAULT 'regular' NOT NULL,
	"amount_minor" bigint NOT NULL,
	"currency" varchar(3) DEFAULT 'AUD' NOT NULL,
	"tax_inclusive" boolean DEFAULT true NOT NULL,
	"starts_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_prices_amount_check" CHECK ("product_prices"."amount_minor" >= 0),
	CONSTRAINT "product_prices_type_check" CHECK ("product_prices"."price_type" in ('regular', 'sale')),
	CONSTRAINT "product_prices_period_check" CHECK ("product_prices"."ends_at" is null or "product_prices"."ends_at" > "product_prices"."starts_at")
);
--> statement-breakpoint
CREATE TABLE "tax_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tax_class_id" uuid NOT NULL,
	"country_code" varchar(2) NOT NULL,
	"state_code" varchar(16),
	"name" varchar(100) NOT NULL,
	"rate" numeric(9, 6) NOT NULL,
	"valid_from" timestamp with time zone NOT NULL,
	"valid_to" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tax_rates_rate_check" CHECK ("tax_rates"."rate" >= 0 and "tax_rates"."rate" <= 1),
	CONSTRAINT "tax_rates_period_check" CHECK ("tax_rates"."valid_to" is null or "tax_rates"."valid_to" > "tax_rates"."valid_from")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_warranties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"warranty_policy_id" uuid NOT NULL,
	"product_id" uuid,
	"variant_id" uuid,
	"is_default" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_warranties_target_check" CHECK (num_nonnulls("product_warranties"."product_id", "product_warranties"."variant_id") = 1)
);
--> statement-breakpoint
CREATE TABLE "warranty_claim_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"warranty_claim_id" uuid NOT NULL,
	"actor_user_id" uuid,
	"from_status" varchar(32),
	"to_status" varchar(32) NOT NULL,
	"note" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warranty_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"claim_number" varchar(48) NOT NULL,
	"warranty_registration_id" uuid NOT NULL,
	"status" varchar(32) DEFAULT 'submitted' NOT NULL,
	"issue_description" text NOT NULL,
	"requested_resolution" varchar(40) NOT NULL,
	"resolution_notes" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "warranty_claims_status_check" CHECK ("warranty_claims"."status" in ('submitted', 'reviewing', 'approved', 'rejected', 'in_progress', 'resolved', 'cancelled'))
);
--> statement-breakpoint
CREATE TABLE "warranty_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid,
	"name" varchar(200) NOT NULL,
	"warranty_type" varchar(40) NOT NULL,
	"term_months" integer NOT NULL,
	"coverage" text NOT NULL,
	"exclusions" text,
	"claim_window_days" integer,
	"status" varchar(24) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "warranty_policies_term_check" CHECK ("warranty_policies"."term_months" > 0)
);
--> statement-breakpoint
CREATE TABLE "warranty_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_number" varchar(48) NOT NULL,
	"warranty_policy_id" uuid NOT NULL,
	"order_item_id" uuid NOT NULL,
	"user_id" uuid,
	"customer_email" varchar(320) NOT NULL,
	"status" varchar(24) DEFAULT 'active' NOT NULL,
	"manufacturer_reference" varchar(160),
	"registered_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "warranty_registrations_period_check" CHECK ("warranty_registrations"."expires_at" > "warranty_registrations"."registered_at")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attribute_definitions" ADD CONSTRAINT "attribute_definitions_default_unit_code_measurement_units_code_fk" FOREIGN KEY ("default_unit_code") REFERENCES "public"."measurement_units"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_parent_brand_id_brands_id_fk" FOREIGN KEY ("parent_brand_id") REFERENCES "public"."brands"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_logo_asset_id_media_assets_id_fk" FOREIGN KEY ("logo_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_attributes" ADD CONSTRAINT "category_attributes_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_attributes" ADD CONSTRAINT "category_attributes_attribute_id_attribute_definitions_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."attribute_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_certifications" ADD CONSTRAINT "product_certifications_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_certifications" ADD CONSTRAINT "product_certifications_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_certifications" ADD CONSTRAINT "product_certifications_document_asset_id_media_assets_id_fk" FOREIGN KEY ("document_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_documents" ADD CONSTRAINT "product_documents_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_documents" ADD CONSTRAINT "product_documents_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_documents" ADD CONSTRAINT "product_documents_asset_id_media_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_asset_id_media_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_tax_class_id_tax_classes_id_fk" FOREIGN KEY ("tax_class_id") REFERENCES "public"."tax_classes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_attribute_values" ADD CONSTRAINT "variant_attribute_values_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_attribute_values" ADD CONSTRAINT "variant_attribute_values_attribute_id_attribute_definitions_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."attribute_definitions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_attribute_values" ADD CONSTRAINT "variant_attribute_values_unit_code_measurement_units_code_fk" FOREIGN KEY ("unit_code") REFERENCES "public"."measurement_units"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_guest_id_guest_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guest"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_guest_id_guest_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guest"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_addresses" ADD CONSTRAINT "order_addresses_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_adjustments" ADD CONSTRAINT "order_adjustments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_adjustments" ADD CONSTRAINT "order_adjustments_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_tax_lines" ADD CONSTRAINT "order_tax_lines_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_tax_lines" ADD CONSTRAINT "order_tax_lines_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_checkout_session_id_checkout_sessions_id_fk" FOREIGN KEY ("checkout_session_id") REFERENCES "public"."checkout_sessions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_guest_id_guest_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guest"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_intents" ADD CONSTRAINT "payment_intents_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_payment_intent_id_payment_intents_id_fk" FOREIGN KEY ("payment_intent_id") REFERENCES "public"."payment_intents"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refund_items" ADD CONSTRAINT "refund_items_refund_id_refunds_id_fk" FOREIGN KEY ("refund_id") REFERENCES "public"."refunds"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refund_items" ADD CONSTRAINT "refund_items_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_intent_id_payment_intents_id_fk" FOREIGN KEY ("payment_intent_id") REFERENCES "public"."payment_intents"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_requested_by_user_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_approved_by_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_consents" ADD CONSTRAINT "customer_consents_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assigned_by_user_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_pickups" ADD CONSTRAINT "order_pickups_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_pickups" ADD CONSTRAINT "order_pickups_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_events" ADD CONSTRAINT "return_events_return_id_returns_id_fk" FOREIGN KEY ("return_id") REFERENCES "public"."returns"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_events" ADD CONSTRAINT "return_events_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_items" ADD CONSTRAINT "return_items_return_id_returns_id_fk" FOREIGN KEY ("return_id") REFERENCES "public"."returns"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_items" ADD CONSTRAINT "return_items_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "returns" ADD CONSTRAINT "returns_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "returns" ADD CONSTRAINT "returns_refund_id_refunds_id_fk" FOREIGN KEY ("refund_id") REFERENCES "public"."refunds"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "returns" ADD CONSTRAINT "returns_requested_by_user_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_items" ADD CONSTRAINT "shipment_items_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_items" ADD CONSTRAINT "shipment_items_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_shipping_method_id_shipping_methods_id_fk" FOREIGN KEY ("shipping_method_id") REFERENCES "public"."shipping_methods"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping_rates" ADD CONSTRAINT "shipping_rates_shipping_method_id_shipping_methods_id_fk" FOREIGN KEY ("shipping_method_id") REFERENCES "public"."shipping_methods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping_rates" ADD CONSTRAINT "shipping_rates_shipping_zone_id_shipping_zones_id_fk" FOREIGN KEY ("shipping_zone_id") REFERENCES "public"."shipping_zones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping_zone_regions" ADD CONSTRAINT "shipping_zone_regions_shipping_zone_id_shipping_zones_id_fk" FOREIGN KEY ("shipping_zone_id") REFERENCES "public"."shipping_zones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracking_events" ADD CONSTRAINT "tracking_events_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_levels" ADD CONSTRAINT "inventory_levels_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_levels" ADD CONSTRAINT "inventory_levels_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_reservation_id_inventory_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."inventory_reservations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_performed_by_user_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_checkout_session_id_checkout_sessions_id_fk" FOREIGN KEY ("checkout_session_id") REFERENCES "public"."checkout_sessions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_serials" ADD CONSTRAINT "inventory_serials_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_serials" ADD CONSTRAINT "inventory_serials_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_serials" ADD CONSTRAINT "inventory_serials_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotion_codes" ADD CONSTRAINT "promotion_codes_promotion_id_promotions_id_fk" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotion_redemptions" ADD CONSTRAINT "promotion_redemptions_promotion_code_id_promotion_codes_id_fk" FOREIGN KEY ("promotion_code_id") REFERENCES "public"."promotion_codes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotion_redemptions" ADD CONSTRAINT "promotion_redemptions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotion_redemptions" ADD CONSTRAINT "promotion_redemptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idempotency_keys" ADD CONSTRAINT "idempotency_keys_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_prices" ADD CONSTRAINT "product_prices_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_rates" ADD CONSTRAINT "tax_rates_tax_class_id_tax_classes_id_fk" FOREIGN KEY ("tax_class_id") REFERENCES "public"."tax_classes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_warranties" ADD CONSTRAINT "product_warranties_warranty_policy_id_warranty_policies_id_fk" FOREIGN KEY ("warranty_policy_id") REFERENCES "public"."warranty_policies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_warranties" ADD CONSTRAINT "product_warranties_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_warranties" ADD CONSTRAINT "product_warranties_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranty_claim_events" ADD CONSTRAINT "warranty_claim_events_warranty_claim_id_warranty_claims_id_fk" FOREIGN KEY ("warranty_claim_id") REFERENCES "public"."warranty_claims"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranty_claim_events" ADD CONSTRAINT "warranty_claim_events_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranty_claims" ADD CONSTRAINT "warranty_claims_warranty_registration_id_warranty_registrations_id_fk" FOREIGN KEY ("warranty_registration_id") REFERENCES "public"."warranty_registrations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranty_policies" ADD CONSTRAINT "warranty_policies_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranty_registrations" ADD CONSTRAINT "warranty_registrations_warranty_policy_id_warranty_policies_id_fk" FOREIGN KEY ("warranty_policy_id") REFERENCES "public"."warranty_policies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranty_registrations" ADD CONSTRAINT "warranty_registrations_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranty_registrations" ADD CONSTRAINT "warranty_registrations_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "account_provider_account_id_uidx" ON "account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "attribute_definitions_code_uidx" ON "attribute_definitions" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "brands_slug_uidx" ON "brands" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "brands_parent_brand_id_idx" ON "brands" USING btree ("parent_brand_id");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_uidx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "categories_parent_id_idx" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "categories_status_sort_idx" ON "categories" USING btree ("status","sort_order");--> statement-breakpoint
CREATE INDEX "category_attributes_attribute_id_idx" ON "category_attributes" USING btree ("attribute_id");--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_storage_uidx" ON "media_assets" USING btree ("storage_provider","bucket","storage_key");--> statement-breakpoint
CREATE INDEX "product_categories_category_id_idx" ON "product_categories" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_categories_primary_uidx" ON "product_categories" USING btree ("product_id") WHERE "product_categories"."is_primary" = true;--> statement-breakpoint
CREATE INDEX "product_certifications_product_id_idx" ON "product_certifications" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_certifications_number_uidx" ON "product_certifications" USING btree ("scheme","certificate_number") WHERE "product_certifications"."certificate_number" is not null;--> statement-breakpoint
CREATE INDEX "product_documents_product_id_idx" ON "product_documents" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_media_product_sort_idx" ON "product_media" USING btree ("product_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "product_media_asset_uidx" ON "product_media" USING btree ("product_id","variant_id","asset_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_variants_catalog_sku_uidx" ON "product_variants" USING btree ("catalog_sku");--> statement-breakpoint
CREATE UNIQUE INDEX "product_variants_gtin_uidx" ON "product_variants" USING btree ("gtin") WHERE "product_variants"."gtin" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "product_variants_default_uidx" ON "product_variants" USING btree ("product_id") WHERE "product_variants"."is_default" = true;--> statement-breakpoint
CREATE INDEX "product_variants_product_status_idx" ON "product_variants" USING btree ("product_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_uidx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_brand_id_idx" ON "products" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "products_tax_class_id_idx" ON "products" USING btree ("tax_class_id");--> statement-breakpoint
CREATE INDEX "products_catalogue_idx" ON "products" USING btree ("status","featured","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "tax_classes_code_uidx" ON "tax_classes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "variant_attribute_values_attribute_idx" ON "variant_attribute_values" USING btree ("attribute_id","value_number");--> statement-breakpoint
CREATE UNIQUE INDEX "cart_items_cart_variant_uidx" ON "cart_items" USING btree ("cart_id","variant_id");--> statement-breakpoint
CREATE INDEX "cart_items_variant_id_idx" ON "cart_items" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "carts_user_status_idx" ON "carts" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "carts_guest_status_idx" ON "carts" USING btree ("guest_id","status");--> statement-breakpoint
CREATE INDEX "carts_expiry_idx" ON "carts" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "carts_active_user_uidx" ON "carts" USING btree ("user_id") WHERE "carts"."user_id" is not null and "carts"."status" = 'active';--> statement-breakpoint
CREATE UNIQUE INDEX "carts_active_guest_uidx" ON "carts" USING btree ("guest_id") WHERE "carts"."guest_id" is not null and "carts"."status" = 'active';--> statement-breakpoint
CREATE UNIQUE INDEX "checkout_sessions_idempotency_uidx" ON "checkout_sessions" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "checkout_sessions_cart_idx" ON "checkout_sessions" USING btree ("cart_id","status");--> statement-breakpoint
CREATE INDEX "checkout_sessions_expiry_idx" ON "checkout_sessions" USING btree ("status","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "order_addresses_order_type_uidx" ON "order_addresses" USING btree ("order_id","address_type");--> statement-breakpoint
CREATE INDEX "order_adjustments_order_id_idx" ON "order_adjustments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_order_id_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_variant_id_idx" ON "order_items" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "order_status_history_order_time_idx" ON "order_status_history" USING btree ("order_id","occurred_at");--> statement-breakpoint
CREATE INDEX "order_tax_lines_order_id_idx" ON "order_tax_lines" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_number_uidx" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_checkout_session_uidx" ON "orders" USING btree ("checkout_session_id");--> statement-breakpoint
CREATE INDEX "orders_user_created_idx" ON "orders" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "orders_status_created_idx" ON "orders" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_intents_idempotency_uidx" ON "payment_intents" USING btree ("idempotency_key");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_intents_provider_id_uidx" ON "payment_intents" USING btree ("provider","provider_intent_id") WHERE "payment_intents"."provider_intent_id" is not null;--> statement-breakpoint
CREATE INDEX "payment_intents_order_id_idx" ON "payment_intents" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "payment_transactions_intent_idx" ON "payment_transactions" USING btree ("payment_intent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_transactions_provider_uidx" ON "payment_transactions" USING btree ("provider_transaction_id") WHERE "payment_transactions"."provider_transaction_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "refunds_number_uidx" ON "refunds" USING btree ("refund_number");--> statement-breakpoint
CREATE UNIQUE INDEX "refunds_provider_id_uidx" ON "refunds" USING btree ("provider_refund_id") WHERE "refunds"."provider_refund_id" is not null;--> statement-breakpoint
CREATE INDEX "refunds_order_id_idx" ON "refunds" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "webhook_events_provider_event_uidx" ON "webhook_events" USING btree ("provider","provider_event_id");--> statement-breakpoint
CREATE INDEX "webhook_events_processing_idx" ON "webhook_events" USING btree ("status","next_attempt_at");--> statement-breakpoint
CREATE INDEX "customer_addresses_user_id_idx" ON "customer_addresses" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "customer_addresses_default_shipping_uidx" ON "customer_addresses" USING btree ("user_id") WHERE "customer_addresses"."is_default_shipping" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "customer_addresses_default_billing_uidx" ON "customer_addresses" USING btree ("user_id") WHERE "customer_addresses"."is_default_billing" = true;--> statement-breakpoint
CREATE INDEX "customer_consents_user_type_idx" ON "customer_consents" USING btree ("user_id","consent_type","occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "customer_profiles_number_uidx" ON "customer_profiles" USING btree ("customer_number");--> statement-breakpoint
CREATE INDEX "user_roles_role_id_idx" ON "user_roles" USING btree ("role_id");--> statement-breakpoint
CREATE UNIQUE INDEX "order_pickups_order_uidx" ON "order_pickups" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "order_pickups_number_uidx" ON "order_pickups" USING btree ("pickup_number");--> statement-breakpoint
CREATE INDEX "order_pickups_location_status_idx" ON "order_pickups" USING btree ("warehouse_id","status");--> statement-breakpoint
CREATE INDEX "return_events_return_time_idx" ON "return_events" USING btree ("return_id","occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "returns_number_uidx" ON "returns" USING btree ("return_number");--> statement-breakpoint
CREATE INDEX "returns_order_status_idx" ON "returns" USING btree ("order_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "shipments_number_uidx" ON "shipments" USING btree ("shipment_number");--> statement-breakpoint
CREATE UNIQUE INDEX "shipments_carrier_tracking_uidx" ON "shipments" USING btree ("carrier","tracking_number") WHERE "shipments"."tracking_number" is not null;--> statement-breakpoint
CREATE INDEX "shipments_order_idx" ON "shipments" USING btree ("order_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "shipping_methods_name_uidx" ON "shipping_methods" USING btree ("name");--> statement-breakpoint
CREATE INDEX "shipping_methods_status_idx" ON "shipping_methods" USING btree ("status");--> statement-breakpoint
CREATE INDEX "shipping_rates_lookup_idx" ON "shipping_rates" USING btree ("shipping_zone_id","shipping_method_id","starts_at");--> statement-breakpoint
CREATE INDEX "shipping_zone_regions_zone_idx" ON "shipping_zone_regions" USING btree ("shipping_zone_id");--> statement-breakpoint
CREATE UNIQUE INDEX "shipping_zones_name_uidx" ON "shipping_zones" USING btree ("name");--> statement-breakpoint
CREATE INDEX "shipping_zones_status_idx" ON "shipping_zones" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tracking_events_shipment_time_idx" ON "tracking_events" USING btree ("shipment_id","occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "tracking_events_carrier_event_uidx" ON "tracking_events" USING btree ("carrier_event_id") WHERE "tracking_events"."carrier_event_id" is not null;--> statement-breakpoint
CREATE INDEX "guest_expires_at_idx" ON "guest" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "inventory_levels_variant_id_idx" ON "inventory_levels" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "inventory_movements_level_time_idx" ON "inventory_movements" USING btree ("warehouse_id","variant_id","occurred_at");--> statement-breakpoint
CREATE INDEX "inventory_movements_reference_idx" ON "inventory_movements" USING btree ("reference_type","reference_id");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_movements_reference_uidx" ON "inventory_movements" USING btree ("warehouse_id","variant_id","movement_type","reference_type","reference_id") WHERE "inventory_movements"."reference_id" is not null;--> statement-breakpoint
CREATE INDEX "inventory_reservations_checkout_idx" ON "inventory_reservations" USING btree ("checkout_session_id");--> statement-breakpoint
CREATE INDEX "inventory_reservations_expiry_idx" ON "inventory_reservations" USING btree ("status","expires_at");--> statement-breakpoint
CREATE INDEX "inventory_reservations_level_idx" ON "inventory_reservations" USING btree ("warehouse_id","variant_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_serials_variant_serial_uidx" ON "inventory_serials" USING btree ("variant_id","serial_number");--> statement-breakpoint
CREATE INDEX "inventory_serials_warehouse_status_idx" ON "inventory_serials" USING btree ("warehouse_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "warehouses_code_uidx" ON "warehouses" USING btree ("code");--> statement-breakpoint
CREATE INDEX "warehouses_status_idx" ON "warehouses" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "promotion_codes_code_uidx" ON "promotion_codes" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "promotion_redemptions_order_code_uidx" ON "promotion_redemptions" USING btree ("order_id","promotion_code_id");--> statement-breakpoint
CREATE INDEX "promotion_redemptions_user_idx" ON "promotion_redemptions" USING btree ("user_id","redeemed_at");--> statement-breakpoint
CREATE INDEX "promotions_active_idx" ON "promotions" USING btree ("status","starts_at","ends_at");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_time_idx" ON "audit_logs" USING btree ("entity_type","entity_id","occurred_at");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_time_idx" ON "audit_logs" USING btree ("actor_user_id","occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idempotency_keys_operation_key_uidx" ON "idempotency_keys" USING btree ("operation","key");--> statement-breakpoint
CREATE INDEX "idempotency_keys_expiry_idx" ON "idempotency_keys" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "outbox_events_processing_idx" ON "outbox_events" USING btree ("status","next_attempt_at","created_at");--> statement-breakpoint
CREATE INDEX "outbox_events_aggregate_idx" ON "outbox_events" USING btree ("aggregate_type","aggregate_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_prices_period_uidx" ON "product_prices" USING btree ("variant_id","price_type","currency","starts_at");--> statement-breakpoint
CREATE INDEX "product_prices_lookup_idx" ON "product_prices" USING btree ("variant_id","currency","starts_at","ends_at");--> statement-breakpoint
CREATE INDEX "tax_rates_lookup_idx" ON "tax_rates" USING btree ("tax_class_id","country_code","state_code","valid_from");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "verification_expires_at_idx" ON "verification" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "product_warranties_product_uidx" ON "product_warranties" USING btree ("warranty_policy_id","product_id") WHERE "product_warranties"."product_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "product_warranties_variant_uidx" ON "product_warranties" USING btree ("warranty_policy_id","variant_id") WHERE "product_warranties"."variant_id" is not null;--> statement-breakpoint
CREATE INDEX "warranty_claim_events_claim_time_idx" ON "warranty_claim_events" USING btree ("warranty_claim_id","occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "warranty_claims_number_uidx" ON "warranty_claims" USING btree ("claim_number");--> statement-breakpoint
CREATE INDEX "warranty_claims_registration_idx" ON "warranty_claims" USING btree ("warranty_registration_id","status");--> statement-breakpoint
CREATE INDEX "warranty_policies_brand_idx" ON "warranty_policies" USING btree ("brand_id");--> statement-breakpoint
CREATE UNIQUE INDEX "warranty_registrations_number_uidx" ON "warranty_registrations" USING btree ("registration_number");--> statement-breakpoint
CREATE INDEX "warranty_registrations_user_idx" ON "warranty_registrations" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "warranty_registrations_email_idx" ON "warranty_registrations" USING btree ("customer_email");