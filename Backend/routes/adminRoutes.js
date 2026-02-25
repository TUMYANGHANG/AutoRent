import express from "express";
import {
  deleteUserController,
  getAllUsersController,
  getPendingProfileVerificationController,
  verifyProfileController,
} from "../controller/adminProfileController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// All admin routes require authentication
router.use(authenticateToken);

// User management (admin only)
router.get("/admin/users", getAllUsersController);
router.get("/admin/users/pending-verification", getPendingProfileVerificationController);
router.patch("/admin/users/:userId/verify-profile", verifyProfileController);
router.delete("/admin/users/:userId", deleteUserController);

export default router;
