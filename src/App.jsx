import { useState, useEffect } from 'react'
import NavTabs from './components/NavTabs'
import LearnTab from './components/LearnTab'
import DrawTab from './components/DrawTab'
import GalleryTab from './components/GalleryTab'
import QuizTab from './components/QuizTab'
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

export default function App() {
  const [activeTab,     setActiveTab]     = useState('learn')
  const [currentIndex,  setCurrentIndex]  = useState(() => load(LS.WORD_INDEX, 0))
  const [drawings,      setDrawings]      = useState(() => load(LS.GALLERY, []))
  const [quizScore,     setQuizScore]     = useState(() => load(LS.QUIZ_SCORE, { correct: 0, wrong: 0 }))

  // Persist word index
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

  function goToDraw() {
    setActiveTab('draw')
  }

  return (
    <div className="app">
      {/* Splash screen — CSS animation removes it after 1.8s */}
      <div className="splash" aria-hidden="true">
        <div className="splash__icon">📚</div>
        <div className="splash__title">Rohingya Words</div>
        <div className="splash__tagline">Learn. Draw. Remember.</div>
      </div>

      <header className="app-header">
        <span className="app-header__icon">🌟</span>
        <h1>Rohingya Words</h1>
      </header>

      <main className="app-content">
        {activeTab === 'learn' && (
          <LearnTab
            words={WORDS}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            onGoToDraw={goToDraw}
          />
        )}
        {activeTab === 'draw' && (
          <DrawTab
            words={WORDS}
            currentIndex={currentIndex}
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
