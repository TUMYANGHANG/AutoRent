import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Create the connection
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

// Create postgres connection
const client = postgres(connectionString, {
  max: 1,
});

// Create drizzle instance
const db = drizzle(client);

export { client, db };

