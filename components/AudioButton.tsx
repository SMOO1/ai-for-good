"use client";

import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { playAudio } from "@/lib/audio";

interface AudioButtonProps {
  text: string;
  size?: number;
  slow?: boolean;
}

export const AudioButton = ({ text, size = 48, slow = false }: AudioButtonProps) => {
  return (
    <button
      onClick={() => playAudio(text, slow ? 0.6 : 1.0)}
      className="p-6 rounded-full bg-primary text-white shadow-lg active:scale-95 transition-transform"
      aria-label="Play Audio"
    >
      <Volume2 size={size} />
    </button>
  );
};
