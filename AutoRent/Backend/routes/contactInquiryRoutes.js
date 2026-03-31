import express from "express";
import {
  createContactInquiryController,
  deleteContactInquiryController,
  listContactInquiriesController,
} from "../controller/contactInquiryController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/contact-inquiries", createContactInquiryController);
router.get("/admin/contact-inquiries", authenticateToken, listContactInquiriesController);
router.delete("/admin/contact-inquiries/:id", authenticateToken, deleteContactInquiryController);

export default router;
