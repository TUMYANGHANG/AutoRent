import {
  createNotification,
  getUserById,
  getUsersByRole,
  NOTIFICATION_TYPES,
} from "../services/notificationService.js";
import {
  sendNewVehicleSubmittedToAdmin,
} from "../services/emailService.js";
import {
  addVehicleImages,
  createVehicle,
  deleteVehicle,
  getVehicleById,
  getPublicVehicleById,
  getPublicVehicles,
  getVehiclesByOwnerId,
  updateVehicle,
  vehicleBelongsToOwner,
} from "../services/vehicleService.js";

/**
 * Get vehicles available for rent (public, no auth)
 */
const getPublicVehiclesController = async (req, res) => {
  try {
    const vehicles = await getPublicVehicles();
    res.status(200).json({
      success: true,
      data: vehicles,
    });
  } catch (error) {
    console.error("Get public vehicles error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get a single vehicle by ID for rent (public, no auth). Only verified + available.
 */
const getPublicVehicleByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await getPublicVehicleById(id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found or not available for rent",
      });
    }
    res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    console.error("Get public vehicle by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Add vehicle (owner only)
 */
const addVehicleController = async (req, res) => {
  try {
    const { role, userId } = req.user;

    if (role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only owners can add vehicles",
      });
    }

    const vehicle = await createVehicle(
      userId,
      {
        brand: req.body.brand,
        model: req.body.model,
        vehicleType: req.body.vehicleType,
        manufactureYear: req.body.manufactureYear,
        color: req.body.color,
        fuelType: req.body.fuelType,
        transmission: req.body.transmission,
        seatingCapacity: req.body.seatingCapacity,
        airbags: req.body.airbags,
        pricePerDay: req.body.pricePerDay,
        securityDeposit: req.body.securityDeposit,
        lateFeePerHour: req.body.lateFeePerHour,
        status: req.body.status,
        description: req.body.description,
      },
      req.body.imageUrls ?? [],
      req.body.documentUrls ?? []
    );

    if (!vehicle) {
      return res.status(500).json({
        success: false,
        message: "Failed to create vehicle",
      });
    }

    const vehicleName = `${vehicle.brand ?? ""} ${vehicle.model ?? ""}`.trim() || "A vehicle";
    const owner = await getUserById(userId);
    const ownerName = owner?.firstName && owner?.lastName
      ? `${owner.firstName} ${owner.lastName}`
      : owner?.firstName || owner?.email || "An owner";

    const admins = await getUsersByRole("admin");
    for (const admin of admins) {
      try {
        await createNotification({
          recipientUserId: admin.id,
          type: NOTIFICATION_TYPES.NEW_VEHICLE_SUBMITTED,
          title: "New vehicle submitted for review",
          message: `${ownerName} added "${vehicleName}". Please review in the Admin Dashboard.`,
          vehicleId: vehicle.id,
          actorUserId: userId,
        });
        await sendNewVehicleSubmittedToAdmin(admin.email, vehicleName, ownerName);
      } catch (err) {
        console.error("Notification/email to admin failed:", err);
      }
    }

    res.status(201).json({
      success: true,
      message: "Vehicle added successfully",
      data: vehicle,
    });
  } catch (error) {
    console.error("Add vehicle error:", error);
    if (error.code === "DOCUMENTS_REQUIRED") {
      return res.status(400).json({
        success: false,
        message: "At least one vehicle document image is required for admin verification",
      });
    }
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A vehicle with this license plate already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get current user's vehicles (owner only)
 */
const getMyVehiclesController = async (req, res) => {
  try {
    const { role, userId } = req.user;

    if (role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only owners can list their vehicles",
      });
    }

    const vehicles = await getVehiclesByOwnerId(userId);

    res.status(200).json({
      success: true,
      data: vehicles,
    });
  } catch (error) {
    console.error("Get my vehicles error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get a single vehicle by ID (owner can get own vehicle)
 */
const getVehicleByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, userId } = req.user;

    const vehicle = await getVehicleById(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    if (role !== "owner" || vehicle.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own vehicles",
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    console.error("Get vehicle by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Add images to a vehicle (owner only, own vehicle)
 */
const addVehicleImagesController = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrls } = req.body;
    const { role, userId } = req.user;

    if (role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only owners can add vehicle images",
      });
    }

    const belongs = await vehicleBelongsToOwner(id, userId);
    if (!belongs) {
      return res.status(403).json({
        success: false,
        message: "You can only add images to your own vehicles",
      });
    }

    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: "imageUrls must be a non-empty array of image URLs",
      });
    }

    const added = await addVehicleImages(id, imageUrls);

    if (added === null) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    res.status(201).json({
      success: true,
      message: "Images added successfully",
      data: added,
    });
  } catch (error) {
    console.error("Add vehicle images error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update vehicle details (owner only; isVerified cannot be changed)
 */
const updateVehicleController = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, userId } = req.user;

    if (role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only owners can update their vehicles",
      });
    }

    const vehicle = await updateVehicle(id, userId, req.body);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found or you do not own it",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: vehicle,
    });
  } catch (error) {
    console.error("Update vehicle error:", error);
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A vehicle with this license plate already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Delete vehicle (owner only, own vehicle)
 */
const deleteVehicleController = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, userId } = req.user;

    if (role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only owners can delete their vehicles",
      });
    }

    const deleted = await deleteVehicle(id, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found or you do not own it",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    console.error("Delete vehicle error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export {
  addVehicleController,
  addVehicleImagesController,
  deleteVehicleController,
  getMyVehiclesController,
  getPublicVehiclesController,
  getPublicVehicleByIdController,
  getVehicleByIdController,
  updateVehicleController,
};
