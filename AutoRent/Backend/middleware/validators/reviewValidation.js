const MAX_COMMENT = 5000;

/**
 * POST /vehicles/:vehicleId/reviews
 */
export const validateReviewBody = (req, res, next) => {
  const errors = [];
  const b = req.body ?? {};

  if (b.rating === undefined || b.rating === null || b.rating === "") {
    errors.push("Rating is required");
  } else {
    const r = Number(b.rating);
    if (!Number.isInteger(r) || r < 1 || r > 5) {
      errors.push("rating must be an integer between 1 and 5");
    }
  }

  if (b.comment !== undefined && b.comment !== null) {
    if (typeof b.comment !== "string") {
      errors.push("comment must be a string");
    } else if (b.comment.length > MAX_COMMENT) {
      errors.push(`comment must be at most ${MAX_COMMENT} characters`);
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
