import express from "express";
import {
  getMyNotificationsController,
  getUnreadCountController,
  markAllAsReadController,
  markAsReadController,
} from "../controller/notificationController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/notifications", getMyNotificationsController);
router.get("/notifications/unread-count", getUnreadCountController);
router.patch("/notifications/:id/read", markAsReadController);
router.patch("/notifications/read-all", markAllAsReadController);

export default router;
