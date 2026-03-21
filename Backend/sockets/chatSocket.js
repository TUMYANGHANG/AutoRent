import {
  createMessageInConversation,
  getConversationForUser,
} from "../services/chatService.js";

/**
 * Register chat-related socket handlers for a connected client.
 */
const registerChatHandlers = (io, socket) => {
  const userId = socket.user?.userId;
  if (userId) {
    socket.join(`user:${userId}`);
  }

  socket.on("joinConversation", async (payload) => {
    try {
      const { conversationId } = payload || {};
      if (!conversationId) return;
      const conv = await getConversationForUser(conversationId, userId);
      if (!conv) return;
      socket.join(`conv:${conversationId}`);
    } catch (err) {
      // Silently ignore for now or emit an error event
      socket.emit("chatError", { message: err.message || "Failed to join conversation" });
    }
  });

  socket.on("leaveConversation", (payload) => {
    const { conversationId } = payload || {};
    if (!conversationId) return;
    socket.leave(`conv:${conversationId}`);
  });

  socket.on("sendMessage", async (payload) => {
    try {
      const { conversationId, text } = payload || {};
      if (!conversationId || !text) return;

      const { conversation, message } = await createMessageInConversation(
        conversationId,
        userId,
        text,
      );

      const enrichedMessage = {
        id: message.id,
        conversationId,
        senderId: message.senderId,
        text: message.text,
        createdAt: message.createdAt,
      };

      const messagePayload = { conversationId, message: enrichedMessage };

      // Emit to conversation room (for users who have joined)
      io.to(`conv:${conversationId}`).emit("message", messagePayload);

      // Also emit to both users' personal rooms so the recipient receives even if
      // they haven't joined the conv room yet (e.g. race on join)
      io.to(`user:${conversation.renterId}`).emit("message", messagePayload);
      io.to(`user:${conversation.ownerId}`).emit("message", messagePayload);

      // Lightweight event for list views
      io.to(`user:${conversation.renterId}`).emit("conversationUpdated", {
        conversationId,
        lastMessageText: message.text,
        lastMessageAt: message.createdAt,
      });
      io.to(`user:${conversation.ownerId}`).emit("conversationUpdated", {
        conversationId,
        lastMessageText: message.text,
        lastMessageAt: message.createdAt,
      });
    } catch (err) {
      socket.emit("chatError", { message: err.message || "Failed to send message" });
    }
  });
};

export { registerChatHandlers };

