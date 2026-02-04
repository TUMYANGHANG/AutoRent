import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { notifications, users } from "../schema/index.js";

const NOTIFICATION_TYPES = {
  NEW_VEHICLE_SUBMITTED: "new_vehicle_submitted",
  VEHICLE_APPROVED: "vehicle_approved",
  VEHICLE_REJECTED: "vehicle_rejected",
};

/**
 * Create a notification
 * @param {Object} params
 * @param {string} params.recipientUserId
 * @param {string} params.type - new_vehicle_submitted | vehicle_approved | vehicle_rejected
 * @param {string} params.title
 * @param {string} [params.message]
 * @param {string} [params.vehicleId]
 * @param {string} [params.actorUserId]
 * @returns {Promise<Object>}
 */
const createNotification = async ({
  recipientUserId,
  type,
  title,
  message = null,
  vehicleId = null,
  actorUserId = null,
}) => {
  const [row] = await db
    .insert(notifications)
    .values({
      recipientUserId,
      type,
      title,
      message: message ?? null,
      vehicleId: vehicleId ?? null,
      actorUserId: actorUserId ?? null,
    })
    .returning();
  return row;
};

/**
 * Get notifications for a user (newest first)
 * @param {string} userId
 * @param {{ limit?: number }} [options]
 * @returns {Promise<Object[]>}
 */
const getNotificationsByUserId = async (userId, options = {}) => {
  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 100);
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.recipientUserId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
  return rows;
};

/**
 * Mark a notification as read
 * @param {string} notificationId
 * @param {string} userId - must be the recipient
 * @returns {Promise<Object|null>}
 */
const markNotificationAsRead = async (notificationId, userId) => {
  const [row] = await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.recipientUserId, userId)
      )
    )
    .returning();
  return row ?? null;
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId
 * @returns {Promise<number>} - number of updated rows
 */
const markAllAsReadByUserId = async (userId) => {
  const result = await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.recipientUserId, userId));
  return result.rowCount ?? 0;
};

/**
 * Get users by role (e.g. all admins for notifying when owner adds vehicle)
 * @param {string} role - 'admin' | 'owner' | 'renter'
 * @returns {Promise<Object[]>} - { id, email, firstName, lastName }
 */
const getUsersByRole = async (role) => {
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(users)
    .where(eq(users.role, role));
  return rows;
};

/**
 * Get unread count for a user
 * @param {string} userId
 * @returns {Promise<number>}
 */
const getUnreadCountByUserId = async (userId) => {
  const rows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(
      and(
        eq(notifications.recipientUserId, userId),
        eq(notifications.isRead, false)
      )
    );
  return rows.length;
};

/**
 * Get user by ID (id, email, firstName, lastName)
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
const getUserById = async (userId) => {
  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row ?? null;
};

export {
  createNotification,
  getNotificationsByUserId,
  getUnreadCountByUserId,
  getUsersByRole,
  getUserById,
  markAllAsReadByUserId,
  markNotificationAsRead,
  NOTIFICATION_TYPES,
};
