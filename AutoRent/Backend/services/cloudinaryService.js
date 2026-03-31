import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.cloudname;
const apiKey = process.env.cloudkey;
const apiSecret = process.env.cloudsecret;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

/**
 * Upload an image buffer to Cloudinary
 * @param {Buffer} buffer - Image file buffer
 * @param {string} mimetype - MIME type (e.g. image/jpeg)
 * @param {string} [folder] - Optional folder in Cloudinary (e.g. "autorent/vehicles")
 * @returns {Promise<string>} - Secure URL of the uploaded image
 */
const uploadImage = async (buffer, mimetype, folder = "autorent/vehicles") => {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured (missing cloudname, cloudkey, or cloudsecret)");
  }

  const base64 = buffer.toString("base64");
  const dataUri = `data:${mimetype};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
  });

  return result.secure_url;
};

/**
 * Upload a document (e.g. PDF) to Cloudinary as raw file
 * @param {Buffer} buffer - File buffer
 * @param {string} mimetype - MIME type (e.g. application/pdf)
 * @param {string} [folder] - Optional folder (e.g. "autorent/vehicles/documents")
 * @returns {Promise<string>} - Secure URL of the uploaded file
 */
const uploadDocument = async (buffer, mimetype, folder = "autorent/vehicles/documents") => {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured (missing cloudname, cloudkey, or cloudsecret)");
  }

  const base64 = buffer.toString("base64");
  const dataUri = `data:${mimetype};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "raw",
  });

  return result.secure_url;
};

export { uploadImage, uploadDocument };
