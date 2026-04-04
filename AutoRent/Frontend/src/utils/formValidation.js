/**
 * Client-side validation helpers aligned with backend rules where possible.
 * Messages are user-facing for forms and modals.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Same character class as backend middleware `isValidPassword` */
const PASSWORD_STRENGTH_RE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const isValidEmail = (value) =>
  typeof value === "string" && EMAIL_RE.test(value.trim());

export const validateRequiredTrim = (value, fieldLabel) => {
  if (value == null || typeof value !== "string" || !value.trim()) {
    return `${fieldLabel} is required.`;
  }
  return null;
};

export const validateEmailField = (value) => {
  const err = validateRequiredTrim(value, "Email");
  if (err) return err;
  if (!isValidEmail(value)) return "Please enter a valid email address.";
  return null;
};

export const validatePasswordStrength = (password) => {
  if (password == null || password === "") {
    return "Password is required.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!PASSWORD_STRENGTH_RE.test(password)) {
    return "Password must include at least one uppercase letter, one lowercase letter, and one number.";
  }
  return null;
};

export const validateLoginForm = ({ email, password }) => {
  const e = validateEmailField(email);
  if (e) return e;
  if (!password || !String(password).length) return "Password is required.";
  return null;
};

export const validateSignUpRegister = ({
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
}) => {
  if (!firstName?.trim() || !lastName?.trim()) {
    return "First name and last name are required.";
  }
  const emailErr = validateEmailField(email);
  if (emailErr) return emailErr;
  const pwErr = validatePasswordStrength(password);
  if (pwErr) return pwErr;
  if (password !== confirmPassword) return "Passwords do not match.";
  return null;
};

export const validateOtp = (otp, digits = 6) => {
  const s = String(otp ?? "").trim();
  if (s.length !== digits || !/^\d+$/.test(s)) {
    return `Please enter a valid ${digits}-digit code.`;
  }
  return null;
};

/** Contact / footer / FAQ inquiry payloads (matches backend field lengths). */
export const validateContactInquiryForm = ({
  name,
  email,
  message,
  phone,
  subject,
}) => {
  const n = validateRequiredTrim(name, "Name");
  if (n) return n;
  const em = validateEmailField(email);
  if (em) return em;
  const msg = validateRequiredTrim(message, "Message");
  if (msg) return msg;
  if (message && message.length > 20000) {
    return "Message is too long. Please shorten it.";
  }
  if (phone != null && phone !== "" && String(phone).length > 50) {
    return "Phone must be at most 50 characters.";
  }
  if (subject != null && subject !== "" && String(subject).length > 500) {
    return "Subject must be at most 500 characters.";
  }
  return null;
};

export const validateFaqInquiryForm = ({
  name,
  email,
  question,
  subject,
}) => {
  const n = validateRequiredTrim(name, "Name");
  if (n) return n;
  const em = validateEmailField(email);
  if (em) return em;
  const q = validateRequiredTrim(question, "Your question");
  if (q) return q;
  if (subject != null && subject !== "" && String(subject).length > 500) {
    return "Subject must be at most 500 characters.";
  }
  return null;
};

const MAX_PICKUP = 500;

/**
 * Per-field errors for booking step 1 (modal + vehicle book page).
 */
export const getBookingStep1Errors = (form) => {
  const err = {};
  const { startDate, returnDate, pickupPlace, dropoffPlace, notes } = form || {};

  if (!startDate) {
    err.startDate = "Start date is required.";
  } else if (typeof startDate === "string" && !ISO_DATE_RE.test(startDate.trim())) {
    err.startDate = "Enter a valid start date (YYYY-MM-DD).";
  }

  if (!returnDate) {
    err.returnDate = "Return date is required.";
  } else if (typeof returnDate === "string" && !ISO_DATE_RE.test(returnDate.trim())) {
    err.returnDate = "Enter a valid return date (YYYY-MM-DD).";
  }

  if (
    startDate &&
    returnDate &&
    ISO_DATE_RE.test(String(startDate).trim()) &&
    ISO_DATE_RE.test(String(returnDate).trim())
  ) {
    const start = new Date(form.startDate);
    const end = new Date(form.returnDate);
    if (start > end) {
      err.returnDate = "Return date must be on or after the start date.";
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      err.startDate = "Start date cannot be in the past.";
    }
  }

  if (!pickupPlace?.trim()) {
    err.pickupPlace = "Pickup place is required.";
  } else if (pickupPlace.length > MAX_PICKUP) {
    err.pickupPlace = `Pickup place must be at most ${MAX_PICKUP} characters.`;
  }

  return err;
};

export const validateGarageCrowdForm = ({
  name,
  latitude,
  longitude,
  email,
}) => {
  const n = validateRequiredTrim(name, "Garage name");
  if (n) return n;
  if (name.length > 255) return "Name must be at most 255 characters.";
  if (latitude === "" || latitude === undefined || latitude === null) {
    return "Pick a location on the map (latitude is required).";
  }
  if (longitude === "" || longitude === undefined || longitude === null) {
    return "Pick a location on the map (longitude is required).";
  }
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return "Latitude and longitude must be valid numbers.";
  }
  if (lat < -90 || lat > 90) return "Latitude must be between -90 and 90.";
  if (lng < -180 || lng > 180) return "Longitude must be between -180 and 180.";
  if (email != null && email !== "") {
    if (!isValidEmail(email)) return "Please enter a valid email or leave it blank.";
  }
  return null;
};
