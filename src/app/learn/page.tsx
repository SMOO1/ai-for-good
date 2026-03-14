'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'

import AppLayout from '@/components/AppLayout'
import DrawingCanvas from '@/components/DrawingCanvas'
import WordCard from '@/components/WordCard'
import PhraseCard from '@/components/PhraseCard'
import PatternBuilder from '@/components/PatternBuilder'
import SentenceCard from '@/components/SentenceCard'
import ScenarioDialogue from '@/components/ScenarioDialogue'

import { SCENARIOS } from '@/data/scenarios'
import { VOCABULARY } from '@/data/vocabulary'

type Step = 'draw' | 'word' | 'phrase' | 'pattern' | 'sentence' | 'situation'
const STEPS: Step[] = ['draw', 'word', 'phrase', 'pattern', 'sentence', 'situation']

const STEP_LABELS: Record<Step, string> = {
  draw: 'Draw', word: 'Word', phrase: 'Phrase',
  pattern: 'Pattern', sentence: 'Sentence', situation: 'Practice',
}

const SWIPE_DIST = 50   // px minimum to count as a swipe
const SWIPE_VEL  = 300  // px/s minimum velocity

type AnimDir = { x: number; y: number }

export default function LearnPage() {
  const router = useRouter()
  const [wordIndex, setWordIndex] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  const [anim, setAnim] = useState<AnimDir>({ x: 1, y: 0 })

  const scenario = SCENARIOS[wordIndex]
  const vocab = VOCABULARY.find(v => v.id === scenario.vocabId)
  const referenceEmoji = vocab?.referenceEmoji ?? scenario.topicIcon
  const currentStep = STEPS[stepIndex]

  // ── Navigation helpers ──────────────────────────────────────────────────────

  const goNextStage = useCallback(() => {
    setAnim({ x: 1, y: 0 })
    if (stepIndex < STEPS.length - 1) setStepIndex(i => i + 1)
  }, [stepIndex])

  const goPrevStage = useCallback(() => {
    if (stepIndex === 0) return
    setAnim({ x: -1, y: 0 })
    setStepIndex(i => i - 1)
  }, [stepIndex])

  const goNextWord = useCallback(() => {
    if (wordIndex >= SCENARIOS.length - 1) return
    setAnim({ x: 0, y: 1 })
    setWordIndex(i => i + 1)
    setStepIndex(0)
    setFinished(false)
  }, [wordIndex])

  const goPrevWord = useCallback(() => {
    if (wordIndex === 0) return
    setAnim({ x: 0, y: -1 })
    setWordIndex(i => i - 1)
    setStepIndex(0)
    setFinished(false)
  }, [wordIndex])

  const advance = useCallback(() => {
    if (finished) return
    if (stepIndex < STEPS.length - 1) {
      setAnim({ x: 1, y: 0 })
      setStepIndex(i => i + 1)
    }
  }, [stepIndex, finished])

  const handleFinished = useCallback(() => setFinished(true), [])

  // ── Keyboard navigation ─────────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNextStage()
      if (e.key === 'ArrowLeft')  goPrevStage()
      if (e.key === 'ArrowDown')  goNextWord()
      if (e.key === 'ArrowUp')    goPrevWord()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNextStage, goPrevStage, goNextWord, goPrevWord])

  // ── Swipe/pan handler ───────────────────────────────────────────────────────

  const handlePanEnd = useCallback((_e: PointerEvent, info: PanInfo) => {
    // Don't intercept drawing gestures
    if (currentStep === 'draw') return

    const { offset, velocity } = info
    const absX = Math.abs(offset.x)
    const absY = Math.abs(offset.y)

    if (absX >= absY) {
      // Horizontal swipe → stage navigation
      if (absX > SWIPE_DIST || Math.abs(velocity.x) > SWIPE_VEL) {
        if (offset.x < 0) goNextStage()
        else goPrevStage()
      }
    } else {
      // Vertical swipe → word navigation
      if (absY > SWIPE_DIST || Math.abs(velocity.y) > SWIPE_VEL) {
        if (offset.y < 0) goNextWord()
        else goPrevWord()
      }
    }
  }, [currentStep, goNextStage, goPrevStage, goNextWord, goPrevWord])

  // ── Derived state ───────────────────────────────────────────────────────────

  const isFirstStep = stepIndex === 0
  const isLastStep  = stepIndex === STEPS.length - 1
  const isFirstWord = wordIndex === 0
  const isLastWord  = wordIndex === SCENARIOS.length - 1

  const cardKey = `${wordIndex}-${finished ? 'done' : currentStep}`

  return (
    <AppLayout>
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center px-4 pt-3 pb-2 gap-3 flex-shrink-0">
        <button
          onClick={() => router.push('/')}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0"
          aria-label="Home"
        >
          ←
        </button>

        {/* Horizontal stage dots */}
        <div className="flex-1 flex items-center justify-center gap-1.5">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => { setAnim({ x: i > stepIndex ? 1 : -1, y: 0 }); setStepIndex(i); setFinished(false) }}
              className={`rounded-full transition-all duration-200 ${
                i === stepIndex && !finished
                  ? 'w-6 h-2.5 bg-primary'
                  : i < stepIndex || finished
                  ? 'w-2.5 h-2.5 bg-primary opacity-50'
                  : 'w-2.5 h-2.5 bg-gray-200'
              }`}
              aria-label={STEP_LABELS[s]}
            />
          ))}
        </div>

        {/* Word counter + icon */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-xs font-bold text-gray-400 tabular-nums">
            {wordIndex + 1}/{SCENARIOS.length}
          </span>
          <span className="text-lg">{scenario.topicIcon}</span>
        </div>
      </div>

      {/* Stage label pill */}
      {!finished && (
        <div className="flex justify-center pb-2 flex-shrink-0">
          <span className="text-xs font-semibold bg-primary text-white px-3 py-1 rounded-full uppercase tracking-wider">
            {STEP_LABELS[currentStep]}
          </span>
        </div>
      )}

      {/* ── Swipeable card area ───────────────────────────────────────────── */}
      <motion.div
        className="flex flex-col flex-1 overflow-hidden touch-pan-y"
        onPanEnd={handlePanEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={cardKey}
            initial={{ opacity: 0, x: anim.x * 60, y: anim.y * 60 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: anim.x * -40, y: anim.y * -40 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex flex-col flex-1"
          >
            {finished ? (
              /* ── Completion card ───────────────────────────────────────── */
              <div className="flex flex-col items-center justify-center flex-1 gap-6 px-8 py-8">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 220, delay: 0.1 }}
                  className="text-8xl"
                >
                  🎉
                </motion.span>
                <div className="text-center">
                  <h2 className="text-3xl font-extrabold text-gray-900">Well done!</h2>
                  <p className="mt-1 text-sm text-gray-400">You learned to say:</p>
                  <p className="mt-3 text-xl font-bold text-primary bg-primary-light rounded-2xl px-5 py-3">
                    {scenario.sentence}
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <button
                    onClick={() => { setStepIndex(0); setFinished(false) }}
                    className="bg-primary-light text-primary rounded-2xl py-3 px-6 text-base font-bold w-full border-2 border-primary"
                  >
                    🔁 Practice Again
                  </button>
                  {!isLastWord && (
                    <button
                      onClick={goNextWord}
                      className="bg-primary text-white rounded-2xl py-3 px-6 text-base font-bold w-full"
                    >
                      Next Word →
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-300">or swipe ↑ for next word</p>
              </div>
            ) : (
              /* ── Active lesson step ────────────────────────────────────── */
              <>
                {currentStep === 'draw' && (
                  <DrawingCanvas
                    word={scenario.word}
                    referenceEmoji={referenceEmoji}
                    onComplete={advance}
                  />
                )}
                {currentStep === 'word' && (
                  <WordCard scenario={scenario} onNext={advance} />
                )}
                {currentStep === 'phrase' && (
                  <PhraseCard scenario={scenario} onNext={advance} />
                )}
                {currentStep === 'pattern' && (
                  <PatternBuilder scenario={scenario} onNext={advance} />
                )}
                {currentStep === 'sentence' && (
                  <SentenceCard scenario={scenario} onNext={advance} />
                )}
                {currentStep === 'situation' && (
                  <ScenarioDialogue scenario={scenario} onComplete={handleFinished} />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── Desktop / fallback nav arrows ────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white flex-shrink-0">
        {/* Stage nav */}
        <div className="flex items-center gap-2">
          <button
            onClick={goPrevStage}
            disabled={isFirstStep || finished}
            className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-lg
              disabled:opacity-25 active:scale-95 hover:bg-gray-200 transition-all"
            aria-label="Previous stage"
          >
            ←
          </button>
          <span className="text-xs text-gray-400 font-medium w-16 text-center leading-tight">
            {finished ? '✅ done' : STEP_LABELS[currentStep]}
          </span>
          <button
            onClick={goNextStage}
            disabled={isLastStep || finished}
            className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-lg
              disabled:opacity-25 active:scale-95 hover:bg-gray-200 transition-all"
            aria-label="Next stage"
          >
            →
          </button>
        </div>

        {/* Vertical word dots */}
        <div className="flex items-center gap-1">
          {SCENARIOS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setAnim({ x: 0, y: i > wordIndex ? 1 : -1 })
                setWordIndex(i)
                setStepIndex(0)
                setFinished(false)
              }}
              className={`rounded-full transition-all duration-200 ${
                i === wordIndex
                  ? 'w-2.5 h-2.5 bg-primary'
                  : 'w-1.5 h-1.5 bg-gray-300'
              }`}
              aria-label={SCENARIOS[i].topicLabel}
            />
          ))}
        </div>

        {/* Word nav */}
        <div className="flex items-center gap-2">
          <button
            onClick={goPrevWord}
            disabled={isFirstWord}
            className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-lg
              disabled:opacity-25 active:scale-95 hover:bg-gray-200 transition-all"
            aria-label="Previous word"
          >
            ↑
          </button>
          <button
            onClick={goNextWord}
            disabled={isLastWord}
            className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-lg
              disabled:opacity-25 active:scale-95 hover:bg-primary/90 transition-all"
            aria-label="Next word"
          >
            ↓
          </button>
        </div>
      </div>

      {/* Swipe hint (shown briefly on first load) */}
      <SwipeHint />
    </AppLayout>
  )
}

function SwipeHint() {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2800)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-20 left-0 right-0 flex justify-center pointer-events-none"
        >
          <div className="bg-gray-800/80 text-white text-xs font-medium px-4 py-2 rounded-full flex items-center gap-3">
            <span>← → stage</span>
            <span className="text-gray-400">|</span>
            <span>↑ ↓ word</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
