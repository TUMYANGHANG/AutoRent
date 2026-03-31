DO $$ BEGIN
 ALTER TABLE "garages" ADD COLUMN "email" varchar(255);
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "garages" ADD COLUMN "website" varchar(500);
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "garages" ADD COLUMN "opening_hours" varchar(100);
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "garages" ADD COLUMN "osm_id" bigint;
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;