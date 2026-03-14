import { useEffect, useState, useMemo } from 'react'
import { useDrawing } from '../hooks/useDrawing'
import { checkDrawing } from '../utils/checkDrawing'
import { CATEGORIES } from '../data/words'
import { useLang } from '../LangContext'
import { CAT_KEYS } from '../i18n'

const COLORS = ['#000000', '#e53e3e', '#1D9E75', '#3182ce', '#dd6b20', '#d53f8c']

const PHASE = {
  DRAW:     'draw',
  CHECKING: 'checking',
  PASS:     'pass',
  FAIL:     'fail',
}

const HINT = { NONE: 0, SILHOUETTE: 1, COLOR: 2 }

export default function DrawTab({ words, onSaveDrawing }) {
  const {
    canvasRef, color, setColor, brushSize, setBrushSize,
    isEraser, setIsEraser, hasStrokes,
    initCanvas, startDraw, draw, endDraw, clearCanvas, getDataURL,
  } = useDrawing()
  const { t } = useLang()

  const [activeCat, setActiveCat] = useState('all')
  const [poolIndex, setPoolIndex] = useState(0)
  const [phase,    setPhase]    = useState(PHASE.DRAW)
  const [aiMsg,    setAiMsg]    = useState('')
  const [savedMsg, setSavedMsg] = useState(false)
  const [hint,     setHint]     = useState(HINT.NONE)

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
            {t[CAT_KEYS[cat]]}
          </button>
        ))}
      </div>

      {/* Word prompt */}
      <div className={`draw-word-prompt ${!isDrawing ? 'draw-word-prompt--hidden' : ''}`}>
        <div className="draw-word-prompt__label">{t.drawPrompt}</div>
        <div className="draw-word-prompt__word">{word.en}</div>
        {hint === HINT.SILHOUETTE && (
          <div className="draw-hint">
            <span className="hint-silhouette">{word.emoji}</span>
          </div>
        )}
        {hint === HINT.COLOR && (
          <div className="draw-hint draw-hint--color">{word.emoji}</div>
        )}
        {isDrawing && hint < HINT.COLOR && (
          <div className="draw-hint-btns">
            <button className="btn btn--hint" onClick={() => setHint(h => h + 1)}>
              {t.hint(hint + 1)}
            </button>
          </div>
        )}
      </div>

      {/* Result banners */}
      {phase === PHASE.CHECKING && (
        <div className="draw-result draw-result--checking">
          <span className="draw-result__spinner">⏳</span> {t.checking}
        </div>
      )}
      {phase === PHASE.PASS && (
        <div className="draw-result draw-result--pass">
          <div className="draw-result__reveal">{word.emoji}</div>
          <div className="draw-result__title">{t.passTitle(word.en)}</div>
          <div className="draw-result__msg">{aiMsg}</div>
          <div className="draw-result__actions">
            <button className="btn btn--primary" onClick={handleSave}>{t.saveGallery}</button>
            <button className="btn btn--ghost" onClick={goNext}>{t.skip}</button>
          </div>
        </div>
      )}
      {phase === PHASE.FAIL && (
        <div className="draw-result draw-result--fail">
          <div className="draw-result__title">{t.failTitle}</div>
          <div className="draw-result__msg">{aiMsg}</div>
          <div className="draw-result__actions">
            <button className="btn btn--primary" onClick={() => { clearCanvas(); setPhase(PHASE.DRAW) }}>
              {t.tryAgain}
            </button>
            <button className="btn btn--ghost" onClick={goNext}>{t.nextWord}</button>
          </div>
        </div>
      )}

      {/* Canvas */}
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

      {/* Toolbar */}
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
            <button className="btn btn--ghost" onClick={goPrev}>{t.prev}</button>
            <button className="btn btn--ghost" onClick={clearCanvas}>{t.clear}</button>
            <button className="btn btn--ghost" onClick={goNext}>{t.next}</button>
            <button className="btn btn--primary" onClick={handleCheck} disabled={!hasStrokes}>
              {t.checkBtn}
            </button>
          </div>
        </>
      )}

      {savedMsg && <div className="toast">💾 Saved to gallery!</div>}
    </div>
  )
}
