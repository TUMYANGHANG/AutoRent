import { randomUUID } from "crypto";
import { desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { contactInquiries } from "../schema/index.js";

const SOURCES = new Set(["contact", "faq", "footer"]);

/**
 * Insert a contact inquiry. Returns null if the table is missing or insert fails.
 */
const createInquiry = async ({ source, name, email, phone, subject, message }) => {
  try {
    const id = randomUUID();
    const [row] = await db
      .insert(contactInquiries)
      .values({
        id,
        source,
        name: String(name).trim(),
        email: String(email).trim(),
        phone: phone ? String(phone).trim().slice(0, 50) : null,
        subject: subject ? String(subject).trim().slice(0, 500) : null,
        message: String(message).trim(),
      })
      .returning();
    return row ?? null;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[contactInquiry] createInquiry:", err?.message || err);
    }
    return null;
  }
};

/**
 * List all inquiries (newest first). Returns [] if the table is missing or query fails — never throws.
 */
const listInquiries = async () => {
  try {
    const rows = await db
      .select()
      .from(contactInquiries)
      .orderBy(desc(contactInquiries.createdAt));
    return Array.isArray(rows) ? rows : [];
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[contactInquiry] listInquiries:", err?.message || err);
    }
    return [];
  }
};

/**
 * Delete one inquiry by id. Returns true if a row was removed.
 */
const deleteInquiryById = async (id) => {
  try {
    const [removed] = await db
      .delete(contactInquiries)
      .where(eq(contactInquiries.id, id))
      .returning({ id: contactInquiries.id });
    return Boolean(removed);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[contactInquiry] deleteInquiryById:", err?.message || err);
    }
    return false;
  }
};

export { SOURCES, createInquiry, deleteInquiryById, listInquiries };
