import {
  createMessageInConversation,
  deleteMessageById,
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
      const { conversationId, text, attachmentUrl } = payload || {};
      if (!conversationId || (!text && !attachmentUrl)) return;

      const { conversation, message } = await createMessageInConversation(
        conversationId,
        userId,
        text,
        attachmentUrl,
      );

      const enrichedMessage = {
        id: message.id,
        conversationId,
        senderId: message.senderId,
        text: message.text,
        attachmentUrl: message.attachmentUrl,
        createdAt: message.createdAt,
      };

      const messagePayload = { conversationId, message: enrichedMessage };

      io.to(`conv:${conversationId}`).emit("message", messagePayload);

      io.to(`user:${conversation.renterId}`).emit("message", messagePayload);
      io.to(`user:${conversation.ownerId}`).emit("message", messagePayload);

      const previewText = message.text || "📷 Photo";
      io.to(`user:${conversation.renterId}`).emit("conversationUpdated", {
        conversationId,
        lastMessageText: previewText,
        lastMessageAt: message.createdAt,
      });
      io.to(`user:${conversation.ownerId}`).emit("conversationUpdated", {
        conversationId,
        lastMessageText: previewText,
        lastMessageAt: message.createdAt,
      });
    } catch (err) {
      socket.emit("chatError", { message: err.message || "Failed to send message" });
    }
  });

  socket.on("deleteMessage", async (payload) => {
    try {
      const { messageId } = payload || {};
      if (!messageId) return;

      const { conversationId, conversation } = await deleteMessageById(messageId, userId);

      const deletePayload = { conversationId, messageId };

      io.to(`conv:${conversationId}`).emit("messageDeleted", deletePayload);

      if (conversation) {
        io.to(`user:${conversation.renterId}`).emit("messageDeleted", deletePayload);
        io.to(`user:${conversation.ownerId}`).emit("messageDeleted", deletePayload);
      }
    } catch (err) {
      socket.emit("chatError", { message: err.message || "Failed to delete message" });
    }
  });
};

export { registerChatHandlers };

