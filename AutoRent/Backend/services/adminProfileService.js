import { desc, eq, or } from "drizzle-orm";
import { db } from "../db/index.js";
import { userDetails, users } from "../schema/index.js";

/**
 * Get all users with optional role filter (admin only). Excludes admin users.
 * @param {string} [role] - Optional: "renter" | "owner" to filter. Omit for all non-admin users.
 * @returns {Promise<Array>} - Users with joined userDetails.
 */
const getAllUsers = async (role) => {
  const whereClause =
    role === "renter"
      ? eq(users.role, "renter")
      : role === "owner"
        ? eq(users.role, "owner")
        : or(eq(users.role, "renter"), eq(users.role, "owner"));

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      isProfileVerified: users.isProfileVerified,
      isEmailVerified: users.isEmailVerified,
      createdAt: users.createdAt,
      userId: userDetails.userId,
      phoneNumber: userDetails.phoneNumber,
      dateOfBirth: userDetails.dateOfBirth,
      address: userDetails.address,
      city: userDetails.city,
      licenseNumber: userDetails.licenseNumber,
      licenseExpiry: userDetails.licenseExpiry,
      licenseImage: userDetails.licenseImage,
      isLicenseVerified: userDetails.isLicenseVerified,
    })
    .from(users)
    .leftJoin(userDetails, eq(users.id, userDetails.userId))
    .where(whereClause)
    .orderBy(desc(users.createdAt));

  return rows;
};

/**
 * Delete a user by ID (admin only). Cascades to user_details, favorites, etc.
 * @param {string} userId - User ID to delete
 * @returns {Promise<Object|null>} - Deleted user or null
 */
const deleteUser = async (userId) => {
  const [deleted] = await db
    .delete(users)
    .where(eq(users.id, userId))
    .returning();
  return deleted || null;
};

/**
 * Get renters pending profile verification (have user details submitted, not yet verified).
 * Returns users with their userDetails for admin review.
 */
const getUsersPendingProfileVerification = async () => {
  const allRenters = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      isProfileVerified: users.isProfileVerified,
      createdAt: users.createdAt,
      userId: userDetails.userId,
      phoneNumber: userDetails.phoneNumber,
      dateOfBirth: userDetails.dateOfBirth,
      address: userDetails.address,
      city: userDetails.city,
      licenseNumber: userDetails.licenseNumber,
      licenseExpiry: userDetails.licenseExpiry,
      licenseImage: userDetails.licenseImage,
      isLicenseVerified: userDetails.isLicenseVerified,
    })
    .from(users)
    .leftJoin(userDetails, eq(users.id, userDetails.userId))
    .where(eq(users.role, "renter"));

  // Filter: not profile-verified, and has submitted profile with license (license image required for verification)
  return allRenters.filter(
    (u) => !u.isProfileVerified && u.licenseImage != null && u.userId != null
  );
};

/**
 * Verify or unverify a user's profile (admin only). Sets users.isProfileVerified.
 * Optionally set isLicenseVerified on userDetails when approving.
 * @param {string} userId - User ID
 * @param {boolean} isVerified - Verification status
 * @returns {Promise<Object|null>} - Updated user or null
 */
const verifyProfile = async (userId, isVerified) => {
  const [updatedUser] = await db
    .update(users)
    .set({
      isProfileVerified: isVerified,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  if (updatedUser) {
    // When verifying: set license verified; when rejecting: clear license verified
    await db
      .update(userDetails)
      .set({
        isLicenseVerified: isVerified,
        updatedAt: new Date(),
      })
      .where(eq(userDetails.userId, userId));
  }

  return updatedUser || null;
};

export { deleteUser, getAllUsers, getUsersPendingProfileVerification, verifyProfile };
