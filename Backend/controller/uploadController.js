import { uploadDocument, uploadImage } from "../services/cloudinaryService.js";

/**
 * Upload images to Cloudinary (owner only)
 * Expects multipart/form-data with field "images" (multiple files)
 */
const uploadImagesController = async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only owners can upload vehicle images",
      });
    }

    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images provided. Use field name 'images' with one or more files.",
      });
    }

    const urls = [];
    for (const file of files) {
      const url = await uploadImage(file.buffer, file.mimetype);
      urls.push(url);
    }

    res.status(200).json({
      success: true,
      data: { urls },
    });
  } catch (error) {
    console.error("Upload images error:", error);
    if (error.message?.includes("Cloudinary is not configured")) {
      return res.status(503).json({
        success: false,
        message: "Image upload is not configured",
      });
    }
    if (error.message?.includes("Invalid file type") || error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: error.message || "Invalid file",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to upload images",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Upload vehicle documents (PDF/images) to Cloudinary (owner only)
 * Expects multipart/form-data with field "documents" (multiple files, max 5, 10MB each)
 */
const uploadDocumentsController = async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only owners can upload vehicle documents",
      });
    }

    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No documents provided. Use field name 'documents' with one or more files.",
      });
    }

    const urls = [];
    for (const file of files) {
      const url = await uploadDocument(file.buffer, file.mimetype);
      urls.push(url);
    }

    res.status(200).json({
      success: true,
      data: { urls },
    });
  } catch (error) {
    console.error("Upload documents error:", error);
    if (error.message?.includes("Cloudinary is not configured")) {
      return res.status(503).json({
        success: false,
        message: "Document upload is not configured",
      });
    }
    if (error.message?.includes("Invalid file type") || error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: error.message || "Invalid file",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to upload documents",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export { uploadImagesController, uploadDocumentsController };
