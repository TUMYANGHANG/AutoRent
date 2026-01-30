/**
 * Run extra migrations (0003, 0004) that add vehicle_document_image and is_verified.
 * Run once: node scripts/run-extra-migrations.js
 * Requires: DATABASE_URL in .env
 */
import "dotenv/config";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set in .env");
  process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });

async function run() {
  try {
    console.log("Adding vehicle_document_image to vehicle_images...");
    await sql`ALTER TABLE vehicle_images ADD COLUMN IF NOT EXISTS vehicle_document_image boolean DEFAULT false NOT NULL`;
    console.log("Done: vehicle_images.vehicle_document_image");

    console.log("Adding is_verified to vehicles...");
    await sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false NOT NULL`;
    console.log("Done: vehicles.is_verified");

    console.log("Extra migrations completed.");
  } catch (err) {
    console.error("Migration error:", err.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
