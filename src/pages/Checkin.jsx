import { motion } from "framer-motion";
import { Mic } from "lucide-react";

const Colors = {
  primary500: "#72063c",
  primary600: "#640233",
  primary700: "#4e0329",
  primary800: "#4e0329",
  primary1000: "#4e0335",
  accent500: "#ddb52f",
};

export default function Checkin() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-6 py-10"
      style={{ backgroundColor: Colors.primary1000 }}
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h1
          className="text-3xl font-semibold"
          style={{ color: Colors.accent500 }}
        >
          Today
        </h1>
        <p className="text-sm text-white/70">
          Speak freely. We’ll remember the day.
        </p>
      </div>

      {/* Siri‑like animation */}
      <div className="flex items-center justify-center flex-1">
        <motion.div
          className="relative flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 220,
              height: 220,
              backgroundColor: Colors.primary600,
            }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 160,
              height: 160,
              backgroundColor: Colors.primary500,
            }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
          />

          <button
            className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-xl"
            style={{ backgroundColor: Colors.accent500 }}
          >
            <Mic className="w-8 h-8 text-black" />
          </button>
        </motion.div>
      </div>

      {/* Footer actions */}
      <div className="w-full space-y-3">
        <button
          className="w-full py-4 rounded-2xl text-white font-medium shadow"
          style={{ backgroundColor: Colors.primary600 }}
        >
          Stop & Save
        </button>
        <button
          className="w-full py-4 rounded-2xl font-medium"
          style={{
            backgroundColor: "transparent",
            color: Colors.accent500,
            border: `1px solid ${Colors.accent500}`,
          }}
        >
          View Past Days
        </button>
      </div>
    </div>
  );
}
