import { useState, useMemo } from 'react'
import { CATEGORIES } from '../data/words'
import { useTTS } from '../hooks/useTTS'
import { useLang } from '../LangContext'
import { CAT_KEYS } from '../i18n'

export default function LearnTab({ words, currentIndex, setCurrentIndex, onGoToDraw }) {
  const [activeCat, setActiveCat] = useState('all')
  const { speak } = useTTS()
  const { t } = useLang()

  const filtered = useMemo(
    () => activeCat === 'all' ? words : words.filter(w => w.cat === activeCat),
    [words, activeCat]
  )

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
      <div className="progress-bar" role="progressbar" aria-valuenow={safeIndex + 1} aria-valuemax={filtered.length}>
        <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="cat-filter">
        {['all', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            className={`cat-pill${activeCat === cat ? ' cat-pill--active' : ''}`}
            onClick={() => changeCategory(cat)}
          >
            {t[CAT_KEYS[cat]]}
          </button>
        ))}
      </div>

      <div className="word-card">
        <div className="word-card__emoji">{word.emoji}</div>
        <div className="word-card__en">{word.en}</div>
        <div className="word-card__roh">{word.roh}</div>
        <span className="word-card__badge">{t[CAT_KEYS[word.cat]]}</span>
      </div>

      <div className="word-nav">
        <button className="btn btn--ghost btn--sm" onClick={prev}>◀ {t.prev.replace('← ', '')}</button>
        <span className="word-nav__counter">{t.wordOf(safeIndex + 1, filtered.length)}</span>
        <button className="btn btn--ghost btn--sm" onClick={next}>{t.next.replace(' →', '')} ▶</button>
      </div>

      <div className="tts-row">
        <button className="btn btn--ghost btn--sm" style={{ flex: 1 }} onClick={() => speak(word.roh, 0.7)}>
          🔊 Rohingya
        </button>
        <button className="btn btn--ghost btn--sm" style={{ flex: 1 }} onClick={() => speak(word.en, 0.8)}>
          🔊 English
        </button>
      </div>

      <div className="learn-draw-btn">
        <button className="btn btn--primary" onClick={onGoToDraw}>
          {t.drawIt}
        </button>
      </div>
    </div>
  )
}
