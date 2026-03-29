-- Manual migration: run against your Postgres DB when you are ready (no Drizzle migration generated).
-- Enum for inquiry source
DO $$ BEGIN
  CREATE TYPE inquiry_source AS ENUM ('contact', 'faq', 'footer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS contact_inquiries (
  id VARCHAR(255) PRIMARY KEY,
  source inquiry_source NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(500),
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  read_at TIMESTAMP
);
