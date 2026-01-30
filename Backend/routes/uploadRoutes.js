import express from "express";
import { uploadImagesController } from "../controller/uploadController.js";
import { authenticateToken } from "../middleware/auth.js";
import { uploadImages } from "../middleware/upload.js";

const router = express.Router();

// POST /api/upload/images – multipart form "images" (owner only)
router.post(
  "/upload/images",
  authenticateToken,
  (req, res, next) => {
    uploadImages(req, res, (err) => {
      if (err) {
        const code = err.code === "LIMIT_FILE_SIZE" || err.code === "LIMIT_FILE_COUNT" ? 400 : 500;
        const message =
          err.code === "LIMIT_FILE_SIZE"
            ? "File too large (max 5MB per file)"
            : err.code === "LIMIT_FILE_COUNT"
              ? "Too many files (max 10)"
              : err.message || "Upload error";
        return res.status(code).json({ success: false, message });
      }
      next();
    });
  },
  uploadImagesController
);

export default router;
