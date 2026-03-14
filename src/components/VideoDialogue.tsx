'use client'

import React, { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSpeechRecognition } from '@/lib/useSpeechRecognition'
import type { ScenarioModule } from '@/data/scenarios'

interface VideoDialogueProps {
  scenario: ScenarioModule
  onComplete: () => void
}

type Phase = 'prompt-video' | 'speak' | 'answer-video' | 'wrong'

export default function VideoDialogue({ scenario, onComplete }: VideoDialogueProps) {
  const [phase, setPhase] = useState<Phase>('prompt-video')
  const [transcript, setTranscript] = useState('')
  const [noInput, setNoInput] = useState(false)
  const promptVideoRef = useRef<HTMLVideoElement>(null)
  const answerVideoRef = useRef<HTMLVideoElement>(null)

  const ext = 'mov'
  const promptSrc = `/videos/${scenario.topic}-prompt.${ext}`
  const answerSrc = `/videos/${scenario.topic}-answer.${ext}`

  // ── Speech recognition ───────────────────────────────────────────────────
  const handleResult = useCallback(({ correct, transcript: t }: { correct: boolean; transcript: string }) => {
    setTranscript(t)
    if (correct) {
      setPhase('answer-video')
    } else {
      setPhase('wrong')
    }
  }, [])

  const { recognitionState, interimTranscript, start, commitNow, isSupported } = useSpeechRecognition({
    targetText: scenario.dialogueExpected,
    threshold: 0.55,
    onResult: handleResult,
    onNoInput: () => setNoInput(true),
  })

  // ── Handlers ─────────────────────────────────────────────────────────────
  const onPromptVideoEnd = () => setPhase('speak')

  const onAnswerVideoEnd = () => onComplete()

  const retry = () => {
    setTranscript('')
    setNoInput(false)
    setPhase('speak')
  }

  return (
    <div className="flex flex-col flex-1 bg-black relative overflow-hidden">

      {/* ── Prompt video ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === 'prompt-video' && (
          <motion.video
            key="prompt"
            ref={promptVideoRef}
            src={promptSrc}
            autoPlay
            playsInline
            onEnded={onPromptVideoEnd}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </AnimatePresence>

      {/* ── Answer video ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === 'answer-video' && (
          <motion.video
            key="answer"
            ref={answerVideoRef}
            src={answerSrc}
            autoPlay
            playsInline
            onEnded={onAnswerVideoEnd}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </AnimatePresence>

      {/* ── Speak phase ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === 'speak' && (
          <motion.div
            key="speak"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-end pb-10 gap-5 px-6"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 50%, transparent)' }}
          >
            {/* Target sentence hint */}
            <div className="w-full bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 text-center">
              <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Say this</p>
              <p className="text-white text-2xl font-bold">{scenario.dialogueExpected}</p>
            </div>

            {/* Interim transcript */}
            {(interimTranscript || noInput) && (
              <p className="text-white/70 text-sm italic text-center">
                {noInput ? "Didn't catch that — try again" : `"${interimTranscript}"`}
              </p>
            )}

            {/* Mic + Done buttons */}
            <div className="flex items-center gap-4">
              {/* Mic button */}
              <button
                onClick={start}
                disabled={recognitionState === 'listening'}
                className={`w-18 h-18 rounded-full flex items-center justify-center text-3xl shadow-xl transition-all active:scale-95 ${
                  recognitionState === 'listening'
                    ? 'bg-red-500 scale-110 animate-pulse'
                    : 'bg-primary'
                }`}
                style={{ width: 72, height: 72 }}
              >
                🎤
              </button>

              {/* Done / submit button — only shown while listening */}
              {recognitionState === 'listening' && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={commitNow}
                  className="bg-white text-primary rounded-2xl px-5 py-3 font-bold text-base shadow-lg active:scale-95"
                >
                  Done ✓
                </motion.button>
              )}
            </div>

            <p className="text-white/40 text-xs">
              {recognitionState === 'listening' ? 'Listening… tap Done when finished' : 'Tap 🎤 to speak'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Wrong phase ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === 'wrong' && (
          <motion.div
            key="wrong"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-end pb-10 gap-4 px-6"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 60%, transparent)' }}
          >
            <div className="w-full bg-amber-500/20 border border-amber-400/50 rounded-2xl p-4 text-center">
              <p className="text-amber-300 font-bold mb-1">Try again!</p>
              {transcript && (
                <p className="text-white/60 text-sm italic">You said: "{transcript}"</p>
              )}
              <p className="text-white text-lg font-bold mt-2">{scenario.dialogueExpected}</p>
            </div>

            <button
              onClick={retry}
              className="bg-primary text-white rounded-2xl py-4 px-10 text-lg font-bold w-full active:scale-95"
            >
              🎤 Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading fallback if video missing */}
      {phase === 'prompt-video' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-white/30 text-sm">Loading video…</div>
        </div>
      )}
    </div>
  )
}
