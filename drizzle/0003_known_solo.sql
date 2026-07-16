ALTER TABLE "seller_orders" ADD COLUMN "currency" varchar(3) DEFAULT 'AUD' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_status_check" CHECK ("orders"."payment_status" in ('unpaid', 'authorized', 'paid', 'partially_refunded', 'refunded', 'failed', 'cancelled'));--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_fulfillment_status_check" CHECK ("orders"."fulfillment_status" in ('unfulfilled', 'partially_fulfilled', 'fulfilled', 'returned'));--> statement-breakpoint
ALTER TABLE "payment_intents" ADD CONSTRAINT "payment_intents_status_check" CHECK ("payment_intents"."status" in ('created', 'requires_action', 'authorized', 'captured', 'failed', 'cancelled', 'expired'));--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_status_check" CHECK ("refunds"."status" in ('requested', 'approved', 'processing', 'succeeded', 'failed', 'cancelled'));--> statement-breakpoint
ALTER TABLE "seller_orders" ADD CONSTRAINT "seller_orders_status_check" CHECK ("seller_orders"."status" in ('pending', 'accepted', 'processing', 'partially_fulfilled', 'fulfilled', 'completed', 'cancelled'));--> statement-breakpoint
ALTER TABLE "seller_orders" ADD CONSTRAINT "seller_orders_fulfillment_status_check" CHECK ("seller_orders"."fulfillment_status" in ('unfulfilled', 'partially_fulfilled', 'fulfilled', 'returned'));--> statement-breakpoint
ALTER TABLE "seller_orders" ADD CONSTRAINT "seller_orders_payout_status_check" CHECK ("seller_orders"."payout_status" in ('pending', 'available', 'processing', 'paid', 'held', 'reversed'));--> statement-breakpoint
ALTER TABLE "seller_orders" ADD CONSTRAINT "seller_orders_amounts_check" CHECK ("seller_orders"."subtotal_minor" >= 0 and "seller_orders"."discount_minor" >= 0
        and "seller_orders"."shipping_minor" >= 0 and "seller_orders"."tax_minor" >= 0
        and "seller_orders"."total_minor" >= 0 and "seller_orders"."commission_minor" >= 0);