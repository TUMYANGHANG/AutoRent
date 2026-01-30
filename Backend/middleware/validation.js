/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} - True if valid
 */
const isValidPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Middleware to validate registration data
 */
const validateRegistration = (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;
  const errors = [];

  // Email validation
  if (!email) {
    errors.push("Email is required");
  } else if (!isValidEmail(email)) {
    errors.push("Invalid email format");
  }

  // Password validation
  if (!password) {
    errors.push("Password is required");
  } else if (!isValidPassword(password)) {
    errors.push(
      "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
    );
  }

  // Optional fields validation
  if (firstName && firstName.trim().length === 0) {
    errors.push("First name cannot be empty");
  }

  if (lastName && lastName.trim().length === 0) {
    errors.push("Last name cannot be empty");
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
 * Middleware to validate OTP verification data
 */
const validateOTPVerification = (req, res, next) => {
  const { email, otp } = req.body;
  const errors = [];

  if (!email) {
    errors.push("Email is required");
  } else if (!isValidEmail(email)) {
    errors.push("Invalid email format");
  }

  if (!otp) {
    errors.push("OTP is required");
  } else if (!/^\d{6}$/.test(otp)) {
    errors.push("OTP must be a 6-digit number");
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
 * Middleware to validate login data
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Email validation
  if (!email) {
    errors.push("Email is required");
  } else if (!isValidEmail(email)) {
    errors.push("Invalid email format");
  }

  // Password validation
  if (!password) {
    errors.push("Password is required");
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
 * Middleware to validate add vehicle data
 */
const validateAddVehicle = (req, res, next) => {
  const { make, model, year, licensePlate, dailyRate } = req.body;
  const errors = [];

  if (!make || typeof make !== "string") {
    errors.push("make is required and must be a string");
  } else if (make.trim().length === 0) {
    errors.push("make cannot be empty");
  } else if (make.length > 100) {
    errors.push("make must be at most 100 characters");
  }

  if (!model || typeof model !== "string") {
    errors.push("model is required and must be a string");
  } else if (model.trim().length === 0) {
    errors.push("model cannot be empty");
  } else if (model.length > 100) {
    errors.push("model must be at most 100 characters");
  }

  if (year === undefined || year === null) {
    errors.push("year is required");
  } else if (!Number.isInteger(Number(year)) || Number(year) < 1900 || Number(year) > new Date().getFullYear() + 1) {
    errors.push("year must be a valid year (1900 to current year + 1)");
  }

  if (!licensePlate || typeof licensePlate !== "string") {
    errors.push("licensePlate is required and must be a string");
  } else if (licensePlate.trim().length === 0) {
    errors.push("licensePlate cannot be empty");
  } else if (licensePlate.length > 20) {
    errors.push("licensePlate must be at most 20 characters");
  }

  const rate = Number(dailyRate);
  if (dailyRate === undefined || dailyRate === null || dailyRate === "") {
    errors.push("dailyRate is required");
  } else if (Number.isNaN(rate) || rate <= 0) {
    errors.push("dailyRate must be a positive number");
  }

  if (req.body.color !== undefined && req.body.color !== null && (typeof req.body.color !== "string" || req.body.color.length > 50)) {
    errors.push("color must be a string of at most 50 characters");
  }

  if (req.body.description !== undefined && req.body.description !== null && typeof req.body.description !== "string") {
    errors.push("description must be a string");
  }

  const validStatuses = ["available", "rented", "maintenance", "inactive"];
  if (req.body.status !== undefined && req.body.status !== null && !validStatuses.includes(req.body.status)) {
    errors.push("status must be one of: available, rented, maintenance, inactive");
  }

  if (req.body.imageUrls !== undefined && (!Array.isArray(req.body.imageUrls) || req.body.imageUrls.some((u) => typeof u !== "string" || u.length > 500))) {
    errors.push("imageUrls must be an array of strings (URLs, max 500 chars each)");
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
 * Middleware to validate add vehicle images data
 */
const validateAddVehicleImages = (req, res, next) => {
  const { imageUrls } = req.body;
  const errors = [];

  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    errors.push("imageUrls must be a non-empty array");
  } else if (imageUrls.some((u) => typeof u !== "string" || u.trim().length === 0 || u.length > 500)) {
    errors.push("imageUrls must be an array of non-empty strings (URLs, max 500 chars each)");
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

export {
  isValidEmail,
  isValidPassword,
  validateAddVehicle,
  validateAddVehicleImages,
  validateLogin,
  validateOTPVerification,
  validateRegistration,
};

