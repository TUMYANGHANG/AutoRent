import { isValidEmail } from "../validationUtils.js";

const SOURCES = new Set(["contact", "faq", "footer"]);

/**
 * POST /contact-inquiries — one check per rule.
 */
export const validateContactInquiry = (req, res, next) => {
  const errors = [];
  const b = req.body ?? {};

  if (!SOURCES.has(b.source)) {
    errors.push("source must be one of: contact, faq, footer");
  }

  if (!b.name || typeof b.name !== "string" || !b.name.trim()) {
    errors.push("name is required");
  }

  if (!b.email || typeof b.email !== "string" || !b.email.trim()) {
    errors.push("email is required");
  } else if (!isValidEmail(b.email.trim())) {
    errors.push("invalid email");
  }

  if (!b.message || typeof b.message !== "string" || !b.message.trim()) {
    errors.push("message is required");
  }

  if (b.phone !== undefined && b.phone !== null && b.phone !== "") {
    if (typeof b.phone !== "string" || b.phone.length > 50) {
      errors.push("phone must be a string of at most 50 characters");
    }
  }

  if (b.subject !== undefined && b.subject !== null && b.subject !== "") {
    if (typeof b.subject !== "string" || b.subject.length > 500) {
      errors.push("subject must be a string of at most 500 characters");
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
