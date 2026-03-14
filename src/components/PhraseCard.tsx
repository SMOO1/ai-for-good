'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import AudioButton from './AudioButton'
import SpeakAndCheck from './SpeakAndCheck'
import { speak, speakRohingya } from '@/lib/speak'
import type { ScenarioModule } from '@/data/scenarios'

interface PhraseCardProps {
  scenario: ScenarioModule
  onNext: () => void
}

export default function PhraseCard({ scenario, onNext }: PhraseCardProps) {
  const [passed, setPassed] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => speak(scenario.phraseAudio), 500)
    return () => clearTimeout(t)
  }, [scenario.phraseAudio])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-5 px-4 pb-6 flex-1"
    >
      <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Building a phrase</p>

      {/* Word → Phrase animation */}
      <div className="w-full bg-primary-light rounded-3xl p-6 flex flex-col items-center gap-5">
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-2xl px-5 py-3 shadow-sm">
            <span className="text-2xl font-bold text-gray-700">{scenario.word}</span>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-2xl text-primary font-bold"
          >
            →
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="bg-primary rounded-2xl px-5 py-3 shadow-md"
          >
            <span className="text-2xl font-bold text-white">{scenario.phrase}</span>
          </motion.div>
        </div>

        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <span>word</span>
          <span>→</span>
          <span className="font-semibold text-primary">phrase</span>
        </div>
      </div>

      {/* Phrase large display */}
      <div className="text-center">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Phrase</p>
        <p className="text-5xl font-bold text-gray-800">{scenario.phrase}</p>
      </div>

      {/* Audio controls */}
      <div className="flex flex-col items-center gap-3 w-full">
        <AudioButton text={scenario.phraseAudio} size="lg" label="Tap to hear" />
        <button
          onClick={() => speak(scenario.phraseAudio, 0.85)}
          className="bg-primary-light text-primary rounded-2xl py-2 px-6 font-semibold text-sm"
        >
          🔁 Repeat
        </button>

        {/* Rohingya phrase */}
        <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 mt-1">
          <div className="flex flex-col">
            <span className="text-[10px] text-amber-500 font-semibold uppercase tracking-widest mb-0.5">
              Rohingya
            </span>
            <span className="text-xl font-bold text-gray-800">{scenario.phraseRoh}</span>
            <span className="text-sm text-gray-400" style={{ fontFamily: 'serif', direction: 'rtl' }}>
              {scenario.phraseArabic}
            </span>
          </div>
          <button
            onClick={() => speakRohingya(scenario.phraseRoh)}
            className="w-12 h-12 rounded-full bg-amber-400 text-white flex items-center justify-center text-xl shadow active:scale-95 transition-transform flex-shrink-0"
            aria-label={`Play Rohingya: ${scenario.phraseRoh}`}
          >
            🔊
          </button>
        </div>
      </div>

      {/* Speak check */}
      <SpeakAndCheck
        targetText={scenario.phraseAudio}
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
