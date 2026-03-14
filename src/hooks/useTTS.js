import { useCallback } from 'react'

export function useTTS() {
  const speak = useCallback((text, rate = 0.85) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'en-US'
    utt.rate = rate
    utt.pitch = 1.0
    window.speechSynthesis.speak(utt)
  }, [])

  return { speak }
}
