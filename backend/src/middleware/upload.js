import multer from "multer";

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
  const allowedVideoTypes = ["video/mp4", "video/webm"];
  const allowedAudioTypes = ["audio/mpeg", "audio/wav", "audio/mp4"];

  const allAllowedTypes = [
    ...allowedImageTypes,
    ...allowedVideoTypes,
    ...allowedAudioTypes,
  ];

  if (!allAllowedTypes.includes(file.mimetype)) {
    return cb(
      new Error(
        `Unsupported file type: ${file.mimetype}. Allowed: images (jpg, png, webp), videos (mp4, webm), audio (mp3, wav, m4a)`
      )
    );
  }

  cb(null, true);
};

// Multer upload configuration with file size limits
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max (largest is video)
  },
});

/**
 * Middleware to determine media type from MIME type
 */
export const determineMediaType = (req, res, next) => {
  if (!req.file) {
    req.mediaType = null;
    return next();
  }

  const mimeType = req.file.mimetype;

  if (mimeType.startsWith("image/")) {
    req.mediaType = "image";
  } else if (mimeType.startsWith("video/")) {
    req.mediaType = "video";
  } else if (mimeType.startsWith("audio/")) {
    req.mediaType = "audio";
  }

  next();
};

export default upload;
