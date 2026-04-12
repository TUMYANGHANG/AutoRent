import { and, eq, or, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { bookings } from "../schema/booking.js";
import { vehicles } from "../schema/vehicle.js";

const RETRY_DELAY_MS = 2000;

/** Network / pool errors that often succeed on a fresh connection */
function isTransientDbError(err) {
  if (!err) return false;
  const codes = new Set();
  const visit = (e, depth) => {
    if (!e || depth > 8) return;
    if (e.code) codes.add(e.code);
    if (e.cause) visit(e.cause, depth + 1);
    if (Array.isArray(e.errors)) e.errors.forEach((x) => visit(x, depth + 1));
  };
  visit(err, 0);
  for (const c of [
    "ETIMEDOUT",
    "ECONNRESET",
    "ECONNREFUSED",
    "EPIPE",
    "ENOTFOUND",
  ]) {
    if (codes.has(c)) return true;
  }
  const msg = String(err.message || "").toLowerCase();
  return msg.includes("timeout") || msg.includes("connection terminated");
}

/**
 * Transition confirmed bookings to in_progress once startDate is reached.
 */
async function activateStartedBookings() {
  const rows = await db
    .update(bookings)
    .set({ status: "in_progress", updatedAt: new Date() })
    .where(
      and(
        eq(bookings.status, "confirmed"),
        // Use CURRENT_DATE so the comparison is valid SQL without bound params
        // (some Drizzle + postgres-js versions fail on CAST($n AS DATE) in updates).
        sql`${bookings.startDate} <= CURRENT_DATE`
      )
    )
    .returning({ id: bookings.id });

  return rows.length;
}

/**
 * Complete bookings whose returnDate has passed and free up vehicles.
 */
async function completeExpiredBookings() {
  const expired = await db
    .select({ id: bookings.id, vehicleId: bookings.vehicleId })
    .from(bookings)
    .where(
      and(
        or(
          eq(bookings.status, "confirmed"),
          eq(bookings.status, "in_progress")
        ),
        sql`${bookings.returnDate} <= CURRENT_DATE`
      )
    );

  if (expired.length === 0) return 0;

  const bookingIds = expired.map((b) => b.id);
  const vehicleIds = [...new Set(expired.map((b) => b.vehicleId))];

  for (const id of bookingIds) {
    await db
      .update(bookings)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(bookings.id, id));
  }

  for (const vehicleId of vehicleIds) {
    const [activeBooking] = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.vehicleId, vehicleId),
          or(
            eq(bookings.status, "pending"),
            eq(bookings.status, "confirmed"),
            eq(bookings.status, "in_progress")
          )
        )
      )
      .limit(1);

    if (!activeBooking) {
      await db
        .update(vehicles)
        .set({ status: "available", updatedAt: new Date() })
        .where(eq(vehicles.id, vehicleId));
    }
  }

  return expired.length;
}

/**
 * Run all scheduled booking transitions. Call this on a timer.
 */
async function runBookingScheduler() {
  const tick = async () => {
    const activated = await activateStartedBookings();
    const completed = await completeExpiredBookings();
    if (activated > 0 || completed > 0) {
      console.log(
        `[BookingScheduler] ${activated} booking(s) activated, ${completed} booking(s) completed`
      );
    }
  };

  try {
    await tick();
  } catch (err) {
    if (!isTransientDbError(err)) {
      console.error("[BookingScheduler] Error:", err?.message || err);
      return;
    }
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    try {
      await tick();
    } catch (err2) {
      console.warn(
        "[BookingScheduler] DB still unavailable after retry:",
        err2?.message || err2
      );
    }
  }
}

const INTERVAL_MS = 60 * 1000;
let timer = null;

function startBookingScheduler() {
  runBookingScheduler();
  timer = setInterval(runBookingScheduler, INTERVAL_MS);
  console.log("BookingScheduler: running (every 60s)");
}

function stopBookingScheduler() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

export { startBookingScheduler, stopBookingScheduler };
