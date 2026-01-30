import {
  getAllVehicles,
  getVehicleById,
  updateVehicleIsVerified,
} from "../services/vehicleService.js";

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

    const vehicles = await getAllVehicles();
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
      hint:
        process.env.NODE_ENV === "development" &&
        /column.*does not exist/i.test(error.message)
          ? "Run migrations: node scripts/run-extra-migrations.js"
          : undefined,
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
  getAllVehiclesController,
  getVehicleByIdAdminController,
  updateVehicleVerifyController
};

