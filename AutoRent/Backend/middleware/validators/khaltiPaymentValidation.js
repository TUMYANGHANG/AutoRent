import { isHttpUrl } from "../validationUtils.js";

/**
 * POST /payments/khalti/initiate
 */
export const validateKhaltiInitiate = (req, res, next) => {
  const errors = [];
  const b = req.body ?? {};

  if (!b.bookingId || typeof b.bookingId !== "string" || !b.bookingId.trim()) {
    errors.push("bookingId is required");
  }

  if (!b.returnUrl) {
    errors.push("returnUrl is required");
  } else if (typeof b.returnUrl !== "string" || !isHttpUrl(b.returnUrl)) {
    errors.push("returnUrl must be a valid http(s) URL");
  }

  if (!b.websiteUrl) {
    errors.push("websiteUrl is required");
  } else if (typeof b.websiteUrl !== "string" || !isHttpUrl(b.websiteUrl)) {
    errors.push("websiteUrl must be a valid http(s) URL");
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
 * POST /payments/khalti/verify
 */
export const validateKhaltiVerify = (req, res, next) => {
  const errors = [];
  const b = req.body ?? {};

  if (!b.pidx || typeof b.pidx !== "string" || !String(b.pidx).trim()) {
    errors.push("pidx is required");
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
