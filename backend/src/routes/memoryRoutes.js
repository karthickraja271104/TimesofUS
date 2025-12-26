import express from "express";
import upload, { determineMediaType } from "../middleware/upload.js";
import {
  createMemory,
  getAllMemories,
  getMemoryById,
  updateMemory,
  deleteMemory,
} from "../controllers/memoryController.js";

const router = express.Router();

/**
 * POST /api/memories
 * Create a new memory with optional media
 */
router.post("/", upload.single("media"), determineMediaType, createMemory);

/**
 * GET /api/memories
 * Get all memories sorted by date
 */
router.get("/", getAllMemories);

/**
 * GET /api/memories/:id
 * Get a specific memory by ID
 */
router.get("/:id", getMemoryById);

/**
 * PUT /api/memories/:id
 * Update a memory
 */
router.put("/:id", upload.single("media"), determineMediaType, updateMemory);

/**
 * DELETE /api/memories/:id
 * Delete a memory and its media
 */
router.delete("/:id", deleteMemory);

export default router;
