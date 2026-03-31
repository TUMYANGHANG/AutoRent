import {
  deleteUser,
  getAllUsers,
  getUsersPendingProfileVerification,
  verifyProfile,
} from "../services/adminProfileService.js";

/**
 * GET /admin/users
 * List all users (owners and renters) with optional role filter. Admin only.
 * Query: ?role=renter|owner
 */
const getAllUsersController = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can list users",
      });
    }

    const role = req.query.role; // "renter" | "owner" or undefined for all
    if (role && role !== "renter" && role !== "owner") {
      return res.status(400).json({
        success: false,
        message: "role must be 'renter' or 'owner'",
      });
    }

    const list = await getAllUsers(role);

    res.status(200).json({
      success: true,
      data: list,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * GET /admin/users/pending-verification
 * List renters pending profile verification (admin only).
 */
const getPendingProfileVerificationController = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can view pending profile verifications",
      });
    }

    const list = await getUsersPendingProfileVerification();

    res.status(200).json({
      success: true,
      data: list,
    });
  } catch (error) {
    console.error("Get pending profile verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * PATCH /admin/users/:userId/verify-profile
 * Set user's profile as verified or not (admin only).
 * Body: { isVerified: boolean }
 */
const verifyProfileController = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can verify profiles",
      });
    }

    const { userId } = req.params;
    const { isVerified } = req.body;

    if (typeof isVerified !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isVerified must be a boolean",
      });
    }

    const updatedUser = await verifyProfile(userId, isVerified);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { password: _, otp: __, otpExpiresAt: ___, ...userResponse } = updatedUser;

    res.status(200).json({
      success: true,
      message: `Profile ${isVerified ? "verified" : "unverified"} successfully`,
      data: userResponse,
    });
  } catch (error) {
    console.error("Verify profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * DELETE /admin/users/:userId
 * Delete a user (admin only). Cannot delete self.
 */
const deleteUserController = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can delete users",
      });
    }

    const { userId } = req.params;
    const currentUserId = req.user?.userId || req.user?.id;

    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const deleted = await deleteUser(userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export {
  deleteUserController,
  getAllUsersController,
  getPendingProfileVerificationController,
  verifyProfileController,
};
