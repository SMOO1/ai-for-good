'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AudioButton from './AudioButton'
import { evalDrawing } from '@/lib/drawingRecognition'

interface DrawingCanvasProps {
  word: string
  referenceEmoji: string
  onComplete: (passed: boolean) => void
}

type Tool = 'pen' | 'eraser'
const COLORS = ['#000000', '#e53e3e', '#2563eb']

export default function DrawingCanvas({ word, referenceEmoji, onComplete }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasStrokes, setHasStrokes] = useState(false)
  const [color, setColor] = useState('#000000')
  const [tool, setTool] = useState<Tool>('pen')
  const [brushSize, setBrushSize] = useState(6)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<'passed' | 'failed' | null>(null)
  const [feedback, setFeedback] = useState('')
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  // Setup canvas with devicePixelRatio
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, rect.width, rect.height)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }
  }, [])

  const getPos = (e: React.MouseEvent | React.TouchEvent | TouchEvent | MouseEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      const touch = e.touches[0]
      if (!touch) return null
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
    } else {
      return { x: (e as MouseEvent).clientX - rect.left, y: (e as MouseEvent).clientY - rect.top }
    }
  }

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) e.preventDefault()
    const pos = getPos(e)
    if (!pos) return
    setIsDrawing(true)
    lastPos.current = pos
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) {
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2)
      ctx.fillStyle = tool === 'eraser' ? '#ffffff' : color
      ctx.fill()
    }
  }, [color, tool, brushSize])

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    if ('touches' in e) e.preventDefault()
    const pos = getPos(e)
    if (!pos || !lastPos.current) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color
    ctx.lineWidth = tool === 'eraser' ? brushSize * 3 : brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    lastPos.current = pos
    setHasStrokes(true)
  }, [isDrawing, color, tool, brushSize])

  const stopDraw = useCallback(() => {
    setIsDrawing(false)
    lastPos.current = null
  }, [])

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.getBoundingClientRect().width, canvas.getBoundingClientRect().height)
    setHasStrokes(false)
  }

  const handleDone = async () => {
    if (!hasStrokes) return
    const canvas = canvasRef.current
    if (!canvas) return
    setIsProcessing(true)
    const dataUrl = canvas.toDataURL('image/png')
    const { correct, feedback: fb } = await evalDrawing(dataUrl, word)
    setFeedback(fb)
    setIsProcessing(false)
    setResult(correct ? 'passed' : 'failed')
  }

  return (
    <div className="flex flex-col gap-3 px-4 pb-4 flex-1">
      {/* Prompt */}
      <div className="flex items-center justify-between bg-primary-light rounded-2xl p-3">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Draw this word:</p>
          <p className="text-3xl font-bold text-primary mt-0.5">{word}</p>
        </div>
        <AudioButton text={word} size="lg" />
      </div>

      {/* Canvas area */}
      <div className="relative rounded-2xl border-2 border-gray-200 overflow-hidden bg-white" style={{ height: '45vh' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none cursor-crosshair"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />

        {/* Processing overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center gap-3"
            >
              <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <p className="text-primary font-semibold">Checking...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result overlay */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 flex flex-col items-center justify-center gap-4 ${
                result === 'passed' ? 'bg-primary bg-opacity-90' : 'bg-amber-500 bg-opacity-90'
              }`}
            >
              {result === 'passed' ? (
                <>
                  <span className="text-6xl">🎨</span>
                  <p className="text-white text-2xl font-bold">Great drawing!</p>
                  {feedback && <p className="text-white/80 text-sm text-center px-4">{feedback}</p>}
                </>
              ) : (
                <>
                  <span className="text-8xl">{referenceEmoji}</span>
                  <p className="text-white text-2xl font-bold text-center px-4">Let&apos;s learn this! 📖</p>
                  {feedback && <p className="text-white/80 text-sm text-center px-4">{feedback}</p>}
                </>
              )}
              <button
                onClick={() => onComplete(result === 'passed')}
                className="bg-white text-primary font-bold rounded-2xl py-3 px-8 text-lg shadow-md mt-2"
              >
                Continue →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3">
        {/* Colors */}
        <div className="flex gap-2">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => { setColor(c); setTool('pen') }}
              className={`w-8 h-8 rounded-full border-2 transition-transform active:scale-90 ${
                color === c && tool === 'pen' ? 'border-primary scale-110' : 'border-gray-300'
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>

        {/* Eraser */}
        <button
          onClick={() => setTool('eraser')}
          className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
            tool === 'eraser' ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          ✏️ Erase
        </button>

        {/* Clear */}
        <button
          onClick={clearCanvas}
          className="ml-auto px-3 py-1.5 rounded-xl text-sm font-semibold bg-white text-gray-600 border border-gray-200"
        >
          🗑️ Clear
        </button>
      </div>

      {/* Brush size */}
      <div className="flex items-center gap-3 px-1">
        <span className="text-xs text-gray-500 w-16">Brush size</span>
        <input
          type="range"
          min={2}
          max={20}
          value={brushSize}
          onChange={e => setBrushSize(Number(e.target.value))}
          className="flex-1 accent-primary"
        />
        <div
          className="rounded-full bg-gray-800"
          style={{ width: brushSize, height: brushSize }}
        />
      </div>

      {/* Done button */}
      <button
        onClick={handleDone}
        disabled={isProcessing || !!result}
        className="bg-primary text-white rounded-2xl py-4 px-8 text-xl font-bold w-full disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
      >
        Done ✓
      </button>
    </div>
  )
}
