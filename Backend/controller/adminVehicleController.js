import {
  sendVehicleApprovedToOwner,
  sendVehicleRejectedToOwner,
} from "../services/emailService.js";
import {
  createNotification,
  getUserById,
  NOTIFICATION_TYPES,
} from "../services/notificationService.js";
import {
  getAdminStats,
  getAllVehicles,
  getVehicleById,
  updateVehicleIsVerified,
} from "../services/vehicleService.js";

/**
 * Get admin dashboard stats (admin only)
 */
const getAdminStatsController = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can view dashboard stats",
      });
    }
    const stats = await getAdminStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Admin get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get all vehicles (admin only)
 */
const getAllVehiclesController = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can list all vehicles",
      });
    }

    const ownerId = req.query.ownerId || null;
    const vehicles = await getAllVehicles(ownerId);
    res.status(200).json({
      success: true,
      data: vehicles,
    });
  } catch (error) {
    console.error("Admin get all vehicles error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get a single vehicle by ID (admin only)
 */
const getVehicleByIdAdminController = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;
    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can view vehicle details",
      });
    }

    const vehicle = await getVehicleById(id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    console.error("Admin get vehicle by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update vehicle isVerified (admin only)
 */
const updateVehicleVerifyController = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;
    const { role } = req.user;
    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can verify vehicles",
      });
    }

    if (typeof isVerified !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isVerified must be a boolean",
      });
    }

    const vehicle = await updateVehicleIsVerified(id, isVerified);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    const vehicleName = `${vehicle.brand ?? ""} ${vehicle.model ?? ""}`.trim() || "Your vehicle";
    const owner = await getUserById(vehicle.ownerId);
    if (owner) {
      try {
        if (isVerified) {
          await createNotification({
            recipientUserId: vehicle.ownerId,
            type: NOTIFICATION_TYPES.VEHICLE_APPROVED,
            title: "Your vehicle has been approved",
            message: `"${vehicleName}" is now listed for rent on AutoRent.`,
            vehicleId: vehicle.id,
            actorUserId: req.user.userId,
          });
          await sendVehicleApprovedToOwner(owner.email, vehicleName);
        } else {
          await createNotification({
            recipientUserId: vehicle.ownerId,
            type: NOTIFICATION_TYPES.VEHICLE_REJECTED,
            title: "Your vehicle was not approved",
            message: `"${vehicleName}" was not approved for listing. You can view details in your dashboard.`,
            vehicleId: vehicle.id,
            actorUserId: req.user.userId,
          });
          await sendVehicleRejectedToOwner(owner.email, vehicleName);
        }
      } catch (err) {
        console.error("Notification/email to owner failed:", err);
      }
    }

    res.status(200).json({
      success: true,
      message: `Vehicle ${isVerified ? "verified" : "unverified"} successfully`,
      data: vehicle,
    });
  } catch (error) {
    console.error("Admin update vehicle verify error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export {
  getAdminStatsController,
  getAllVehiclesController,
  getVehicleByIdAdminController,
  updateVehicleVerifyController,
};

