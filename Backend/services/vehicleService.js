import { and, eq, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, vehicleImages, vehicles } from "../schema/index.js";

/**
 * Create a vehicle with images and documents (owner only). Document images are mandatory.
 * @param {string} ownerId - Owner user ID
 * @param {Object} vehicleData - Vehicle fields (brand, model, vehicleType, manufactureYear, color, fuelType, transmission, seatingCapacity, airbags, pricePerDay, securityDeposit, lateFeePerHour, status?, description?)
 * @param {string[]} [imageUrls] - Optional array of image URLs
 * @param {string[]} documentUrls - Array of document URLs (at least one required for admin verification)
 * @returns {Promise<Object>} - Created vehicle with images and documents
 */
const createVehicle = async (ownerId, vehicleData, imageUrls = [], documentUrls = []) => {
  if (!Array.isArray(documentUrls) || documentUrls.length === 0) {
    const err = new Error("At least one vehicle document image is required for admin verification");
    err.code = "DOCUMENTS_REQUIRED";
    throw err;
  }

  const [vehicle] = await db
    .insert(vehicles)
    .values({
      ownerId,
      brand: vehicleData.brand,
      model: vehicleData.model,
      vehicleType: vehicleData.vehicleType ?? null,
      manufactureYear: vehicleData.manufactureYear,
      color: vehicleData.color ?? null,
      fuelType: vehicleData.fuelType ?? null,
      transmission: vehicleData.transmission ?? null,
      seatingCapacity: vehicleData.seatingCapacity ?? null,
      airbags: vehicleData.airbags ?? null,
      pricePerDay: String(vehicleData.pricePerDay),
      securityDeposit: vehicleData.securityDeposit != null ? String(vehicleData.securityDeposit) : null,
      lateFeePerHour: vehicleData.lateFeePerHour != null ? String(vehicleData.lateFeePerHour) : null,
      status: vehicleData.status ?? "available",
      description: vehicleData.description ?? null,
      updatedAt: new Date(),
    })
    .returning();

  if (!vehicle) return null;

  const imageRows = [];
  if (imageUrls.length > 0) {
    const rows = await db
      .insert(vehicleImages)
      .values(
        imageUrls.map((url) => ({
          vehicleId: vehicle.id,
          imageUrl: url,
          documentUrl: null,
        }))
      )
      .returning();
    imageRows.push(...rows);
  }

  const docRows = await db
    .insert(vehicleImages)
    .values(
      documentUrls.map((url) => ({
        vehicleId: vehicle.id,
        imageUrl: null,
        documentUrl: url,
      }))
    )
    .returning();

  const documents = docRows.map((r) => ({ id: r.id, documentUrl: r.documentUrl }));
  return { ...vehicle, images: imageRows, documents };
};

/**
 * Get vehicles by owner ID with images and documents
 */
const getVehiclesByOwnerId = async (ownerId) => {
  const ownerVehicles = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.ownerId, ownerId))
    .orderBy(vehicles.createdAt);

  if (ownerVehicles.length === 0) return [];

  const vehicleIds = ownerVehicles.map((v) => v.id);
  const allRows = await db
    .select()
    .from(vehicleImages)
    .where(inArray(vehicleImages.vehicleId, vehicleIds))
    .orderBy(vehicleImages.createdAt);

  const imagesByVehicle = {};
  const documentsByVehicle = {};
  for (const row of allRows) {
    if (row.documentUrl != null) {
      if (!documentsByVehicle[row.vehicleId]) documentsByVehicle[row.vehicleId] = [];
      documentsByVehicle[row.vehicleId].push({ id: row.id, documentUrl: row.documentUrl });
    } else if (row.imageUrl != null) {
      if (!imagesByVehicle[row.vehicleId]) imagesByVehicle[row.vehicleId] = [];
      imagesByVehicle[row.vehicleId].push(row);
    }
  }

  return ownerVehicles.map((v) => ({
    ...v,
    images: imagesByVehicle[v.id] ?? [],
    documents: documentsByVehicle[v.id] ?? [],
  }));
};

/**
 * Get a single vehicle by ID with images and documents
 */
const getVehicleById = async (vehicleId) => {
  const [vehicle] = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.id, vehicleId))
    .limit(1);

  if (!vehicle) return null;

  const allRows = await db
    .select()
    .from(vehicleImages)
    .where(eq(vehicleImages.vehicleId, vehicleId))
    .orderBy(vehicleImages.createdAt);

  const images = allRows.filter((r) => r.imageUrl != null);
  const documents = allRows.filter((r) => r.documentUrl != null).map((r) => ({ id: r.id, documentUrl: r.documentUrl }));

  return { ...vehicle, images, documents };
};

/**
 * Add images to an existing vehicle (owner only)
 */
