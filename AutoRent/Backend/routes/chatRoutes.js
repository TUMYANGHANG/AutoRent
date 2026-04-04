import express from "express";
import {
  createConversationController,
  deleteMessageController,
  getMessagesController,
  getMyConversationsController,
  getOwnersController,
  getRentersController,
  postMessageController,
} from "../controller/chatController.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  validateChatConversationCreate,
  validateChatMessageBody,
  validateMessagesQuery,
} from "../middleware/validators/chatValidation.js";

const router = express.Router();

// All chat routes require auth
router.use(authenticateToken);

router.get("/chat/owners", getOwnersController);
router.get("/chat/renters", getRentersController);
router.post("/chat/conversations", validateChatConversationCreate, createConversationController);
router.get("/chat/conversations", getMyConversationsController);
router.get("/chat/conversations/:id/messages", validateMessagesQuery, getMessagesController);
router.post("/chat/conversations/:id/messages", validateChatMessageBody, postMessageController);
router.delete("/chat/messages/:messageId", deleteMessageController);

export default router;

