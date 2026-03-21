CREATE TYPE "public"."booking_request_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "booking_requests" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"vehicle_id" varchar(255) NOT NULL,
	"renter_id" varchar(255) NOT NULL,
	"owner_id" varchar(255) NOT NULL,
	"start_date" date NOT NULL,
	"return_date" date NOT NULL,
	"pickup_place" varchar(500) NOT NULL,
	"dropoff_place" varchar(500),
	"notes" text,
	"status" "booking_request_status" DEFAULT 'pending' NOT NULL,
	"rejection_reason" varchar(500),
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "booking_request_id" varchar(255);--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "security_deposit" numeric(12, 2);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_renter_id_users_id_fk" FOREIGN KEY ("renter_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookings" ADD CONSTRAINT "bookings_booking_request_id_booking_requests_id_fk" FOREIGN KEY ("booking_request_id") REFERENCES "public"."booking_requests"("id") ON DELETE SET NULL ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
