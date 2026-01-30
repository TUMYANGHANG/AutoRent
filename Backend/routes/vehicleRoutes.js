import express from "express";
import {
  addVehicleController,
  addVehicleImagesController,
  getMyVehiclesController,
  getVehicleByIdController,
} from "../controller/vehicleController.js";
import { authenticateToken } from "../middleware/auth.js";
import { validateAddVehicle, validateAddVehicleImages } from "../middleware/validation.js";

const router = express.Router();

// All vehicle routes require authentication
router.use(authenticateToken);

// Add vehicle (owner only) – POST /api/vehicles
router.post("/vehicles", validateAddVehicle, addVehicleController);

// Get current user's vehicles (owner only) – GET /api/vehicles
router.get("/vehicles", getMyVehiclesController);

// Get a single vehicle by ID (owner, own vehicle only) – GET /api/vehicles/:id
router.get("/vehicles/:id", getVehicleByIdController);

// Add images to a vehicle (owner only, own vehicle) – POST /api/vehicles/:id/images
router.post("/vehicles/:id/images", validateAddVehicleImages, addVehicleImagesController);

export default router;
