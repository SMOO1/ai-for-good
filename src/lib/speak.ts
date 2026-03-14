// Priority order for English TTS voices
const PREFERRED_VOICES = [
  'Google US English',
  'Microsoft Aria Online (Natural)',
  'Microsoft Jenny Online (Natural)',
  'Microsoft Guy Online (Natural)',
  'Samantha',               // macOS / iOS
  'Karen',                  // macOS Australian
  'Daniel',                 // macOS British
]

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  for (const name of PREFERRED_VOICES) {
    const match = voices.find(v => v.name === name)
    if (match) return match
  }

  // Fall back to first en-US voice, then any English voice
  return (
    voices.find(v => v.lang === 'en-US') ??
    voices.find(v => v.lang.startsWith('en')) ??
    null
  )
}

export function speak(text: string, rate = 0.85) {
  if (typeof window === 'undefined') return
  window.speechSynthesis.cancel()

  const u = new SpeechSynthesisUtterance(text)
  u.rate = rate
  u.lang = 'en-US'

  const voice = pickVoice()
  if (voice) u.voice = voice

  window.speechSynthesis.speak(u)
}

// Voices that read romanized Rohingya more naturally (South Asian phonetics)
const ROHINGYA_PREFERRED_VOICES = [
  'Woodrow',                              // user-recommended
  'Microsoft Ravi - English (India)',
  'Microsoft Heera - English (India)',
  'Google हिन्दी',
  'Lekha',                                // macOS Indian English
  'Rishi',                                // macOS Indian English
]

function pickRohingyaVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  for (const name of ROHINGYA_PREFERRED_VOICES) {
    const match = voices.find(v => v.name.toLowerCase().includes(name.toLowerCase()))
    if (match) return match
  }

  // Log available voices in dev so user can find the right name
  if (process.env.NODE_ENV === 'development') {
    console.log('[speak] available voices:', voices.map(v => v.name))
  }

  return pickVoice()
}

export function speakRohingya(text: string) {
  if (typeof window === 'undefined') return
  window.speechSynthesis.cancel()

  const u = new SpeechSynthesisUtterance(text)
  u.rate = 0.9
  u.pitch = 1.0
  u.lang = 'en-US'

  const voice = pickRohingyaVoice()
  if (voice) u.voice = voice

  window.speechSynthesis.speak(u)
}
