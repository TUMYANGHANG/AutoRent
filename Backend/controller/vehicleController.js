import {
  addVehicleImages,
  createVehicle,
  getVehicleById,
  getVehiclesByOwnerId,
  vehicleBelongsToOwner,
} from "../services/vehicleService.js";

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
        make: req.body.make,
        model: req.body.model,
        year: req.body.year,
        licensePlate: req.body.licensePlate,
        color: req.body.color,
        dailyRate: req.body.dailyRate,
        status: req.body.status,
        description: req.body.description,
      },
      req.body.imageUrls ?? []
    );

    if (!vehicle) {
      return res.status(500).json({
        success: false,
        message: "Failed to create vehicle",
      });
    }

    res.status(201).json({
      success: true,
      message: "Vehicle added successfully",
      data: vehicle,
    });
  } catch (error) {
    console.error("Add vehicle error:", error);
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

export {
  addVehicleController,
  addVehicleImagesController,
  getMyVehiclesController,
  getVehicleByIdController,
};
