import { randomUUID } from "crypto";
import { boolean, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./user.js";
import { vehicles } from "./vehicle.js";

const notifications = pgTable("notifications", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => randomUUID()),
  recipientUserId: varchar("recipient_user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "CASCADE" }),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  vehicleId: varchar("vehicle_id", { length: 255 }).references(() => vehicles.id, {
    onDelete: "SET NULL",
  }),
  actorUserId: varchar("actor_user_id", { length: 255 }).references(() => users.id, {
    onDelete: "SET NULL",
  }),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export { notifications };
