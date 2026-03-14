'use client'

import React, { useState } from 'react'
import clsx from 'clsx'
import { speak } from '@/lib/speak'

interface AudioButtonProps {
  text: string
  size?: 'sm' | 'lg'
  label?: string
}

export default function AudioButton({ text, size = 'sm', label }: AudioButtonProps) {
  const [speaking, setSpeaking] = useState(false)

  const handleSpeak = () => {
    setSpeaking(true)
    speak(text, 0.85)
    setTimeout(() => setSpeaking(false), 1500)
  }

  const handleSlow = () => {
    setSpeaking(true)
    speak(text, 0.5)
    setTimeout(() => setSpeaking(false), 2200)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-3">
        <button
          onClick={handleSpeak}
          className={clsx(
            'rounded-full bg-primary text-white flex items-center justify-center shadow-md transition-transform active:scale-95',
            size === 'lg' ? 'w-16 h-16 text-2xl' : 'w-10 h-10 text-lg',
            speaking && 'ring-4 ring-primary ring-opacity-40 animate-pulse'
          )}
          aria-label={`Play audio: ${text}`}
        >
          🔊
        </button>
        <button
          onClick={handleSlow}
          className={clsx(
            'rounded-full bg-primary-light text-primary flex items-center justify-center shadow-sm transition-transform active:scale-95',
            size === 'lg' ? 'w-10 h-10 text-base' : 'w-8 h-8 text-sm'
          )}
          aria-label={`Play slow audio: ${text}`}
          title="Play slowly"
        >
          🐢
        </button>
      </div>
      {label && (
        <span className="text-sm text-gray-500 font-medium">{label}</span>
      )}
    </div>
  )
}
