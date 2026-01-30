-- Add is_verified column to vehicles
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "is_verified" boolean DEFAULT false NOT NULL;
