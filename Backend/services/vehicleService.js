import { and, eq, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import { vehicleImages, vehicles } from "../schema/index.js";

/**
 * Create a vehicle with optional images (owner only)
 * @param {string} ownerId - Owner user ID
 * @param {Object} vehicleData - Vehicle fields (make, model, year, licensePlate, dailyRate, color?, description?, status?)
 * @param {string[]} [imageUrls] - Optional array of image URLs
 * @returns {Promise<Object>} - Created vehicle with images
 */
const createVehicle = async (ownerId, vehicleData, imageUrls = []) => {
  const [vehicle] = await db
    .insert(vehicles)
    .values({
      ownerId,
      make: vehicleData.make,
      model: vehicleData.model,
      year: vehicleData.year,
      licensePlate: vehicleData.licensePlate,
      color: vehicleData.color ?? null,
      dailyRate: String(vehicleData.dailyRate),
      status: vehicleData.status ?? "available",
      description: vehicleData.description ?? null,
      updatedAt: new Date(),
    })
    .returning();

  if (!vehicle) return null;

  const images = [];
  if (imageUrls.length > 0) {
    const imageRows = await db
      .insert(vehicleImages)
      .values(
        imageUrls.map((url, index) => ({
          vehicleId: vehicle.id,
          imageUrl: url,
          displayOrder: index,
        }))
      )
      .returning();
    images.push(...imageRows);
  }

  return { ...vehicle, images };
};

/**
 * Get vehicles by owner ID with their images
 * @param {string} ownerId - Owner user ID
 * @returns {Promise<Object[]>} - List of vehicles with images
 */
const getVehiclesByOwnerId = async (ownerId) => {
  const ownerVehicles = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.ownerId, ownerId))
    .orderBy(vehicles.createdAt);

  if (ownerVehicles.length === 0) return [];

  const vehicleIds = ownerVehicles.map((v) => v.id);
  const allImages = await db
    .select()
    .from(vehicleImages)
    .where(inArray(vehicleImages.vehicleId, vehicleIds))
    .orderBy(vehicleImages.displayOrder, vehicleImages.createdAt);

  const imagesByVehicle = {};
  for (const img of allImages) {
    if (!imagesByVehicle[img.vehicleId]) imagesByVehicle[img.vehicleId] = [];
    imagesByVehicle[img.vehicleId].push(img);
  }

  return ownerVehicles.map((v) => ({
    ...v,
    images: imagesByVehicle[v.id] ?? [],
  }));
};

/**
 * Get a single vehicle by ID with images (if owner or allowed)
 * @param {string} vehicleId - Vehicle ID
 * @returns {Promise<Object|null>} - Vehicle with images or null
 */
const getVehicleById = async (vehicleId) => {
  const [vehicle] = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.id, vehicleId))
    .limit(1);

  if (!vehicle) return null;

  const images = await db
    .select()
    .from(vehicleImages)
    .where(eq(vehicleImages.vehicleId, vehicleId))
    .orderBy(vehicleImages.displayOrder, vehicleImages.createdAt);

  return { ...vehicle, images };
};

/**
 * Add images to an existing vehicle (owner only)
 * @param {string} vehicleId - Vehicle ID
 * @param {string[]} imageUrls - Image URLs
 * @returns {Promise<Object[]|null>} - Created image rows or null if vehicle not found
 */
const addVehicleImages = async (vehicleId, imageUrls) => {
  const [vehicle] = await db
    .select({ id: vehicles.id })
    .from(vehicles)
    .where(eq(vehicles.id, vehicleId))
    .limit(1);

  if (!vehicle) return null;

  if (imageUrls.length === 0) return [];

  const existing = await db
    .select({ displayOrder: vehicleImages.displayOrder })
    .from(vehicleImages)
    .where(eq(vehicleImages.vehicleId, vehicleId));

  const startOrder =
    existing.length > 0
      ? Math.max(...existing.map((r) => r.displayOrder ?? 0)) + 1
      : 0;

  const inserted = await db
    .insert(vehicleImages)
    .values(
      imageUrls.map((url, index) => ({
        vehicleId,
        imageUrl: url,
        displayOrder: startOrder + index,
      }))
    )
    .returning();

  return inserted;
};

/**
 * Check if a vehicle exists and belongs to owner
 * @param {string} vehicleId - Vehicle ID
 * @param {string} ownerId - Owner user ID
 * @returns {Promise<boolean>}
 */
const vehicleBelongsToOwner = async (vehicleId, ownerId) => {
  const [row] = await db
    .select({ id: vehicles.id })
    .from(vehicles)
    .where(and(eq(vehicles.id, vehicleId), eq(vehicles.ownerId, ownerId)))
    .limit(1);
  return !!row;
};

/**
 * Get all vehicles with images (admin only)
 * @returns {Promise<Object[]>}
 */
const getAllVehicles = async () => {
  const allVehicles = await db
    .select()
    .from(vehicles)
    .orderBy(vehicles.createdAt);

  if (allVehicles.length === 0) return [];

  const vehicleIds = allVehicles.map((v) => v.id);
  const allImages = await db
    .select()
    .from(vehicleImages)
    .where(inArray(vehicleImages.vehicleId, vehicleIds))
    .orderBy(vehicleImages.displayOrder, vehicleImages.createdAt);

  const imagesByVehicle = {};
  for (const img of allImages) {
    if (!imagesByVehicle[img.vehicleId]) imagesByVehicle[img.vehicleId] = [];
    imagesByVehicle[img.vehicleId].push(img);
  }

  return allVehicles.map((v) => ({
    ...v,
    images: imagesByVehicle[v.id] ?? [],
  }));
};

/**
 * Update vehicle isVerified (admin only)
 * @param {string} vehicleId - Vehicle ID
 * @param {boolean} isVerified - Verification status
 * @returns {Promise<Object|null>}
 */
const updateVehicleIsVerified = async (vehicleId, isVerified) => {
  const [updated] = await db
    .update(vehicles)
    .set({ isVerified: !!isVerified, updatedAt: new Date() })
    .where(eq(vehicles.id, vehicleId))
    .returning();
  return updated ?? null;
};

export {
    addVehicleImages,
    createVehicle,
    getAllVehicles,
    getVehicleById,
    getVehiclesByOwnerId,
    updateVehicleIsVerified,
    vehicleBelongsToOwner
};

