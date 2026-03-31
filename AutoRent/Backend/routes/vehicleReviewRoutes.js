import express from "express";
import {
  createReviewController,
  getMyReviewController,
  getRatingStatsController,
  getReviewsController,
} from "../controller/vehicleReviewController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router({ mergeParams: true });

// Public routes (no auth)
router.get("/vehicles/:vehicleId/reviews/stats", getRatingStatsController);
router.get("/vehicles/:vehicleId/reviews", getReviewsController);

// Auth required
router.get("/vehicles/:vehicleId/reviews/me", authenticateToken, getMyReviewController);
router.post("/vehicles/:vehicleId/reviews", authenticateToken, createReviewController);

export default router;
