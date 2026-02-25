import { randomUUID } from "crypto";
import { boolean, pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

// User role enum
export const userRoleEnum = pgEnum("user_role", ["renter", "owner", "admin"]);

// Users table
const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => randomUUID()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  role: userRoleEnum("role").default("renter").notNull(),
  isEmailVerified: boolean("is_email_verified").default(false).notNull(),
  isProfileVerified: boolean("is_profile_verified").default(false).notNull(),
  otp: varchar("otp", { length: 6 }),
  otpExpiresAt: timestamp("otp_expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export { users };

