'use client'

import React from 'react'
import { motion } from 'framer-motion'
import type { RecognitionState } from '@/lib/useSpeechRecognition'

interface MicrophoneButtonProps {
  state: RecognitionState
  onClick: () => void
  disabled?: boolean
}

export default function MicrophoneButton({ state, onClick, disabled }: MicrophoneButtonProps) {
  const isListening = state === 'listening'
  const isEvaluating = state === 'evaluating'

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onClick}
        disabled={disabled || isListening || isEvaluating}
        className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          isListening
            ? 'bg-red-500 ring-4 ring-red-300 animate-pulse'
            : isEvaluating
            ? 'bg-gray-400 animate-pulse'
            : 'bg-primary'
        }`}
        aria-label={isListening ? 'Listening…' : isEvaluating ? 'Checking…' : 'Tap to speak'}
      >
        {isEvaluating ? '⏳' : '🎤'}
      </motion.button>
      <p className="text-sm font-semibold text-gray-600">
        {isListening ? 'Listening…' : isEvaluating ? 'Checking…' : 'Tap to speak'}
      </p>
    </div>
  )
}
