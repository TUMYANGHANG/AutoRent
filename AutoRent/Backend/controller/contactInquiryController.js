import { sendContactInquiryThankYou } from "../services/emailService.js";
import { createInquiry, deleteInquiryById, listInquiries, SOURCES } from "../services/contactInquiryService.js";

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

/** Delay before sending the auto thank-you email (ms). */
const THANK_YOU_EMAIL_DELAY_MS = 60_000;

/**
 * POST /contact-inquiries — public (no auth).
 */
const createContactInquiryController = async (req, res) => {
  try {
    const { source, name, email, phone, subject, message } = req.body ?? {};

    if (!SOURCES.has(source)) {
      return res.status(400).json({
        success: false,
        message: "source must be one of: contact, faq, footer",
      });
    }
    if (!isNonEmptyString(name)) {
      return res.status(400).json({ success: false, message: "name is required" });
    }
    if (!isNonEmptyString(email)) {
      return res.status(400).json({ success: false, message: "email is required" });
    }
    if (!isNonEmptyString(message)) {
      return res.status(400).json({ success: false, message: "message is required" });
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
    if (!emailOk) {
      return res.status(400).json({ success: false, message: "invalid email" });
    }

    const row = await createInquiry({
      source,
      name,
      email,
      phone: phone ?? null,
      subject: subject ?? null,
      message,
    });

    if (!row) {
      return res.status(500).json({ success: false, message: "Failed to save inquiry" });
    }

    const toEmail = String(email).trim();
    const displayName = String(name).trim();
    setTimeout(() => {
      sendContactInquiryThankYou(toEmail, displayName).catch((emailErr) => {
        console.error("[contactInquiry] thank-you email failed:", emailErr?.message || emailErr);
      });
    }, THANK_YOU_EMAIL_DELAY_MS);

    res.status(201).json({
      success: true,
      message: "Thank you — we received your message.",
      data: { id: row.id },
    });
  } catch (error) {
    console.error("Create contact inquiry error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * GET /admin/contact-inquiries — admin only.
 */
const listContactInquiriesController = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can view inquiries",
      });
    }

    const list = await listInquiries();
    res.status(200).json({
      success: true,
      data: Array.isArray(list) ? list : [],
    });
  } catch (error) {
    console.error("List contact inquiries error:", error);
    res.status(200).json({
      success: true,
      data: [],
    });
  }
};

/**
 * DELETE /admin/contact-inquiries/:id — admin only.
 */
const deleteContactInquiryController = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can delete inquiries",
      });
    }

    const id = req.params?.id;
    if (!id || typeof id !== "string" || !id.trim()) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const ok = await deleteInquiryById(id.trim());
    if (!ok) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    res.status(200).json({ success: true, message: "Inquiry deleted" });
  } catch (error) {
    console.error("Delete contact inquiry error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export {
  createContactInquiryController,
  deleteContactInquiryController,
  listContactInquiriesController,
};

