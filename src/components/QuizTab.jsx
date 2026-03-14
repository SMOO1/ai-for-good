import { useState, useMemo, useCallback } from 'react'
import { CATEGORIES } from '../data/words'
import { useTTS } from '../hooks/useTTS'

function pickOptions(correct, pool) {
  // 3 wrong English answers, shuffled with the correct one
  const others = pool
    .filter(w => w.en !== correct.en)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
  return [correct, ...others].sort(() => Math.random() - 0.5)
}

function pickQuestion(pool) {
  return pool[Math.floor(Math.random() * pool.length)]
}

export default function QuizTab({ words, score, onScoreChange }) {
  const [activeCat, setActiveCat]         = useState('all')
  const [answered,  setAnswered]          = useState(null)    // null | 'correct' | 'wrong'
  const [chosen,    setChosen]            = useState(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const { speak } = useTTS()

  const pool = useMemo(
    () => activeCat === 'all' ? words : words.filter(w => w.cat === activeCat),
    [words, activeCat]
  )

  const [question, setQuestion] = useState(() => pickQuestion(pool))

  // Options are English words — user reads Rohingya and picks meaning
  const options = useMemo(() => pickOptions(question, pool.length >= 4 ? pool : words), [question])

  const nextQuestion = useCallback(() => {
    setQuestion(pickQuestion(pool))
    setAnswered(null)
    setChosen(null)
  }, [pool])

  function handleAnswer(opt) {
    if (answered) return
    setChosen(opt)
    const correct = opt.en === question.en
    if (correct) {
      const next = { ...score, correct: score.correct + 1 }
      onScoreChange(next)
      setAnswered('correct')
      speak(`${question.en}. In Rohingya: ${question.roh}`, 0.85)
      if (next.correct % 5 === 0) {
        setTimeout(() => setShowCelebration(true), 400)
      }
    } else {
      onScoreChange({ ...score, wrong: score.wrong + 1 })
      setAnswered('wrong')
      speak(`${question.en}. In Rohingya: ${question.roh}`, 0.85)
    }
  }

  function handleCategoryChange(cat) {
    setActiveCat(cat)
    const newPool = cat === 'all' ? words : words.filter(w => w.cat === cat)
    setQuestion(pickQuestion(newPool))
    setAnswered(null)
    setChosen(null)
  }

  return (
    <div className="quiz-tab">
      {/* Score */}
      <div className="quiz-score">
        <span className="quiz-score__correct">✓ {score.correct}</span>
        <span className="quiz-score__wrong">✗ {score.wrong}</span>
      </div>

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

      {/* Question card — show Rohingya word */}
      <div className="quiz-card">
        <div className="quiz-card__arabic">{question.arabic}</div>
        <div className="quiz-card__roh">{question.roh}</div>
        <div className="quiz-card__prompt">What does this mean in English?</div>
      </div>

      {/* Options — English words */}
      <div className="quiz-options">
        {options.map(opt => {
          let cls = 'quiz-option quiz-option--en'
          if (answered) {
            if (opt.en === question.en) cls += ' quiz-option--correct'
            else if (chosen?.en === opt.en) cls += ' quiz-option--wrong'
          }
          return (
            <button
              key={opt.en}
              className={cls}
              onClick={() => handleAnswer(opt)}
              disabled={!!answered}
            >
              <span className="quiz-option__emoji">{opt.emoji}</span>
              <span className="quiz-option__en">{opt.en}</span>
            </button>
          )
        })}
      </div>

      {/* Feedback + next */}
      {answered && (
        <div className={`quiz-feedback quiz-feedback--${answered}`}>
          {answered === 'correct'
            ? `✓ "${question.roh}" means ${question.en}!`
            : `✗ It means "${question.en}" (${question.roh})`}
          <button className="btn btn--primary btn--sm" onClick={nextQuestion}>
            Next →
          </button>
        </div>
      )}

      {/* Celebration overlay */}
      {showCelebration && (
        <div className="celebration" onClick={() => setShowCelebration(false)}>
          <div className="celebration__card" onClick={e => e.stopPropagation()}>
            <div className="celebration__emoji">🎉</div>
            <div className="celebration__title">Amazing! {score.correct} correct!</div>
            <div className="celebration__sub">You&apos;re learning so fast!</div>
            <button
              className="btn btn--primary"
              onClick={() => { setShowCelebration(false); nextQuestion() }}
            >
              Keep going →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
