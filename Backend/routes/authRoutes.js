import express from "express";
import { login, register, resendOTP, verifyEmail } from "../controller/authController.js";
import {
  createUserDetailsController,
  getUserDetailsController,
  updateUserDetailsController,
  verifyLicenseController
} from "../controller/userDetailsController.js";
import { authenticateToken } from "../middleware/auth.js";
import { validateLogin, validateOTPVerification, validateRegistration } from "../middleware/validation.js";

const router = express.Router();

// ==================== Authentication Routes ====================

// Register new user
router.post("/auth/register", validateRegistration, register);

// Verify email with OTP
router.post("/auth/verify-email", validateOTPVerification, verifyEmail);

// Resend OTP
router.post("/auth/resend-otp", resendOTP);

// Login user
router.post("/auth/login", validateLogin, login);

// ==================== User Details Routes ====================

// All user details routes require authentication
router.use("/user-details", authenticateToken);

// Get user details by user ID
router.get("/user-details/:userId", getUserDetailsController);

// Create user details
router.post("/user-details", createUserDetailsController);

// Update user details
router.put("/user-details/:userId", updateUserDetailsController);

// Verify license (Admin only)
router.patch("/user-details/:userId/verify-license", verifyLicenseController);

export default router;
