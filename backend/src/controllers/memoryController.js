import Memory from "../models/Memory.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

/**
 * Create a new memory with optional media upload
 * POST /api/memories
 */
export const createMemory = async (req, res, next) => {
  try {
    const { title, message, date, createdBy } = req.body;

    console.log("📝 Creating memory...");
    console.log("   Body:", { title, message, date, createdBy });
    console.log("   File:", req.file ? `${req.file.originalname} (${req.file.mimetype})` : "None");
    console.log("   Media Type:", req.mediaType || "None");

    // Validate required fields
    if (!title || !message || !date || !createdBy) {
      const missing = [];
      if (!title) missing.push("title");
      if (!message) missing.push("message");
      if (!date) missing.push("date");
      if (!createdBy) missing.push("createdBy");
      
      console.error("   ❌ Validation error - Missing:", missing);
      return res
        .status(400)
        .json({ error: `Title, message, date, and createdBy are required. Missing: ${missing.join(", ")}` });
    }

    // Validate createdBy value
    if (!["him", "her"].includes(createdBy)) {
      return res
        .status(400)
        .json({ error: "createdBy must be either 'him' or 'her'" });
    }

    // Prepare memory data
    const memoryData = {
      title,
      message,
      date: new Date(date),
      createdBy,
      media: {
        type: null,
        url: null,
        publicId: null,
      },
    };

    // Handle file upload if provided
    if (req.file && req.mediaType) {
      const mediaInfo = await uploadToCloudinary(
        req.file.buffer,
        req.file.originalname,
        req.mediaType
      );

      memoryData.media = {
        type: req.mediaType,
        url: mediaInfo.url,
        publicId: mediaInfo.publicId,
      };
    }

    // Create and save memory
    const memory = new Memory(memoryData);
    await memory.save();

    console.log("   ✅ Memory saved to database:", memory._id);

    res.status(201).json({
      success: true,
      message: "Memory created successfully",
      data: memory.formatResponse(),
    });
  } catch (error) {
    console.error("   ❌ Create memory error:", error.message);
    next(error);
  }
};

/**
 * Get all memories sorted by date (newest first)
 * GET /api/memories
 */
export const getAllMemories = async (req, res, next) => {
  try {
    const memories = await Memory.find()
      .sort({ date: -1 })
      .select("-__v");

    // Format response
    const formattedMemories = memories.map((memory) =>
      memory.formatResponse()
    );

    res.status(200).json({
      success: true,
      count: formattedMemories.length,
      data: formattedMemories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single memory by ID
 * GET /api/memories/:id
 */
export const getMemoryById = async (req, res, next) => {
  try {
    const memory = await Memory.findById(req.params.id);

    if (!memory) {
      return res.status(404).json({ error: "Memory not found" });
    }

    res.status(200).json({
      success: true,
      data: memory.formatResponse(),
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ error: "Invalid memory ID" });
    }
    next(error);
  }
};

/**
 * Update a memory
 * PUT /api/memories/:id
 */
export const updateMemory = async (req, res, next) => {
  try {
    const { title, message, date, createdBy, removeMedia } = req.body;
    const updates = {};

    if (title) updates.title = title;
    if (message) updates.message = message;
    if (date) updates.date = new Date(date);
    if (createdBy) {
      if (!["him", "her"].includes(createdBy)) {
        return res
          .status(400)
          .json({ error: "createdBy must be either 'him' or 'her'" });
      }
      updates.createdBy = createdBy;
    }

    // Handle file update if provided
    if (req.file && req.mediaType) {
      const memory = await Memory.findById(req.params.id);

      if (!memory) {
        return res.status(404).json({ error: "Memory not found" });
      }

      // Delete old media from Cloudinary
      if (memory.media.publicId) {
        await deleteFromCloudinary(memory.media.publicId);
      }

      // Upload new media
      const mediaInfo = await uploadToCloudinary(
        req.file.buffer,
        req.file.originalname,
        req.mediaType
      );

      updates.media = {
        type: req.mediaType,
        url: mediaInfo.url,
        publicId: mediaInfo.publicId,
      };
    } else if (removeMedia === "true") {
      // Handle media removal
      const memory = await Memory.findById(req.params.id);

      if (!memory) {
        return res.status(404).json({ error: "Memory not found" });
      }

      // Delete media from Cloudinary if it exists
      if (memory.media?.publicId) {
        await deleteFromCloudinary(memory.media.publicId);
      }

      // Clear media from the memory
      updates.media = {
        type: null,
        url: null,
        publicId: null,
      };
    }

    const memory = await Memory.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!memory) {
      return res.status(404).json({ error: "Memory not found" });
    }

    res.status(200).json({
      success: true,
      message: "Memory updated successfully",
      data: memory.formatResponse(),
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ error: "Invalid memory ID" });
    }
    next(error);
  }
};

/**
 * Delete a memory and its media
 * DELETE /api/memories/:id
 */
export const deleteMemory = async (req, res, next) => {
  try {
    const memory = await Memory.findByIdAndDelete(req.params.id);

    if (!memory) {
      return res.status(404).json({ error: "Memory not found" });
    }

    // Delete media from Cloudinary if it exists
    if (memory.media.publicId) {
      await deleteFromCloudinary(memory.media.publicId);
    }

    res.status(200).json({
      success: true,
      message: "Memory deleted successfully",
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ error: "Invalid memory ID" });
    }
    next(error);
  }
};
