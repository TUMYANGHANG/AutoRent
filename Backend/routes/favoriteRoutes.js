import express from "express";
import {
  addFavoriteController,
  getFavoriteIdsController,
  getFavoritesController,
  removeFavoriteController,
} from "../controller/favoriteController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/favorites/ids", getFavoriteIdsController);
router.get("/favorites", getFavoritesController);
router.post("/favorites", addFavoriteController);
router.delete("/favorites/:vehicleId", removeFavoriteController);

export default router;
