import {
  createMessageInConversation,
  deleteMessageById,
  getConversationsForUser,
  getMessagesForConversation,
  getOrCreateConversationByPair,
  getOwnersForRenter,
  getRentersForOwner,
} from "../services/chatService.js";

/**
 * GET /chat/owners
 * Returns list of owners (for renters to start a chat with).
 */
const getOwnersController = async (req, res) => {
  try {
    const excludeUserId = req.user?.userId ?? null;
    const list = await getOwnersForRenter(excludeUserId);
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    console.error("Get owners error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * GET /chat/renters
 * Returns list of renters (for owners to start a chat with).
 */
const getRentersController = async (req, res) => {
  try {
    const excludeUserId = req.user?.userId ?? null;
    const list = await getRentersForOwner(excludeUserId);
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    console.error("Get renters error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * POST /chat/conversations
 * Body: { targetUserId }
 * Returns an existing or newly created conversation between renter and owner.
 */
const createConversationController = async (req, res) => {
  try {
    const callerUserId = req.user.userId;
    const { targetUserId } = req.body || {};

    const conv = await getOrCreateConversationByPair({
      callerUserId,
      targetUserId: targetUserId || null,
    });

    res.status(200).json({
      success: true,
      data: conv,
    });
  } catch (error) {
    if (error.code === "VALIDATION_ERROR") {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.code === "NOT_FOUND") {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.code === "FORBIDDEN") {
      return res.status(403).json({ success: false, message: error.message });
    }
    console.error("Create conversation error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * GET /chat/conversations
 * List conversations for current user (renter/owner).
 */
const getMyConversationsController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const list = await getConversationsForUser(userId);
    res.status(200).json({
      success: true,
      data: list,
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * GET /chat/conversations/:id/messages?limit=50
 */
const getMessagesController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const limit = req.query.limit ? Number(req.query.limit) : 50;

    const result = await getMessagesForConversation(id, userId, limit);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or access denied",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * POST /chat/conversations/:id/messages
 * Body: { text }
 * Creates a new message via HTTP (for fallback / testing without sockets).
 */
const postMessageController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { text, attachmentUrl } = req.body || {};

    const result = await createMessageInConversation(id, userId, text, attachmentUrl);
    res.status(201).json({
      success: true,
      data: result.message,
    });
  } catch (error) {
    if (error.code === "VALIDATION_ERROR") {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.code === "FORBIDDEN") {
      return res.status(403).json({ success: false, message: error.message });
    }
    console.error("Post message error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * DELETE /chat/messages/:messageId
 * Delete a message (only the sender can delete their own).
 */
const deleteMessageController = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;

    await deleteMessageById(messageId, userId);
    res.status(200).json({ success: true, message: "Message deleted" });
  } catch (error) {
    if (error.code === "NOT_FOUND") {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.code === "FORBIDDEN") {
      return res.status(403).json({ success: false, message: error.message });
    }
    console.error("Delete message error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export {
  createConversationController,
  deleteMessageController,
  getMessagesController,
  getMyConversationsController,
  getOwnersController,
  getRentersController,
  postMessageController,
};

