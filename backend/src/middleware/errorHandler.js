/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err.message || err);
  console.error("Stack:", err.stack);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: "Validation failed", details: messages });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({ error: "Duplicate field value entered" });
  }

  // Multer file size exceeded
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "File size exceeds limit" });
  }

  // Multer file filter error
  if (err.name === "MulterError" || (err.message && err.message.includes("Unsupported file type"))) {
    return res.status(400).json({ error: err.message });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    status: err.status || 500,
  });
};
