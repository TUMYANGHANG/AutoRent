import {
  getNotificationsByUserId,
  getUnreadCountByUserId,
  markAllAsReadByUserId,
  markNotificationAsRead,
} from "../services/notificationService.js";

/**
 * Get current user's notifications (auth required)
 */
const getMyNotificationsController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = req.query.limit ? Math.min(parseInt(req.query.limit, 10) || 50, 100) : 50;
    const notifications = await getNotificationsByUserId(userId, { limit });
    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get unread count for current user
 */
const getUnreadCountController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const count = await getUnreadCountByUserId(userId);
    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Mark a single notification as read
 */
const markAsReadController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const notification = await markNotificationAsRead(id, userId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }
    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Mark all notifications as read for current user
 */
const markAllAsReadController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updated = await markAllAsReadByUserId(userId);
    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: { updated },
    });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export {
  getMyNotificationsController,
  getUnreadCountController,
  markAllAsReadController,
  markAsReadController,
};
