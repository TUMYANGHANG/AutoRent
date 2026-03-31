import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load .env file
dotenv.config();

export default defineConfig({
  schema: "./schema/index.js",   // sql schema file (exports all schemas)
  out: "./DbMigration",         // Migration folder
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,   // Use process.env
  },
});