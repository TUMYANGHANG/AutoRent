import express from "express";
import {
  createConversationController,
  getMessagesController,
  getMyConversationsController,
  getOwnersController,
  getRentersController,
  postMessageController,
} from "../controller/chatController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// All chat routes require auth
router.use(authenticateToken);

router.get("/chat/owners", getOwnersController);
router.get("/chat/renters", getRentersController);
router.post("/chat/conversations", createConversationController);
router.get("/chat/conversations", getMyConversationsController);
router.get("/chat/conversations/:id/messages", getMessagesController);
router.post("/chat/conversations/:id/messages", postMessageController);

export default router;

