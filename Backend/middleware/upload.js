import multer from "multer";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${ALLOWED_MIMES.join(", ")}`), false);
  }
};

export const uploadImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).array("images", 10);

const DOC_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB for documents
const ALLOWED_DOC_MIMES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

const docFileFilter = (req, file, cb) => {
  if (ALLOWED_DOC_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: PDF, JPEG, PNG, WebP`), false);
  }
};

export const uploadDocuments = multer({
  storage: multer.memoryStorage(),
  fileFilter: docFileFilter,
  limits: { fileSize: DOC_MAX_FILE_SIZE },
}).array("documents", 5);

// Single image upload (for profile pictures, license images, etc.)
export const uploadSingleImage = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single("file");
