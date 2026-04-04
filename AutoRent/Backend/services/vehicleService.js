import { and, count, desc, eq, gte, inArray, isNotNull, ne, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "../db/index.js";
import { bookings, userDetails, users, vehicleImages, vehicles } from "../schema/index.js";
import { getRatingStats, getRatingStatsForVehicles } from "./vehicleReviewService.js";

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
      pickupLatitude: vehicleData.pickupLatitude != null ? String(vehicleData.pickupLatitude) : null,
      pickupLongitude: vehicleData.pickupLongitude != null ? String(vehicleData.pickupLongitude) : null,
      pickupAddress: vehicleData.pickupAddress != null ? String(vehicleData.pickupAddress).trim().slice(0, 500) : null,
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

/** Default search radius when `nearby` + lat/lng are set but `radiusKm` is omitted (km). */
const DEFAULT_NEARBY_RADIUS_KM = 1.5;

/** Haversine distance in km between two points */
const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Get vehicles for rent (public): verified, status = available or rented.
 * Returns vehicles with images; rented vehicles shown with status for visibility.
 * @param {Object} [opts] - Optional: { lat, lng, radiusKm, nearby }. If nearby and lat/lng set, only vehicles with pickup location are returned, sorted by distance, with distanceKm on each. If radiusKm is omitted, defaults to DEFAULT_NEARBY_RADIUS_KM (1.5 km).
 */
const getPublicVehicles = async (opts = {}) => {
  const { lat, lng, radiusKm, nearby } = opts;
  const useNearby = !!nearby && lat != null && lng != null && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng));
  const userLat = useNearby ? Number(lat) : null;
  const userLng = useNearby ? Number(lng) : null;
  let maxRadius =
    radiusKm != null && radiusKm !== "" && !Number.isNaN(Number(radiusKm))
      ? Number(radiusKm)
      : null;
  if (useNearby && maxRadius === null) {
    maxRadius = DEFAULT_NEARBY_RADIUS_KM;
  }

  const baseWhere = and(
    eq(vehicles.isVerified, true),
    or(eq(vehicles.status, "available"), eq(vehicles.status, "rented"))
  );
  const whereClause = useNearby
    ? and(baseWhere, isNotNull(vehicles.pickupLatitude), isNotNull(vehicles.pickupLongitude))
    : baseWhere;

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
      pickupLatitude: vehicles.pickupLatitude,
      pickupLongitude: vehicles.pickupLongitude,
      pickupAddress: vehicles.pickupAddress,
    })
    .from(vehicles)
    .where(whereClause)
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

  let ratingStats = {};
  try {
    ratingStats = await getRatingStatsForVehicles(vehicleIds);
  } catch (err) {
    console.warn("Vehicle review stats unavailable:", err?.message);
  }
  let result = list.map((v) => ({
    ...v,
    images: imagesByVehicle[v.id] ?? [],
    averageRating: ratingStats[v.id]?.averageRating ?? null,
    reviewCount: ratingStats[v.id]?.reviewCount ?? 0,
  }));

  if (useNearby && userLat != null && userLng != null) {
    result = result
      .map((v) => {
        const vLat = Number(v.pickupLatitude);
        const vLng = Number(v.pickupLongitude);
        if (Number.isNaN(vLat) || Number.isNaN(vLng)) return null;
        const distanceKm = haversineKm(userLat, userLng, vLat, vLng);
        if (maxRadius != null && distanceKm > maxRadius) return null;
        return { ...v, distanceKm: Math.round(distanceKm * 10) / 10 };
      })
      .filter(Boolean)
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }

  return result;
};

/**
 * Get a single vehicle by ID for public browse (verified; available or rented).
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
      pickupLatitude: vehicles.pickupLatitude,
      pickupLongitude: vehicles.pickupLongitude,
      pickupAddress: vehicles.pickupAddress,
    })
    .from(vehicles)
    .where(and(eq(vehicles.id, vehicleId), eq(vehicles.isVerified, true)))
    .limit(1);

  if (!vehicle) return null;

  const rows = await db
    .select({ imageUrl: vehicleImages.imageUrl })
    .from(vehicleImages)
    .where(eq(vehicleImages.vehicleId, vehicleId))
    .orderBy(vehicleImages.createdAt);

  const images = rows.filter((r) => r.imageUrl != null).map((r) => r.imageUrl);
  let stats = { averageRating: null, reviewCount: 0 };
  try {
    stats = await getRatingStats(vehicleId);
  } catch (err) {
    console.warn("Vehicle review stats unavailable:", err?.message);
  }
  return {
    ...vehicle,
    images,
    averageRating: stats.averageRating,
    reviewCount: stats.reviewCount,
  };
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
  if (data.pickupLatitude !== undefined) allowed.pickupLatitude = data.pickupLatitude === null || data.pickupLatitude === "" ? null : String(data.pickupLatitude);
  if (data.pickupLongitude !== undefined) allowed.pickupLongitude = data.pickupLongitude === null || data.pickupLongitude === "" ? null : String(data.pickupLongitude);
  if (data.pickupAddress !== undefined) allowed.pickupAddress = data.pickupAddress === null || data.pickupAddress === "" ? null : String(data.pickupAddress).trim().slice(0, 500);

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

/**
 * Get admin dashboard stats (total vehicles, total users, active rentals, pending actions).
 */
