import { randomUUID } from "crypto";
import { pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const inquirySourceEnum = pgEnum("inquiry_source", ["contact", "faq", "footer"]);

const contactInquiries = pgTable("contact_inquiries", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => randomUUID()),
  source: inquirySourceEnum("source").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  subject: varchar("subject", { length: 500 }),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

export { contactInquiries };
