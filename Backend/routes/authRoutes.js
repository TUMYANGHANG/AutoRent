import express from "express";
import {
  forgotPassword,
  login,
  register,
  resendOTP,
  resetPassword,
  verifyEmail,
  verifyOTPForReset,
} from "../controller/authController.js";
import {
  createUserDetailsController,
  getUserDetailsController,
  updateUserDetailsController,
  verifyLicenseController
} from "../controller/userDetailsController.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  validateForgotPassword,
  validateLogin,
  validateOTPVerification,
  validateRegistration,
  validateResetPassword,
} from "../middleware/validation.js";

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

// Forgot password: send OTP to registered email
router.post("/auth/forgot-password", validateForgotPassword, forgotPassword);

// Verify OTP (for forgot password; does not clear OTP)
router.post("/auth/verify-otp", validateOTPVerification, verifyOTPForReset);

// Reset password: verify OTP (clears it) and set new password
router.post("/auth/reset-password", validateResetPassword, resetPassword);

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
