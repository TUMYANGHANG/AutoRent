import express from "express";
import {
  createContactInquiryController,
  deleteContactInquiryController,
  listContactInquiriesController,
} from "../controller/contactInquiryController.js";
import { authenticateToken } from "../middleware/auth.js";
import { validateContactInquiry } from "../middleware/validators/contactInquiryValidation.js";

const router = express.Router();

router.post("/contact-inquiries", validateContactInquiry, createContactInquiryController);
router.get("/admin/contact-inquiries", authenticateToken, listContactInquiriesController);
router.delete("/admin/contact-inquiries/:id", authenticateToken, deleteContactInquiryController);

export default router;
