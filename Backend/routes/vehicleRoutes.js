import express from "express";
import {
  getAdminStatsController,
  getAllVehiclesController,
  getVehicleByIdAdminController,
  updateVehicleVerifyController,
} from "../controller/adminVehicleController.js";
import {
  addVehicleController,
  addVehicleImagesController,
  deleteVehicleController,
  getMyVehiclesController,
  getPublicVehiclesController,
  getPublicVehicleByIdController,
  getVehicleByIdController,
  updateVehicleController,
} from "../controller/vehicleController.js";
import { authenticateToken } from "../middleware/auth.js";
import { validateAddVehicle, validateAddVehicleImages, validateUpdateVehicle } from "../middleware/validation.js";

const router = express.Router();

// —— Public (renter) routes (no auth) ——
router.get("/vehicles/browse", getPublicVehiclesController);
router.get("/vehicles/browse/:id", getPublicVehicleByIdController);

// —— Owner vehicle routes (auth required) ——
router.post("/vehicles", authenticateToken, validateAddVehicle, addVehicleController);
router.get("/vehicles", authenticateToken, getMyVehiclesController);
router.get("/vehicles/:id", authenticateToken, getVehicleByIdController);
router.patch("/vehicles/:id", authenticateToken, validateUpdateVehicle, updateVehicleController);
router.delete("/vehicles/:id", authenticateToken, deleteVehicleController);
router.post("/vehicles/:id/images", authenticateToken, validateAddVehicleImages, addVehicleImagesController);

// —— Admin routes (auth required) ——
router.get("/admin/stats", authenticateToken, getAdminStatsController);
router.get("/admin/vehicles", authenticateToken, getAllVehiclesController);
router.get("/admin/vehicles/:id", authenticateToken, getVehicleByIdAdminController);
router.patch("/admin/vehicles/:id/verify", authenticateToken, updateVehicleVerifyController);



export default router;
