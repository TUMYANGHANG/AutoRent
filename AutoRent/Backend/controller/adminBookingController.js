import { getAllBookingsForAdmin } from "../services/bookingService.js";

/**
 * GET /admin/bookings — list all bookings (admin only).
 */
const getAdminBookingsController = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can list all bookings",
      });
    }

    const list = await getAllBookingsForAdmin();
    res.status(200).json({
      success: true,
      data: list,
    });
  } catch (error) {
    console.error("Get admin bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export { getAdminBookingsController };
  