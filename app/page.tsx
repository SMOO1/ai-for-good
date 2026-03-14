"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { motion } from "framer-motion";
import { Volume2, Pencil, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { vocabulary } from "@/data/vocabulary";

export default function Home() {
  const [showHome, setShowHome] = useState(false);

  if (!showHome) {
    // Welcome Screen
    return (
      <AppShell>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white relative overflow-hidden">
          {/* Decorative background blobs */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 translate-x-1/2 translate-y-1/2"></div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-12 relative z-10"
          >
            <div className="w-32 h-32 bg-primary rounded-3xl flex items-center justify-center shadow-2xl mb-8 mx-auto">
              <Pencil size={64} className="text-white" />
            </div>
            <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">Draw to Link</h1>
            <p className="text-2xl text-gray-500 font-medium">Hear a word. Draw it. Learn it.</p>
          </motion.div>

          <div className="flex justify-center gap-8 mb-16 w-full max-w-sm relative z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="p-5 bg-blue-50 text-blue-500 rounded-full shadow-sm">
                <Volume2 size={36} />
              </div>
              <span className="font-bold text-gray-700 text-lg">Listen</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="p-5 bg-amber-50 text-amber-500 rounded-full shadow-sm">
                <Pencil size={36} />
              </div>
              <span className="font-bold text-gray-700 text-lg">Draw</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="p-5 bg-emerald-50 text-emerald-500 rounded-full shadow-sm">
                <BookOpen size={36} />
              </div>
              <span className="font-bold text-gray-700 text-lg">Learn</span>
            </div>
          </div>

          <button
            onClick={() => setShowHome(true)}
            className="w-full py-6 bg-primary text-white rounded-3xl text-3xl font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-4 relative z-10"
          >
            Start
            <ArrowRight size={36} />
          </button>
        </div>
      </AppShell>
    );
  }

  // Home / Practice Start Screen
  return (
    <AppShell>
      <div className="flex-1 flex flex-col p-6 gap-8 bg-gray-50 relative overflow-hidden">
        {/* Soft background shape */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

        <header className="flex justify-between items-center pt-6 relative z-10">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Practice</h2>
        </header>

        <div className="relative z-10 flex-1 flex flex-col justify-center gap-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Today's Words</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {vocabulary.slice(0, 5).map((item) => (
                <div key={item.id} className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl border border-gray-100 shadow-sm">
                  {item.icon}
                </div>
              ))}
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-xl font-bold text-gray-400 border border-gray-100 shadow-sm">
                +7
              </div>
            </div>
          </div>

          <Link href="/practice" className="block mt-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-primary p-12 rounded-[2.5rem] shadow-2xl text-white flex flex-col items-center gap-6 text-center"
            >
              <div className="bg-white/20 p-8 rounded-full">
                <Pencil size={80} className="text-white" />
              </div>
              <span className="text-4xl font-black tracking-tight">Start Practice</span>
            </motion.div>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
