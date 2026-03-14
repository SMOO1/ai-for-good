import { useState, useMemo } from 'react'
import { CATEGORIES } from '../data/words'
import { useTTS } from '../hooks/useTTS'

export default function LearnTab({ words, currentIndex, setCurrentIndex, onGoToDraw }) {
  const [activeCat, setActiveCat] = useState('all')
  const { speak } = useTTS()

  const filtered = useMemo(
    () => activeCat === 'all' ? words : words.filter(w => w.cat === activeCat),
    [words, activeCat]
  )

  // Clamp index when category changes
  const safeIndex = Math.min(currentIndex, filtered.length - 1)
  const word = filtered[safeIndex] ?? filtered[0]

  function changeCategory(cat) {
    setActiveCat(cat)
    setCurrentIndex(0)
  }

  function prev() {
    setCurrentIndex(i => (Math.min(i, filtered.length - 1) - 1 + filtered.length) % filtered.length)
  }

  function next() {
    setCurrentIndex(i => (Math.min(i, filtered.length - 1) + 1) % filtered.length)
  }

  const progress = filtered.length > 1 ? ((safeIndex) / (filtered.length - 1)) * 100 : 100

  return (
    <div className="learn-tab">
      {/* Progress bar */}
      <div className="progress-bar" role="progressbar" aria-valuenow={safeIndex + 1} aria-valuemax={filtered.length}>
        <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Category filter */}
      <div className="cat-filter">
        {['all', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            className={`cat-pill${activeCat === cat ? ' cat-pill--active' : ''}`}
            onClick={() => changeCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Word card */}
      <div className="word-card">
        <div className="word-card__emoji">{word.emoji}</div>
        <div className="word-card__en">{word.en}</div>
        <div className="word-card__roh">{word.roh}</div>
        <span className="word-card__badge">{word.cat}</span>
      </div>

      {/* Navigation */}
      <div className="word-nav">
        <button className="btn btn--ghost btn--sm" onClick={prev}>◀ Prev</button>
        <span className="word-nav__counter">{safeIndex + 1} / {filtered.length}</span>
        <button className="btn btn--ghost btn--sm" onClick={next}>Next ▶</button>
      </div>

      {/* TTS buttons */}
      <div className="tts-row">
        <button
          className="btn btn--ghost btn--sm"
          style={{ flex: 1 }}
          onClick={() => speak(word.roh, 0.7)}
        >
          🔊 Rohingya
        </button>
        <button
          className="btn btn--ghost btn--sm"
          style={{ flex: 1 }}
          onClick={() => speak(word.en, 0.8)}
        >
          🔊 English
        </button>
      </div>

      {/* Draw it button */}
      <div className="learn-draw-btn">
        <button className="btn btn--primary" onClick={onGoToDraw}>
          Draw it ✏️
        </button>
      </div>
    </div>
  )
}
