import express from "express";
import {
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

// All other vehicle routes require authentication
router.use(authenticateToken);

// —— Owner vehicle routes ——
router.post("/vehicles", validateAddVehicle, addVehicleController) //new vehcles added by owner
router.get("/vehicles", getMyVehiclesController); //get all vehicles of the owner
router.get("/vehicles/:id", getVehicleByIdController); //get a single vehicle by id
router.patch("/vehicles/:id", validateUpdateVehicle, updateVehicleController); //update vehicle details (owner; isVerified not allowed)
router.delete("/vehicles/:id", deleteVehicleController);
router.post("/vehicles/:id/images", validateAddVehicleImages, addVehicleImagesController);



// —— Admin vehicle routes ——
router.get("/admin/vehicles", getAllVehiclesController);
router.get("/admin/vehicles/:id", getVehicleByIdAdminController);
router.patch("/admin/vehicles/:id/verify", updateVehicleVerifyController);



export default router;
