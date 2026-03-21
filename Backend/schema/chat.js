import { randomUUID } from "crypto";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./user.js";
import { bookings } from "./booking.js";
import { bookingRequests } from "./bookingRequest.js";

// Conversation between a renter and an owner (general chat, not tied to a specific booking)
const chatConversations = pgTable("chat_conversations", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  bookingId: varchar("booking_id", { length: 255 }).references(() => bookings.id, {
    onDelete: "CASCADE",
  }),
  bookingRequestId: varchar("booking_request_id", { length: 255 }).references(
    () => bookingRequests.id,
    { onDelete: "CASCADE" },
  ),
  renterId: varchar("renter_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "CASCADE" }),
  ownerId: varchar("owner_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "CASCADE" }),
  lastMessageText: text("last_message_text"),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Individual chat messages
const chatMessages = pgTable("chat_messages", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  conversationId: varchar("conversation_id", { length: 255 })
    .notNull()
    .references(() => chatConversations.id, { onDelete: "CASCADE" }),
  senderId: varchar("sender_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "CASCADE" }),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export { chatConversations, chatMessages };

