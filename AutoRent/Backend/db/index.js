import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Create the connection
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

// Create postgres connection
// Hosted Postgres (Neon, Supabase, Railway, etc.) often closes idle TCP/TLS sessions
// after a few minutes. Without idle_timeout, the next query can hit a dead socket
// and throw read ECONNRESET (see postgres.js README: "ECONNRESET issue").
const client = postgres(connectionString, {
  max: 1,
  idle_timeout: Number(process.env.PG_IDLE_TIMEOUT_SEC ?? 20),
  connect_timeout: Number(process.env.PG_CONNECT_TIMEOUT_SEC ?? 30),
});

// Create drizzle instance
const db = drizzle(client);

export { client, db };

