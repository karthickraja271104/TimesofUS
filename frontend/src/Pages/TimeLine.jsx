import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Home, AlertCircle, Video } from "lucide-react";
import { Link } from "react-router-dom";
import MemoryCard from "../components/MemoryCard";
import AddMemoryModal from "../components/AddMemoryModal";
import EditMemoryModal from "../components/EditMemoryModal";
import RedString from "../components/RedString";
import { fetchMemories, createMemory, updateMemory, deleteMemory } from "../services/api.js";

export default function TimeLine() {
  const [memories, setMemories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const scrollContainerRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // Fetch memories on component mount
  useEffect(() => {
    const loadMemories = async () => {
      try {
        setIsLoading(true);
        const data = await fetchMemories();
        console.log("📦 Fetched data:", data);
        console.log("📦 Data length:", data?.length);
        // Sort by date (oldest first)
        const sorted = [...data].sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        console.log("📦 Sorted data:", sorted);
        setMemories(sorted);
        setError(null);
        setRetryCount(0); // Reset retry count on success
      } catch (err) {
        setError(err.message);
        console.error("Failed to load memories:", err);
        
        // Auto-retry after 3 seconds if server is not running
        if (retryCount < 5) {
          retryTimeoutRef.current = setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 3000);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadMemories();

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [retryCount]);

  // Keyboard navigation
  useEffect(() => {
    if (memories.length === 0) return;

    const handleKeyPress = (e) => {
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [activeIndex, memories.length]);

  const goToNext = () => {
    if (memories.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % memories.length);
  };

  const goToPrevious = () => {
    if (memories.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + memories.length) % memories.length);
  };

  const handleAddMemory = async (formData) => {
    try {
      const newMemory = await createMemory(formData);
      setMemories((prev) => [newMemory, ...prev]);
      setActiveIndex(0);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to create memory:", err);
    }
  };

  const handleEditMemory = (memory) => {
    setEditingMemory(memory);
    setIsEditModalOpen(true);
  };

  const handleUpdateMemory = (updatedMemory) => {
    setMemories((prev) => {
      const updated = prev.map((mem) => (mem.id === updatedMemory.id ? updatedMemory : mem));
      // Re-sort by date (oldest first) after update
      return updated.sort((a, b) => new Date(a.date) - new Date(b.date));
    });
    setIsEditModalOpen(false);
    setEditingMemory(null);
  };

  const handleDeleteMemory = async (memoryId) => {
    if (!window.confirm("Are you sure you want to delete this memory?")) {
      return;
    }

    try {
      await deleteMemory(memoryId);
      setMemories((prev) => prev.filter((mem) => mem.id !== memoryId));
      
      // Adjust active index if needed
      if (memories.length > 0 && activeIndex >= memories.length - 1) {
        setActiveIndex(Math.max(0, memories.length - 2));
      }
    } catch (err) {
      console.error("Failed to delete memory:", err);
      alert("Failed to delete memory. Please try again.");
    }
  };

  // Scroll to active card
  useEffect(() => {
    if (scrollContainerRef.current && memories.length > 0) {
      const cardWidth = 320 + 16; // card width + gap
      scrollContainerRef.current.scrollTo({
        left: activeIndex * cardWidth - 64,
        behavior: "smooth",
      });
    }
  }, [activeIndex, memories]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-red-50 to-white overflow-hidden">
      {/* Home Button */}
      <Link to="/">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="absolute top-6 left-6 z-40 p-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl transition"
          title="Back to Home"
        >
          <Home size={24} />
        </motion.button>
      </Link>

      {/* Video Call Button */}
      <Link to="/videocall">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="absolute top-6 right-6 z-40 p-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg hover:shadow-xl transition"
          title="Video Call"
        >
          <Video size={24} />
        </motion.button>
      </Link>

      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center pt-12 pb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
          Our Story
        </h1>
        <p className="text-red-600 text-lg">Every moment with you is precious</p>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2 max-w-md mx-auto"
        >
          <AlertCircle size={20} />
          <div className="flex-1">
            <p className="font-medium">Failed to load memories</p>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-2 text-gray-600">
              Make sure the backend server is running on http://localhost:5000
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setRetryCount(prev => prev + 1)}
                className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition font-medium"
              >
                Retry Now
              </button>
              {retryCount > 0 && retryCount < 5 && (
                <p className="text-xs text-gray-600 py-1">
                  Auto-retrying... (attempt {retryCount}/5)
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-red-200 border-t-red-400 rounded-full"
          />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && memories.length === 0 && !error && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-4">No memories yet</p>
          <p className="text-gray-400 text-sm">
            Click the + button below to add your first memory
          </p>
        </div>
      )}

      {/* Timeline Container */}
      {!isLoading && memories.length > 0 && (
        <div className="relative flex items-center justify-center px-4 md:px-8">
          {/* Red String Background */}
          <div className="absolute inset-0 flex items-center pointer-events-none">
            <RedString />
          </div>

          {/* Left Navigation Button */}
          <motion.button
            onClick={goToPrevious}
            whileHover={{ scale: 1.1, x: -4 }}
            whileTap={{ scale: 0.95 }}
            className="absolute left-0 z-20 p-2 md:p-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl transition"
          >
            <ChevronLeft size={24} />
          </motion.button>

          {/* Memory Cards Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-hidden scroll-smooth py-8 px-16 max-w-5xl relative z-10"
          >
            {memories.map((memory, index) => (
              <div
                key={memory.id}
                onClick={() => setActiveIndex(index)}
                className="cursor-pointer"
              >
                <MemoryCard
                  memory={memory}
                  isActive={index === activeIndex}
                  index={index}
                  onEdit={handleEditMemory}
                  onDelete={handleDeleteMemory}
                />
              </div>
            ))}
          </div>

          {/* Right Navigation Button */}
          <motion.button
            onClick={goToNext}
            whileHover={{ scale: 1.1, x: 4 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-0 z-20 p-2 md:p-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl transition"
          >
            <ChevronRight size={24} />
          </motion.button>
        </div>
      )}

      {/* Info Bar */}
      {!isLoading && memories.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center mt-8 pb-8"
        >
          <p className="text-gray-600 text-sm md:text-base">
            {activeIndex + 1} of {memories.length} memories
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Use arrow keys or buttons to navigate
          </p>
        </motion.div>
      )}

      {/* Floating Add Memory Button */}
      <motion.button
        onClick={() => setIsModalOpen(true)}
        whileHover={{ scale: 1.15, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="fixed bottom-8 right-8 p-4 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white shadow-xl hover:shadow-2xl z-30 transition"
      >
        <Plus size={28} />
      </motion.button>

      {/* Add Memory Modal */}
      <AddMemoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddMemory}
      />

      {/* Edit Memory Modal */}
      <EditMemoryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        memory={editingMemory}
        onUpdate={handleUpdateMemory}
      />
    </div>
  );
}