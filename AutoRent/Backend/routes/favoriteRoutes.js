import express from "express";
import {
  addFavoriteController,
  getFavoriteIdsController,
  getFavoritesController,
  removeFavoriteController,
} from "../controller/favoriteController.js";
import { authenticateToken } from "../middleware/auth.js";
import { validateFavoriteBody } from "../middleware/validators/favoriteValidation.js";

const router = express.Router();

router.get("/favorites/ids", authenticateToken, getFavoriteIdsController);
router.get("/favorites", authenticateToken, getFavoritesController);
router.post("/favorites", authenticateToken, validateFavoriteBody, addFavoriteController);
router.delete("/favorites/:vehicleId", authenticateToken, removeFavoriteController);

export default router;
