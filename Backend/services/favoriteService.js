import { and, eq, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import { favorites, vehicleImages, vehicles } from "../schema/index.js";

/**
 * Add vehicle to user's favorites. Vehicle must be verified + available.
 */
const addFavorite = async (userId, vehicleId) => {
  const [vehicle] = await db
    .select({ id: vehicles.id })
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

  const [existing] = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.vehicleId, vehicleId)))
    .limit(1);

  if (existing) return existing;

  const [row] = await db
    .insert(favorites)
    .values({
      userId,
      vehicleId,
    })
    .returning();

  return row ?? null;
};

/**
 * Remove vehicle from user's favorites.
 */
const removeFavorite = async (userId, vehicleId) => {
  const deleted = await db
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.vehicleId, vehicleId)))
    .returning();

  return deleted != null && deleted.length > 0;
};

/**
 * Get user's favorite vehicle IDs (in order added).
 */
const getFavoriteVehicleIds = async (userId) => {
  const rows = await db
    .select({ vehicleId: favorites.vehicleId })
    .from(favorites)
    .where(eq(favorites.userId, userId))
    .orderBy(favorites.createdAt);

  return rows.map((r) => r.vehicleId);
};

/**
 * Get user's favorite vehicles (full data + images). Only returns vehicles still verified + available.
 */
const getFavoriteVehicles = async (userId) => {
  const favIds = await getFavoriteVehicleIds(userId);
  if (favIds.length === 0) return [];

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
    .where(
      and(
        inArray(vehicles.id, favIds),
        eq(vehicles.isVerified, true),
        eq(vehicles.status, "available")
      )
    );

  if (list.length === 0) return [];

  const orderMap = new Map(favIds.map((id, i) => [id, i]));
  list.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));

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

export {
  addFavorite,
  getFavoriteVehicleIds,
  getFavoriteVehicles,
  removeFavorite,
};
