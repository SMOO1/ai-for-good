import { useRef, useState, useCallback } from 'react'

export function useDrawing() {
  const canvasRef    = useRef(null)
  const isDrawingRef = useRef(false)
  const lastPosRef   = useRef({ x: 0, y: 0 })

  const [color,      setColor]      = useState('#000000')
  const [brushSize,  setBrushSize]  = useState(8)
  const [isEraser,   setIsEraser]   = useState(false)
  const [hasStrokes, setHasStrokes] = useState(false)

  function initCanvas() {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr  = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width  = rect.width  * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, rect.width, rect.height)
    setHasStrokes(false)
  }

  const getPos = useCallback((e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const src  = e.touches ? e.touches[0] : e
    // ctx.scale(dpr, dpr) is already applied, so use CSS pixel coords directly
    return {
      x: src.clientX - rect.left,
      y: src.clientY - rect.top,
    }
  }, [])

  const startDraw = useCallback((e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    isDrawingRef.current = true
    lastPosRef.current   = getPos(e, canvas)
  }, [getPos])

  const draw = useCallback((e) => {
    e.preventDefault()
    if (!isDrawingRef.current) return
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    const pos    = getPos(e, canvas)

    ctx.beginPath()
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = isEraser ? '#FFFFFF' : color
    ctx.lineWidth   = brushSize
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
    ctx.stroke()
    lastPosRef.current = pos
    setHasStrokes(true)
  }, [color, brushSize, isEraser, getPos])

  const endDraw = useCallback((e) => {
    e?.preventDefault()
    isDrawingRef.current = false
  }, [])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr  = window.devicePixelRatio || 1
    const ctx  = canvas.getContext('2d')
    const w    = canvas.width  / dpr
    const h    = canvas.height / dpr
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, w, h)
    setHasStrokes(false)
    setIsEraser(false)
  }, [])

  const getDataURL = useCallback(() =>
    canvasRef.current?.toDataURL('image/png') ?? null
  , [])

  return {
    canvasRef,
    color,    setColor,
    brushSize, setBrushSize,
    isEraser,  setIsEraser,
    hasStrokes,
    initCanvas, startDraw, draw, endDraw,
    clearCanvas, getDataURL,
  }
}
