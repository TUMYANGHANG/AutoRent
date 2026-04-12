import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Create the connection
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

function numEnv(key, fallback) {
  const v = Number(process.env[key]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

// Hosted Postgres often drops idle TCP sessions; pool settings avoid reusing dead sockets.
// See: postgres.js README (idle_timeout, max_lifetime, ECONNRESET).
const client = postgres(connectionString, {
  max: numEnv("PG_POOL_MAX", 8),
  idle_timeout: numEnv("PG_IDLE_TIMEOUT_SEC", 25),
  max_lifetime: numEnv("PG_MAX_LIFETIME_SEC", 900),
  connect_timeout: numEnv("PG_CONNECT_TIMEOUT_SEC", 45),
});

// Create drizzle instance
const db = drizzle(client);

export { client, db };

