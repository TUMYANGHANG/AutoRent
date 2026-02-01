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

export const vehicleStatusEnum = pgEnum("vehicle_status", [
  "available",
  "rented",
  "maintenance",
  "inactive",
]);

// Vehicles table – id (PK), owner_id (FK), and full attributes
const vehicles = pgTable("vehicles", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => randomUUID()),
  ownerId: varchar("owner_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "CASCADE" }),
  brand: varchar("brand", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  vehicleType: varchar("vehicle_type", { length: 50 }),
  manufactureYear: integer("manufacture_year").notNull(),
  color: varchar("color", { length: 50 }),
  fuelType: varchar("fuel_type", { length: 50 }),
  transmission: varchar("transmission", { length: 50 }),
  seatingCapacity: integer("seating_capacity"),
  airbags: integer("airbags"),
  pricePerDay: decimal("price_per_day", { precision: 10, scale: 2 }).notNull(),
  securityDeposit: decimal("security_deposit", { precision: 10, scale: 2 }),
  lateFeePerHour: decimal("late_fee_per_hour", { precision: 10, scale: 2 }),
  status: vehicleStatusEnum("status").default("available").notNull(),
  description: text("description"),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export { vehicles };
