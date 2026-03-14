'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState, useCallback, useEffect } from 'react'
import { evalWithLLM } from './llmEval'

export type RecognitionState = 'idle' | 'listening' | 'evaluating'

export interface SpeechResult {
  correct: boolean
  transcript: string
  feedback?: string
}

interface Options {
  targetText: string
  focusWord?: string
  /** Unused — LLM decides correctness. Kept for API compatibility. */
  threshold?: number
  onResult: (result: SpeechResult) => void
  onNoInput?: () => void
}

export function useSpeechRecognition({ targetText, onResult, onNoInput }: Options) {
  const [recognitionState, setRecognitionState] = useState<RecognitionState>('idle')
  const [interimTranscript, setInterimTranscript] = useState('')
  const recognitionRef = useRef<any>(null)
  const startedAtRef = useRef(0)
  const handledRef = useRef(false)
  const interimRef = useRef('')

  const [isSupported, setIsSupported] = useState(false)
  useEffect(() => {
    setIsSupported(!!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition))
  }, [])

  const evaluate = useCallback(async (spoken: string) => {
    setInterimTranscript('')
    interimRef.current = ''
    setRecognitionState('evaluating')
    const { correct, feedback } = await evalWithLLM(targetText, spoken)
    setRecognitionState('idle')
    onResult({ correct, transcript: spoken, feedback })
  }, [targetText, onResult])

  const start = useCallback(() => {
    if (typeof window === 'undefined') return

    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SR) return

    const recognition = new SR()
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 3
    recognitionRef.current = recognition
    handledRef.current = false

    recognition.onstart = () => {
      startedAtRef.current = Date.now()
      setRecognitionState('listening')
    }

    recognition.onend = () => {
      if (!handledRef.current) {
        setRecognitionState('idle')
        onNoInput?.()
      }
    }

    recognition.onerror = () => {
      setRecognitionState('idle')
      onNoInput?.()
    }

    recognition.onresult = (event: any) => {
      const resultIndex = event.results.length - 1
      const result = event.results[resultIndex]

      if (!result.isFinal) {
        const t = result[0].transcript.trim()
        setInterimTranscript(t)
        interimRef.current = t
        return
      }

      const spoken: string = result[0].transcript.trim()
      const durationMs = Date.now() - startedAtRef.current

      if (durationMs < 600 || spoken.length < 2) {
        onNoInput?.()
        return
      }

      handledRef.current = true
      try { recognition.stop() } catch { /* ignore */ }
      evaluate(spoken)
    }

    try { recognition.start() } catch { /* already started */ }
  }, [evaluate, onNoInput])

  const stop = useCallback(() => {
    try { recognitionRef.current?.stop() } catch { /* ignore */ }
    setRecognitionState('idle')
  }, [])

  const commitNow = useCallback(() => {
    if (handledRef.current) return
    const currentInterim = interimRef.current
    handledRef.current = true

    const durationMs = Date.now() - startedAtRef.current

    if (!currentInterim || durationMs < 600) {
      onNoInput?.()
    } else {
      try { recognitionRef.current?.stop() } catch { /* ignore */ }
      evaluate(currentInterim)
    }
  }, [evaluate, onNoInput])

  return { recognitionState, interimTranscript, start, stop, commitNow, isSupported }
}
