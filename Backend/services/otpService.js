import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../schema/index.js";

/**
 * Generate a 6-digit OTP
 * @returns {string} - 6-digit OTP code
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Create and store OTP in user's record
 * @param {string} email - User's email address
 * @param {number} expiryMinutes - OTP expiry time in minutes (default: 10)
 * @returns {Promise<string>} - Generated OTP code
 */
const createOTP = async (email, expiryMinutes = 10) => {
  const otpCode = generateOTP();
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  // Update user record with new OTP
  await db
    .update(users)
    .set({
      otp: otpCode,
      otpExpiresAt: expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(users.email, email));

  return otpCode;
};

/**
 * Verify OTP
 * @param {string} email - User's email address
 * @param {string} otpCode - OTP code to verify
 * @returns {Promise<boolean>} - True if OTP is valid, false otherwise
 */
const verifyOTP = async (email, otpCode) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || !user.otp || !user.otpExpiresAt) {
    return false;
  }

  // Check if OTP matches and is not expired
  if (user.otp !== otpCode) {
    return false;
  }

  if (new Date(user.otpExpiresAt) < new Date()) {
    return false;
  }

  // Clear OTP after successful verification
  await db
    .update(users)
    .set({
      otp: null,
      otpExpiresAt: null,
      updatedAt: new Date(),
    })
    .where(eq(users.email, email));

  return true;
};

/**
 * Validate OTP without clearing (e.g. for forgot-password step before reset).
 * @param {string} email - User's email address
 * @param {string} otpCode - OTP code to validate
 * @returns {Promise<boolean>} - True if OTP is valid and not expired
 */
const validateOTP = async (email, otpCode) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || !user.otp || !user.otpExpiresAt) {
    return false;
  }
  if (user.otp !== otpCode) {
    return false;
  }
  if (new Date(user.otpExpiresAt) < new Date()) {
    return false;
  }
  return true;
};

/**
 * Check if user has a valid unused OTP
 * @param {string} email - User's email address
 * @returns {Promise<boolean>} - True if valid OTP exists
 */
const hasValidOTP = async (email) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || !user.otp || !user.otpExpiresAt) {
    return false;
  }

  return new Date(user.otpExpiresAt) > new Date();
};

export {
  createOTP, generateOTP, hasValidOTP, validateOTP, verifyOTP
};

