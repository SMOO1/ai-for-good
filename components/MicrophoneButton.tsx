"use client";

import React, { useState } from "react";
import { Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const MicrophoneButton = () => {
  const [isListening, setIsListening] = useState(false);

  const handleClick = () => {
    setIsListening(true);
    // Simulate listening for 2 seconds
    setTimeout(() => {
      setIsListening(false);
    }, 2000);
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0.3 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute inset-0 bg-primary rounded-full"
          />
        )}
      </AnimatePresence>
      
      <button
        onClick={handleClick}
        className={`relative z-10 p-6 rounded-full shadow-lg transition-all ${
          isListening ? "bg-red-500 text-white" : "bg-white text-primary border-2 border-primary"
        }`}
      >
        <Mic size={48} />
      </button>
    </div>
  );
};
