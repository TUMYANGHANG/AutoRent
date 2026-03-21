import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../schema/index.js";
import {
  cancelBooking,
  createBookingWithPayment,
  getBookingById,
  getBookingsForUser,
  getOwnerStats,
} from "../services/bookingService.js";

/**
 * Ensure current user is verified renter (for creating bookings).
 */
const ensureVerifiedRenter = async (req, res, next) => {
  const { userId, role } = req.user;
  if (role !== "renter") {
    return res.status(403).json({
      success: false,
      message: "Only renters can create bookings",
    });
  }
  const [user] = await db
    .select({ isProfileVerified: users.isProfileVerified })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user?.isProfileVerified) {
    return res.status(403).json({
      success: false,
      message:
        "Complete your profile and get it verified by admin before you can book vehicles.",
    });
  }
  next();
};

/**
 * POST /bookings - Create a booking with payment (pay_on_pickup supported; Stripe/Khalti placeholders).
 */
const createBookingController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      vehicleId,
      startDate,
      returnDate,
      pickupPlace,
      dropoffPlace,
      notes,
      paymentMethod = "pay_on_pickup",
    } = req.body;

    if (!vehicleId || !startDate || !returnDate || !pickupPlace) {
      return res.status(400).json({
        success: false,
        message: "vehicleId, startDate, returnDate, and pickupPlace are required",
      });
    }

    // For now only pay_on_pickup is implemented
    const allowedMethods = ["pay_on_pickup"];
    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `Payment method '${paymentMethod}' is not yet available. Use 'pay_on_pickup' for now. Stripe and Khalti coming soon.`,
      });
    }

    const result = await createBookingWithPayment(
      userId,
      { vehicleId, startDate, returnDate, pickupPlace, dropoffPlace, notes },
      paymentMethod
    );

    if (!result) {
      return res.status(500).json({
        success: false,
        message: "Failed to create booking",
      });
    }

    res.status(201).json({
      success: true,
      message: "Booking confirmed. Pay at pickup when you collect the vehicle.",
      data: {
        booking: result.booking,
        payment: result.payment,
        vehicle: {
          id: result.vehicle.id,
          brand: result.vehicle.brand,
          model: result.vehicle.model,
        },
      },
    });
  } catch (error) {
    if (error.code === "VALIDATION_ERROR") {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.code === "NOT_FOUND") {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.code === "CONFLICT") {
      return res.status(409).json({ success: false, message: error.message });
    }
    console.error("Create booking error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * GET /bookings/:id - Get booking by ID (renter or owner).
 */
const getBookingByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;

    const booking = await getBookingById(id, userId, role);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * GET /bookings/stats - Get owner dashboard stats (active rentals, total earnings). Owner only.
 */
const getOwnerStatsController = async (req, res) => {
  try {
    const { role, userId } = req.user;
    if (role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only vehicle owners can view dashboard stats",
      });
    }
    const stats = await getOwnerStats(userId);
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get owner stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * GET /bookings - Get bookings for current user (renter or owner).
 */
const getBookingsController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    const list = await getBookingsForUser(userId, role);
    res.status(200).json({
      success: true,
      data: list,
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * PATCH /bookings/:id/cancel - Cancel a booking.
 */
const cancelBookingController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;

    const updated = await cancelBooking(id, userId, role);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled",
      data: updated,
    });
  } catch (error) {
    if (error.code === "INVALID_STATE") {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error("Cancel booking error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export {
  cancelBookingController,
  createBookingController,
  ensureVerifiedRenter,
  getBookingByIdController,
  getBookingsController,
  getOwnerStatsController,
};
