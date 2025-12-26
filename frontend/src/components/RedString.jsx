import { motion } from "framer-motion";

/**
 * RedString Component - Japanese "Red String of Fate" (赤い糸)
 * Represents the invisible red thread connecting soulmates
 * Animated with flowing, organic motion and shimmering effects
 */
export default function RedString() {
  return (
    <motion.svg
      className="absolute top-1/2 left-0 w-full h-20 pointer-events-none"
      style={{ transform: "translateY(-50%)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      preserveAspectRatio="none"
      viewBox="0 0 1400 100"
    >
      <defs>
        {/* Main gradient for string */}
        <linearGradient id="stringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(220, 38, 38, 0.2)" />
          <stop offset="25%" stopColor="rgba(239, 68, 68, 0.6)" />
          <stop offset="50%" stopColor="rgba(220, 38, 38, 0.9)" />
          <stop offset="75%" stopColor="rgba(239, 68, 68, 0.6)" />
          <stop offset="100%" stopColor="rgba(220, 38, 38, 0.2)" />
        </linearGradient>

        {/* Shimmer/glow effect */}
        <linearGradient id="shimmerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
          <stop offset="50%" stopColor="rgba(255, 255, 255, 0.8)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="stringGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer glow layer */}
      <motion.path
        d="M 0 50 Q 175 30, 350 50 T 700 50 T 1050 50 T 1400 50"
        stroke="rgba(220, 38, 38, 0.15)"
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main string with wavy animation */}
      <motion.path
        d="M 0 50 Q 175 30, 350 50 T 700 50 T 1050 50 T 1400 50"
        stroke="url(#stringGradient)"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        filter="url(#stringGlow)"
        animate={{
          y: [0, -3, 0],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Flowing shimmer effect */}
      <motion.path
        d="M 0 50 Q 175 30, 350 50 T 700 50 T 1050 50 T 1400 50"
        stroke="url(#shimmerGradient)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        animate={{
          x: [-1400, 1400],
          opacity: [0, 0.5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Second shimmer for extra shine */}
      <motion.path
        d="M 0 50 Q 175 30, 350 50 T 700 50 T 1050 50 T 1400 50"
        stroke="url(#shimmerGradient)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        animate={{
          x: [-1400, 1400],
          opacity: [0, 0.3, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
          delay: 1,
        }}
      />

      {/* Animated knots/connection points along the string */}
      {[175, 525, 875, 1225].map((x, idx) => (
        <g key={x}>
          {/* Knot glow */}
          <motion.circle
            cx={x}
            cy="50"
            r="8"
            fill="rgba(239, 68, 68, 0.2)"
            animate={{
              r: [8, 12, 8],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: idx * 0.3,
            }}
          />

          {/* Inner knot */}
          <motion.circle
            cx={x}
            cy="50"
            r="4"
            fill="rgba(220, 38, 38, 0.8)"
            animate={{
              r: [4, 5.5, 4],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: idx * 0.3,
            }}
          />
        </g>
      ))}

      {/* Subtle secondary wavy string (for depth) */}
      <motion.path
        d="M 0 52 Q 175 35, 350 52 T 700 52 T 1050 52 T 1400 52"
        stroke="rgba(220, 38, 38, 0.3)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        animate={{
          y: [0, 2, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.svg>
  );
}
