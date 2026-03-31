import {
  canUserReview,
  createReview,
  getRatingStats,
  getReviewsForVehicle,
  getUserReview,
} from "../services/vehicleReviewService.js";

const isTableMissingError = (err) => {
  const code = err?.code ?? err?.cause?.code;
  return code === "42P01" || err?.message?.includes("does not exist");
};

/**
 * GET /vehicles/:vehicleId/reviews - Get reviews for a vehicle (public).
 */
const getReviewsController = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const [reviews, stats] = await Promise.all([
      getReviewsForVehicle(vehicleId, limit, offset),
      getRatingStats(vehicleId),
    ]);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        averageRating: stats.averageRating,
        reviewCount: stats.reviewCount,
      },
    });
  } catch (error) {
    if (error?.code === "42P01" || error?.message?.includes("does not exist")) {
      return res.status(200).json({
        success: true,
        data: { reviews: [], averageRating: null, reviewCount: 0 },
      });
    }
    console.error("Get reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * GET /vehicles/:vehicleId/reviews/stats - Get rating stats only (public).
 */
const getRatingStatsController = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const stats = await getRatingStats(vehicleId);
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    if (isTableMissingError(error)) {
      return res.status(200).json({
        success: true,
        data: { averageRating: null, reviewCount: 0 },
      });
    }
    console.error("Get rating stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * POST /vehicles/:vehicleId/reviews - Create or update review (auth required).
 */
const createReviewController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { vehicleId } = req.params;
    const { rating, comment, bookingId } = req.body;

    if (!rating) {
      return res.status(400).json({
        success: false,
        message: "Rating is required",
      });
    }

    const review = await createReview(userId, vehicleId, rating, comment, bookingId);

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error) {
    if (error.code === "VALIDATION_ERROR") {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.code === "FORBIDDEN") {
      return res.status(403).json({ success: false, message: error.message });
    }
    console.error("Create review error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * GET /vehicles/:vehicleId/reviews/me - Get current user's review for this vehicle (auth required).
 */
const getMyReviewController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { vehicleId } = req.params;

    const review = await getUserReview(vehicleId, userId);
    const canReview = await canUserReview(vehicleId, userId);

    res.status(200).json({
      success: true,
      data: {
        review: review || null,
        canReview: canReview.canReview,
        canUpdate: canReview.canUpdate ?? false,
        reason: canReview.reason || null,
      },
    });
  } catch (error) {
    if (isTableMissingError(error)) {
      return res.status(200).json({
        success: true,
        data: {
          review: null,
          canReview: false,
          canUpdate: false,
          reason: "Reviews not available",
        },
      });
    }
    console.error("Get my review error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export {
  createReviewController,
  getMyReviewController,
  getRatingStatsController,
  getReviewsController,
};
