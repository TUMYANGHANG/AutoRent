DO $$ BEGIN
 CREATE TYPE "public"."owner_invoice_status" AS ENUM('pending', 'paid', 'waived', 'disputed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."owner_settlement_payment_method" AS ENUM('khalti', 'stripe');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."settlement_period_status" AS ENUM('open', 'closed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."wheel_category" AS ENUM('two_wheeler', 'four_wheeler');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "owner_commission_invoices" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"owner_id" varchar(255) NOT NULL,
	"settlement_period_id" varchar(255) NOT NULL,
	"reference_code" varchar(64) NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'NPR' NOT NULL,
	"status" "owner_invoice_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"paid_at" timestamp,
	"payment_method" "owner_settlement_payment_method",
	"payment_reference" text,
	"proof_url" varchar(512),
	"confirmed_by_user_id" varchar(255),
	"confirmed_at" timestamp,
	"notes" text,
	CONSTRAINT "owner_commission_invoices_reference_code_unique" UNIQUE("reference_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "platform_commission_lines" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"settlement_period_id" varchar(255) NOT NULL,
	"owner_invoice_id" varchar(255),
	"booking_id" varchar(255) NOT NULL,
	"payment_id" varchar(255),
	"owner_id" varchar(255) NOT NULL,
	"vehicle_id" varchar(255) NOT NULL,
	"wheel_category" "wheel_category" NOT NULL,
	"base_amount" numeric(12, 2) NOT NULL,
	"commission_rate_pct" numeric(5, 2) NOT NULL,
	"commission_amount" numeric(12, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "platform_settlement_periods" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"status" "settlement_period_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vehicles" ADD COLUMN "wheel_category" "wheel_category" DEFAULT 'four_wheeler' NOT NULL;
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "owner_commission_invoices" ADD CONSTRAINT "owner_commission_invoices_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "owner_commission_invoices" ADD CONSTRAINT "owner_commission_invoices_settlement_period_id_platform_settlement_periods_id_fk" FOREIGN KEY ("settlement_period_id") REFERENCES "public"."platform_settlement_periods"("id") ON DELETE CASCADE ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "owner_commission_invoices" ADD CONSTRAINT "owner_commission_invoices_confirmed_by_user_id_users_id_fk" FOREIGN KEY ("confirmed_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "platform_commission_lines" ADD CONSTRAINT "platform_commission_lines_settlement_period_id_platform_settlement_periods_id_fk" FOREIGN KEY ("settlement_period_id") REFERENCES "public"."platform_settlement_periods"("id") ON DELETE CASCADE ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "platform_commission_lines" ADD CONSTRAINT "platform_commission_lines_owner_invoice_id_owner_commission_invoices_id_fk" FOREIGN KEY ("owner_invoice_id") REFERENCES "public"."owner_commission_invoices"("id") ON DELETE SET NULL ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "platform_commission_lines" ADD CONSTRAINT "platform_commission_lines_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "platform_commission_lines" ADD CONSTRAINT "platform_commission_lines_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE SET NULL ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "platform_commission_lines" ADD CONSTRAINT "platform_commission_lines_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "platform_commission_lines" ADD CONSTRAINT "platform_commission_lines_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
