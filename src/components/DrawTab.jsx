import { useEffect, useState, useMemo } from 'react'
import { useDrawing } from '../hooks/useDrawing'
import { checkDrawing } from '../utils/checkDrawing'
import { CATEGORIES } from '../data/words'

const COLORS = ['#000000', '#e53e3e', '#1D9E75', '#3182ce', '#dd6b20', '#d53f8c']

// Draw phase states
const PHASE = {
  DRAW:    'draw',    // blank canvas, word shown as text only
  CHECKING:'checking',// waiting for Claude
  PASS:    'pass',    // Claude said YES → reveal emoji, offer save
  FAIL:    'fail',    // Claude said NO  → try again or skip
}

// Hint levels: 0 = word only, 1 = silhouette emoji, 2 = colour emoji
const HINT = { NONE: 0, SILHOUETTE: 1, COLOR: 2 }

export default function DrawTab({ words, onSaveDrawing }) {
  const {
    canvasRef, color, setColor, brushSize, setBrushSize,
    isEraser, setIsEraser, hasStrokes,
    initCanvas, startDraw, draw, endDraw, clearCanvas, getDataURL,
  } = useDrawing()

  const [activeCat, setActiveCat] = useState('all')
  const [poolIndex, setPoolIndex] = useState(0)
  const [phase,   setPhase]   = useState(PHASE.DRAW)
  const [aiMsg,   setAiMsg]   = useState('')
  const [savedMsg, setSavedMsg] = useState(false)
  const [hint,    setHint]    = useState(HINT.NONE)

  const pool = useMemo(
    () => activeCat === 'all' ? words : words.filter(w => w.cat === activeCat),
    [words, activeCat]
  )

  const word = pool[Math.min(poolIndex, pool.length - 1)]

  function handleCategoryChange(cat) {
    setActiveCat(cat)
    setPoolIndex(0)
    clearCanvas()
    setPhase(PHASE.DRAW)
    setAiMsg('')
    setHint(HINT.NONE)
  }

  function goNext() {
    setPoolIndex(i => (i + 1) % pool.length)
    clearCanvas()
    setPhase(PHASE.DRAW)
    setAiMsg('')
    setHint(HINT.NONE)
  }

  function goPrev() {
    setPoolIndex(i => (i - 1 + pool.length) % pool.length)
    clearCanvas()
    setPhase(PHASE.DRAW)
    setAiMsg('')
    setHint(HINT.NONE)
  }

  // Re-initialise canvas when word changes
  useEffect(() => {
    const id = setTimeout(initCanvas, 50)
    return () => clearTimeout(id)
  }, [poolIndex, activeCat])

  function handleCheck() {
    const dataURL = getDataURL()
    if (!dataURL || !hasStrokes) return
    setPhase(PHASE.CHECKING)
    checkDrawing(dataURL, word.en)
      .then(({ passed, message }) => {
        setAiMsg(message)
        setPhase(passed ? PHASE.PASS : PHASE.FAIL)
      })
      .catch(err => {
        setAiMsg(`Error: ${err.message}`)
        setPhase(PHASE.FAIL)
      })
  }

  function handleSave() {
    const dataURL = getDataURL()
    if (dataURL) {
      onSaveDrawing({ en: word.en, roh: word.roh, emoji: word.emoji, img: dataURL, timestamp: Date.now() })
      setSavedMsg(true)
      setTimeout(() => setSavedMsg(false), 2000)
    }
    goNext()
  }

  const isDrawing = phase === PHASE.DRAW

  // Silhouette = emoji rendered in black via CSS filter
  const silhouette = (
    <span className="hint-silhouette">{word.emoji}</span>
  )

  return (
    <div className="draw-tab">
      {/* Category filter */}
      <div className="cat-filter">
        {['all', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            className={`cat-pill${activeCat === cat ? ' cat-pill--active' : ''}`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Word prompt — word + progressive hint */}
      <div className={`draw-word-prompt ${!isDrawing ? 'draw-word-prompt--hidden' : ''}`}>
        <div className="draw-word-prompt__label">Draw this word:</div>
        <div className="draw-word-prompt__word">{word.en}</div>
        {hint === HINT.SILHOUETTE && (
          <div className="draw-hint draw-hint--silhouette">{silhouette}</div>
        )}
        {hint === HINT.COLOR && (
          <div className="draw-hint draw-hint--color">{word.emoji}</div>
        )}
        {isDrawing && hint < HINT.COLOR && (
          <div className="draw-hint-btns">
            <button
              className="btn btn--hint"
              onClick={() => setHint(h => h + 1)}
            >
              💡 Hint {hint + 1}
            </button>
          </div>
        )}
      </div>

      {/* Result banner (shown after AI check) */}
      {phase === PHASE.CHECKING && (
        <div className="draw-result draw-result--checking">
          <span className="draw-result__spinner">⏳</span> Checking your drawing…
        </div>
      )}
      {phase === PHASE.PASS && (
        <div className="draw-result draw-result--pass">
          <div className="draw-result__reveal">{word.emoji}</div>
          <div className="draw-result__title">✅ That looks like {word.en}!</div>
          <div className="draw-result__msg">{aiMsg}</div>
          <div className="draw-result__actions">
            <button className="btn btn--primary" onClick={handleSave}>💾 Save to Gallery</button>
            <button className="btn btn--ghost" onClick={goNext}>Skip →</button>
          </div>
        </div>
      )}
      {phase === PHASE.FAIL && (
        <div className="draw-result draw-result--fail">
          <div className="draw-result__title">❌ Not quite…</div>
          <div className="draw-result__msg">{aiMsg}</div>
          <div className="draw-result__actions">
            <button className="btn btn--primary" onClick={() => { clearCanvas(); setPhase(PHASE.DRAW) }}>
              Try again ↩
            </button>
            <button className="btn btn--ghost" onClick={goNext}>Next word →</button>
          </div>
        </div>
      )}

      {/* Canvas — always visible so drawing persists while result is shown */}
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        style={{ opacity: !isDrawing ? 0.5 : 1, pointerEvents: isDrawing ? 'auto' : 'none', touchAction: 'none' }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />

      {/* Toolbar — only interactive while drawing */}
      {isDrawing && (
        <>
          <div className="draw-toolbar">
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
            <div className="brush-row">
              <span className="brush-label">Size</span>
              <input
                type="range"
                className="brush-slider"
                min={2} max={24}
                value={brushSize}
                onChange={e => setBrushSize(Number(e.target.value))}
              />
              <div className="brush-preview">
                <span style={{
                  width: brushSize, height: brushSize, borderRadius: '50%',
                  display: 'inline-block',
                  background: isEraser ? '#ccc' : color,
                }} />
              </div>
            </div>
          </div>

          <div className="draw-actions">
            <button className="btn btn--ghost" onClick={goPrev}>← Prev</button>
            <button className="btn btn--ghost" onClick={clearCanvas}>🗑️ Clear</button>
            <button className="btn btn--ghost" onClick={goNext}>Next →</button>
            <button
              className="btn btn--primary"
              onClick={handleCheck}
              disabled={!hasStrokes}
            >
              ✓ Check
            </button>
          </div>
        </>
      )}

      {savedMsg && <div className="toast">💾 Saved to gallery!</div>}
    </div>
  )
}
