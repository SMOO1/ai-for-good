'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AudioButton from './AudioButton'
import { speak } from '@/lib/speak'
import type { ScenarioModule } from '@/data/scenarios'

interface PatternBuilderProps {
  scenario: ScenarioModule
  onNext: () => void
}

export default function PatternBuilder({ scenario, onNext }: PatternBuilderProps) {
  const [selected, setSelected] = useState<string | null>(null)

  const patternParts = scenario.pattern.split('___')
  const filledSentence = selected
    ? patternParts[0] + selected + (patternParts[1] ?? '')
    : null

  const handleSelect = (option: string) => {
    setSelected(option)
    setTimeout(() => speak(patternParts[0] + option + (patternParts[1] ?? '')), 300)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-5 px-4 pb-6 flex-1"
    >
      <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Fill in the blank</p>

      {/* Pattern display */}
      <div className="w-full bg-gray-50 rounded-3xl p-5 text-center shadow-inner">
        <div className="flex items-center justify-center flex-wrap gap-2 text-3xl font-bold text-gray-800">
          {patternParts[0] && <span>{patternParts[0]}</span>}
          <div className={`min-w-[120px] px-4 py-2 rounded-2xl border-2 border-dashed transition-all ${
            selected ? 'bg-primary text-white border-primary' : 'border-gray-300 bg-white text-gray-400'
          }`}>
            {selected ?? '___'}
          </div>
          {patternParts[1] && patternParts[1].trim() && <span>{patternParts[1]}</span>}
        </div>
      </div>

      {/* Options */}
      <div className="w-full">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 text-center">Choose an answer</p>
        <div className="flex flex-wrap gap-3 justify-center">
          {scenario.patternOptions.map(option => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className={`px-5 py-3 rounded-2xl text-lg font-semibold border-2 transition-all active:scale-95 shadow-sm ${
                selected === option
                  ? 'bg-primary text-white border-primary scale-105 shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Generated sentence + audio */}
      <AnimatePresence>
        {filledSentence && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-primary-light rounded-3xl p-5 flex items-center justify-between gap-4"
          >
            <p className="text-2xl font-bold text-primary flex-1">{filledSentence}</p>
            <AudioButton text={filledSentence} size="lg" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1" />

      <button
        onClick={onNext}
        disabled={!selected}
        className="bg-primary text-white rounded-2xl py-4 px-8 text-xl font-bold w-full disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </motion.div>
  )
}
