import { getAdminDashboardHome } from "../services/adminDashboardService.js";

/**
 * GET /admin/dashboard/home — new renters, reminders, monthly renter count.
 */
const getAdminDashboardHomeController = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can view dashboard home data",
      });
    }

    const data = await getAdminDashboardHome();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Admin dashboard home error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export { getAdminDashboardHomeController };