const addVehicleImages = async (vehicleId, imageUrls) => {
  const [vehicle] = await db
    .select({ id: vehicles.id })
    .from(vehicles)
    .where(eq(vehicles.id, vehicleId))
    .limit(1);

  if (!vehicle) return null;
  if (imageUrls.length === 0) return [];

  const inserted = await db
    .insert(vehicleImages)
    .values(
      imageUrls.map((url) => ({
        vehicleId,
        imageUrl: url,
        documentUrl: null,
      }))
    )
    .returning();

  return inserted;
};

/**
 * Check if a vehicle exists and belongs to owner
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
 * Get vehicles available for rent (public): verified and status = available.
 * Returns vehicles with images only (no documents, no owner private info).
 */
const getPublicVehicles = async () => {
  const list = await db
    .select({
      id: vehicles.id,
      brand: vehicles.brand,
      model: vehicles.model,
      vehicleType: vehicles.vehicleType,
      manufactureYear: vehicles.manufactureYear,
      color: vehicles.color,
      fuelType: vehicles.fuelType,
      transmission: vehicles.transmission,
      seatingCapacity: vehicles.seatingCapacity,
      airbags: vehicles.airbags,
      pricePerDay: vehicles.pricePerDay,
      securityDeposit: vehicles.securityDeposit,
      lateFeePerHour: vehicles.lateFeePerHour,
      status: vehicles.status,
      description: vehicles.description,
      createdAt: vehicles.createdAt,
    })
    .from(vehicles)
    .where(and(eq(vehicles.isVerified, true), eq(vehicles.status, "available")))
    .orderBy(vehicles.createdAt);

  if (list.length === 0) return [];

  const vehicleIds = list.map((v) => v.id);
  const allRows = await db
    .select({ vehicleId: vehicleImages.vehicleId, imageUrl: vehicleImages.imageUrl })
    .from(vehicleImages)
    .where(inArray(vehicleImages.vehicleId, vehicleIds))
    .orderBy(vehicleImages.createdAt);

  const imagesByVehicle = {};
  for (const row of allRows) {
    if (row.imageUrl != null) {
      if (!imagesByVehicle[row.vehicleId]) imagesByVehicle[row.vehicleId] = [];
      imagesByVehicle[row.vehicleId].push(row.imageUrl);
    }
  }

  return list.map((v) => ({
    ...v,
    images: imagesByVehicle[v.id] ?? [],
  }));
};

/**
 * Get a single vehicle by ID for public browse (verified + available only).
 */
const getPublicVehicleById = async (vehicleId) => {
  const [vehicle] = await db
    .select({
      id: vehicles.id,
      brand: vehicles.brand,
      model: vehicles.model,
      vehicleType: vehicles.vehicleType,
      manufactureYear: vehicles.manufactureYear,
      color: vehicles.color,
      fuelType: vehicles.fuelType,
      transmission: vehicles.transmission,
      seatingCapacity: vehicles.seatingCapacity,
      airbags: vehicles.airbags,
      pricePerDay: vehicles.pricePerDay,
      securityDeposit: vehicles.securityDeposit,
      lateFeePerHour: vehicles.lateFeePerHour,
      status: vehicles.status,
      description: vehicles.description,
      createdAt: vehicles.createdAt,
    })
    .from(vehicles)
    .where(
      and(
        eq(vehicles.id, vehicleId),
        eq(vehicles.isVerified, true),
        eq(vehicles.status, "available")
      )
    )
    .limit(1);

  if (!vehicle) return null;

  const rows = await db
    .select({ imageUrl: vehicleImages.imageUrl })
    .from(vehicleImages)
    .where(eq(vehicleImages.vehicleId, vehicleId))
    .orderBy(vehicleImages.createdAt);

  const images = rows.filter((r) => r.imageUrl != null).map((r) => r.imageUrl);
  return { ...vehicle, images };
};

/**
 * Get all vehicles with images, documents, and owner info (admin only).
 * @param {string} [ownerId] - Optional owner ID to filter by
 */
