import { boolean, date, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./user.js";

// User details table (one-to-one relationship with users)
const userDetails = pgTable("user_details", {
  userId: varchar("user_id", { length: 255 })
    .primaryKey()
    .references(() => users.id, { onDelete: "CASCADE" }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  dateOfBirth: date("date_of_birth"),
  profilePicture: varchar("profile_picture", { length: 500 }),
  address: varchar("address", { length: 255 }),
  city: varchar("city", { length: 100 }),
  licenseNumber: varchar("license_number", { length: 50 }),
  licenseExpiry: date("license_expiry"),
  licenseImage: varchar("license_image", { length: 500 }),
  isLicenseVerified: boolean("is_license_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export { userDetails };

