"use client";

import React, { useRef, useState, useEffect } from "react";
import { Eraser, Pencil, Trash2, Check } from "lucide-react";

interface LargeDrawingCanvasProps {
  onDone: (imageData: string) => void;
}

export const LargeDrawingCanvas = ({ onDone }: LargeDrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const resizeCanvas = () => {
      // Set actual internal canvas resolution to match its displayed size
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      // Reset context properties after resize
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = 6;
      context.strokeStyle = "#1F2937"; // text-gray-800
    };

    resizeCanvas();
    setCtx(context);
    
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!ctx) return;
    setIsDrawing(true);
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !ctx) return;
    e.preventDefault(); // Prevent scrolling on touch
    const pos = getPos(e);
    
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 30;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = 8;
      ctx.strokeStyle = "#1F2937";
    }

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (ctx) ctx.closePath();
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const handleDone = () => {
    if (!canvasRef.current) return;
    onDone(canvasRef.current.toDataURL("image/png"));
  };

  return (
    <div className="flex flex-col w-full h-full bg-white overflow-hidden relative">
      {/* Canvas Area - Dominates the screen */}
      <div 
        ref={containerRef}
        className="flex-1 relative touch-none bg-gray-50/50"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
          style={{ touchAction: 'none' }} // Crucial for mobile drawing
        />
      </div>
      
      {/* Compact Toolbar */}
      <div className="flex justify-between items-center px-4 py-4 md:px-8 bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-10 pb-8 md:pb-6">
        <div className="flex gap-3">
          <button
            onClick={() => setTool("pen")}
            className={`p-4 rounded-2xl transition-all flex items-center justify-center ${
              tool === "pen" 
                ? "bg-gray-900 text-white shadow-md scale-105" 
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            <Pencil size={28} />
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`p-4 rounded-2xl transition-all flex items-center justify-center ${
              tool === "eraser" 
                ? "bg-gray-900 text-white shadow-md scale-105" 
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            <Eraser size={28} />
          </button>
          <button
            onClick={clearCanvas}
            className="p-4 rounded-2xl bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <Trash2 size={28} />
          </button>
        </div>
        
        <button
          onClick={handleDone}
          className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xl shadow-lg active:scale-95 flex items-center gap-2 transition-transform"
        >
          <Check size={28} />
          Done
        </button>
      </div>
    </div>
  );
};
