'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'

import AppLayout from '@/components/AppLayout'
import DrawingCanvas from '@/components/DrawingCanvas'
import WordCard from '@/components/WordCard'
import PhraseCard from '@/components/PhraseCard'
import PatternBuilder from '@/components/PatternBuilder'
import SentenceCard from '@/components/SentenceCard'
import VideoDialogue from '@/components/VideoDialogue'

import { SCENARIOS } from '@/data/scenarios'
import { VOCABULARY } from '@/data/vocabulary'

type Step = 'draw' | 'word' | 'phrase' | 'pattern' | 'sentence' | 'situation'
const STEPS: Step[] = ['word', 'draw', 'phrase', 'pattern', 'sentence', 'situation']
const STEP_LABELS: Record<Step, string> = {
  draw: 'Draw', word: 'Word', phrase: 'Phrase',
  pattern: 'Pattern', sentence: 'Sentence', situation: 'Practice',
}

// Transition used for every card slide
const SLIDE = { type: 'tween' as const, duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }

// How many px / px·s to count as a swipe
const DIST = 45
const VEL  = 250

type Dir = { x: number; y: number }

export default function LearnPage() {
  const router = useRouter()

  const [wordIndex, setWordIndex] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const [finished,  setFinished]  = useState(false)
  const [dir, setDir] = useState<Dir>({ x: 1, y: 0 })

  // keep a ref so gesture handler always sees latest values
  const stateRef = useRef({ wordIndex, stepIndex, finished })
  useEffect(() => { stateRef.current = { wordIndex, stepIndex, finished } }, [wordIndex, stepIndex, finished])

  const scenario = SCENARIOS[wordIndex]
  const vocab    = VOCABULARY.find(v => v.id === scenario.vocabId)
  const refEmoji = vocab?.referenceEmoji ?? scenario.topicIcon
  const step     = STEPS[stepIndex]

  // ── Navigation ────────────────────────────────────────────────────────────

  const goNextStage = useCallback(() => {
    const { stepIndex: si, finished: fin } = stateRef.current
    if (fin || si >= STEPS.length - 1) return
    setDir({ x: 1, y: 0 })
    setStepIndex(si + 1)
  }, [])

  const goPrevStage = useCallback(() => {
    const { stepIndex: si } = stateRef.current
    if (si <= 0) return
    setDir({ x: -1, y: 0 })
    setStepIndex(si - 1)
  }, [])

  const goNextWord = useCallback(() => {
    const { wordIndex: wi } = stateRef.current
    setDir({ x: 0, y: 1 })
    setWordIndex((wi + 1) % SCENARIOS.length)
    setStepIndex(0)
    setFinished(false)
  }, [])

  const goPrevWord = useCallback(() => {
    const { wordIndex: wi } = stateRef.current
    setDir({ x: 0, y: -1 })
    setWordIndex((wi - 1 + SCENARIOS.length) % SCENARIOS.length)
    setStepIndex(0)
    setFinished(false)
  }, [])

  const advance = useCallback(() => {
    const { stepIndex: si, finished: fin } = stateRef.current
    if (fin) return
    if (si < STEPS.length - 1) { setDir({ x: 1, y: 0 }); setStepIndex(si + 1) }
  }, [])

  // ── Keyboard ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNextStage()
      if (e.key === 'ArrowLeft')  goPrevStage()
      if (e.key === 'ArrowDown')  goNextWord()
      if (e.key === 'ArrowUp')    goPrevWord()
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [goNextStage, goPrevStage, goNextWord, goPrevWord])

  // ── Swipe / drag handler ──────────────────────────────────────────────────

  const onPanEnd = useCallback((_e: PointerEvent, info: PanInfo) => {
    // Drawing canvas handles its own touch events — don't hijack
    if (stateRef.current.finished === false && step === 'draw') return

    const { offset, velocity } = info
    const absX = Math.abs(offset.x), absY = Math.abs(offset.y)

    if (absX >= absY) {
      // horizontal → stage
      if (absX > DIST || Math.abs(velocity.x) > VEL) {
        offset.x < 0 ? goNextStage() : goPrevStage()
      }
    } else {
      // vertical → word (Reels scroll)
      if (absY > DIST || Math.abs(velocity.y) > VEL) {
        offset.y < 0 ? goNextWord() : goPrevWord()
      }
    }
  }, [step, goNextStage, goPrevStage, goNextWord, goPrevWord])

  // ── Helpers ───────────────────────────────────────────────────────────────

  const isFirstStep = stepIndex === 0
  const isLastStep  = stepIndex === STEPS.length - 1
  // words always cycle — never disabled
  const isFirstWord = false
  const isLastWord  = false
  const cardKey     = `${wordIndex}-${finished ? 'done' : step}`

  // enter from / exit toward based on swipe direction
  const enterX = dir.x * 420, enterY = dir.y * 750
  const exitX  = dir.x * -420, exitY  = dir.y * -750

  return (
    <AppLayout>

      {/* ── Top HUD ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-1 flex-shrink-0 z-10">

        {/* Home */}
        <button
          onClick={() => router.push('/')}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0"
        >←</button>

        {/* Horizontal stage dots (tappable) */}
        <div className="flex-1 flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => {
                if (finished) { setFinished(false) }
                setDir({ x: i > stepIndex ? 1 : -1, y: 0 })
                setStepIndex(i)
              }}
              aria-label={STEP_LABELS[s]}
              className={`rounded-full transition-all duration-200 ${
                i === stepIndex && !finished
                  ? 'w-7 h-2.5 bg-primary'
                  : i < stepIndex || finished
                  ? 'w-2.5 h-2.5 bg-primary/50'
                  : 'w-2.5 h-2.5 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Word counter */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-xs font-bold text-gray-400 tabular-nums">{wordIndex + 1}/{SCENARIOS.length}</span>
          <span className="text-base">{scenario.topicIcon}</span>
        </div>
      </div>

      {/* Stage label */}
      {!finished && (
        <div className="flex justify-center pb-1.5 flex-shrink-0">
          <span className="text-[11px] font-bold bg-primary text-white px-3 py-0.5 rounded-full uppercase tracking-widest">
            {STEP_LABELS[step]}
          </span>
        </div>
      )}

      {/* ── Swipeable card ───────────────────────────────────────────────── */}
      <motion.div
        className="flex-1 overflow-hidden relative"
        onPanEnd={onPanEnd}
        style={{ touchAction: 'pan-y' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={cardKey}
            initial={{ x: enterX, y: enterY, opacity: 0 }}
            animate={{ x: 0,      y: 0,      opacity: 1, transition: SLIDE }}
            exit={{   x: exitX,  y: exitY,  opacity: 0, transition: SLIDE }}
            className="absolute inset-0 flex flex-col overflow-y-auto"
          >
            {finished ? (
              /* ── Completion ──────────────────────────────────────────── */
              <div className="flex flex-col items-center justify-center flex-1 gap-5 px-8 py-8">
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 220, delay: 0.1 }}
                  className="text-8xl"
                >🎉</motion.span>
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
                    className="bg-primary-light text-primary rounded-2xl py-3 px-6 font-bold border-2 border-primary"
                  >🔁 Practice Again</button>
                  <button
                    onClick={goNextWord}
                    className="bg-primary text-white rounded-2xl py-3 px-6 font-bold"
                  >Next Word →</button>
                </div>
                <p className="text-xs text-gray-300">or swipe ↑ for next word</p>
              </div>
            ) : (
              /* ── Lesson steps ────────────────────────────────────────── */
              <>
                {step === 'draw' && (
                  <DrawingCanvas word={scenario.word} referenceEmoji={refEmoji} onComplete={advance} />
                )}
                {step === 'word' && (
                  <WordCard scenario={scenario} onNext={advance} />
                )}
                {step === 'phrase' && (
                  <PhraseCard scenario={scenario} onNext={advance} />
                )}
                {step === 'pattern' && (
                  <PatternBuilder scenario={scenario} onNext={advance} />
                )}
                {step === 'sentence' && (
                  <SentenceCard scenario={scenario} onNext={advance} />
                )}
                {step === 'situation' && (
                  <VideoDialogue scenario={scenario} onComplete={() => setFinished(true)} />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── Button nav bar ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-100 bg-white flex-shrink-0">

        {/* ← stage */}
        <button
          onClick={goPrevStage}
          disabled={isFirstStep || finished}
          className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-lg
            disabled:opacity-25 active:scale-95 transition-all"
          aria-label="Previous stage"
        >←</button>

        {/* stage label */}
        <span className="text-xs text-gray-400 font-medium text-center w-14 leading-tight">
          {finished ? '✅' : STEP_LABELS[step]}
        </span>

        {/* → stage */}
        <button
          onClick={goNextStage}
          disabled={isLastStep || finished}
          className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-lg
            disabled:opacity-25 active:scale-95 transition-all"
          aria-label="Next stage"
        >→</button>

        {/* word position dots */}
        <div className="flex-1 flex items-center justify-center gap-1.5">
          {SCENARIOS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDir({ x: 0, y: i > wordIndex ? 1 : -1 })
                setWordIndex(i); setStepIndex(0); setFinished(false)
              }}
              className={`rounded-full transition-all duration-200 ${
                i === wordIndex ? 'w-2.5 h-2.5 bg-primary' : 'w-1.5 h-1.5 bg-gray-300'
              }`}
              aria-label={SCENARIOS[i].topicLabel}
            />
          ))}
        </div>

        {/* ↑ word */}
        <button
          onClick={goPrevWord}
          disabled={isFirstWord}
          className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-lg
            disabled:opacity-25 active:scale-95 transition-all"
          aria-label="Previous word"
        >↑</button>

        {/* ↓ word */}
        <button
          onClick={goNextWord}
          disabled={isLastWord}
          className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-lg
            disabled:opacity-25 active:scale-95 transition-all"
          aria-label="Next word"
        >↓</button>
      </div>

      {/* ── First-load swipe hint ─────────────────────────────────────────── */}
      <SwipeHint />
    </AppLayout>
  )
}

function SwipeHint() {
  const [show, setShow] = useState(true)
  useEffect(() => { const t = setTimeout(() => setShow(false), 3000); return () => clearTimeout(t) }, [])
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="absolute bottom-20 inset-x-0 flex justify-center pointer-events-none"
        >
          <div className="bg-gray-900/75 text-white text-xs font-medium px-4 py-2 rounded-full flex items-center gap-3 backdrop-blur-sm">
            <span>← → stage</span>
            <span className="opacity-40">|</span>
            <span>↑ ↓ scroll word</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
