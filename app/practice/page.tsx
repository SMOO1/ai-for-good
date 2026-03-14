"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { LargeDrawingCanvas } from "@/components/LargeDrawingCanvas";
import { AudioButton } from "@/components/AudioButton";
import { vocabulary, VocabularyItem } from "@/data/vocabulary";
import { evaluateDrawing } from "@/lib/mockEvaluation";
import { playAudio } from "@/lib/audio";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, RefreshCw, ArrowRight, Image as ImageIcon, Volume2 } from "lucide-react";
import Link from "next/link";

type Screen = "prompt" | "draw" | "checking" | "result";

export default function PracticePage() {
  const [screen, setScreen] = useState<Screen>("prompt");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [drawingData, setDrawingData] = useState<string | null>(null);

  const currentItem = vocabulary[currentIndex];

  // Auto-play audio when prompt shows
  useEffect(() => {
    if (screen === "prompt") {
      // Small delay to ensure interaction context if needed, but usually works on mount if preceded by user click
      setTimeout(() => {
        playAudio(currentItem.audioText);
      }, 300);
    }
  }, [screen, currentItem]);

  const handleStartDrawing = () => {
    setScreen("draw");
  };

  const handleDoneDrawing = async (imageData: string) => {
    setDrawingData(imageData);
    setScreen("checking");
    
    // Evaluate the drawing strictly using the pixel heuristic
    const result = await evaluateDrawing(imageData, currentItem.expectedShape);
    
    // Simulate thinking delay to let the UI show "Checking..."
    setTimeout(() => {
      setIsCorrect(result);
      setScreen("result");
      // Auto-play audio on result screen
      playAudio(currentItem.audioText);
    }, 1500);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % vocabulary.length);
    setScreen("prompt");
    setDrawingData(null);
  };

  const handleRetry = () => {
    setScreen("draw");
    setDrawingData(null);
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full relative bg-gray-50">
        
        {/* Top Navigation - Keep it minimal */}
        <header className="flex items-center justify-between p-4 z-10 bg-gray-50/80 backdrop-blur-md">
          <Link href="/" className="p-3 bg-white rounded-full shadow-sm text-gray-500 active:scale-95">
            <X size={24} />
          </Link>
          <div className="flex gap-1">
            {vocabulary.slice(0, 5).map((_, idx) => (
              <div 
                key={idx} 
                className={`w-2 h-2 rounded-full ${idx === currentIndex % 5 ? 'bg-primary' : 'bg-gray-300'}`}
              />
            ))}
          </div>
          <div className="w-12" /> {/* Spacer */}
        </header>

        <div className="flex-1 flex flex-col px-4 pb-4 relative">
          <AnimatePresence mode="wait">
            
            {/* PROMPT SCREEN */}
            {screen === "prompt" && (
              <motion.div
                key="prompt"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex-1 flex flex-col items-center justify-center gap-10"
              >
                <div className="flex flex-col items-center gap-6">
                  {currentItem.hintIcon && (
                    <div className="text-6xl opacity-50">{currentItem.hintIcon}</div>
                  )}
                  <h1 className="text-7xl font-black text-gray-900 tracking-tight text-center">
                    {currentItem.label}
                  </h1>
                  <AudioButton text={currentItem.audioText} size={56} />
                </div>

                <button
                  onClick={handleStartDrawing}
                  className="w-full max-w-sm py-6 bg-primary text-white rounded-[2rem] text-3xl font-black shadow-xl active:scale-95 transition-all mt-8"
                >
                  Draw this
                </button>
              </motion.div>
            )}

            {/* DRAW SCREEN */}
            {screen === "draw" && (
              <motion.div
                key="draw"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="fixed inset-0 z-50 bg-white flex flex-col"
              >
                {/* Floating Reminder Header */}
                <div className="absolute top-6 inset-x-0 flex justify-center z-20 pointer-events-none px-4">
                  <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-[2rem] shadow-xl border border-gray-100 flex items-center gap-4 pointer-events-auto">
                    <span className="text-3xl font-black text-gray-800 tracking-tight">{currentItem.label}</span>
                    <button 
                      onClick={() => playAudio(currentItem.audioText)}
                      className="p-3 bg-blue-50 text-blue-500 rounded-full active:scale-95 transition-transform"
                    >
                      <Volume2 size={24} />
                    </button>
                  </div>
                </div>
                
                {/* Full-bleed canvas */}
                <div className="flex-1 w-full h-full relative"> 
                  <LargeDrawingCanvas onDone={handleDoneDrawing} />
                </div>
              </motion.div>
            )}

            {/* CHECKING SCREEN */}
            {screen === "checking" && (
              <motion.div
                key="checking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center gap-8"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="w-32 h-32 border-[8px] border-primary/20 border-t-primary rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-primary">
                    <ImageIcon size={40} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-600 tracking-tight">Checking...</p>
              </motion.div>
            )}

            {/* RESULT SCREEN */}
            {screen === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col"
              >
                {isCorrect ? (
                  <div className="bg-emerald-50 text-emerald-700 py-6 px-4 rounded-3xl flex flex-col items-center justify-center mb-6 border border-emerald-100 shadow-sm">
                    <CheckCircle2 size={64} className="mb-2 text-emerald-500" />
                    <h2 className="text-3xl font-black text-center">{currentItem.encouragement}</h2>
                  </div>
                ) : (
                  <div className="bg-amber-50 text-amber-800 py-6 px-4 rounded-3xl flex flex-col items-center justify-center mb-6 border border-amber-100 shadow-sm">
                    <h2 className="text-3xl font-black text-center">Let's learn this word</h2>
                    <p className="text-xl mt-2 opacity-80">Here is the picture</p>
                  </div>
                )}

                {/* Main visual reference card */}
                <div className="flex-1 bg-white rounded-[2rem] shadow-md border border-gray-100 p-8 flex flex-col items-center justify-center gap-6 relative overflow-hidden">
                   {/* Huge reference image (emoji for now, acts as illustration) */}
                   <div className="text-[9rem] leading-none select-none filter drop-shadow-xl z-10">
                     {currentItem.referenceImage}
                   </div>
                   
                   <div className="flex items-center gap-6 z-10 mt-4">
                     <span className="text-5xl font-black text-gray-900 tracking-tight">{currentItem.label}</span>
                     <AudioButton text={currentItem.audioText} size={32} />
                   </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col gap-4">
                  {!isCorrect && (
                    <button
                      onClick={handleRetry}
                      className="w-full py-5 bg-white text-gray-700 border-2 border-gray-200 rounded-2xl text-2xl font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      <RefreshCw size={28} />
                      Try again
                    </button>
                  )}
                  
                  <button
                    onClick={handleNext}
                    className="w-full py-6 bg-primary text-white rounded-[2rem] text-2xl font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    Next word
                    <ArrowRight size={32} />
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}
