import { and, desc, eq, gte, inArray, lte, or } from "drizzle-orm";
import { db } from "../db/index.js";
import { bookingRequests, bookings, payments, users, vehicles } from "../schema/index.js";

/**
 * Check overlapping: confirmed/in_progress bookings for same dates.
 */
const hasOverlap = async (vehicleId, startDate, returnDate) => {
  const [overlapBooking] = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        eq(bookings.vehicleId, vehicleId),
        or(
          eq(bookings.status, "confirmed"),
          eq(bookings.status, "in_progress")
        ),
        lte(bookings.startDate, returnDate),
        gte(bookings.returnDate, startDate)
      )
    )
    .limit(1);
  return !!overlapBooking;
};

/**
 * Create a booking request (renter only). No payment created until owner approves.
 */
const createRequest = async (renterId, data) => {
  const { vehicleId, startDate, returnDate, pickupPlace, dropoffPlace, notes } = data;

  if (!vehicleId || !startDate || !returnDate || !pickupPlace) {
    const err = new Error("vehicleId, startDate, returnDate, and pickupPlace are required");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  const start = new Date(startDate);
  const end = new Date(returnDate);
  if (start > end) {
    const err = new Error("Return date must be on or after start date");
    err.code = "VALIDATION_ERROR";
    throw err;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (start < today) {
    const err = new Error("Start date cannot be in the past");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  const [vehicle] = await db
    .select()
    .from(vehicles)
    .where(
      and(
        eq(vehicles.id, vehicleId),
        eq(vehicles.isVerified, true),
        eq(vehicles.status, "available")
      )
    )
    .limit(1);

  if (!vehicle) {
    const err = new Error("Vehicle not found or not available for rent");
    err.code = "NOT_FOUND";
    throw err;
  }

  const overlapping = await hasOverlap(vehicleId, startDate, returnDate);
  if (overlapping) {
    const err = new Error("Vehicle is already booked for the selected dates");
    err.code = "CONFLICT";
    throw err;
  }

  const [request] = await db
    .insert(bookingRequests)
    .values({
      vehicleId,
      renterId,
      ownerId: vehicle.ownerId,
      startDate,
      returnDate,
      pickupPlace,
      dropoffPlace: dropoffPlace || null,
      notes: notes || null,
      status: "pending",
      updatedAt: new Date(),
    })
    .returning();

  return { request, vehicle };
};

/**
 * Approve a request (owner only). Creates booking + payment, updates vehicle.
 */
const approveRequest = async (requestId, userId, userRole) => {
  const [row] = await db
    .select()
    .from(bookingRequests)
    .where(eq(bookingRequests.id, requestId))
    .limit(1);

  if (!row) return null;
  if (row.status !== "pending") {
    const err = new Error("Request is no longer pending");
    err.code = "INVALID_STATE";
    throw err;
  }

  const isOwner = row.ownerId === userId;
  const isAdmin = userRole === "admin";
  if (!isOwner && !isAdmin) return null;

  // Re-check overlap (another booking might have been created)
  const overlapping = await hasOverlap(row.vehicleId, row.startDate, row.returnDate);
  if (overlapping) {
    const err = new Error("Vehicle is already booked for these dates");
    err.code = "CONFLICT";
    throw err;
  }

  const [vehicle] = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.id, row.vehicleId))
    .limit(1);
  if (!vehicle || vehicle.status !== "available") {
    const err = new Error("Vehicle is no longer available");
    err.code = "CONFLICT";
    throw err;
  }

  const pricePerDay = Number(vehicle.pricePerDay) || 0;
  const securityDeposit = Number(vehicle.securityDeposit) || 0;
  const end = new Date(row.returnDate);
  const start = new Date(row.startDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
  const rentalAmount = pricePerDay * days;

  const [booking] = await db
    .insert(bookings)
    .values({
      bookingRequestId: row.id,
      vehicleId: row.vehicleId,
      renterId: row.renterId,
      ownerId: row.ownerId,
      startDate: row.startDate,
      returnDate: row.returnDate,
      pickupPlace: row.pickupPlace,
      dropoffPlace: row.dropoffPlace,
      notes: row.notes,
      status: "confirmed",
      updatedAt: new Date(),
    })
    .returning();

  await db
    .insert(payments)
    .values({
      bookingId: booking.id,
      amount: String(rentalAmount),
      securityDeposit: securityDeposit > 0 ? String(securityDeposit) : null,
      currency: "NPR",
      method: "pay_on_pickup",
      status: "pending",
      externalId: null,
      paidAt: null,
      updatedAt: new Date(),
    });

  await db
    .update(vehicles)
    .set({ status: "rented", updatedAt: new Date() })
    .where(eq(vehicles.id, row.vehicleId));

  const now = new Date();
  await db
    .update(bookingRequests)
    .set({
      status: "accepted",
      respondedAt: now,
      updatedAt: now,
    })
    .where(eq(bookingRequests.id, requestId));

  return { booking, request: { ...row, status: "accepted" }, vehicle };
};

/**
 * Reject a request (owner only).
 */
const rejectRequest = async (requestId, userId, userRole, rejectionReason = null) => {
  const [row] = await db
    .select()
    .from(bookingRequests)
    .where(eq(bookingRequests.id, requestId))
    .limit(1);

  if (!row) return null;
  if (row.status !== "pending") {
    const err = new Error("Request is no longer pending");
    err.code = "INVALID_STATE";
    throw err;
  }

  const isOwner = row.ownerId === userId;
  const isAdmin = userRole === "admin";
  if (!isOwner && !isAdmin) return null;

  const now = new Date();
  const [updated] = await db
    .update(bookingRequests)
    .set({
      status: "rejected",
      rejectionReason: rejectionReason || null,
      respondedAt: now,
      updatedAt: now,
    })
    .where(eq(bookingRequests.id, requestId))
    .returning();

  return updated;
};

/**
 * Cancel a pending request (renter only).
 */
const cancelRequest = async (requestId, userId, userRole) => {
  const [row] = await db
    .select()
    .from(bookingRequests)
    .where(eq(bookingRequests.id, requestId))
    .limit(1);

  if (!row) return null;
  if (row.status !== "pending") {
    const err = new Error("Request is no longer pending");
    err.code = "INVALID_STATE";
    throw err;
  }

  const isRenter = row.renterId === userId;
  const isAdmin = userRole === "admin";
  if (!isRenter && !isAdmin) return null;

  const now = new Date();
  const [updated] = await db
    .update(bookingRequests)
    .set({
      status: "rejected", // treat as withdrawn
      respondedAt: now,
      updatedAt: now,
    })
    .where(eq(bookingRequests.id, requestId))
    .returning();

  return updated;
};

/**
 * Get requests for renter (my requests).
 */
const getMyRequests = async (renterId) => {
  const list = await db
    .select()
    .from(bookingRequests)
    .where(eq(bookingRequests.renterId, renterId))
    .orderBy(desc(bookingRequests.createdAt));

  if (list.length === 0) return [];
  const vehicleIds = [...new Set(list.map((r) => r.vehicleId))];
  const vehicleList = await db
    .select({
      id: vehicles.id,
      brand: vehicles.brand,
      model: vehicles.model,
      pricePerDay: vehicles.pricePerDay,
    })
    .from(vehicles)
    .where(inArray(vehicles.id, vehicleIds));
  const vehiclesById = Object.fromEntries(vehicleList.map((v) => [v.id, v]));

  return list.map((r) => ({
    ...r,
    vehicle: vehiclesById[r.vehicleId] || null,
  }));
};

/**
 * Get pending requests for owner (requests for their vehicles).
 */
const getRequestsForOwner = async (ownerId) => {
  const list = await db
    .select()
    .from(bookingRequests)
    .where(
      and(
        eq(bookingRequests.ownerId, ownerId),
        eq(bookingRequests.status, "pending")
      )
    )
    .orderBy(desc(bookingRequests.createdAt));

  if (list.length === 0) return [];
  const vehicleIds = [...new Set(list.map((r) => r.vehicleId))];
  const renterIds = [...new Set(list.map((r) => r.renterId))];

  const [vehicleList, renterList] = await Promise.all([
    db
      .select({
        id: vehicles.id,
        brand: vehicles.brand,
        model: vehicles.model,
        pricePerDay: vehicles.pricePerDay,
      })
      .from(vehicles)
      .where(inArray(vehicles.id, vehicleIds)),
    db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(users)
      .where(inArray(users.id, renterIds)),
  ]);

  const vehiclesById = Object.fromEntries(vehicleList.map((v) => [v.id, v]));
  const rentersById = Object.fromEntries(renterList.map((u) => [u.id, u]));

  return list.map((r) => ({
    ...r,
    vehicle: vehiclesById[r.vehicleId] || null,
    renter: rentersById[r.renterId] || null,
  }));
};

/**
 * Get request by ID (renter or owner).
 */
const getRequestById = async (requestId, userId, userRole) => {
  const [row] = await db
    .select()
    .from(bookingRequests)
    .where(eq(bookingRequests.id, requestId))
    .limit(1);

  if (!row) return null;
  const isRenter = row.renterId === userId;
  const isOwner = row.ownerId === userId;
  const isAdmin = userRole === "admin";
  if (!isRenter && !isOwner && !isAdmin) return null;

  const [vehicle] = await db
    .select({
      id: vehicles.id,
      brand: vehicles.brand,
      model: vehicles.model,
      pricePerDay: vehicles.pricePerDay,
      securityDeposit: vehicles.securityDeposit,
    })
    .from(vehicles)
    .where(eq(vehicles.id, row.vehicleId))
    .limit(1);

  return { ...row, vehicle: vehicle || null };
};

export {
  approveRequest,
  cancelRequest,
  createRequest,
  getMyRequests,
  getRequestById,
  getRequestsForOwner,
  rejectRequest,
};
