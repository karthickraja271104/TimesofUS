import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export default function FloatingHearts() {
  return [...Array(8)].map((_, i) => {
    const left = Math.random() * 100; // Random horizontal position
    const size = 16 + Math.random() * 20; // Random size 16-36px
    const duration = 8 + Math.random() * 6; // Random duration 8-14s
    const xOffset = (Math.random() - 0.5) * 50; // Random horizontal drift

    return (
      <motion.div
        key={i}
        className="fixed pointer-events-none"
        initial={{ y: "100vh", opacity: 0, x: 0 }}
        animate={{ 
          y: "-100vh", 
          opacity: [0, 0.6, 0.6, 0],
          x: xOffset 
        }}
        transition={{
          duration,
          repeat: Infinity,
          delay: i * 0.15,
          ease: "linear",
        }}
        style={{ left: `${left}%`, bottom: 0 }}
      >
        <Heart 
          size={size} 
          fill="rgba(255, 59, 107, 0.6)" 
          stroke="rgba(255, 59, 107, 0.3)"
          strokeWidth={0.5}
        />
      </motion.div>
    );
  });
}
