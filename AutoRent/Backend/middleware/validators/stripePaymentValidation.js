import { isHttpUrl } from "../validationUtils.js";

/**
 * POST /payments/stripe/initiate
 */
export const validateStripeInitiate = (req, res, next) => {
  const errors = [];
  const b = req.body ?? {};

  if (!b.bookingId || typeof b.bookingId !== "string" || !b.bookingId.trim()) {
    errors.push("bookingId is required");
  }

  if (!b.successUrl) {
    errors.push("successUrl is required");
  } else if (typeof b.successUrl !== "string" || !isHttpUrl(b.successUrl)) {
    errors.push("successUrl must be a valid http(s) URL");
  }

  if (!b.cancelUrl) {
    errors.push("cancelUrl is required");
  } else if (typeof b.cancelUrl !== "string" || !isHttpUrl(b.cancelUrl)) {
    errors.push("cancelUrl must be a valid http(s) URL");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }
  next();
};

/**
 * POST /payments/stripe/verify
 */
export const validateStripeVerify = (req, res, next) => {
  const errors = [];
  const b = req.body ?? {};

  if (!b.sessionId || typeof b.sessionId !== "string" || !b.sessionId.trim()) {
    errors.push("sessionId is required");
  }

  if (!b.purchaseOrderId || typeof b.purchaseOrderId !== "string" || !b.purchaseOrderId.trim()) {
    errors.push("purchaseOrderId is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }
  next();
};
