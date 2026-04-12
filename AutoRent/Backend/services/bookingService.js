import { and, count, desc, eq, gte, inArray, lte, ne, or, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { bookings, payments, users, vehicles } from "../schema/index.js";
import {
  createNotification,
  NOTIFICATION_TYPES,
} from "./notificationService.js";

/**
 * Check if vehicle has overlapping bookings in date range (pending or confirmed).
 */
const hasOverlappingBooking = async (vehicleId, startDate, returnDate, excludeBookingId = null) => {
  const conditions = [
    eq(bookings.vehicleId, vehicleId),
    or(
      eq(bookings.status, "pending"),
      eq(bookings.status, "confirmed"),
      eq(bookings.status, "in_progress")
    ),
    lte(bookings.startDate, returnDate),
    gte(bookings.returnDate, startDate),
  ];
  if (excludeBookingId) {
    conditions.push(ne(bookings.id, excludeBookingId));
  }
  const [row] = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(and(...conditions))
    .limit(1);
  return !!row;
};

/**
 * Create a booking with payment. For pay_on_pickup: creates booking + payment (status pending).
 * @param {string} renterId - Renter user ID
 * @param {Object} data - { vehicleId, startDate, returnDate, pickupPlace, dropoffPlace?, notes? }
 * @param {string} paymentMethod - 'pay_on_pickup' | 'stripe' | 'khalti'
 * @returns {Promise<{ booking, payment }|null>}
 */
const createBookingWithPayment = async (renterId, data, paymentMethod = "pay_on_pickup") => {
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

  // Get vehicle and owner
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

  const ownerId = vehicle.ownerId;

  // Check overlapping bookings
  const overlapping = await hasOverlappingBooking(vehicleId, startDate, returnDate);
  if (overlapping) {
    const err = new Error("Vehicle is already booked for the selected dates");
    err.code = "CONFLICT";
    throw err;
  }

  // Compute amounts: rental = what renter pays; security deposit = collateral (held, returned on vehicle return)
  const pricePerDay = Number(vehicle.pricePerDay) || 0;
  const securityDeposit = Number(vehicle.securityDeposit) || 0;
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
  const rentalAmount = pricePerDay * days;

  // Create booking
  const [booking] = await db
    .insert(bookings)
    .values({
      vehicleId,
      renterId,
      ownerId,
      startDate,
      returnDate,
      pickupPlace,
      dropoffPlace: dropoffPlace || null,
      notes: notes || null,
      status: "confirmed", // For pay_on_pickup we confirm immediately
      updatedAt: new Date(),
    })
    .returning();

  if (!booking) return null;

  // Update vehicle status to rented
  await db
    .update(vehicles)
    .set({ status: "rented", updatedAt: new Date() })
    .where(eq(vehicles.id, vehicleId));

  // Create payment: amount = rental (what renter pays); securityDeposit = collateral (returned on vehicle return)
  const paymentStatus = paymentMethod === "pay_on_pickup" ? "pending" : "pending";
  const [payment] = await db
    .insert(payments)
    .values({
      bookingId: booking.id,
      amount: String(rentalAmount),
      securityDeposit: securityDeposit > 0 ? String(securityDeposit) : null,
      currency: "NPR",
      method: paymentMethod,
      status: paymentStatus,
      externalId: null,
      paidAt: null,
      updatedAt: new Date(),
    })
    .returning();

  return { booking, payment, vehicle };
};

/**
 * Get booking by ID with vehicle and payment info. User must be renter or owner.
 */
const getBookingById = async (bookingId, userId, userRole) => {
  const [row] = await db
    .select({
      id: bookings.id,
      vehicleId: bookings.vehicleId,
      renterId: bookings.renterId,
      ownerId: bookings.ownerId,
      startDate: bookings.startDate,
      returnDate: bookings.returnDate,
      pickupPlace: bookings.pickupPlace,
      dropoffPlace: bookings.dropoffPlace,
      notes: bookings.notes,
      status: bookings.status,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!row) return null;

  const isRenter = row.renterId === userId;
  const isOwner = row.ownerId === userId;
  const isAdmin = userRole === "admin";
  if (!isRenter && !isOwner && !isAdmin) return null;

  // Get vehicle
  const [vehicle] = await db
    .select({
      id: vehicles.id,
      brand: vehicles.brand,
      model: vehicles.model,
      pricePerDay: vehicles.pricePerDay,
      securityDeposit: vehicles.securityDeposit,
      lateFeePerHour: vehicles.lateFeePerHour,
    })
    .from(vehicles)
    .where(eq(vehicles.id, row.vehicleId))
    .limit(1);

  // Get payment
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.bookingId, bookingId))
    .limit(1);

  return { ...row, vehicle: vehicle || null, payment: payment || null };
};

