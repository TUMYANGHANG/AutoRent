DO $$ BEGIN
 ALTER TABLE "users" ADD COLUMN "is_profile_verified" boolean DEFAULT false NOT NULL;
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;