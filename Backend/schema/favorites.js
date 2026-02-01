import { randomUUID } from "crypto";
import { pgTable, timestamp, unique, varchar } from "drizzle-orm/pg-core";
import { users } from "./user.js";
import { vehicles } from "./vehicle.js";

const favorites = pgTable(
  "favorites",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => randomUUID()),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "CASCADE" }),
    vehicleId: varchar("vehicle_id", { length: 255 })
      .notNull()
      .references(() => vehicles.id, { onDelete: "CASCADE" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    userVehicleUnique: unique().on(t.userId, t.vehicleId),
  })
);

export { favorites };
