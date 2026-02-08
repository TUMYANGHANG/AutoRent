import { randomUUID } from "crypto";
import { decimal, pgTable, timestamp, varchar, bigint } from "drizzle-orm/pg-core";
import { users } from "./user.js";

// Garages table – stores workshop / garage locations across Nepal
const garages = pgTable("garages", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  city: varchar("city", { length: 100 }),
  district: varchar("district", { length: 100 }),
  province: varchar("province", { length: 100 }),
  address: varchar("address", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 500 }),
  openingHours: varchar("opening_hours", { length: 100 }),
  type: varchar("type", { length: 50 }), // e.g. car_repair, tyre, workshop
  source: varchar("source", { length: 50 }), // e.g. osm, user
  osmId: bigint("osm_id", { mode: "number" }), // OpenStreetMap ID
  createdByUserId: varchar("created_by_user_id", { length: 255 }).references(
    () => users.id,
    { onDelete: "SET NULL" }
  ),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export { garages };
