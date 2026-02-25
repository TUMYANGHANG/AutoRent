import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";
import { users } from "../schema/index.js";
import { sendOTPEmail, sendPasswordResetOTPEmail } from "../services/emailService.js";
import { createOTP, generateOTP, validateOTP, verifyOTP } from "../services/otpService.js";

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Validate and set role (default to "renter" if not provided or invalid)
    const validRoles = ["renter", "owner"];
    const userRole = role && validRoles.includes(role) ? role : "renter";

    // Create user with OTP
    const [newUser] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        role: userRole,
        isEmailVerified: false,
        otp: otp,
        otpExpiresAt: otpExpiresAt,
      })
      .returning();

    try {
      await sendOTPEmail(email.toLowerCase(), otp);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      // User is created but email failed - they can request resend
      return res.status(201).json({
        success: true,
        message: "User registered successfully, but failed to send verification email. Please request a new OTP.",
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          isEmailVerified: newUser.isEmailVerified,
        },
      });
    }

    // Remove password, otp, and otpExpiresAt from response
    const { password: _, otp: __, otpExpiresAt: ___, ...userResponse } = newUser;

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please check your email for OTP verification.",
      user: userResponse,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during registration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Verify email with OTP
 */
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check if user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Verify OTP
    const isValid = await verifyOTP(email.toLowerCase(), otp);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Update user as verified
    const [updatedUser] = await db
      .update(users)
      .set({
        isEmailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    // Remove password, otp, and otpExpiresAt from response
    const { password: _, otp: __, otpExpiresAt: ___, ...userResponse } = updatedUser;

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during email verification",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Resend OTP
 */
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate and send new OTP
    const otp = await createOTP(email.toLowerCase());

    try {
      await sendOTPEmail(email.toLowerCase(), otp);
      res.status(200).json({
        success: true,
        message: "OTP sent successfully. Please check your email.",
      });
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again later.",
      });
    }
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET is not defined in environment variables");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        userId: user.id, // Alias for consistency
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      }
    );

    // Remove password, otp, and otpExpiresAt from response
    const { password: _, otp: __, otpExpiresAt: ___, ...userResponse } = user;

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Forgot password: send OTP to registered email (any user)
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    const otp = await createOTP(email.toLowerCase());

    try {
      await sendPasswordResetOTPEmail(email.toLowerCase(), otp);
      res.status(200).json({
        success: true,
        message: "OTP has been sent to your email. Use it to reset your password.",
      });
    } catch (emailError) {
      console.error("Failed to send password reset OTP email:", emailError);
      res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again later.",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Verify OTP for forgot password (does not clear OTP; used before reset step)
 */
const verifyOTPForReset = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const isValid = await validateOTP(email.toLowerCase(), otp);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now set a new password.",
    });
  } catch (error) {
    console.error("Verify OTP for reset error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Reset password: verify OTP (clears it), then update password
 */
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const isValid = await verifyOTP(email.toLowerCase(), otp);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Please request a new one.",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.email, email.toLowerCase()));

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully. You can now sign in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * GET /auth/me – return current user from token (fresh from DB, includes isProfileVerified).
 */
const getMe = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { password: _, otp: __, otpExpiresAt: ___, ...userResponse } = user;

    res.status(200).json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export {
  forgotPassword,
  getMe,
  login,
  register,
  resendOTP,
  resetPassword,
  verifyEmail,
  verifyOTPForReset,
};

