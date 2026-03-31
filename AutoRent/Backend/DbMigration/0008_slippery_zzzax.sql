CREATE TABLE IF NOT EXISTS "vehicle_reviews" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"vehicle_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"booking_id" varchar(255),
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vehicle_reviews_vehicle_id_user_id_unique" UNIQUE("vehicle_id","user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vehicle_reviews" ADD CONSTRAINT "vehicle_reviews_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vehicle_reviews" ADD CONSTRAINT "vehicle_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vehicle_reviews" ADD CONSTRAINT "vehicle_reviews_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE SET NULL ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
