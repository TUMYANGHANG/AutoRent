import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { bookings, payments, users, vehicles } from "../schema/index.js";
import { initiatePayment, lookupPayment } from "../services/khaltiService.js";

/**
 * POST /payments/khalti/initiate
 * Initiate Khalti payment for a booking with pending payment.
 * Body: { bookingId, returnUrl, websiteUrl }
 */
export const initiateKhaltiController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { bookingId, returnUrl, websiteUrl } = req.body;

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

    const amount = Number(payment.amount) || 0;
    if (amount < 10) {
      return res.status(400).json({
        success: false,
        message: "Amount must be at least Rs 10",
      });
    }

    const [vehicle] = await db
      .select({ brand: vehicles.brand, model: vehicles.model })
      .from(vehicles)
      .where(eq(vehicles.id, booking.vehicleId))
      .limit(1);

    const [user] = await db
      .select({ firstName: users.firstName, lastName: users.lastName, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const customerInfo = user
      ? {
          name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
          email: user.email || "",
          phone: "",
        }
      : undefined;

    const vehicleName = vehicle
      ? `${vehicle.brand || ""} ${vehicle.model || ""}`.trim()
      : "Vehicle rental";

    const result = await initiatePayment({
      returnUrl,
      websiteUrl,
      amount,
      purchaseOrderId: bookingId,
      purchaseOrderName: `AutoRent: ${vehicleName} (${booking.startDate} - ${booking.returnDate})`,
      customerInfo,
    });

    res.status(200).json({
      success: true,
      data: {
        paymentUrl: result.payment_url,
        pidx: result.pidx,
        expiresAt: result.expires_at,
        expiresIn: result.expires_in,
      },
    });
  } catch (error) {
    if (error.code === "CONFIG_ERROR") {
      return res.status(503).json({ success: false, message: error.message });
    }
    if (error.code === "VALIDATION_ERROR") {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.code === "KHALTI_ERROR") {
      return res.status(502).json({
        success: false,
        message: error.message || "Khalti payment initiation failed",
      });
    }
    console.error("Khalti initiate error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * POST /payments/khalti/verify
 * Verify payment after Khalti redirect.
 * Body: { pidx, purchaseOrderId } - purchaseOrderId comes from callback URL params.
 */
export const verifyKhaltiController = async (req, res) => {
  try {
    const { pidx, purchaseOrderId } = req.body;

    const result = await lookupPayment(pidx);

    if (result.status !== "Completed") {
      return res.status(200).json({
        success: false,
        verified: true,
        status: result.status,
        message:
          result.status === "User canceled"
            ? "Payment was cancelled"
            : result.status === "Expired"
              ? "Payment link expired"
              : `Payment status: ${result.status}`,
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
        message: "Booking not found for this payment. purchaseOrderId may be incorrect.",
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
        method: "khalti",
        externalId: result.transaction_id || null,
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id));

    res.status(200).json({
      success: true,
      verified: true,
      message: "Payment verified successfully",
      data: {
        bookingId: purchaseOrderId,
        transactionId: result.transaction_id,
        amount: result.total_amount / 100,
      },
    });
  } catch (error) {
    if (error.code === "CONFIG_ERROR") {
      return res.status(503).json({ success: false, message: error.message });
    }
    if (error.code === "KHALTI_ERROR") {
      return res.status(502).json({
        success: false,
        message: error.message || "Khalti verification failed",
      });
    }
    console.error("Khalti verify error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
