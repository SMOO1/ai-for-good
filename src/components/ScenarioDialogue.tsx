'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FeedbackMessage from './FeedbackMessage'
import MicrophoneButton from './MicrophoneButton'
import AudioButton from './AudioButton'
import { useSpeechRecognition } from '@/lib/useSpeechRecognition'
import type { ScenarioModule } from '@/data/scenarios'

interface ScenarioDialogueProps {
  scenario: ScenarioModule
  onComplete: () => void
}

function speak(text: string, rate = 0.85) {
  if (typeof window === 'undefined') return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = rate
  u.lang = 'en-US'
  window.speechSynthesis.speak(u)
}

type Turn = 'prompt' | 'answer' | 'wrong' | 'feedback'

export default function ScenarioDialogue({ scenario, onComplete }: ScenarioDialogueProps) {
  const [turn, setTurn] = useState<Turn>('prompt')
  const [transcript, setTranscript] = useState('')
  const [noInputMsg, setNoInputMsg] = useState(false)
  const [practiceCount, setPracticeCount] = useState(0)

  useEffect(() => {
    if (turn === 'prompt') {
      const t = setTimeout(() => speak(scenario.dialoguePrompt), 600)
      return () => clearTimeout(t)
    }
  }, [turn, scenario.dialoguePrompt])

  const handleResult = useCallback(({ correct, transcript: t }: { correct: boolean; transcript: string }) => {
    setTranscript(t)
    setNoInputMsg(false)
    setTurn(correct ? 'feedback' : 'wrong')
  }, [])

  const handleNoInput = useCallback(() => {
    setNoInputMsg(true)
  }, [])

  const { recognitionState, interimTranscript, start, isSupported } = useSpeechRecognition({
    targetText: scenario.dialogueExpected,
    focusWord: scenario.word,
    onResult: handleResult,
    onNoInput: handleNoInput,
  })

  const handlePracticeAgain = () => {
    setPracticeCount(c => c + 1)
    setTranscript('')
    setNoInputMsg(false)
    setTurn('prompt')
    setTimeout(() => setTurn('answer'), 800)
  }

  const retryFromWrong = () => {
    setTranscript('')
    setNoInputMsg(false)
    setTurn('answer')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 px-4 pb-6 flex-1"
    >
      {/* Location header */}
      <div className="bg-gray-800 rounded-2xl p-4 flex items-center gap-3">
        <span className="text-3xl">{scenario.scenarioIcon}</span>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Location</p>
          <p className="text-white font-bold text-lg">{scenario.scenarioLocation}</p>
        </div>
        <span className="ml-auto text-xs text-gray-400 font-medium">Situation Practice</span>
      </div>

      {/* Dialogue area */}
      <div className="flex flex-col gap-4 flex-1">
        {/* AI prompt bubble */}
        <div className="flex items-end gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xl flex-shrink-0">
            {scenario.scenarioIcon}
          </div>
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-100 rounded-2xl rounded-bl-sm p-4 max-w-[75%]"
          >
            <p className="text-gray-800 text-lg font-medium">{scenario.dialoguePrompt}</p>
            <button
              onClick={() => speak(scenario.dialoguePrompt)}
              className="text-gray-400 text-xs mt-1 hover:text-gray-600"
            >
              🔊 hear again
            </button>
          </motion.div>
        </div>

        {/* User response area */}
        <AnimatePresence mode="wait">
          {turn === 'prompt' && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-end mt-2"
            >
              <button
                onClick={() => setTurn('answer')}
                className="bg-primary-light text-primary rounded-2xl rounded-br-sm px-5 py-3 font-semibold border-2 border-dashed border-primary"
              >
                Tap to respond →
              </button>
            </motion.div>
          )}

          {turn === 'answer' && (
            <motion.div
              key="answer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-end gap-3"
            >
              {/* Target sentence hint */}
              <div className="bg-primary-light rounded-2xl rounded-br-sm p-4 max-w-[80%] border-2 border-primary">
                <p className="text-primary font-bold text-lg">{scenario.dialogueExpected}</p>
              </div>

              {isSupported ? (
                <div className="flex flex-col items-center gap-2 w-full">
                  <MicrophoneButton state={recognitionState} onClick={start} />
                  {interimTranscript ? (
                    <p className="text-gray-400 text-sm italic">"{interimTranscript}"</p>
                  ) : noInputMsg ? (
                    <p className="text-amber-600 text-sm font-medium text-center">
                      We didn't catch that — tap 🎤 and speak clearly
                    </p>
                  ) : (
                    <p className="text-gray-400 text-sm">Tap 🎤 to say it</p>
                  )}
                </div>
              ) : (
                /* Fallback: no speech recognition support */
                <div className="flex items-center gap-3">
                  <p className="text-gray-400 text-sm">Tap 🎤 to say it</p>
                  <MicrophoneButton
                    state="idle"
                    onClick={() => { speak(scenario.dialogueExpected); setTurn('feedback') }}
                  />
                </div>
              )}
            </motion.div>
          )}

          {turn === 'wrong' && (
            <motion.div
              key="wrong"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
              {/* User attempt bubble */}
              <div className="flex justify-end">
                <div className="bg-amber-100 border border-amber-300 rounded-2xl rounded-br-sm p-3 max-w-[80%]">
                  <p className="text-amber-800 font-medium">{transcript || '…'}</p>
                </div>
              </div>
              {/* Error feedback + pronunciation hint */}
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col gap-2">
                <p className="text-amber-700 font-bold">🔁 Not quite — let's try again</p>
                <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-amber-200">
                  <p className="text-amber-800 font-semibold flex-1">{scenario.dialogueExpected}</p>
                  <AudioButton text={scenario.dialogueExpected} size="sm" />
                </div>
                <button
                  onClick={retryFromWrong}
                  className="bg-amber-500 text-white rounded-xl py-2 px-6 font-bold mt-1"
                >
                  Try Again 🎤
                </button>
              </div>
            </motion.div>
          )}

          {turn === 'feedback' && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-3"
            >
              {/* User bubble */}
              <div className="flex justify-end">
                <div className="bg-primary rounded-2xl rounded-br-sm p-4 max-w-[80%]">
                  <p className="text-white font-bold text-lg">{transcript || scenario.dialogueExpected}</p>
                </div>
              </div>
              <FeedbackMessage message={scenario.dialogueFeedback} type="success" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      {turn === 'feedback' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-3 mt-2"
        >
          {practiceCount < 2 && (
            <button
              onClick={handlePracticeAgain}
              className="bg-primary-light text-primary rounded-2xl py-3 px-6 font-bold text-lg border-2 border-primary"
            >
              🔁 Practice Again
            </button>
          )}
          <button
            onClick={onComplete}
            className="bg-primary text-white rounded-2xl py-4 px-8 text-xl font-bold w-full"
          >
            Finish Lesson 🎉
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
