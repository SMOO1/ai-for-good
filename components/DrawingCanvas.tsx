"use client";

import React, { useRef, useState, useEffect } from "react";
import { Eraser, Pencil, Trash2, Check } from "lucide-react";

interface DrawingCanvasProps {
  onDone: (imageData: string) => void;
}

export const DrawingCanvas = ({ onDone }: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Set canvas size based on parent container
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.lineWidth = 5;
        context.strokeStyle = "#000000";
      }
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
    const pos = getPos(e);
    
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 20;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#000000";
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
      clientX = e.clientX;
      clientY = e.clientY;
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
    onDone(canvasRef.current.toDataURL());
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-inner border-2 border-dashed border-gray-200 overflow-hidden">
      <div className="flex-1 relative touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair"
        />
      </div>
      
      <div className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-100">
        <div className="flex gap-4">
          <button
            onClick={() => setTool("pen")}
            className={`p-4 rounded-full transition-all ${
              tool === "pen" ? "bg-primary text-white scale-110 shadow-lg" : "bg-white text-gray-500 shadow-sm"
            }`}
          >
            <Pencil size={28} />
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`p-4 rounded-full transition-all ${
              tool === "eraser" ? "bg-primary text-white scale-110 shadow-lg" : "bg-white text-gray-500 shadow-sm"
            }`}
          >
            <Eraser size={28} />
          </button>
          <button
            onClick={clearCanvas}
            className="p-4 rounded-full bg-white text-gray-500 shadow-sm active:scale-95"
          >
            <Trash2 size={28} />
          </button>
        </div>
        
        <button
          onClick={handleDone}
          className="px-8 py-4 bg-green-500 text-white rounded-full font-bold text-xl shadow-lg active:scale-95 flex items-center gap-2"
        >
          <Check size={28} />
          Done
        </button>
      </div>
    </div>
  );
};
