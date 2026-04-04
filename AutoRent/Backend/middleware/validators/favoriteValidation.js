/**
 * POST /favorites
 */
export const validateFavoriteBody = (req, res, next) => {
  const errors = [];
  const b = req.body ?? {};

  if (!b.vehicleId || typeof b.vehicleId !== "string" || !b.vehicleId.trim()) {
    errors.push("vehicleId is required");
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
