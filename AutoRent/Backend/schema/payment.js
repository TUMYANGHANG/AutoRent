import { randomUUID } from "crypto";
import { numeric, pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { bookings } from "./booking.js";

export const paymentMethodEnum = pgEnum("payment_method", [
  "stripe",
  "khalti",
  "pay_on_pickup",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);

const payments = pgTable("payments", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => randomUUID()),
  bookingId: varchar("booking_id", { length: 255 })
    .notNull()
    .references(() => bookings.id, { onDelete: "CASCADE" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(), // Rental amount only (what renter pays)
  securityDeposit: numeric("security_deposit", { precision: 12, scale: 2 }), // Collateral held; returned on vehicle return
  currency: varchar("currency", { length: 10 }).default("NPR").notNull(),
  method: paymentMethodEnum("method").notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  externalId: varchar("external_id", { length: 255 }), // Stripe pi_xxx or Khalti transaction ID
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export { payments };
