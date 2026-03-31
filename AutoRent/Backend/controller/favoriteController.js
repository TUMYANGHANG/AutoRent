import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../schema/index.js";
import {
  addFavorite,
  getFavoriteVehicleIds,
  getFavoriteVehicles,
  removeFavorite,
} from "../services/favoriteService.js";

/**
 * Get current user's favorite vehicle IDs (for UI state).
 */
const getFavoriteIdsController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const ids = await getFavoriteVehicleIds(userId);
    res.status(200).json({
      success: true,
      data: ids,
    });
  } catch (error) {
    console.error("Get favorite IDs error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get current user's favorite vehicles (full list for Favorites page).
 */
const getFavoritesController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const vehicles = await getFavoriteVehicles(userId);
    res.status(200).json({
      success: true,
      data: vehicles,
    });
  } catch (error) {
    console.error("Get favorites error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Add vehicle to favorites.
 * Renters must have profile verified (isProfileVerified) to add favorites or book.
 */
const addFavoriteController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    const { vehicleId } = req.body;

    if (!vehicleId) {
      return res.status(400).json({
        success: false,
        message: "vehicleId is required",
      });
    }

    if (role === "renter") {
      const [user] = await db
        .select({ isProfileVerified: users.isProfileVerified })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      if (!user?.isProfileVerified) {
        return res.status(403).json({
          success: false,
          message:
            "Complete your profile and get it verified by admin before you can add favorites or book vehicles.",
        });
      }
    }

    const result = await addFavorite(userId, vehicleId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found or not available for rent",
      });
    }

    res.status(201).json({
      success: true,
      message: "Vehicle added to favorites",
      data: { vehicleId },
    });
  } catch (error) {
    console.error("Add favorite error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Remove vehicle from favorites.
 */
const removeFavoriteController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { vehicleId } = req.params;

    if (!vehicleId) {
      return res.status(400).json({
        success: false,
        message: "vehicleId is required",
      });
    }

    const removed = await removeFavorite(userId, vehicleId);

    res.status(200).json({
      success: true,
      message: removed ? "Vehicle removed from favorites" : "Favorite not found",
      data: { removed },
    });
  } catch (error) {
    console.error("Remove favorite error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export {
  addFavoriteController,
  getFavoriteIdsController,
  getFavoritesController,
  removeFavoriteController,
};