const getAdminStats = async () => {
  const [vehiclesRow] = await db.select({ totalVehicles: count() }).from(vehicles);

  const [usersRow] = await db
    .select({ totalUsers: count() })
    .from(users)
    .where(ne(users.role, "admin"));

  const [activeRow] = await db
    .select({ count: count() })
    .from(bookings)
    .where(inArray(bookings.status, ["confirmed", "in_progress"]));

  // Pending profile verifications: renters with userDetails + licenseImage, not yet verified
  const [pendingProfileRow] = await db
    .select({ count: count() })
    .from(users)
    .innerJoin(userDetails, eq(users.id, userDetails.userId))
    .where(
      and(
        eq(users.role, "renter"),
        eq(users.isProfileVerified, false),
        isNotNull(userDetails.licenseImage)
      )
    );
  const pendingProfileCount = Number(pendingProfileRow?.count ?? 0);

  // Unverified vehicles
  const [unverifiedVehiclesRow] = await db
    .select({ count: count() })
    .from(vehicles)
    .where(eq(vehicles.isVerified, false));

  const pendingActions =
    pendingProfileCount + Number(unverifiedVehiclesRow?.count ?? 0);

  return {
    totalVehicles: Number(vehiclesRow?.totalVehicles ?? 0),
    totalUsers: Number(usersRow?.totalUsers ?? 0),
    activeRentals: Number(activeRow?.count ?? 0),
    pendingActions,
  };
};

/** Local calendar YYYY-MM-DD (avoid UTC drift from toISOString()). */
const formatLocalYYYYMMDD = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/** Match week bucket keys from PG date / string / Date to YYYY-MM-DD. */
const normalizeWeekStartKey = (value) => {
  if (value == null) return "";
  if (typeof value === "string") {
    const m = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatLocalYYYYMMDD(value);
  }
  const s = String(value);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? "" : formatLocalYYYYMMDD(d);
};

const getAdminReportStats = async () => {
  const renterCountRow = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, "renter"));
  const ownerCountRow = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, "owner"));

  const totalRenters = Number(renterCountRow[0]?.count ?? 0);
  const totalOwners = Number(ownerCountRow[0]?.count ?? 0);

  const [vehiclesRow] = await db.select({ total: count() }).from(vehicles);
  const totalVehicles = Number(vehiclesRow?.total ?? 0);

  const vehicleTypeRows = await db
    .select({
      type: vehicles.vehicleType,
      count: count(),
    })
    .from(vehicles)
    .groupBy(vehicles.vehicleType);

  const vehiclesByType = vehicleTypeRows.map((r) => ({
    type: r.type || "Unknown",
    count: Number(r.count),
  }));

  const WEEKS = 8;
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startOfCurrentWeek = new Date(now);
  startOfCurrentWeek.setDate(now.getDate() - diffToMonday);
  startOfCurrentWeek.setHours(0, 0, 0, 0);

  const eightWeeksAgo = new Date(startOfCurrentWeek);
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - (WEEKS - 1) * 7);

  const weeklyRows = await db
    .select({
      weekStart: sql`date_trunc('week', ${bookings.createdAt})::date`.as("week_start"),
      count: count(),
    })
    .from(bookings)
    .where(gte(bookings.createdAt, eightWeeksAgo))
    .groupBy(sql`date_trunc('week', ${bookings.createdAt})::date`)
    .orderBy(sql`date_trunc('week', ${bookings.createdAt})::date`);

  const weeklyMap = new Map();
  for (const r of weeklyRows) {
    const key = normalizeWeekStartKey(r.weekStart);
    if (key) {
      weeklyMap.set(key, Number(r.count));
    }
  }

  const weeklyRentals = [];
  for (let i = 0; i < WEEKS; i++) {
    const ws = new Date(eightWeeksAgo);
    ws.setDate(ws.getDate() + i * 7);
    const key = formatLocalYYYYMMDD(ws);
    const label = ws.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    weeklyRentals.push({ week: key, label, count: weeklyMap.get(key) ?? 0 });
  }

  return {
    totalRenters,
    totalOwners,
    totalVehicles,
    vehiclesByType,
    weeklyRentals,
  };
};