/**
 * Get bookings for current user (as renter or owner).
 */
const getBookingsForUser = async (userId, role) => {
  const col = role === "owner" ? bookings.ownerId : bookings.renterId;
  const rows = await db
    .select({
      id: bookings.id,
      vehicleId: bookings.vehicleId,
      renterId: bookings.renterId,
      ownerId: bookings.ownerId,
      startDate: bookings.startDate,
      returnDate: bookings.returnDate,
      pickupPlace: bookings.pickupPlace,
      status: bookings.status,
      createdAt: bookings.createdAt,
      paymentId: payments.id,
      paymentStatus: payments.status,
    })
    .from(bookings)
    .leftJoin(payments, eq(payments.bookingId, bookings.id))
    .where(eq(col, userId))
    .orderBy(desc(bookings.createdAt));

  if (rows.length === 0) return [];

  const vehicleIds = [...new Set(rows.map((b) => b.vehicleId))];
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

  return rows.map((b) => {
    const { paymentId, paymentStatus, ...rest } = b;
    return {
      ...rest,
      vehicle: vehiclesById[b.vehicleId] || null,
      payment:
        paymentId != null
          ? { id: paymentId, status: paymentStatus }
          : null,
    };
  });
};

/**
 * Cancel a booking (only if status is pending or confirmed).
 */
