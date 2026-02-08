import express from "express";
import {
  createGarageController,
  getGaragesController,
  getGaragesForMapController,
} from "../controller/garageController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Public endpoints
router.get("/garages", getGaragesController);
router.get("/garages/map", getGaragesForMapController);

// Authenticated endpoints (crowd locating)
router.use(authenticateToken);
router.post("/garages", createGarageController);

export default router;
