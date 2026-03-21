import express from "express";
import {
  getMyNotificationsController,
  getUnreadCountController,
  markAllAsReadController,
  markAsReadController,
} from "../controller/notificationController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/notifications", authenticateToken, getMyNotificationsController);
router.get("/notifications/unread-count", authenticateToken, getUnreadCountController);
router.patch("/notifications/:id/read", authenticateToken, markAsReadController);
router.patch("/notifications/read-all", authenticateToken, markAllAsReadController);

export default router;
