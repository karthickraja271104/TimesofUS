import { motion, AnimatePresence } from "framer-motion";
import { Heart, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";

const formatDate = (dateString) => {
  if (!dateString) return "No date";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function MemoryCard({
  memory,
  isActive,
  index,
  onEdit,
  onDelete,
}) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      {/* ================= CARD ================= */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: isActive ? 1 : 0.6,
          scale: isActive ? 1 : 0.85,
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileHover={{ scale: isActive ? 1.05 : 0.88 }}
        className="flex-shrink-0 w-80 bg-gradient-to-br from-red-50 to-red-50
                   rounded-2xl shadow-lg p-5 border border-red-100
                   cursor-pointer relative overflow-hidden flex flex-col"
      >
        {/* Background heart */}
        <div className="absolute top-2 right-2 opacity-20">
          <Heart size={40} fill="#ff3b6b" stroke="none" />
        </div>

        {/* ============ MEDIA PREVIEW TRIGGER ============ */}
        <div
          className="w-full h-48 rounded-lg mb-3 overflow-hidden
                     border border-red-200 bg-red-100 flex items-center justify-center relative group"
          onMouseEnter={() => memory.media?.type === "image" && setShowPreview(true)}
          onMouseLeave={() => setShowPreview(false)}
        >
          {memory.media?.type === "image" ? (
            <img
              src={memory.media.url}
              alt={memory.title}
              className="w-full h-full object-cover"
            />
          ) : memory.media?.type === "video" ? (
            <div className="w-full h-full relative bg-black/5 flex items-center justify-center">
              <video
                src={memory.media.url}
                controls
                className="w-full h-full object-cover"
                style={{ display: "block" }}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 pointer-events-none">
                <div className="text-white text-4xl">▶️</div>
              </div>
            </div>
          ) : memory.media?.type === "audio" ? (
            <div className="w-full h-full flex flex-col items-center justify-center px-4 gap-3">
              <span className="text-5xl animate-pulse">🎵</span>
              <audio
                src={memory.media.url}
                controls
                className="w-full"
                style={{ maxWidth: "calc(100% - 16px)" }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full w-full text-red-400 text-center px-4">
              <span className="text-lg">💝 Memory Moment</span>
            </div>
          )}
        </div>

        {/* ================= CONTENT ================= */}
        <p className="text-red-500 text-xs mb-1">
          {formatDate(memory.date)}
        </p>

        <motion.h3 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg font-semibold text-gray-800 mb-2 max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-red-50"
        >
          {memory.title}
        </motion.h3>

        <span className="inline-block mb-2 px-2 py-0.5 bg-red-100 text-red-600
                         text-xs rounded-full w-fit">
          by {memory.createdBy === "him" ? "Him" : "Her"}
        </span>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 text-sm flex-grow max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-red-50"
        >
          {memory.message}
        </motion.p>

        {/* Footer */}
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-red-100">
          <div className="flex items-center gap-1">
            <Heart size={14} fill="#ff3b6b" stroke="#ff3b6b" />
            <span className="text-xs text-red-500">Memory {index + 1}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(memory);
              }}
              className="p-1 bg-blue-100 text-blue-600 rounded"
            >
              <Edit2 size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(memory.id);
              }}
              className="p-1 bg-red-100 text-red-600 rounded"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ================= FLOATING HOVER PREVIEW ================= */}
      <AnimatePresence>
        {showPreview && memory.media?.type === "image" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="
              fixed z-[9999] inset-0
              flex items-center justify-center
              pointer-events-none
            "
          >
            <img
              src={memory.media.url}
              alt={memory.title}
              className="
                max-w-[70vw]
                max-h-[80vh]
                w-auto h-auto
                object-contain
                rounded-lg
              "
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
