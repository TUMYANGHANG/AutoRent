import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { bookings, users, vehicleReviews } from "../schema/index.js";

/**
 * Create or update a vehicle review. User must have completed a booking for this vehicle.
 * @param {string} userId - User ID (renter)
 * @param {string} vehicleId - Vehicle ID
 * @param {number} rating - 1-5
 * @param {string} [comment] - Optional comment
 * @param {string} [bookingId] - Optional booking ID (for linking)
 */
const createReview = async (userId, vehicleId, rating, comment = null, bookingId = null) => {
  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5) {
    const err = new Error("Rating must be an integer between 1 and 5");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  // Verify user has a valid booking for this vehicle
  const [booking] = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        eq(bookings.vehicleId, vehicleId),
        eq(bookings.renterId, userId),
        inArray(bookings.status, ["confirmed", "in_progress", "completed"])
      )
    )
    .limit(1);

  if (!booking) {
    const err = new Error("You can only review vehicles you have rented and completed");
    err.code = "FORBIDDEN";
    throw err;
  }

  const [existing] = await db
    .select()
    .from(vehicleReviews)
    .where(
      and(
        eq(vehicleReviews.vehicleId, vehicleId),
        eq(vehicleReviews.userId, userId)
      )
    )
    .limit(1);

  const values = {
    rating: r,
    comment: comment?.trim() || null,
    bookingId: bookingId || booking.id,
    updatedAt: new Date(),
  };

  if (existing) {
    const [updated] = await db
      .update(vehicleReviews)
      .set(values)
      .where(eq(vehicleReviews.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(vehicleReviews)
    .values({
      vehicleId,
      userId,
      bookingId: values.bookingId,
      rating: values.rating,
      comment: values.comment,
      updatedAt: values.updatedAt,
    })
    .returning();
  return created;
};

/**
 * Get reviews for a vehicle with user info (public).
 */
const getReviewsForVehicle = async (vehicleId, limit = 20, offset = 0) => {
  const list = await db
    .select({
      id: vehicleReviews.id,
      vehicleId: vehicleReviews.vehicleId,
      userId: vehicleReviews.userId,
      rating: vehicleReviews.rating,
      comment: vehicleReviews.comment,
      createdAt: vehicleReviews.createdAt,
      userFirstName: users.firstName,
      userLastName: users.lastName,
    })
    .from(vehicleReviews)
    .innerJoin(users, eq(vehicleReviews.userId, users.id))
    .where(eq(vehicleReviews.vehicleId, vehicleId))
    .orderBy(desc(vehicleReviews.createdAt))
    .limit(limit)
    .offset(offset);

  return list.map((r) => ({
    id: r.id,
    vehicleId: r.vehicleId,
    userId: r.userId,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
    userName: [r.userFirstName, r.userLastName].filter(Boolean).join(" ") || "Anonymous",
  }));
};

/**
 * Get average rating and count for a vehicle.
 */
const getRatingStats = async (vehicleId) => {
  const [row] = await db
    .select({
      avgRating: sql`round(avg(${vehicleReviews.rating})::numeric, 1)`,
      count: sql`count(*)::int`,
    })
    .from(vehicleReviews)
    .where(eq(vehicleReviews.vehicleId, vehicleId));

  const avgRating = row?.avgRating != null ? Number(row.avgRating) : null;
  const count = row?.count != null ? Number(row.count) : 0;
  return {
    averageRating: avgRating,
    reviewCount: count,
  };
};

/**
 * Get rating stats for multiple vehicles.
 */
const getRatingStatsForVehicles = async (vehicleIds) => {
  if (!vehicleIds.length) return {};

  const rows = await db
    .select({
      vehicleId: vehicleReviews.vehicleId,
      avgRating: sql`round(avg(${vehicleReviews.rating})::numeric, 1)`,
      count: sql`count(*)::int`,
    })
    .from(vehicleReviews)
    .where(inArray(vehicleReviews.vehicleId, vehicleIds))
    .groupBy(vehicleReviews.vehicleId);

  const stats = {};
  for (const r of rows) {
    stats[r.vehicleId] = {
      averageRating: r.avgRating != null ? Number(r.avgRating) : null,
      reviewCount: r.count != null ? Number(r.count) : 0,
    };
  }
  for (const vid of vehicleIds) {
    if (!stats[vid]) stats[vid] = { averageRating: null, reviewCount: 0 };
  }
  return stats;
};

/**
 * Check if current user has already reviewed this vehicle.
 */
const getUserReview = async (vehicleId, userId) => {
  if (!userId) return null;
  const [r] = await db
    .select()
    .from(vehicleReviews)
    .where(
      and(
        eq(vehicleReviews.vehicleId, vehicleId),
        eq(vehicleReviews.userId, userId)
      )
    )
    .limit(1);
  return r || null;
};

/**
 * Check if user can review (has completed booking, hasn't reviewed yet).
 */
const canUserReview = async (vehicleId, userId) => {
  if (!userId) return { canReview: false, reason: "Sign in to leave a review" };

  const [booking] = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        eq(bookings.vehicleId, vehicleId),
        eq(bookings.renterId, userId),
        inArray(bookings.status, ["confirmed", "in_progress", "completed"])
      )
    )
    .limit(1);

  if (!booking) {
    return { canReview: false, reason: "You can only review vehicles you have rented" };
  }

  const existing = await getUserReview(vehicleId, userId);
  if (existing) {
    return { canReview: true, existingReview: existing, canUpdate: true };
  }
  return { canReview: true, existingReview: null, canUpdate: false };
};

export {
  canUserReview,
  createReview,
  getRatingStats,
  getRatingStatsForVehicles,
  getReviewsForVehicle,
  getUserReview
};

