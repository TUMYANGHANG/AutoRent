import { and, asc, desc, eq, or } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  chatConversations,
  chatMessages,
  userDetails,
  users,
} from "../schema/index.js";

/**
 * Get all owners (for renters to start a chat with).
 * Includes profile picture and city from user_details (no email — use names + profile in UI).
 */
const getOwnersForRenter = async (excludeUserId = null) => {
  const rows = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      profilePicture: userDetails.profilePicture,
      city: userDetails.city,
    })
    .from(users)
    .leftJoin(userDetails, eq(users.id, userDetails.userId))
    .where(eq(users.role, "owner"))
    .orderBy(asc(users.firstName), asc(users.lastName));

  if (excludeUserId) return rows.filter((r) => r.id !== excludeUserId);
  return rows;
};

/**
 * Get all renters (for owners to start a chat with).
 * Includes profile picture and city from user_details (no email in list).
 */
const getRentersForOwner = async (excludeUserId = null) => {
  const rows = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      profilePicture: userDetails.profilePicture,
      city: userDetails.city,
    })
    .from(users)
    .leftJoin(userDetails, eq(users.id, userDetails.userId))
    .where(eq(users.role, "renter"))
    .orderBy(asc(users.firstName), asc(users.lastName));

  if (excludeUserId) return rows.filter((r) => r.id !== excludeUserId);
  return rows;
};

/**
 * Get or create a conversation between a renter and owner (general chat).
 * callerUserId must be either the renter or the owner.
 * targetUserId is the other party (owner if caller is renter, renter if caller is owner).
 */
const getOrCreateConversationByPair = async ({ callerUserId, targetUserId }) => {
  if (!callerUserId || !targetUserId || callerUserId === targetUserId) {
    const err = new Error("Invalid caller or target user");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  // Determine renter and owner from users table
  const [caller] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, callerUserId))
    .limit(1);
  const [target] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, targetUserId))
    .limit(1);

  if (!caller || !target) {
    const err = new Error("User not found");
    err.code = "NOT_FOUND";
    throw err;
  }

  let renterId, ownerId;
  if (caller.role === "renter" && target.role === "owner") {
    renterId = callerUserId;
    ownerId = targetUserId;
  } else if (caller.role === "owner" && target.role === "renter") {
    renterId = targetUserId;
    ownerId = callerUserId;
  } else {
    const err = new Error("Chat is only between renters and owners");
    err.code = "FORBIDDEN";
    throw err;
  }

  const [existing] = await db
    .select()
    .from(chatConversations)
    .where(
      and(
        eq(chatConversations.renterId, renterId),
        eq(chatConversations.ownerId, ownerId),
      ),
    )
    .orderBy(desc(chatConversations.updatedAt))
    .limit(1);

  if (existing) return existing;

  const [inserted] = await db
    .insert(chatConversations)
    .values({
      renterId,
      ownerId,
      lastMessageText: null,
      lastMessageAt: null,
      updatedAt: new Date(),
    })
    .returning();

  return inserted;
};

/**
 * Ensure current user is part of the conversation (renter or owner).
 */
const getConversationForUser = async (conversationId, userId) => {
  const [conv] = await db
    .select()
    .from(chatConversations)
    .where(
      and(
        eq(chatConversations.id, conversationId),
        or(
          eq(chatConversations.renterId, userId),
          eq(chatConversations.ownerId, userId),
        ),
      ),
    )
    .limit(1);
  return conv ?? null;
};

/**
 * Get messages for a conversation, newest last.
 */
const getMessagesForConversation = async (conversationId, userId, limit = 50) => {
  const conv = await getConversationForUser(conversationId, userId);
  if (!conv) return null;

  const rows = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);

  // Return ascending by createdAt for UI
  return {
    conversation: conv,
    messages: rows.slice().reverse(),
  };
};

/**
 * Create a new message in a conversation for a given sender.
 */
const createMessageInConversation = async (conversationId, senderId, text, attachmentUrl = null) => {
  const hasText = text && String(text).trim();
  const hasAttachment = attachmentUrl && String(attachmentUrl).trim();

  if (!hasText && !hasAttachment) {
    const err = new Error("Message text or attachment is required");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  const conv = await getConversationForUser(conversationId, senderId);
  if (!conv) {
    const err = new Error("Conversation not found or access denied");
    err.code = "FORBIDDEN";
    throw err;
  }

  const now = new Date();
  const messageText = hasText ? String(text) : null;

  const [msg] = await db
    .insert(chatMessages)
    .values({
      conversationId,
      senderId,
      text: messageText,
      attachmentUrl: hasAttachment ? String(attachmentUrl) : null,
      createdAt: now,
    })
    .returning();

  const previewText = messageText || "📷 Photo";

  await db
    .update(chatConversations)
    .set({
      lastMessageText: previewText,
      lastMessageAt: now,
      updatedAt: now,
    })
    .where(eq(chatConversations.id, conversationId));

  return { conversation: conv, message: msg };
};

/**
 * Get all conversations for current user (renter or owner), newest first.
 */
const getConversationsForUser = async (userId) => {
  const list = await db
    .select()
    .from(chatConversations)
    .where(
      or(
        eq(chatConversations.renterId, userId),
        eq(chatConversations.ownerId, userId),
      ),
    )
    .orderBy(desc(chatConversations.updatedAt));

  if (list.length === 0) return [];

  const userIds = Array.from(
    new Set(list.flatMap((c) => [c.renterId, c.ownerId])),
  );
  const userRows = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    })
    .from(users)
    .where(or(...userIds.map((id) => eq(users.id, id))));

  const usersById = Object.fromEntries(userRows.map((u) => [u.id, u]));

  return list.map((c) => ({
    ...c,
    renter: usersById[c.renterId] || null,
    owner: usersById[c.ownerId] || null,
  }));
};

/**
 * Delete a message. Only the sender can delete their own message.
 * Returns the deleted message's conversationId so the caller can broadcast.
 */
const deleteMessageById = async (messageId, userId) => {
  const [msg] = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.id, messageId))
    .limit(1);

  if (!msg) {
    const err = new Error("Message not found");
    err.code = "NOT_FOUND";
    throw err;
  }

  if (msg.senderId !== userId) {
    const err = new Error("You can only delete your own messages");
    err.code = "FORBIDDEN";
    throw err;
  }

  await db.delete(chatMessages).where(eq(chatMessages.id, messageId));

  const conv = await getConversationForUser(msg.conversationId, userId);

  if (conv && conv.lastMessageAt && msg.createdAt &&
      new Date(conv.lastMessageAt).getTime() === new Date(msg.createdAt).getTime()) {
    const [latest] = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, msg.conversationId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(1);

    await db
      .update(chatConversations)
      .set({
        lastMessageText: latest?.text || latest?.attachmentUrl ? "📷 Photo" : null,
        lastMessageAt: latest?.createdAt || null,
        updatedAt: new Date(),
      })
      .where(eq(chatConversations.id, msg.conversationId));
  }

  return { conversationId: msg.conversationId, conversation: conv };
};

export {
  createMessageInConversation,
  deleteMessageById,
  getConversationForUser,
  getConversationsForUser,
  getMessagesForConversation,
  getOrCreateConversationByPair,
  getOwnersForRenter,
  getRentersForOwner,
};

