import express from "express";
import {
    getAllVehiclesController,
    getVehicleByIdAdminController,
    updateVehicleVerifyController,
} from "../controller/adminVehicleController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// All admin routes require authentication
router.use(authenticateToken);

// Get all vehicles (admin only) – GET /api/admin/vehicles
router.get("/admin/vehicles", getAllVehiclesController);

// Get vehicle by ID (admin only) – GET /api/admin/vehicles/:id
router.get("/admin/vehicles/:id", getVehicleByIdAdminController);

// Update vehicle isVerified (admin only) – PATCH /api/admin/vehicles/:id/verify
router.patch("/admin/vehicles/:id/verify", updateVehicleVerifyController);

export default router;
