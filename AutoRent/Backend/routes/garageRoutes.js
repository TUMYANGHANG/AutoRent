import express from "express";
import {
  createGarageController,
  getGaragesController,
  getGaragesForMapController,
} from "../controller/garageController.js";
import { authenticateToken } from "../middleware/auth.js";
import { validateGarageCreate, validateGarageMapQuery } from "../middleware/validators/garageValidation.js";

const router = express.Router();

// Public endpoints
router.get("/garages", getGaragesController);
router.get("/garages/map", validateGarageMapQuery, getGaragesForMapController);

// Authenticated endpoints (crowd locating)
router.post("/garages", authenticateToken, validateGarageCreate, createGarageController);

export default router;
