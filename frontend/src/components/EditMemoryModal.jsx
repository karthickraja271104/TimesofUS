import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { updateMemory } from "../services/api.js";

export default function EditMemoryModal({ isOpen, onClose, memory, onUpdate }) {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    date: "",
    createdBy: "him",
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize form with memory data when modal opens
  useEffect(() => {
    if (memory && isOpen) {
      setFormData({
        title: memory.title || "",
        message: memory.message || "",
        date: memory.date ? memory.date.split("T")[0] : "",
        createdBy: memory.createdBy || "him",
      });

      if (memory.media?.url) {
        setMediaPreview(memory.media.url);
        setMediaType(memory.media.type);
      }
      setError(null);
    }
  }, [memory, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Determine media type
    const type = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("audio/")
          ? "audio"
          : null;

    if (!type) {
      setError("Unsupported file type");
      return;
    }

    setMediaFile(file);
    setMediaType(type);

    // Create preview
    if (type === "image") {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setMediaPreview(`${type} file: ${file.name}`);
    }
    setError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    // Determine media type
    const type = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("audio/")
          ? "audio"
          : null;

    if (!type) {
      setError("Unsupported file type");
      return;
    }

    setMediaFile(file);
    setMediaType(type);

    // Create preview
    if (type === "image") {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setMediaPreview(`${type} file: ${file.name}`);
    }
    setError(null);
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title || !formData.message || !formData.date) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("message", formData.message);
      data.append("date", formData.date);
      data.append("createdBy", formData.createdBy);

      // Append new media if user selected a new file
      if (mediaFile) {
        data.append("media", mediaFile);
      } else if (mediaPreview === null && memory.media?.url) {
        // User cleared the existing media - send flag to backend
        data.append("removeMedia", "true");
      }

      const updatedMemory = await updateMemory(memory.id, data);
      onUpdate(updatedMemory);

      onClose();
    } catch (err) {
      setError(err.message || "Failed to update memory");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 pointer-events-auto"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full mx-4 max-w-md max-h-[85vh] bg-white rounded-2xl shadow-2xl z-50 border border-red-100 flex flex-col pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-red-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Heart size={20} fill="#ff3b6b" stroke="#ff3b6b" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Edit Memory
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-red-50 rounded-lg transition"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              {/* Form Content - Scrollable */}
              <div className="space-y-3 overflow-y-auto flex-1 p-4">
                {/* Title Input */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., First Coffee Together"
                    className="w-full px-3 py-1.5 text-sm border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 bg-red-50"
                  />
                </div>

                {/* Date Input */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 text-sm border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 bg-red-50"
                  />
                </div>

                {/* Created By Selector */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Created By
                  </label>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-2 flex-1 p-2 border border-red-200 rounded-lg cursor-pointer hover:bg-red-50 transition" style={{ backgroundColor: formData.createdBy === "him" ? "#fef2f2" : "transparent" }}>
                      <input
                        type="radio"
                        name="createdBy"
                        value="him"
                        checked={formData.createdBy === "him"}
                        onChange={handleInputChange}
                        className="w-3 h-3 text-red-500 accent-red-500"
                      />
                      <span className="text-xs text-gray-700 font-medium">by Him</span>
                    </label>
                    <label className="flex items-center gap-2 flex-1 p-2 border border-red-200 rounded-lg cursor-pointer hover:bg-red-50 transition" style={{ backgroundColor: formData.createdBy === "her" ? "#fef2f2" : "transparent" }}>
                      <input
                        type="radio"
                        name="createdBy"
                        value="her"
                        checked={formData.createdBy === "her"}
                        onChange={handleInputChange}
                        className="w-3 h-3 text-red-500 accent-red-500"
                      />
                      <span className="text-xs text-gray-700 font-medium">by Her</span>
                    </label>
                  </div>
                </div>

                {/* Message Textarea */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Memory
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Share your memory..."
                    rows="2"
                    className="w-full px-3 py-1.5 text-sm border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 bg-red-50 resize-none"
                  />
                </div>

                {/* Media Upload with Preview */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Media (Optional)
                  </label>
                  <div className="space-y-2">
                    <div 
                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
                        isDragging 
                          ? "border-red-500 bg-red-100 scale-105" 
                          : "border-red-200 hover:bg-red-50"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        accept="image/*,video/*,audio/*"
                        onChange={handleMediaUpload}
                        className="hidden"
                        id="media-upload"
                      />
                      <label htmlFor="media-upload" className="cursor-pointer block">
                        <motion.div
                          animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Upload size={24} className="mx-auto mb-2 text-red-400" />
                        </motion.div>
                        <p className="text-sm text-gray-700 font-medium">
                          Drag and drop or click to update
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Image, Video, or Audio
                        </p>
                      </label>
                    </div>
                    {mediaPreview && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative rounded-lg overflow-hidden border-2 border-red-200"
                      >
                        {mediaType === "image" && (
                          <img
                            src={mediaPreview}
                            alt="Preview"
                            className="w-full h-24 object-cover"
                          />
                        )}
                        {mediaType === "video" && (
                          <video
                            src={mediaPreview}
                            controls
                            className="w-full h-24 object-cover"
                          />
                        )}
                        {mediaType === "audio" && (
                          <div className="bg-gradient-to-r from-red-50 to-red-50 p-2 h-16 flex items-center justify-center">
                            <audio
                              src={mediaPreview}
                              controls
                              className="w-full h-6"
                            />
                          </div>
                        )}
                        {typeof mediaPreview === "string" &&
                          !mediaPreview.startsWith("blob:") && (
                            <div className="bg-gradient-to-r from-red-50 to-red-50 p-2 h-16 flex items-center justify-center">
                              <p className="text-xs text-gray-600">{mediaPreview}</p>
                            </div>
                          )}
                        <button
                          type="button"
                          onClick={() => {
                            handleRemoveMedia();
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600 transition"
                        >
                          <X size={14} />
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600"
                  >
                    {error}
                  </motion.div>
                )}
              </div>

              {/* Buttons - Fixed at Bottom */}
              <div className="flex gap-2 p-4 border-t border-red-100 bg-white flex-shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 text-sm border border-red-200 text-gray-700 rounded-lg hover:bg-red-50 transition font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition font-medium shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
                      />
                      Saving
                    </>
                  ) : (
                    "Update"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
