-- Add pickup location columns to vehicles for "find nearby" feature
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "pickup_latitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "pickup_longitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "pickup_address" varchar(500);
