'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MicrophoneButton from './MicrophoneButton'
import AudioButton from './AudioButton'
import { useSpeechRecognition } from '@/lib/useSpeechRecognition'

interface SpeakAndCheckProps {
  /** The text the user must say */
  targetText: string
  /** Key word that must appear in the spoken result */
  focusWord?: string
  /** Similarity threshold 0–1 (default 0.6) */
  threshold?: number
  /** Called when user passes */
  onPass: () => void
}

export default function SpeakAndCheck({
  targetText,
  focusWord,
  threshold = 0.6,
  onPass,
}: SpeakAndCheckProps) {
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [transcript, setTranscript] = useState('')
  const [noInput, setNoInput] = useState(false)

  const handleResult = useCallback(({ correct, transcript: t }: { correct: boolean; transcript: string }) => {
    setTranscript(t)
    setResult(correct ? 'correct' : 'wrong')
    setNoInput(false)
    if (correct) onPass()
  }, [onPass])

  const handleNoInput = useCallback(() => setNoInput(true), [])

  const { recognitionState, interimTranscript, start, isSupported } = useSpeechRecognition({
    targetText,
    focusWord,
    threshold,
    onResult: handleResult,
    onNoInput: handleNoInput,
  })

  const retry = () => {
    setResult(null)
    setTranscript('')
    setNoInput(false)
  }

  if (!isSupported) return null

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <AnimatePresence mode="wait">
        {result === null && (
          <motion.div
            key="mic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <MicrophoneButton state={recognitionState} onClick={start} />
            <p className="text-xs text-gray-400 text-center">
              {interimTranscript
                ? `"${interimTranscript}"`
                : noInput
                ? "Didn't catch that — try again"
                : 'Tap 🎤 and say it'}
            </p>
          </motion.div>
        )}

        {result === 'correct' && (
          <motion.div
            key="correct"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-green-50 border-2 border-green-400 rounded-2xl p-4 flex items-center gap-3"
          >
            <span className="text-3xl">✅</span>
            <div>
              <p className="text-green-700 font-bold">Great pronunciation!</p>
              {transcript && <p className="text-green-600 text-sm italic">"{transcript}"</p>}
            </div>
          </motion.div>
        )}

        {result === 'wrong' && (
          <motion.div
            key="wrong"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔁</span>
              <div className="flex-1">
                <p className="text-amber-700 font-bold text-sm">Try again</p>
                {transcript && <p className="text-amber-600 text-xs italic">You said: "{transcript}"</p>}
              </div>
              <AudioButton text={targetText} size="sm" />
            </div>
            <button
              onClick={retry}
              className="bg-amber-500 text-white rounded-xl py-2 px-5 font-bold text-sm w-full"
            >
              Try Again 🎤
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
