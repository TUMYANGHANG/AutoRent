import { randomUUID } from "crypto";
import { date, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./user.js";
import { vehicles } from "./vehicle.js";

export const bookingRequestStatusEnum = pgEnum("booking_request_status", [
  "pending",
  "accepted",
  "rejected",
]);

const bookingRequests = pgTable("booking_requests", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => randomUUID()),
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
  status: bookingRequestStatusEnum("status").default("pending").notNull(),
  rejectionReason: varchar("rejection_reason", { length: 500 }),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export { bookingRequests };
