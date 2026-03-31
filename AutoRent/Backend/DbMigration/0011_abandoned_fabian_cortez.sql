DO $$ BEGIN
 CREATE TYPE "public"."inquiry_source" AS ENUM('contact', 'faq', 'footer');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contact_inquiries" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"source" "inquiry_source" NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"subject" varchar(500),
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"read_at" timestamp
);
--> statement-breakpoint
DROP TABLE "owner_commission_invoices" CASCADE;--> statement-breakpoint
DROP TABLE "platform_commission_lines" CASCADE;--> statement-breakpoint
DROP TABLE "platform_settlement_periods" CASCADE;--> statement-breakpoint
ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "wheel_category";--> statement-breakpoint
DROP TYPE "public"."owner_invoice_status";--> statement-breakpoint
DROP TYPE "public"."owner_settlement_payment_method";--> statement-breakpoint
DROP TYPE "public"."settlement_period_status";--> statement-breakpoint
DROP TYPE "public"."wheel_category";