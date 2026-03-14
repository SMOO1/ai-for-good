"use client";

import React from "react";
import { motion } from "framer-motion";

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-background shadow-xl flex flex-col relative overflow-hidden">
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
};
