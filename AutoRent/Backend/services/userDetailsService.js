import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { userDetails, users } from "../schema/index.js";

/**
 * Get user details by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} - User details or null if not found
 */
const getUserDetails = async (userId) => {
  const [details] = await db
    .select()
    .from(userDetails)
    .where(eq(userDetails.userId, userId))
    .limit(1);

  return details || null;
};

/**
 * Create user details
 * @param {string} userId - User ID
 * @param {Object} detailsData - User details data
 * @returns {Promise<Object>} - Created user details
 */
const createUserDetails = async (userId, detailsData) => {
  const [newDetails] = await db
    .insert(userDetails)
    .values({
      userId: userId,
      phoneNumber: detailsData.phoneNumber || null,
      dateOfBirth: detailsData.dateOfBirth || null,
      profilePicture: detailsData.profilePicture || null,
      address: detailsData.address || null,
      city: detailsData.city || null,
      licenseNumber: detailsData.licenseNumber || null,
      licenseExpiry: detailsData.licenseExpiry || null,
      licenseImage: detailsData.licenseImage || null,
      isLicenseVerified: false, // Default to false, admin must verify
      updatedAt: new Date(),
    })
    .returning();

  return newDetails;
};

/**
 * Update user details
 * @param {string} userId - User ID
 * @param {Object} detailsData - Updated user details data
 * @returns {Promise<Object|null>} - Updated user details or null if not found
 */
const updateUserDetails = async (userId, detailsData) => {
  // Build update object with only provided fields
  const updateData = {
    updatedAt: new Date(),
  };

  if (detailsData.phoneNumber !== undefined) {
    updateData.phoneNumber = detailsData.phoneNumber || null;
  }
  if (detailsData.dateOfBirth !== undefined) {
    updateData.dateOfBirth = detailsData.dateOfBirth || null;
  }
  if (detailsData.profilePicture !== undefined) {
    updateData.profilePicture = detailsData.profilePicture || null;
  }
  if (detailsData.address !== undefined) {
    updateData.address = detailsData.address || null;
  }
  if (detailsData.city !== undefined) {
    updateData.city = detailsData.city || null;
  }
  if (detailsData.licenseNumber !== undefined) {
    updateData.licenseNumber = detailsData.licenseNumber || null;
  }
  if (detailsData.licenseExpiry !== undefined) {
    updateData.licenseExpiry = detailsData.licenseExpiry || null;
  }
  if (detailsData.licenseImage !== undefined) {
    updateData.licenseImage = detailsData.licenseImage || null;
    // Reset verification if license image is updated
    if (detailsData.licenseImage) {
      updateData.isLicenseVerified = false;
    }
  }

  const [updatedDetails] = await db
    .update(userDetails)
    .set(updateData)
    .where(eq(userDetails.userId, userId))
    .returning();

  // When renter (or any user) edits their profile, reset profile verification so admin must review again
  if (updatedDetails) {
    await db
      .update(users)
      .set({ isProfileVerified: false, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  return updatedDetails || null;
};

/**
 * Verify user license (Admin only)
 * @param {string} userId - User ID
 * @param {boolean} isVerified - Verification status
 * @returns {Promise<Object|null>} - Updated user details or null if not found
 */
const verifyLicense = async (userId, isVerified) => {
  const [updatedDetails] = await db
    .update(userDetails)
    .set({
      isLicenseVerified: isVerified,
      updatedAt: new Date(),
    })
    .where(eq(userDetails.userId, userId))
    .returning();

  return updatedDetails || null;
};

/**
 * Check if user details exist
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - True if details exist
 */
const userDetailsExist = async (userId) => {
  const details = await getUserDetails(userId);
  return details !== null;
};

export {
  createUserDetails,
  getUserDetails,
  updateUserDetails,
  userDetailsExist,
  verifyLicense
};

