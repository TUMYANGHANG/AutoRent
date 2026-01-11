CREATE TYPE "public"."user_role" AS ENUM('renter', 'owner', 'admin');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_details" (
	"user_id" varchar(255) PRIMARY KEY NOT NULL,
	"phone_number" varchar(20),
	"date_of_birth" date,
	"profile_picture" varchar(500),
	"address" varchar(255),
	"city" varchar(100),
	"license_number" varchar(50),
	"license_expiry" date,
	"license_image" varchar(500),
	"is_license_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'renter' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_details" ADD CONSTRAINT "user_details_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
