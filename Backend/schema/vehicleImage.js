import { randomUUID } from "crypto";
import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { vehicles } from "./vehicle.js";

// Single table: vehicle image (photo) and vehicle document – separate attributes per row
const vehicleImages = pgTable("vehicle_images", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => randomUUID()),
  vehicleId: varchar("vehicle_id", { length: 255 })
    .notNull()
    .references(() => vehicles.id, { onDelete: "CASCADE" }),
  imageUrl: varchar("image_url", { length: 500 }),
  documentUrl: varchar("document_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export { vehicleImages };
