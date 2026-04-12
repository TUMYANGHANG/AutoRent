import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../schema/index.js";

/** Default 15m; override with OTP_EXPIRY_MINUTES (5–120). */
const OTP_EXPIRY_MINUTES = (() => {
  const n = Number(process.env.OTP_EXPIRY_MINUTES);
  if (Number.isFinite(n) && n >= 5 && n <= 120) return Math.floor(n);
  return 15;
})();

/**
 * Generate a 6-digit OTP
 * @returns {string} - 6-digit OTP code
 */
const generateOTP = () => {
  return crypto.randomInt(100_000, 1_000_000).toString();
};

/** Single source of truth for registration + resend + forgot-password expiry. */
const getOtpExpiresAt = () =>
  new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

/** JSON may send otp as number; DB stores string — strict !== would fail. */
const normalizeOtpInput = (otp) => {
  if (otp == null) return "";
  return String(otp).trim();
};

/** Compare stored expiry to now (handles Date or ISO string from Postgres). */
const isOtpExpired = (expiresAt) => {
  if (expiresAt == null) return true;
  const t =
    expiresAt instanceof Date
      ? expiresAt.getTime()
      : new Date(expiresAt).getTime();
  if (Number.isNaN(t)) return true;
  return t <= Date.now();
};

/**
 * Create and store OTP in user's record
 * @param {string} email - User's email address
 * @param {number} expiryMinutes - OTP expiry time in minutes (default: OTP_EXPIRY_MINUTES)
 * @returns {Promise<string>} - Generated OTP code
 */
const createOTP = async (email, expiryMinutes = OTP_EXPIRY_MINUTES) => {
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
  const want = normalizeOtpInput(otpCode);
  if (!/^\d{6}$/.test(want)) return false;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || !user.otp || !user.otpExpiresAt) {
    return false;
  }

  if (normalizeOtpInput(user.otp) !== want) {
    return false;
  }

  if (isOtpExpired(user.otpExpiresAt)) {
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
  const want = normalizeOtpInput(otpCode);
  if (!/^\d{6}$/.test(want)) return false;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || !user.otp || !user.otpExpiresAt) {
    return false;
  }
  if (normalizeOtpInput(user.otp) !== want) {
    return false;
  }
  if (isOtpExpired(user.otpExpiresAt)) {
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

  return !isOtpExpired(user.otpExpiresAt);
};

export {
  OTP_EXPIRY_MINUTES,
  createOTP,
  generateOTP,
  getOtpExpiresAt,
  hasValidOTP,
  validateOTP,
  verifyOTP,
};

