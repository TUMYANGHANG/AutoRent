/**
 * Small shared primitives used by auth/vehicle middleware and per-route validators.
 * Keeps email/URL/date rules consistent without coupling unrelated flows.
 */

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email ?? ""));
};

/** Calendar date only, e.g. 2026-03-28 (matches HTML date inputs). */
export const isIsoDateOnlyString = (value) =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim());

export const isHttpUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};
