import { randomUUID } from "crypto";
import { date, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./user.js";
import { vehicles } from "./vehicle.js";
import { bookingRequests } from "./bookingRequest.js";

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
]);

const bookings = pgTable("bookings", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => randomUUID()),
  bookingRequestId: varchar("booking_request_id", { length: 255 }).references(
    () => bookingRequests.id,
    { onDelete: "SET NULL" }
  ),
  vehicleId: varchar("vehicle_id", { length: 255 })
    .notNull()
    .references(() => vehicles.id, { onDelete: "CASCADE" }),
  renterId: varchar("renter_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "CASCADE" }),
  ownerId: varchar("owner_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "CASCADE" }),
  startDate: date("start_date").notNull(),
  returnDate: date("return_date").notNull(),
  pickupPlace: varchar("pickup_place", { length: 500 }).notNull(),
  dropoffPlace: varchar("dropoff_place", { length: 500 }),
  notes: text("notes"),
  status: bookingStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export { bookings };
