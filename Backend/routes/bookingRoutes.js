import express from "express";
import {
  cancelBookingController,
  createBookingController,
  ensureVerifiedRenter,
  getBookingByIdController,
  getBookingsController,
  getOwnerStatsController,
} from "../controller/bookingController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/bookings/stats", getOwnerStatsController);
router.get("/bookings", getBookingsController);
router.get("/bookings/:id", getBookingByIdController);
router.post("/bookings", ensureVerifiedRenter, createBookingController);
router.patch("/bookings/:id/cancel", cancelBookingController);

export default router;
