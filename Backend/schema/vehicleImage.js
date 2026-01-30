import { randomUUID } from "crypto";
import { boolean, integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { vehicles } from "./vehicle.js";

// Vehicle images table (many-to-one with vehicles; multiple images per vehicle)
const vehicleImages = pgTable("vehicle_images", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => randomUUID()),
  vehicleId: varchar("vehicle_id", { length: 255 })
    .notNull()
    .references(() => vehicles.id, { onDelete: "CASCADE" }),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  vehicleDocumentImage: boolean("vehicle_document_image").default(false).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export { vehicleImages };
