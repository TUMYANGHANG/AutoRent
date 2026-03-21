import { randomUUID } from "crypto";
import {
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./user.js";
import { vehicles } from "./vehicle.js";
import { bookings } from "./booking.js";

const vehicleReviews = pgTable(
  "vehicle_reviews",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => randomUUID()),
    vehicleId: varchar("vehicle_id", { length: 255 })
      .notNull()
      .references(() => vehicles.id, { onDelete: "CASCADE" }),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "CASCADE" }),
    bookingId: varchar("booking_id", { length: 255 }).references(
      () => bookings.id,
      { onDelete: "SET NULL" }
    ),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    vehicleUserUnique: unique().on(t.vehicleId, t.userId),
  })
);

export { vehicleReviews };