const cancelBooking = async (bookingId, userId, userRole) => {
  const [row] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!row) return null;

  const isRenter = row.renterId === userId;
  const isOwner = row.ownerId === userId;
  const isAdmin = userRole === "admin";
  if (!isRenter && !isOwner && !isAdmin) return null;

  if (row.status !== "pending" && row.status !== "confirmed") {
    const err = new Error("Booking cannot be cancelled in its current state");
    err.code = "INVALID_STATE";
    throw err;
  }

  const [payRow] = await db
    .select({ status: payments.status })
    .from(payments)
    .where(eq(payments.bookingId, bookingId))
    .limit(1);

  if (payRow?.status === "paid") {
    const err = new Error(
      "This booking cannot be cancelled because payment has already been completed."
    );
    err.code = "PAYMENT_PAID";
    throw err;
  }

  const [updated] = await db
    .update(bookings)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(bookings.id, bookingId))
    .returning();

  // If no other active bookings for this vehicle, set status back to available
  const [otherBooking] = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        eq(bookings.vehicleId, row.vehicleId),
        ne(bookings.id, bookingId),
        or(
          eq(bookings.status, "pending"),
          eq(bookings.status, "confirmed"),
          eq(bookings.status, "in_progress")
        )
      )
    )
    .limit(1);
  if (!otherBooking) {
    await db
      .update(vehicles)
      .set({ status: "available", updatedAt: new Date() })
      .where(eq(vehicles.id, row.vehicleId));
  }

  if (isRenter && updated) {
    try {
      const [renter] = await db
        .select({
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      const renterName = renter
        ? [renter.firstName, renter.lastName].filter(Boolean).join(" ").trim() ||
          renter.email ||
          "A renter"
        : "A renter";
      await createNotification({
        recipientUserId: row.ownerId,
        type: NOTIFICATION_TYPES.BOOKING_CANCELLED_BY_RENTER,
        title: "Booking cancelled by renter",
        message: `${renterName} cancelled their booking for your vehicle.`,
        vehicleId: row.vehicleId,
        actorUserId: userId,
      });
    } catch (err) {
      console.error("Failed to notify owner of booking cancellation:", err?.message ?? err);
    }
  }

  return updated;
};

/**
 * Get owner dashboard stats: active rentals count and total earnings from paid payments.
 */
const getOwnerStats = async (ownerId) => {
  const [activeRow] = await db
    .select({ count: count() })
    .from(bookings)
    .where(
      and(
        eq(bookings.ownerId, ownerId),
        inArray(bookings.status, ["confirmed", "in_progress"])
      )
    );

  const [earningsRow] = await db
    .select({
      total: sql`coalesce(sum(${payments.amount})::numeric, 0)`,
    })
    .from(payments)
    .innerJoin(bookings, eq(payments.bookingId, bookings.id))
    .where(
      and(eq(bookings.ownerId, ownerId), eq(payments.status, "paid"))
    );

  return {
    activeRentals: Number(activeRow?.count ?? 0),
    totalEarnings: Number(earningsRow?.total ?? 0),
  };
};

/**
 * Paid revenue timestamp: when payment was marked paid.
 */
const paidTimestamp = sql`coalesce(${payments.paidAt}, ${payments.updatedAt})`;

/**
 * Owner earnings dashboard: monthly comparison, top vehicles, pending total.
 */
const getOwnerEarningsReport = async (ownerId) => {
  const [totalRow] = await db
    .select({
      total: sql`coalesce(sum(${payments.amount})::numeric, 0)`,
    })
    .from(payments)
    .innerJoin(bookings, eq(payments.bookingId, bookings.id))
    .where(and(eq(bookings.ownerId, ownerId), eq(payments.status, "paid")));

  const [thisMonthRow] = await db
    .select({
      total: sql`coalesce(sum(${payments.amount})::numeric, 0)`,
    })
    .from(payments)
    .innerJoin(bookings, eq(payments.bookingId, bookings.id))
    .where(
      and(
        eq(bookings.ownerId, ownerId),
        eq(payments.status, "paid"),
        sql`date_trunc('month', ${paidTimestamp}) = date_trunc('month', now())`
      )
    );

  const [lastMonthRow] = await db
    .select({
      total: sql`coalesce(sum(${payments.amount})::numeric, 0)`,
    })
    .from(payments)
    .innerJoin(bookings, eq(payments.bookingId, bookings.id))
    .where(
      and(
        eq(bookings.ownerId, ownerId),
        eq(payments.status, "paid"),
        sql`date_trunc('month', ${paidTimestamp}) = date_trunc('month', now() - interval '1 month')`
      )
    );

  const [pendingRow] = await db
    .select({
      total: sql`coalesce(sum(${payments.amount})::numeric, 0)`,
    })
    .from(payments)
    .innerJoin(bookings, eq(payments.bookingId, bookings.id))
    .where(and(eq(bookings.ownerId, ownerId), eq(payments.status, "pending")));

  const totalEarnings = Number(totalRow?.total ?? 0);
  const thisMonthEarnings = Number(thisMonthRow?.total ?? 0);
  const lastMonthEarnings = Number(lastMonthRow?.total ?? 0);
  const pendingPaymentsTotal = Number(pendingRow?.total ?? 0);

  let monthOverMonthChangePct = 0;
  if (lastMonthEarnings > 0) {
    monthOverMonthChangePct =
      ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100;
  } else if (thisMonthEarnings > 0) {
    monthOverMonthChangePct = 100;
  }

  const WEEKS = 4;
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startOfCurrentWeek = new Date(now);
  startOfCurrentWeek.setDate(now.getDate() - diffToMonday);
  startOfCurrentWeek.setHours(0, 0, 0, 0);

  const firstWeekStart = new Date(startOfCurrentWeek);
  firstWeekStart.setDate(firstWeekStart.getDate() - (WEEKS - 1) * 7);
  // postgres.js cannot bind JS Date as a param; use ISO strings for comparisons.
  const firstWeekStartIso = firstWeekStart.toISOString();

  const weeklyRows = await db
    .select({
      weekStart: sql`date_trunc('week', ${paidTimestamp})::date`.as("week_start"),
      total: sql`coalesce(sum(${payments.amount})::numeric, 0)`,
    })
    .from(payments)
    .innerJoin(bookings, eq(payments.bookingId, bookings.id))
    .where(
      and(
        eq(bookings.ownerId, ownerId),
        eq(payments.status, "paid"),
        gte(paidTimestamp, firstWeekStartIso)
      )
    )
    .groupBy(sql`date_trunc('week', ${paidTimestamp})::date`)
    .orderBy(sql`date_trunc('week', ${paidTimestamp})::date`);

  const weeklyMap = new Map();
  for (const r of weeklyRows) {
    const key =
      r.weekStart instanceof Date
        ? r.weekStart.toISOString().slice(0, 10)
        : String(r.weekStart).slice(0, 10);
    weeklyMap.set(key, Number(r.total));
  }

  const weeklyEarnings = [];
  for (let i = 0; i < WEEKS; i++) {
    const ws = new Date(firstWeekStart);
    ws.setDate(ws.getDate() + i * 7);
    const key = ws.toISOString().slice(0, 10);
    const label = ws.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
    weeklyEarnings.push({
      weekStart: key,
      label,
      amount: weeklyMap.get(key) ?? 0,
    });
  }

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const startLast7 = new Date(todayEnd);
  startLast7.setDate(startLast7.getDate() - 6);
  startLast7.setHours(0, 0, 0, 0);
  const startPrev7 = new Date(startLast7);
  startPrev7.setDate(startPrev7.getDate() - 7);
  const rangeStart = new Date(startPrev7);
  const rangeStartIso = rangeStart.toISOString();
  const todayEndIso = todayEnd.toISOString();

  const dailyRows = await db
    .select({
      d: sql`date_trunc('day', ${paidTimestamp})::date`.as("d"),
      total: sql`coalesce(sum(${payments.amount})::numeric, 0)`,
    })
    .from(payments)
    .innerJoin(bookings, eq(payments.bookingId, bookings.id))
    .where(
      and(
        eq(bookings.ownerId, ownerId),
        eq(payments.status, "paid"),
        gte(paidTimestamp, rangeStartIso),
        lte(paidTimestamp, todayEndIso)
      )
    )
    .groupBy(sql`date_trunc('day', ${paidTimestamp})::date`)
    .orderBy(sql`date_trunc('day', ${paidTimestamp})::date`);

  const dailyMap = new Map();
  for (const r of dailyRows) {
    const key =
      r.d instanceof Date ? r.d.toISOString().slice(0, 10) : String(r.d).slice(0, 10);
    dailyMap.set(key, Number(r.total));
  }

  const fmtKey = (d) => d.toISOString().slice(0, 10);
  const dailyPrev7 = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startPrev7);
    d.setDate(d.getDate() + i);
    dailyPrev7.push({
      dayLabel: d.toLocaleDateString("en-US", { weekday: "short" }),
      amount: dailyMap.get(fmtKey(d)) ?? 0,
    });
  }
  const dailyLast7 = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startLast7);
    d.setDate(d.getDate() + i);
    dailyLast7.push({
      dayLabel: d.toLocaleDateString("en-US", { weekday: "short" }),
      amount: dailyMap.get(fmtKey(d)) ?? 0,
    });
  }

  const topRows = await db
    .select({
      vehicleId: vehicles.id,
      brand: vehicles.brand,
      model: vehicles.model,
      total: sql`coalesce(sum(${payments.amount})::numeric, 0)`,
    })
    .from(payments)
    .innerJoin(bookings, eq(payments.bookingId, bookings.id))
    .innerJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
    .where(and(eq(bookings.ownerId, ownerId), eq(payments.status, "paid")))
    .groupBy(vehicles.id, vehicles.brand, vehicles.model)
    .orderBy(desc(sql`sum(${payments.amount})::numeric`))
    .limit(4);

  const topVehicles = topRows.map((r) => ({
    vehicleId: r.vehicleId,
    brand: r.brand,
    model: r.model,
    label: `${r.brand} ${r.model}`,
    amount: Number(r.total ?? 0),
  }));

  const maxTop = topVehicles.reduce((m, v) => Math.max(m, v.amount), 0) || 1;

  return {
    currency: "NPR",
    totalEarnings,
    thisMonthEarnings,
    lastMonthEarnings,
    monthOverMonthChangePct,
    pendingPaymentsTotal,
    topVehicles,
    topVehiclesMaxAmount: maxTop,
  };
};

