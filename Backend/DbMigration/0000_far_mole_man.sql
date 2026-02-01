CREATE TYPE "public"."user_role" AS ENUM('renter', 'owner', 'admin');--> statement-breakpoint
CREATE TYPE "public"."vehicle_status" AS ENUM('available', 'rented', 'maintenance', 'inactive');--> statement-breakpoint
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
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"role" "user_role" DEFAULT 'renter' NOT NULL,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"otp" varchar(6),
	"otp_expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vehicle_images" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"vehicle_id" varchar(255) NOT NULL,
	"image_url" varchar(500),
	"document_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vehicles" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"owner_id" varchar(255) NOT NULL,
	"brand" varchar(100) NOT NULL,
	"model" varchar(100) NOT NULL,
	"vehicle_type" varchar(50),
	"manufacture_year" integer NOT NULL,
	"color" varchar(50),
	"fuel_type" varchar(50),
	"transmission" varchar(50),
	"seating_capacity" integer,
	"airbags" integer,
	"price_per_day" numeric(10, 2) NOT NULL,
	"security_deposit" numeric(10, 2),
	"late_fee_per_hour" numeric(10, 2),
	"status" "vehicle_status" DEFAULT 'available' NOT NULL,
	"description" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_details" ADD CONSTRAINT "user_details_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vehicle_images" ADD CONSTRAINT "vehicle_images_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
