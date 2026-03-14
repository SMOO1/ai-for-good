'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AudioButton from './AudioButton'
import MicrophoneButton from './MicrophoneButton'
import { useSpeechRecognition } from '@/lib/useSpeechRecognition'
import type { ScenarioModule } from '@/data/scenarios'

interface SentenceCardProps {
  scenario: ScenarioModule
  onNext: () => void
}

function speak(text: string, rate = 0.85) {
  if (typeof window === 'undefined') return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = rate
  u.lang = 'en-US'
  window.speechSynthesis.speak(u)
}

type ResultState = 'correct' | 'wrong' | null

export default function SentenceCard({ scenario, onNext }: SentenceCardProps) {
  const [result, setResult] = useState<ResultState>(null)
  const [transcript, setTranscript] = useState('')
  const [noInputMsg, setNoInputMsg] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => speak(scenario.sentenceAudio), 500)
    return () => clearTimeout(t)
  }, [scenario.sentenceAudio])

  const handleResult = useCallback(({ correct, transcript: t }: { correct: boolean; transcript: string }) => {
    setTranscript(t)
    setResult(correct ? 'correct' : 'wrong')
    setNoInputMsg(false)
  }, [])

  const handleNoInput = useCallback(() => {
    setNoInputMsg(true)
  }, [])

  const { recognitionState, interimTranscript, start, isSupported } = useSpeechRecognition({
    targetText: scenario.sentenceAudio,
    focusWord: scenario.word,
    onResult: handleResult,
    onNoInput: handleNoInput,
  })

  const retry = () => {
    setResult(null)
    setTranscript('')
    setNoInputMsg(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-5 px-4 pb-6 flex-1"
    >
      <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Say this sentence</p>

      {/* Sentence card */}
      <div className="w-full bg-primary rounded-3xl p-6 flex flex-col items-center gap-3 shadow-lg">
        <p className="text-3xl font-bold text-white text-center leading-tight">
          {scenario.sentence}
        </p>
        <AudioButton text={scenario.sentenceAudio} size="lg" />
      </div>

      {/* Context hint */}
      <div className="w-full bg-amber-50 rounded-2xl p-4 flex items-center gap-4 border border-amber-200">
        <div className="text-4xl">{scenario.scenarioIcon}</div>
        <div>
          <p className="text-xs text-amber-600 uppercase tracking-wider font-medium">You can say this at:</p>
          <p className="text-xl font-bold text-amber-800">{scenario.scenarioLocation}</p>
        </div>
      </div>

      {/* Mic + feedback area */}
      <div className="flex flex-col items-center gap-4 w-full">
        <AnimatePresence mode="wait">
          {result === null && (
            <motion.div
              key="mic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              {isSupported ? (
                <>
                  <MicrophoneButton state={recognitionState} onClick={start} />
                  {interimTranscript ? (
                    <p className="text-gray-400 text-sm italic text-center">"{interimTranscript}"</p>
                  ) : noInputMsg ? (
                    <p className="text-amber-600 text-sm font-medium text-center">
                      We didn't catch that — tap 🎤 and speak clearly
                    </p>
                  ) : (
                    <p className="text-gray-400 text-sm text-center">Tap the mic and say the sentence</p>
                  )}
                </>
              ) : (
                /* Fallback for browsers without speech recognition */
                <button
                  onClick={() => { speak(scenario.sentenceAudio); setResult('correct') }}
                  className="w-full rounded-2xl py-4 px-8 text-xl font-bold border-2 border-primary text-primary bg-white"
                >
                  🔊 Practice Speaking
                </button>
              )}
            </motion.div>
          )}

          {result === 'correct' && (
            <motion.div
              key="correct"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-green-50 border-2 border-green-400 rounded-2xl p-5 flex flex-col items-center gap-2"
            >
              <span className="text-5xl">✅</span>
              <p className="text-green-700 text-xl font-bold text-center">Great pronunciation!</p>
              {transcript && (
                <p className="text-green-600 text-sm text-center italic">"{transcript}"</p>
              )}
            </motion.div>
          )}

          {result === 'wrong' && (
            <motion.div
              key="wrong"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 flex flex-col items-center gap-3"
            >
              <span className="text-4xl">🔁</span>
              <p className="text-amber-700 text-lg font-bold text-center">Let's try again</p>
              {transcript && (
                <p className="text-amber-600 text-sm text-center">You said: "{transcript}"</p>
              )}
              <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 border border-amber-200 w-full justify-center">
                <p className="text-amber-800 font-semibold text-center">{scenario.sentence}</p>
                <AudioButton text={scenario.sentenceAudio} size="sm" />
              </div>
              <button
                onClick={retry}
                className="bg-amber-500 text-white rounded-2xl py-3 px-8 font-bold text-lg w-full"
              >
                Try Again 🎤
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1" />

      <button
        onClick={onNext}
        disabled={result !== 'correct' && isSupported}
        className="bg-primary text-white rounded-2xl py-4 px-8 text-xl font-bold w-full disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Try it out →
      </button>
    </motion.div>
  )
}
