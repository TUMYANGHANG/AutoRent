import {
  createUserDetails,
  getUserDetails,
  updateUserDetails,
  userDetailsExist,
  verifyLicense,
} from "../services/userDetailsService.js";

/**
 * Get user details by user ID
 */
const getUserDetailsController = async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only access their own details unless they're admin
    const requestingUserId = req.user?.userId;
    const userRole = req.user?.role;

    if (userId !== requestingUserId && userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You can only access your own user details",
      });
    }

    const details = await getUserDetails(userId);

    if (!details) {
      return res.status(404).json({
        success: false,
        message: "User details not found",
      });
    }

    res.status(200).json({
      success: true,
      data: details,
    });
  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Create user details
 */
const createUserDetailsController = async (req, res) => {
  try {
    const { userId } = req.body;
    const requestingUserId = req.user?.userId;
    const userRole = req.user?.role;

    // Users can only create their own details unless they're admin
    if (userId !== requestingUserId && userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You can only create your own user details",
      });
    }

    // Check if details already exist
    const exists = await userDetailsExist(userId);
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "User details already exist. Use update endpoint instead.",
      });
    }

    const detailsData = {
      phoneNumber: req.body.phoneNumber,
      dateOfBirth: req.body.dateOfBirth,
      profilePicture: req.body.profilePicture,
      address: req.body.address,
      city: req.body.city,
      licenseNumber: req.body.licenseNumber,
      licenseExpiry: req.body.licenseExpiry,
      licenseImage: req.body.licenseImage,
    };

    const newDetails = await createUserDetails(userId, detailsData);

    res.status(201).json({
      success: true,
      message: "User details created successfully",
      data: newDetails,
    });
  } catch (error) {
    console.error("Create user details error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update user details
 */
const updateUserDetailsController = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.userId;
    const userRole = req.user?.role;

    // Users can only update their own details unless they're admin
    if (userId !== requestingUserId && userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You can only update your own user details",
      });
    }

    // Check if details exist
    const exists = await userDetailsExist(userId);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "User details not found. Create details first.",
      });
    }

    const detailsData = {
      phoneNumber: req.body.phoneNumber,
      dateOfBirth: req.body.dateOfBirth,
      profilePicture: req.body.profilePicture,
      address: req.body.address,
      city: req.body.city,
      licenseNumber: req.body.licenseNumber,
      licenseExpiry: req.body.licenseExpiry,
      licenseImage: req.body.licenseImage,
    };

    const updatedDetails = await updateUserDetails(userId, detailsData);

    if (!updatedDetails) {
      return res.status(404).json({
        success: false,
        message: "User details not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User details updated successfully",
      data: updatedDetails,
    });
  } catch (error) {
    console.error("Update user details error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Verify user license (Admin only)
 */
const verifyLicenseController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isVerified } = req.body;
    const userRole = req.user?.role;

    // Only admins can verify licenses
    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can verify licenses",
      });
    }

    if (typeof isVerified !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isVerified must be a boolean value",
      });
    }

    const updatedDetails = await verifyLicense(userId, isVerified);

    if (!updatedDetails) {
      return res.status(404).json({
        success: false,
        message: "User details not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `License ${isVerified ? "verified" : "unverified"} successfully`,
      data: updatedDetails,
    });
  } catch (error) {
    console.error("Verify license error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export {
  createUserDetailsController,
  getUserDetailsController,
  updateUserDetailsController,
  verifyLicenseController
};

