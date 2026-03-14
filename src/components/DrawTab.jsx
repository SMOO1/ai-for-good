import { useEffect, useState } from 'react'
import { useDrawing } from '../hooks/useDrawing'

const COLORS = ['#000000', '#e53e3e', '#1D9E75', '#3182ce', '#dd6b20', '#d53f8c']

export default function DrawTab({ words, currentIndex, onSaveDrawing }) {
  const {
    canvasRef, color, setColor, brushSize, setBrushSize,
    isEraser, setIsEraser, hasStrokes,
    initCanvas, startDraw, draw, endDraw, clearCanvas, getDataURL,
  } = useDrawing()

  const [showToast, setShowToast] = useState(false)
  const word = words[Math.min(currentIndex, words.length - 1)]

  useEffect(() => {
    // Small timeout to let layout complete before reading getBoundingClientRect
    const id = setTimeout(initCanvas, 50)
    return () => clearTimeout(id)
  }, [])

  function handleSave() {
    if (!hasStrokes) return
    const img = getDataURL()
    onSaveDrawing({
      en:        word.en,
      roh:       word.roh,
      emoji:     word.emoji,
      img,
      timestamp: Date.now(),
    })
    clearCanvas()
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  return (
    <div className="draw-tab">
      {/* Mini word card */}
      <div className="mini-word-card">
        <span className="mini-word-card__emoji">{word.emoji}</span>
        <div>
          <div className="mini-word-card__en">{word.en}</div>
          <div className="mini-word-card__roh">{word.roh}</div>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
        style={{ touchAction: 'none' }}
      />

      <div className="draw-toolbar">
        {/* Colors + eraser */}
        <div className="color-row">
          {COLORS.map(c => (
            <button
              key={c}
              className={`color-dot${!isEraser && color === c ? ' color-dot--selected' : ''}`}
              style={{ background: c }}
              onClick={() => { setColor(c); setIsEraser(false) }}
              aria-label={`Color ${c}`}
            />
          ))}
          <button
            className={`eraser-btn${isEraser ? ' eraser-btn--active' : ''}`}
            onClick={() => setIsEraser(e => !e)}
          >
            ⬜ Eraser
          </button>
        </div>

        {/* Brush size */}
        <div className="brush-row">
          <span className="brush-label">Size</span>
          <input
            type="range"
            className="brush-slider"
            min={2}
            max={24}
            value={brushSize}
            onChange={e => setBrushSize(Number(e.target.value))}
          />
          <div className="brush-preview">
            <span style={{
              width:        brushSize,
              height:       brushSize,
              borderRadius: '50%',
              display:      'inline-block',
              background:   isEraser ? '#ccc' : color,
            }} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="draw-actions">
        <button className="btn btn--ghost" onClick={clearCanvas}>🗑️ Clear</button>
        <button className="btn btn--primary" onClick={handleSave} disabled={!hasStrokes}>
          ✓ Save to Gallery
        </button>
      </div>

      {showToast && <div className="toast">✓ Saved to gallery!</div>}
    </div>
  )
}