const ACTIVITY_FEED_LIMIT = 20;

const displayNameParts = (first, last, fallback) => {
  const n = [first, last].filter(Boolean).join(" ").trim();
  return n || fallback || "—";
};

/**
 * Admin: recent signups, new listings with owner, bookings with renter↔vehicle, available fleet sample.
 */
const getAdminActivityFeed = async () => {
  const renterUser = alias(users, "renter");

  const recentUsers = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(ne(users.role, "admin"))
    .orderBy(desc(users.createdAt))
    .limit(ACTIVITY_FEED_LIMIT);

  const recentVehicles = await db
    .select({
      id: vehicles.id,
      brand: vehicles.brand,
      model: vehicles.model,
      status: vehicles.status,
      isVerified: vehicles.isVerified,
      createdAt: vehicles.createdAt,
      ownerFirst: users.firstName,
      ownerLast: users.lastName,
      ownerEmail: users.email,
    })
    .from(vehicles)
    .innerJoin(users, eq(vehicles.ownerId, users.id))
    .orderBy(desc(vehicles.createdAt))
    .limit(ACTIVITY_FEED_LIMIT);

  const recentBookings = await db
    .select({
      id: bookings.id,
      status: bookings.status,
      startDate: bookings.startDate,
      returnDate: bookings.returnDate,
      createdAt: bookings.createdAt,
      vehicleBrand: vehicles.brand,
      vehicleModel: vehicles.model,
      renterFirst: renterUser.firstName,
      renterLast: renterUser.lastName,
      renterEmail: renterUser.email,
    })
    .from(bookings)
    .innerJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
    .innerJoin(renterUser, eq(bookings.renterId, renterUser.id))
    .orderBy(desc(bookings.createdAt))
    .limit(ACTIVITY_FEED_LIMIT);

  const [availableCountRow] = await db
    .select({ c: count() })
    .from(vehicles)
    .where(eq(vehicles.status, "available"));

  const availableVehicles = await db
    .select({
      id: vehicles.id,
      brand: vehicles.brand,
      model: vehicles.model,
      isVerified: vehicles.isVerified,
      ownerFirst: users.firstName,
      ownerLast: users.lastName,
      ownerEmail: users.email,
    })
    .from(vehicles)
    .innerJoin(users, eq(vehicles.ownerId, users.id))
    .where(eq(vehicles.status, "available"))
    .orderBy(desc(vehicles.createdAt))
    .limit(ACTIVITY_FEED_LIMIT);

  return {
    recentUsers: recentUsers.map((u) => ({
      id: u.id,
      name: displayNameParts(u.firstName, u.lastName, u.email),
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    })),
    recentVehicles: recentVehicles.map((v) => ({
      id: v.id,
      label: `${v.brand} ${v.model}`.trim(),
      vehicleBrand: v.brand,
      vehicleModel: v.model,
      status: v.status,
      isVerified: v.isVerified,
      ownerName: displayNameParts(v.ownerFirst, v.ownerLast, v.ownerEmail),
      createdAt: v.createdAt,
    })),
    recentBookings: recentBookings.map((b) => ({
      id: b.id,
      status: b.status,
      startDate: b.startDate,
      returnDate: b.returnDate,
      vehicleLabel: `${b.vehicleBrand} ${b.vehicleModel}`.trim(),
      renterName: displayNameParts(b.renterFirst, b.renterLast, b.renterEmail),
      createdAt: b.createdAt,
    })),
    availableVehicles: {
      total: Number(availableCountRow?.c ?? 0),
      items: availableVehicles.map((v) => ({
        id: v.id,
        label: `${v.brand} ${v.model}`.trim(),
        isVerified: v.isVerified,
        ownerName: displayNameParts(v.ownerFirst, v.ownerLast, v.ownerEmail),
      })),
    },
  };
};

export {
    addVehicleImages,
    createVehicle,
    deleteVehicle,
    getAdminActivityFeed,
    getAdminReportStats,
    getAdminStats,
    getAllVehicles,
    getPublicVehicleById,
    getPublicVehicles,
    getVehicleById,
    getVehiclesByOwnerId,
    updateVehicle,
    updateVehicleIsVerified,
    vehicleBelongsToOwner
};

