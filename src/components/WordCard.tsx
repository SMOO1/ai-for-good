'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import AudioButton from './AudioButton'
import SpeakAndCheck from './SpeakAndCheck'
import { speak } from '@/lib/speak'
import type { ScenarioModule } from '@/data/scenarios'
import { VOCABULARY } from '@/data/vocabulary'

interface WordCardProps {
  scenario: ScenarioModule
  onNext: () => void
}

export default function WordCard({ scenario, onNext }: WordCardProps) {
  const vocab = VOCABULARY.find(v => v.id === scenario.vocabId)
  const [passed, setPassed] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => speak(scenario.wordAudio), 500)
    return () => clearTimeout(t)
  }, [scenario.wordAudio])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-5 px-4 pb-6 flex-1"
    >
      {/* Reference emoji card */}
      <div className="w-full bg-primary-light rounded-3xl flex items-center justify-center shadow-inner" style={{ minHeight: '180px' }}>
        <span className="text-9xl select-none">{vocab?.referenceEmoji ?? scenario.topicIcon}</span>
      </div>

      {/* Word */}
      <div className="text-center">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Word</p>
        <p className="text-6xl font-bold text-gray-800">{scenario.word}</p>
      </div>

      {/* Audio controls */}
      <div className="flex flex-col items-center gap-2">
        <AudioButton text={scenario.wordAudio} size="lg" label="Tap to hear" />
        <button
          onClick={() => speak(scenario.wordAudio, 0.85)}
          className="bg-primary-light text-primary rounded-2xl py-2 px-6 font-semibold text-sm"
        >
          🔁 Repeat
        </button>
      </div>

      {/* Speak check */}
      <SpeakAndCheck
        targetText={scenario.wordAudio}
        focusWord={scenario.word}
        threshold={0.5}
        onPass={() => setPassed(true)}
      />

      <div className="flex-1" />

      <button
        onClick={onNext}
        disabled={!passed}
        className="bg-primary text-white rounded-2xl py-4 px-8 text-xl font-bold w-full disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </motion.div>
  )
}
