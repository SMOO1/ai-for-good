import { useState, useEffect } from 'react'
import NavTabs from './components/NavTabs'
import LearnTab from './components/LearnTab'
import DrawTab from './components/DrawTab'
import GalleryTab from './components/GalleryTab'
import QuizTab from './components/QuizTab'
import { LangProvider, useLang } from './LangContext'
import { WORDS } from './data/words'
import './App.css'

const LS = {
  GALLERY:    'rw_gallery',
  WORD_INDEX: 'rw_word_index',
  QUIZ_SCORE: 'rw_quiz_score',
}

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* quota */ }
}

function AppInner() {
  const { t, toggle } = useLang()
  const [activeTab,    setActiveTab]    = useState('learn')
  const [currentIndex, setCurrentIndex] = useState(() => load(LS.WORD_INDEX, 0))
  const [drawings,     setDrawings]     = useState(() => load(LS.GALLERY, []))
  const [quizScore,    setQuizScore]    = useState(() => load(LS.QUIZ_SCORE, { correct: 0, wrong: 0 }))

  useEffect(() => { save(LS.WORD_INDEX, currentIndex) }, [currentIndex])

  function handleSaveDrawing(item) {
    const next = [item, ...drawings]
    setDrawings(next)
    save(LS.GALLERY, next)
  }

  function handleDeleteDrawing(index) {
    const next = drawings.filter((_, i) => i !== index)
    setDrawings(next)
    save(LS.GALLERY, next)
  }

  function handleQuizScore(next) {
    setQuizScore(next)
    save(LS.QUIZ_SCORE, next)
  }

  return (
    <div className="app">
      {/* Splash screen */}
      <div className="splash" aria-hidden="true">
        <div className="splash__icon">📚</div>
        <div className="splash__title">Rohingya Words</div>
        <div className="splash__tagline">Learn. Draw. Remember.</div>
      </div>

      <header className="app-header">
        <span className="app-header__icon">🌟</span>
        <h1>Rohingya Words</h1>
        <button className="lang-toggle" onClick={toggle}>{t.langToggle}</button>
      </header>

      <main className="app-content">
        {activeTab === 'learn' && (
          <LearnTab
            words={WORDS}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            onGoToDraw={() => setActiveTab('draw')}
          />
        )}
        {activeTab === 'draw' && (
          <DrawTab
            words={WORDS}
            onSaveDrawing={handleSaveDrawing}
          />
        )}
        {activeTab === 'gallery' && (
          <GalleryTab
            drawings={drawings}
            onDeleteDrawing={handleDeleteDrawing}
          />
        )}
        {activeTab === 'quiz' && (
          <QuizTab
            words={WORDS}
            score={quizScore}
            onScoreChange={handleQuizScore}
          />
        )}
      </main>

      <NavTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        drawingCount={drawings.length}
      />
    </div>
  )
}

export default function App() {
  return (
    <LangProvider>
      <AppInner />
    </LangProvider>
  )
}
