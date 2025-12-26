import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

// Ensure environment variables are loaded
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file to Cloudinary with automatic resource type detection
 * @param {Buffer} fileBuffer - File buffer from Multer
 * @param {String} fileName - Original filename
 * @param {String} mediaType - Type of media (image, video, audio)
 * @returns {Promise<Object>} - Cloudinary response with url and publicId
 */
export const uploadToCloudinary = async (fileBuffer, fileName, mediaType) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: `memories/${Date.now()}-${fileName.split(".")[0]}`,
        resource_type: "auto", // Auto-detect resource type
        folder: "romantic-timeline/memories",
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            type: mediaType,
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Deletes a file from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Cloudinary deletion failed: ${error.message}`);
  }
};

export default cloudinary;
