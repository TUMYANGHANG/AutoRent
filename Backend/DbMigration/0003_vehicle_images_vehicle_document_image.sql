-- Add vehicle_document_image column to vehicle_images
ALTER TABLE "vehicle_images" ADD COLUMN IF NOT EXISTS "vehicle_document_image" boolean DEFAULT false NOT NULL;
