import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { bookings, payments, users, vehicles } from "../schema/index.js";
import { createCheckoutSession, retrieveSession } from "../services/stripeService.js";

const NPR_TO_USD_RATE = 1 / 133.5;

/**
 * POST /payments/stripe/initiate
 * Create a Stripe Checkout Session for a booking with pending payment.
 * Body: { bookingId, successUrl, cancelUrl }
 */
export const initiateStripeController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { bookingId, successUrl, cancelUrl } = req.body;

    if (!bookingId || !successUrl || !cancelUrl) {
      return res.status(400).json({
        success: false,
        message: "bookingId, successUrl, and cancelUrl are required",
      });
    }

    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.renterId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the renter can pay for this booking",
      });
    }

    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.bookingId, bookingId))
      .limit(1);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (payment.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "This booking is already paid",
      });
    }

    const amountNPR = Number(payment.amount) || 0;
    const amountUSD = Math.round(amountNPR * NPR_TO_USD_RATE * 100) / 100;
    if (amountUSD < 0.5) {
      return res.status(400).json({
        success: false,
        message: `Amount too small for Stripe. Rs. ${amountNPR} converts to $${amountUSD.toFixed(2)} (min $0.50).`,
      });
    }

    console.log(`[Stripe] Converting NPR ${amountNPR} → USD ${amountUSD.toFixed(2)} (rate: ${NPR_TO_USD_RATE.toFixed(6)})`);

    const [vehicle] = await db
      .select({ brand: vehicles.brand, model: vehicles.model })
      .from(vehicles)
      .where(eq(vehicles.id, booking.vehicleId))
      .limit(1);

    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const vehicleName = vehicle
      ? `${vehicle.brand || ""} ${vehicle.model || ""}`.trim()
      : "Vehicle rental";

    const result = await createCheckoutSession({
      successUrl,
      cancelUrl,
      amount: amountUSD,
      currency: "usd",
      bookingId,
      productName: `AutoRent: ${vehicleName} (${booking.startDate} – ${booking.returnDate})`,
      customerEmail: user?.email || undefined,
    });

    res.status(200).json({
      success: true,
      data: {
        checkoutUrl: result.checkoutUrl,
        sessionId: result.sessionId,
        amountNPR,
        amountUSD,
      },
    });
  } catch (error) {
    if (error.code === "CONFIG_ERROR") {
      return res.status(503).json({ success: false, message: error.message });
    }
    if (error.code === "VALIDATION_ERROR") {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.code === "STRIPE_ERROR") {
      return res.status(502).json({
        success: false,
        message: error.message || "Stripe payment initiation failed",
      });
    }
    console.error("[Stripe] Initiate error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * POST /payments/stripe/verify
 * Verify Stripe payment after checkout redirect.
 * Body: { sessionId, purchaseOrderId }
 */
export const verifyStripeController = async (req, res) => {
  try {
    const { sessionId, purchaseOrderId } = req.body;

    if (!sessionId || !purchaseOrderId) {
      return res.status(400).json({
        success: false,
        message: "sessionId and purchaseOrderId are required",
      });
    }

    const session = await retrieveSession(sessionId);

    if (session.paymentStatus !== "paid") {
      return res.status(200).json({
        success: false,
        verified: true,
        status: session.paymentStatus,
        message:
          session.status === "expired"
            ? "Checkout session expired"
            : `Payment status: ${session.paymentStatus}`,
      });
    }

    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.bookingId, purchaseOrderId))
      .limit(1);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Booking not found for this payment.",
      });
    }

    if (payment.status === "paid") {
      return res.status(200).json({
        success: true,
        alreadyPaid: true,
        message: "Payment was already recorded",
        data: { bookingId: purchaseOrderId },
      });
    }

    await db
      .update(payments)
      .set({
        status: "paid",
        method: "stripe",
        externalId: session.paymentIntent || null,
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id));

    const paidUSD = (session.amountTotal || 0) / 100;

    res.status(200).json({
      success: true,
      verified: true,
      message: "Payment verified successfully",
      data: {
        bookingId: purchaseOrderId,
        transactionId: session.paymentIntent,
        amount: paidUSD,
        currency: "USD",
      },
    });
  } catch (error) {
    if (error.code === "CONFIG_ERROR") {
      return res.status(503).json({ success: false, message: error.message });
    }
    if (error.code === "STRIPE_ERROR") {
      return res.status(502).json({
        success: false,
        message: error.message || "Stripe verification failed",
      });
    }
    console.error("[Stripe] Verify error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
