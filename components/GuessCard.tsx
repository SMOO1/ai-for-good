"use client";

import React from "react";
import { VocabularyItem } from "@/data/vocabulary";
import { Volume2 } from "lucide-react";
import { playAudio } from "@/lib/audio";
import { motion } from "framer-motion";

interface GuessCardProps {
  item: VocabularyItem;
  onSelect: (item: VocabularyItem) => void;
}

export const GuessCard = ({ item, onSelect }: GuessCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white p-6 rounded-2xl shadow-md border-2 border-transparent active:border-primary flex flex-col items-center gap-3 cursor-pointer relative"
      onClick={() => onSelect(item)}
    >
      <span className="text-6xl mb-2">{item.icon}</span>
      <span className="text-2xl font-bold text-gray-800">{item.label}</span>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          playAudio(item.audioText);
        }}
        className="mt-2 p-3 rounded-full bg-accent text-primary hover:bg-primary hover:text-white transition-colors"
      >
        <Volume2 size={24} />
      </button>
    </motion.div>
  );
};
