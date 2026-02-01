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
 * Middleware to validate forgot password (email only)
 */
const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;
  const errors = [];

  if (!email) {
    errors.push("Email is required");
  } else if (!isValidEmail(email)) {
    errors.push("Invalid email format");
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
 * Middleware to validate reset password (email, otp, newPassword)
 */
const validateResetPassword = (req, res, next) => {
  const { email, otp, newPassword } = req.body;
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

  if (!newPassword) {
    errors.push("New password is required");
  } else if (!isValidPassword(newPassword)) {
    errors.push(
      "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
    );
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
 * Middleware to validate add vehicle data (document images mandatory for admin verification)
 */
const validateAddVehicle = (req, res, next) => {
  const { brand, model, manufactureYear, pricePerDay } = req.body;
  const errors = [];

  if (!brand || typeof brand !== "string") {
    errors.push("brand is required and must be a string");
  } else if (brand.trim().length === 0) {
    errors.push("brand cannot be empty");
  } else if (brand.length > 100) {
    errors.push("brand must be at most 100 characters");
  }

  if (!model || typeof model !== "string") {
    errors.push("model is required and must be a string");
  } else if (model.trim().length === 0) {
    errors.push("model cannot be empty");
  } else if (model.length > 100) {
    errors.push("model must be at most 100 characters");
  }

  if (manufactureYear === undefined || manufactureYear === null) {
    errors.push("manufactureYear is required");
  } else if (!Number.isInteger(Number(manufactureYear)) || Number(manufactureYear) < 1900 || Number(manufactureYear) > new Date().getFullYear() + 1) {
    errors.push("manufactureYear must be a valid year (1900 to current year + 1)");
  }

  const rate = Number(pricePerDay);
  if (pricePerDay === undefined || pricePerDay === null || pricePerDay === "") {
    errors.push("pricePerDay is required");
  } else if (Number.isNaN(rate) || rate <= 0) {
    errors.push("pricePerDay must be a positive number");
  }

  if (req.body.vehicleType !== undefined && req.body.vehicleType !== null && (typeof req.body.vehicleType !== "string" || req.body.vehicleType.length > 50)) {
    errors.push("vehicleType must be a string of at most 50 characters");
  }
  if (req.body.color !== undefined && req.body.color !== null && (typeof req.body.color !== "string" || req.body.color.length > 50)) {
    errors.push("color must be a string of at most 50 characters");
  }
  if (req.body.fuelType !== undefined && req.body.fuelType !== null && (typeof req.body.fuelType !== "string" || req.body.fuelType.length > 50)) {
    errors.push("fuelType must be a string of at most 50 characters");
  }
  if (req.body.transmission !== undefined && req.body.transmission !== null && (typeof req.body.transmission !== "string" || req.body.transmission.length > 50)) {
    errors.push("transmission must be a string of at most 50 characters");
  }
  if (req.body.seatingCapacity !== undefined && req.body.seatingCapacity !== null && (!Number.isInteger(Number(req.body.seatingCapacity)) || Number(req.body.seatingCapacity) < 0)) {
    errors.push("seatingCapacity must be a non-negative integer");
  }
  if (req.body.airbags !== undefined && req.body.airbags !== null && (!Number.isInteger(Number(req.body.airbags)) || Number(req.body.airbags) < 0)) {
    errors.push("airbags must be a non-negative integer");
  }
  if (req.body.securityDeposit !== undefined && req.body.securityDeposit !== null && req.body.securityDeposit !== "" && (Number.isNaN(Number(req.body.securityDeposit)) || Number(req.body.securityDeposit) < 0)) {
    errors.push("securityDeposit must be a non-negative number");
  }
  if (req.body.lateFeePerHour !== undefined && req.body.lateFeePerHour !== null && req.body.lateFeePerHour !== "" && (Number.isNaN(Number(req.body.lateFeePerHour)) || Number(req.body.lateFeePerHour) < 0)) {
    errors.push("lateFeePerHour must be a non-negative number");
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

  // Vehicle document images are mandatory for admin verification
  if (!Array.isArray(req.body.documentUrls) || req.body.documentUrls.length === 0) {
    errors.push("At least one vehicle document image is required (documentUrls must be a non-empty array)");
  } else if (req.body.documentUrls.some((u) => typeof u !== "string" || u.length > 500)) {
    errors.push("documentUrls must be an array of strings (URLs, max 500 chars each)");
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
 * Middleware to validate update vehicle data (owner only; isVerified not allowed)
 */
const validateUpdateVehicle = (req, res, next) => {
  const validStatuses = ["available", "rented", "maintenance", "inactive"];
  const errors = [];

  if (req.body.brand !== undefined) {
    if (typeof req.body.brand !== "string" || req.body.brand.trim().length === 0) errors.push("brand must be a non-empty string");
    else if (req.body.brand.length > 100) errors.push("brand must be at most 100 characters");
  }
  if (req.body.model !== undefined) {
    if (typeof req.body.model !== "string" || req.body.model.trim().length === 0) errors.push("model must be a non-empty string");
    else if (req.body.model.length > 100) errors.push("model must be at most 100 characters");
  }
  if (req.body.vehicleType !== undefined && req.body.vehicleType !== null && (typeof req.body.vehicleType !== "string" || req.body.vehicleType.length > 50)) {
    errors.push("vehicleType must be a string of at most 50 characters");
  }
  if (req.body.manufactureYear !== undefined) {
    const y = Number(req.body.manufactureYear);
    if (!Number.isInteger(y) || y < 1900 || y > new Date().getFullYear() + 1) errors.push("manufactureYear must be a valid year");
  }
  if (req.body.color !== undefined && req.body.color !== null && (typeof req.body.color !== "string" || req.body.color.length > 50)) {
    errors.push("color must be a string of at most 50 characters");
  }
  if (req.body.fuelType !== undefined && req.body.fuelType !== null && (typeof req.body.fuelType !== "string" || req.body.fuelType.length > 50)) {
    errors.push("fuelType must be a string of at most 50 characters");
  }
  if (req.body.transmission !== undefined && req.body.transmission !== null && (typeof req.body.transmission !== "string" || req.body.transmission.length > 50)) {
    errors.push("transmission must be a string of at most 50 characters");
  }
  if (req.body.seatingCapacity !== undefined && req.body.seatingCapacity !== null && (!Number.isInteger(Number(req.body.seatingCapacity)) || Number(req.body.seatingCapacity) < 0)) {
    errors.push("seatingCapacity must be a non-negative integer");
  }
  if (req.body.airbags !== undefined && req.body.airbags !== null && (!Number.isInteger(Number(req.body.airbags)) || Number(req.body.airbags) < 0)) {
    errors.push("airbags must be a non-negative integer");
  }
  if (req.body.pricePerDay !== undefined) {
    const rate = Number(req.body.pricePerDay);
    if (Number.isNaN(rate) || rate <= 0) errors.push("pricePerDay must be a positive number");
  }
  if (req.body.securityDeposit !== undefined && req.body.securityDeposit !== null && req.body.securityDeposit !== "" && (Number.isNaN(Number(req.body.securityDeposit)) || Number(req.body.securityDeposit) < 0)) {
    errors.push("securityDeposit must be a non-negative number");
  }
  if (req.body.lateFeePerHour !== undefined && req.body.lateFeePerHour !== null && req.body.lateFeePerHour !== "" && (Number.isNaN(Number(req.body.lateFeePerHour)) || Number(req.body.lateFeePerHour) < 0)) {
    errors.push("lateFeePerHour must be a non-negative number");
  }
  if (req.body.description !== undefined && req.body.description !== null && typeof req.body.description !== "string") {
    errors.push("description must be a string");
  }
  if (req.body.status !== undefined && !validStatuses.includes(req.body.status)) {
    errors.push("status must be one of: available, rented, maintenance, inactive");
  }
  if (req.body.isVerified !== undefined) {
    errors.push("isVerified cannot be updated by owner; only admin can verify vehicles");
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
  validateForgotPassword,
  validateLogin,
  validateOTPVerification,
  validateRegistration,
  validateResetPassword,
  validateUpdateVehicle,
};

