/**
 * Run the favorites table migration.
 * Usage: node scripts/run-favorites-migration.js
 */
import "dotenv/config";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });

const statements = [
  `CREATE TABLE IF NOT EXISTS "favorites" (
  "id" varchar(255) PRIMARY KEY NOT NULL,
  "user_id" varchar(255) NOT NULL,
  "vehicle_id" varchar(255) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
)`,
  `DO $$ BEGIN
 ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$`,
  `DO $$ BEGIN
 ALTER TABLE "favorites" ADD CONSTRAINT "favorites_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "favorites_user_id_vehicle_id_unique" ON "favorites" USING btree ("user_id","vehicle_id")`,
];

async function run() {
  try {
    for (const statement of statements) {
      await sql.unsafe(statement);
      console.log("OK:", statement.slice(0, 50) + "...");
    }
    console.log("Favorites migration completed.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
