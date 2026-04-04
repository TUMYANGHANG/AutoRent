import express from "express";
import {
  cancelBookingController,
  createBookingController,
  ensureVerifiedRenter,
  getBookingByIdController,
  getBookingsController,
  getOwnerEarningsReportController,
  getOwnerStatsController,
} from "../controller/bookingController.js";
import { authenticateToken } from "../middleware/auth.js";
import { validateCreateBooking } from "../middleware/validators/bookingCreateValidation.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/bookings/stats", getOwnerStatsController);
router.get("/bookings/stats/earnings", getOwnerEarningsReportController);
router.get("/bookings", getBookingsController);
router.get("/bookings/:id", getBookingByIdController);
router.post("/bookings", ensureVerifiedRenter, validateCreateBooking, createBookingController);
router.patch("/bookings/:id/cancel", cancelBookingController);

export default router;
