'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState, useCallback } from 'react'

export type RecognitionState = 'idle' | 'listening'

export interface SpeechResult {
  correct: boolean
  transcript: string
}

interface Options {
  targetText: string
  focusWord?: string
  /** Similarity threshold 0–1 (default 0.75) */
  threshold?: number
  onResult: (result: SpeechResult) => void
  onNoInput?: () => void
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function similarity(target: string, spoken: string): number {
  const a = normalize(target).split(' ')
  const b = normalize(spoken).split(' ')
  if (!a.length || !b.length) return 0
  let matches = 0
  const minLen = Math.min(a.length, b.length)
  for (let i = 0; i < minLen; i++) {
    if (a[i] === b[i]) matches++
  }
  return matches / a.length
}

function wordPresent(word: string, spoken: string): boolean {
  if (!word) return true
  return normalize(spoken).split(' ').includes(normalize(word))
}

export function useSpeechRecognition({ targetText, focusWord, threshold = 0.75, onResult, onNoInput }: Options) {
  const [recognitionState, setRecognitionState] = useState<RecognitionState>('idle')
  const [interimTranscript, setInterimTranscript] = useState('')
  const recognitionRef = useRef<any>(null)
  const startedAtRef = useRef(0)
  const handledRef = useRef(false)
  const interimRef = useRef('')

  const isSupported =
    typeof window !== 'undefined' &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)

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
      setRecognitionState('idle')
      if (!handledRef.current) {
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
      setInterimTranscript('')

      const ratio = similarity(targetText, spoken)
      const okWord = focusWord ? wordPresent(focusWord, spoken) : true
      const correct = ratio >= threshold && okWord

      onResult({ correct, transcript: spoken })

      try { recognition.stop() } catch { /* ignore */ }
    }

    try { recognition.start() } catch { /* already started */ }
  }, [targetText, focusWord, onResult, onNoInput])

  const stop = useCallback(() => {
    try { recognitionRef.current?.stop() } catch { /* ignore */ }
    setRecognitionState('idle')
  }, [])

  // Force-evaluate whatever has been heard so far (interim or nothing)
  const commitNow = useCallback(() => {
    if (handledRef.current) return
    const currentInterim = interimRef.current
    handledRef.current = true
    setInterimTranscript('')
    interimRef.current = ''

    const durationMs = Date.now() - startedAtRef.current

    if (!currentInterim || durationMs < 600) {
      onNoInput?.()
    } else {
      const ratio = similarity(targetText, currentInterim)
      const okWord = focusWord ? wordPresent(focusWord, currentInterim) : true
      const correct = ratio >= threshold && okWord
      onResult({ correct, transcript: currentInterim })
    }

    try { recognitionRef.current?.stop() } catch { /* ignore */ }
  }, [targetText, focusWord, threshold, onResult, onNoInput])

  return { recognitionState, interimTranscript, start, stop, commitNow, isSupported }
}
