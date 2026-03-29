import { and, eq, lte, or, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { bookings } from "../schema/booking.js";
import { vehicles } from "../schema/vehicle.js";

/**
 * Transition confirmed bookings to in_progress once startDate is reached.
 */
async function activateStartedBookings() {
  const today = new Date().toISOString().slice(0, 10);

  const rows = await db
    .update(bookings)
    .set({ status: "in_progress", updatedAt: sql`now()` })
    .where(
      and(
        eq(bookings.status, "confirmed"),
        lte(bookings.startDate, today)
      )
    )
    .returning({ id: bookings.id });

  return rows.length;
}

/**
 * Complete bookings whose returnDate has passed and free up vehicles.
 */
async function completeExpiredBookings() {
  const today = new Date().toISOString().slice(0, 10);

  const expired = await db
    .select({ id: bookings.id, vehicleId: bookings.vehicleId })
    .from(bookings)
    .where(
      and(
        or(
          eq(bookings.status, "confirmed"),
          eq(bookings.status, "in_progress")
        ),
        lte(bookings.returnDate, today)
      )
    );

  if (expired.length === 0) return 0;

  const bookingIds = expired.map((b) => b.id);
  const vehicleIds = [...new Set(expired.map((b) => b.vehicleId))];

  for (const id of bookingIds) {
    await db
      .update(bookings)
      .set({ status: "completed", updatedAt: sql`now()` })
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
        .set({ status: "available", updatedAt: sql`now()` })
        .where(eq(vehicles.id, vehicleId));
    }
  }

  return expired.length;
}

/**
 * Run all scheduled booking transitions. Call this on a timer.
 */
async function runBookingScheduler() {
  try {
    const activated = await activateStartedBookings();
    const completed = await completeExpiredBookings();
    if (activated > 0 || completed > 0) {
      console.log(
        `[BookingScheduler] ${activated} booking(s) activated, ${completed} booking(s) completed`
      );
    }
  } catch (err) {
    console.error("[BookingScheduler] Error:", err?.message || err);
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
