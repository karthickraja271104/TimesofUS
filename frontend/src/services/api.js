import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Get all memories from the backend
 */
export const fetchMemories = async () => {
  try {
    console.log("🔄 Fetching memories from:", `${API_BASE_URL}/memories`);
    const response = await api.get("/memories");
    console.log("✅ Memories fetched:", response.data);
    return response.data.data || [];
  } catch (error) {
    console.error("❌ Fetch error:", error);
    throw new Error(
      error.response?.data?.error || "Failed to fetch memories"
    );
  }
};

/**
 * Create a new memory with optional media upload
 */
export const createMemory = async (formData) => {
  try {
    const response = await api.post("/memories", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to create memory"
    );
  }
};

/**
 * Get a single memory by ID
 */
export const getMemoryById = async (id) => {
  try {
    const response = await api.get(`/memories/${id}`);
    return response.data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch memory"
    );
  }
};

/**
 * Update a memory
 */
export const updateMemory = async (id, formData) => {
  try {
    const response = await api.put(`/memories/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to update memory"
    );
  }
};

/**
 * Delete a memory
 */
export const deleteMemory = async (id) => {
  try {
    await api.delete(`/memories/${id}`);
    return true;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to delete memory"
    );
  }
};

export default api;
