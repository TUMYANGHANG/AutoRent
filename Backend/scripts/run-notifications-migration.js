/**
 * Run the notifications table migration.
 * Usage: node scripts/run-notifications-migration.js
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
  `CREATE TABLE IF NOT EXISTS "notifications" (
  "id" varchar(255) PRIMARY KEY NOT NULL,
  "recipient_user_id" varchar(255) NOT NULL,
  "type" varchar(50) NOT NULL,
  "title" varchar(255) NOT NULL,
  "message" text,
  "vehicle_id" varchar(255),
  "actor_user_id" varchar(255),
  "is_read" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
)`,
  `DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_user_id_users_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$`,
  `DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE SET NULL ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$`,
  `DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$`,
  `CREATE INDEX IF NOT EXISTS "notifications_recipient_user_id_idx" ON "notifications" USING btree ("recipient_user_id")`,
  `CREATE INDEX IF NOT EXISTS "notifications_recipient_read_created_idx" ON "notifications" ("recipient_user_id", "is_read", "created_at" DESC)`,
];

async function run() {
  try {
    for (const statement of statements) {
      await sql.unsafe(statement);
      console.log("OK:", statement.slice(0, 60) + "...");
    }
    console.log("Notifications migration completed.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
