import { isValidEmail } from "../validationUtils.js";

/**
 * GET /garages/map?bbox=
 */
export const validateGarageMapQuery = (req, res, next) => {
  const errors = [];
  const bbox = req.query?.bbox;

  if (bbox === undefined || bbox === null || bbox === "") {
    errors.push("bbox query parameter is required (west,south,east,north)");
  } else if (typeof bbox !== "string") {
    errors.push("bbox must be a string");
  } else {
    const parts = bbox.split(",").map((p) => p.trim());
    if (parts.length !== 4) {
      errors.push("bbox must have 4 comma-separated numbers: west,south,east,north");
    } else {
      for (let i = 0; i < 4; i += 1) {
        if (Number.isNaN(Number(parts[i]))) {
          errors.push("bbox values must be valid numbers");
          break;
        }
      }
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

/**
 * POST /garages — crowd-sourced garage (renter); role still enforced in controller.
 */
export const validateGarageCreate = (req, res, next) => {
  const errors = [];
  const b = req.body ?? {};

  if (!b.name || typeof b.name !== "string" || !b.name.trim()) {
    errors.push("name is required");
  } else if (b.name.length > 255) {
    errors.push("name must be at most 255 characters");
  }

  if (b.latitude === undefined || b.latitude === null) {
    errors.push("latitude is required");
  }
  if (b.longitude === undefined || b.longitude === null) {
    errors.push("longitude is required");
  }

  if (b.latitude !== undefined && b.latitude !== null && b.longitude !== undefined && b.longitude !== null) {
    const latNum = Number(b.latitude);
    const lngNum = Number(b.longitude);
    if (Number.isNaN(latNum)) {
      errors.push("latitude must be a valid number");
    } else if (latNum < -90 || latNum > 90) {
      errors.push("latitude must be between -90 and 90");
    }
    if (Number.isNaN(lngNum)) {
      errors.push("longitude must be a valid number");
    } else if (lngNum < -180 || lngNum > 180) {
      errors.push("longitude must be between -180 and 180");
    }
  }

  if (b.email !== undefined && b.email !== null && b.email !== "") {
    if (typeof b.email !== "string" || !isValidEmail(b.email.trim())) {
      errors.push("email must be a valid email when provided");
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