const getAllVehicles = async (ownerId = null) => {
  let query = db
    .select({
      id: vehicles.id,
      ownerId: vehicles.ownerId,
      brand: vehicles.brand,
      model: vehicles.model,
      vehicleType: vehicles.vehicleType,
      manufactureYear: vehicles.manufactureYear,
      color: vehicles.color,
      fuelType: vehicles.fuelType,
      transmission: vehicles.transmission,
      seatingCapacity: vehicles.seatingCapacity,
      airbags: vehicles.airbags,
      pricePerDay: vehicles.pricePerDay,
      securityDeposit: vehicles.securityDeposit,
      lateFeePerHour: vehicles.lateFeePerHour,
      status: vehicles.status,
      description: vehicles.description,
      isVerified: vehicles.isVerified,
      createdAt: vehicles.createdAt,
      updatedAt: vehicles.updatedAt,
      owner: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      },
    })
    .from(vehicles)
    .leftJoin(users, eq(vehicles.ownerId, users.id))
    .orderBy(vehicles.createdAt);

  if (ownerId) {
    query = query.where(eq(vehicles.ownerId, ownerId));
  }
  const allVehicles = await query;

  if (allVehicles.length === 0) return [];

  const vehicleIds = allVehicles.map((v) => v.id);
  const allRows = await db
    .select()
    .from(vehicleImages)
    .where(inArray(vehicleImages.vehicleId, vehicleIds))
    .orderBy(vehicleImages.createdAt);

  const imagesByVehicle = {};
  const documentsByVehicle = {};
  for (const row of allRows) {
    if (row.documentUrl != null) {
      if (!documentsByVehicle[row.vehicleId]) documentsByVehicle[row.vehicleId] = [];
      documentsByVehicle[row.vehicleId].push({ id: row.id, documentUrl: row.documentUrl });
    } else if (row.imageUrl != null) {
      if (!imagesByVehicle[row.vehicleId]) imagesByVehicle[row.vehicleId] = [];
      imagesByVehicle[row.vehicleId].push(row);
    }
  }

  return allVehicles.map((v) => ({
    ...v,
    images: imagesByVehicle[v.id] ?? [],
    documents: documentsByVehicle[v.id] ?? [],
  }));
};

/**
 * Update vehicle isVerified (admin only)
 */
const updateVehicleIsVerified = async (vehicleId, isVerified) => {
  const [updated] = await db
    .update(vehicles)
    .set({ isVerified: !!isVerified, updatedAt: new Date() })
    .where(eq(vehicles.id, vehicleId))
    .returning();
  return updated ?? null;
};

/**
 * Update vehicle details (owner only). Does not allow changing isVerified.
 */
const updateVehicle = async (vehicleId, ownerId, data) => {
  const belongs = await vehicleBelongsToOwner(vehicleId, ownerId);
  if (!belongs) return null;

  const allowed = {};
  if (data.brand !== undefined) allowed.brand = String(data.brand).trim();
  if (data.model !== undefined) allowed.model = String(data.model).trim();
  if (data.vehicleType !== undefined) allowed.vehicleType = data.vehicleType === null || data.vehicleType === "" ? null : String(data.vehicleType).trim();
  if (data.manufactureYear !== undefined) allowed.manufactureYear = Number(data.manufactureYear);
  if (data.color !== undefined) allowed.color = data.color === null || data.color === "" ? null : String(data.color).trim();
  if (data.fuelType !== undefined) allowed.fuelType = data.fuelType === null || data.fuelType === "" ? null : String(data.fuelType).trim();
  if (data.transmission !== undefined) allowed.transmission = data.transmission === null || data.transmission === "" ? null : String(data.transmission).trim();
  if (data.seatingCapacity !== undefined) allowed.seatingCapacity = data.seatingCapacity === null || data.seatingCapacity === "" ? null : Number(data.seatingCapacity);
  if (data.airbags !== undefined) allowed.airbags = data.airbags === null || data.airbags === "" ? null : Number(data.airbags);
  if (data.pricePerDay !== undefined) allowed.pricePerDay = String(data.pricePerDay);
  if (data.securityDeposit !== undefined) allowed.securityDeposit = data.securityDeposit === null || data.securityDeposit === "" ? null : String(data.securityDeposit);
  if (data.lateFeePerHour !== undefined) allowed.lateFeePerHour = data.lateFeePerHour === null || data.lateFeePerHour === "" ? null : String(data.lateFeePerHour);
  if (data.description !== undefined) allowed.description = data.description === null || data.description === "" ? null : String(data.description).trim();
  if (data.status !== undefined) allowed.status = data.status;

  if (Object.keys(allowed).length === 0) {
    return getVehicleById(vehicleId);
  }
  allowed.updatedAt = new Date();

  const [updated] = await db
    .update(vehicles)
    .set(allowed)
    .where(eq(vehicles.id, vehicleId))
    .returning();

  if (!updated) return null;
  return getVehicleById(vehicleId);
};

/**
 * Delete a vehicle (owner only). vehicle_images are CASCADE deleted.
 * @param {string} vehicleId - Vehicle ID
 * @param {string} ownerId - Owner user ID
 * @returns {Promise<boolean>} - True if deleted, false if not found or not owner
 */
const deleteVehicle = async (vehicleId, ownerId) => {
  const belongs = await vehicleBelongsToOwner(vehicleId, ownerId);
  if (!belongs) return false;

  const deleted = await db
    .delete(vehicles)
    .where(and(eq(vehicles.id, vehicleId), eq(vehicles.ownerId, ownerId)))
    .returning();

  return deleted != null && deleted.length > 0;
};

export {
  addVehicleImages,
  createVehicle,
  deleteVehicle,
  getAllVehicles,
  getPublicVehicleById,
  getPublicVehicles,
  getVehicleById,
  getVehiclesByOwnerId,
  updateVehicle,
  updateVehicleIsVerified,
  vehicleBelongsToOwner,
};
