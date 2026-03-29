import { createInquiry, listInquiries, SOURCES } from "../services/contactInquiryService.js";

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

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
      data: list,
    });
  } catch (error) {
    console.error("List contact inquiries error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export { createContactInquiryController, listContactInquiriesController };

