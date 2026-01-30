import { randomUUID } from "crypto";
import {
    boolean,
    decimal,
    integer,
    pgEnum,
    pgTable,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";
import { users } from "./user.js";

// Vehicle status enum
export const vehicleStatusEnum = pgEnum("vehicle_status", [
  "available",
  "rented",
  "maintenance",
  "inactive",
]);

// Vehicles table (many-to-one with users as owner)
const vehicles = pgTable("vehicles", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => randomUUID()),
  ownerId: varchar("owner_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "CASCADE" }),
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  licensePlate: varchar("license_plate", { length: 20 }).notNull().unique(),
  color: varchar("color", { length: 50 }),
  dailyRate: decimal("daily_rate", { precision: 10, scale: 2 }).notNull(),
  status: vehicleStatusEnum("status").default("available").notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export { vehicles };

