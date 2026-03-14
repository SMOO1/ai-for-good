'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FlueLogo from './FlueLogo'


const slides = [
  {
    id: 'welcome',
    illustration: <FlueLogo iconSize={80} showWordmark={false} />,
    title: 'Welcome to FLUE!',
    desc: 'Learn English through pictures, sounds, and speaking — no reading required.',
  },
  {
    id: 'swipe-words',
    illustration: (
      <div className="flex flex-col items-center gap-2">
        {/* Word card mock */}
        <div className="bg-primary-light border border-primary/20 rounded-2xl px-8 py-4 text-center shadow-sm">
          <span className="text-4xl">🏥</span>
          <p className="text-lg font-bold text-gray-800 mt-1">doctor</p>
        </div>
        {/* Up arrow */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
          className="text-primary"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 22 L14 6M14 6 L7 13M14 6 L21 13" stroke="#2E7D5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
        <div className="bg-white border border-gray-200 rounded-2xl px-8 py-4 text-center shadow-sm opacity-50">
          <span className="text-4xl">🚌</span>
          <p className="text-lg font-bold text-gray-400 mt-1">bus</p>
        </div>
      </div>
    ),
    title: 'Scroll for new words',
    desc: 'Swipe up or down to move between different English words.',
  },
  {
    id: 'swipe-steps',
    illustration: (
      <div className="flex flex-col items-center gap-4">
        {/* Step dots */}
        <div className="flex gap-2 items-center">
          {['🔤', '✏️', '💬', '📝', '🗣️', '🎬'].map((icon, i) => (
            <motion.div
              key={i}
              animate={i === 1 ? { scale: [1, 1.2, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.8, delay: 0.3 }}
              className={`flex items-center justify-center rounded-full text-base ${
                i === 1
                  ? 'w-10 h-10 bg-primary text-white shadow-md'
                  : 'w-7 h-7 bg-gray-200 text-gray-500'
              }`}
            >
              {icon}
            </motion.div>
          ))}
        </div>
        {/* Left-right arrows */}
        <div className="flex items-center gap-6">
          <motion.div
            animate={{ x: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            className="text-primary"
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M22 14 L6 14M6 14 L13 7M6 14 L13 21" stroke="#2E7D5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
          <span className="text-sm font-semibold text-gray-500">6 steps</span>
          <motion.div
            animate={{ x: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            className="text-primary"
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M6 14 L22 14M22 14 L15 7M22 14 L15 21" stroke="#2E7D5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </div>
      </div>
    ),
    title: 'Learn step by step',
    desc: 'Swipe left or right to go through each learning step: word → draw → phrase → sentence → speak.',
  },
]

export default function OnboardingPopup() {
  const [visible, setVisible] = useState(false)
  const [slideIndex, setSlideIndex] = useState(0)
  const [dir, setDir] = useState(1)

  useEffect(() => {
    setVisible(true)
  }, [])

  function goNext() {
    if (slideIndex < slides.length - 1) {
      setDir(1)
      setSlideIndex(slideIndex + 1)
    } else {
      dismiss()
    }
  }

  function dismiss() {
    setVisible(false)
  }

  if (!visible) return null

  const slide = slides[slideIndex]
  const isLast = slideIndex === slides.length - 1

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm px-4 pb-8"
        onClick={dismiss}
      >
        {/* Card */}
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
        >
          {/* Slide content */}
          <div className="relative overflow-hidden" style={{ minHeight: 300 }}>
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={slide.id}
                custom={dir}
                initial={{ x: dir * 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: dir * -60, opacity: 0 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="flex flex-col items-center px-8 pt-10 pb-6 gap-6"
              >
                {/* Illustration */}
                <div className="flex items-center justify-center" style={{ minHeight: 120 }}>
                  {slide.illustration}
                </div>

                {/* Text */}
                <div className="text-center">
                  <h2 className="text-xl font-extrabold text-gray-900 mb-2">{slide.title}</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">{slide.desc}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom area */}
          <div className="px-8 pb-8 flex flex-col items-center gap-4">
            {/* Pagination dots */}
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDir(i > slideIndex ? 1 : -1); setSlideIndex(i) }}
                  className={`rounded-full transition-all duration-200 ${
                    i === slideIndex
                      ? 'w-6 h-2.5 bg-primary'
                      : 'w-2.5 h-2.5 bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={goNext}
              className="w-full bg-primary text-white rounded-2xl py-4 text-base font-bold shadow"
            >
              {isLast ? "Let's Start!" : 'Next'}
            </button>

            {/* Skip */}
            {!isLast && (
              <button onClick={dismiss} className="text-xs text-gray-400 font-medium">
                Skip
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