/**
 * All bookings for admin (renter + vehicle + payment summary).
 */
const getAllBookingsForAdmin = async () => {
  const rows = await db
    .select({
      id: bookings.id,
      vehicleId: bookings.vehicleId,
      renterId: bookings.renterId,
      ownerId: bookings.ownerId,
      startDate: bookings.startDate,
      returnDate: bookings.returnDate,
      pickupPlace: bookings.pickupPlace,
      status: bookings.status,
      createdAt: bookings.createdAt,
      vehicleBrand: vehicles.brand,
      vehicleModel: vehicles.model,
      renterFirstName: users.firstName,
      renterLastName: users.lastName,
      renterEmail: users.email,
      paymentAmount: payments.amount,
      paymentStatus: payments.status,
    })
    .from(bookings)
    .innerJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
    .innerJoin(users, eq(bookings.renterId, users.id))
    .leftJoin(payments, eq(payments.bookingId, bookings.id))
    .orderBy(desc(bookings.createdAt));

  return rows.map((r) => ({
    id: r.id,
    vehicleId: r.vehicleId,
    ownerId: r.ownerId,
    renterId: r.renterId,
    startDate: r.startDate,
    returnDate: r.returnDate,
    pickupPlace: r.pickupPlace,
    status: r.status,
    createdAt: r.createdAt,
    vehicle: {
      brand: r.vehicleBrand,
      model: r.vehicleModel,
      label: [r.vehicleBrand, r.vehicleModel].filter(Boolean).join(" ") || "—",
    },
    renter: {
      firstName: r.renterFirstName,
      lastName: r.renterLastName,
      email: r.renterEmail,
      name: [r.renterFirstName, r.renterLastName].filter(Boolean).join(" ") || r.renterEmail || "—",
    },
    payment: r.paymentAmount
      ? {
        amount: r.paymentAmount,
        status: r.paymentStatus,
      }
      : null,
  }));
};

export {
  cancelBooking,
  createBookingWithPayment,
  getAllBookingsForAdmin,
  getBookingById,
  getBookingsForUser,
  getOwnerEarningsReport,
  getOwnerStats,
  hasOverlappingBooking
};

