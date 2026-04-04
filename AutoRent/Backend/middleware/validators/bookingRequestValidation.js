import { isIsoDateOnlyString } from "../validationUtils.js";

const MAX_PLACE = 500;
const MAX_NOTES = 10000;

/**
 * POST /booking-requests — each field checked separately (no shared collector).
 */
export const validateBookingRequestCreate = (req, res, next) => {
  const errors = [];
  const b = req.body;

  if (b == null || typeof b !== "object" || Array.isArray(b)) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: ["Request body must be a JSON object"],
    });
  }

  if (!b.vehicleId || typeof b.vehicleId !== "string" || !b.vehicleId.trim()) {
    errors.push("vehicleId is required and must be a non-empty string");
  }

  if (!b.startDate) {
    errors.push("startDate is required");
  } else if (typeof b.startDate !== "string" || !isIsoDateOnlyString(b.startDate)) {
    errors.push("startDate must be YYYY-MM-DD");
  }

  if (!b.returnDate) {
    errors.push("returnDate is required");
  } else if (typeof b.returnDate !== "string" || !isIsoDateOnlyString(b.returnDate)) {
    errors.push("returnDate must be YYYY-MM-DD");
  }

  if (
    isIsoDateOnlyString(String(b.startDate ?? "")) &&
    isIsoDateOnlyString(String(b.returnDate ?? ""))
  ) {
    const start = new Date(`${String(b.startDate).trim()}T00:00:00Z`);
    const end = new Date(`${String(b.returnDate).trim()}T00:00:00Z`);
    if (start > end) {
      errors.push("returnDate must be on or after startDate");
    }
  }

  if (!b.pickupPlace || typeof b.pickupPlace !== "string" || !b.pickupPlace.trim()) {
    errors.push("pickupPlace is required and must be a non-empty string");
  } else if (b.pickupPlace.length > MAX_PLACE) {
    errors.push(`pickupPlace must be at most ${MAX_PLACE} characters`);
  }

  if (b.dropoffPlace !== undefined && b.dropoffPlace !== null) {
    if (typeof b.dropoffPlace !== "string") {
      errors.push("dropoffPlace must be a string when provided");
    } else if (b.dropoffPlace.length > MAX_PLACE) {
      errors.push(`dropoffPlace must be at most ${MAX_PLACE} characters`);
    }
  }

  if (b.notes !== undefined && b.notes !== null) {
    if (typeof b.notes !== "string") {
      errors.push("notes must be a string when provided");
    } else if (b.notes.length > MAX_NOTES) {
      errors.push(`notes must be at most ${MAX_NOTES} characters`);
    }
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
