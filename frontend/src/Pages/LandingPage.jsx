import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import "./Landing.css";
import FloatingHearts from "../FloatingHearts";
import Heart from "../components/Heart";
export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <div className="landing">
      {/* Floating hearts background */}
      <FloatingHearts />

      {/* Decorative elements */}
      <motion.div
        className="absolute top-10 left-10 opacity-20"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles size={40} className="text-red-400" />
      </motion.div>

      <motion.div
        className="absolute bottom-10 right-10 opacity-20"
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles size={40} className="text-red-400" />
      </motion.div>

      {/* Decorative lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-red-300 to-transparent rounded-full blur-3xl"
          style={{ top: "-20%", right: "-10%" }}
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-l from-red-300/20 to-transparent rounded-full blur-3xl"
          style={{ bottom: "-20%", left: "-10%" }}
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 7, repeat: Infinity }}
        />
      </div>

      {/* Main content */}
      <motion.div
        className="center z-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Top decoration text */}
        <motion.div variants={itemVariants} className="mb-6">
          <p className="text-sm md:text-base tracking-widest text-red-500 font-light uppercase">
            ✦ A Love Story ✦
          </p>
        </motion.div>

        {/* Main heart */}
        <motion.div variants={itemVariants}>
          <Link to="/timeline" className="heart-link inline-block">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-300 rounded-full blur-2xl opacity-30"
                animate={{ scale: [0.8, 1.2, 0.8] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <Heart size={190} color="red" />
            </motion.div>
          </Link>
        </motion.div>

        {/* Main text */}
        <motion.div variants={itemVariants} className="mt-8 md:mt-10">
          <div className="text">
            <motion.h1
              className="text-3xl md:text-4xl font-light text-red-700 mb-4 leading-relaxed"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Every heartbeat holds<br />
              <span className="font-semibold">a memory</span>
            </motion.h1>
            <motion.p
              className="text-base md:text-lg text-red-600 font-light mt-6"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 0.3 }}
            >
              Click my heart to begin your journey ❤️
            </motion.p>
          </div>
        </motion.div>

        {/* Bottom decoration */}
        <motion.div
          variants={itemVariants}
          className="mt-10 flex justify-center gap-2 md:gap-4"
        >
          <motion.div
            className="w-1 h-1 bg-red-400 rounded-full"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-1 h-1 bg-red-400 rounded-full"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.15 }}
          />
          <motion.div
            className="w-1 h-1 bg-red-400 rounded-full"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
