'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import FlueLogo from '@/components/FlueLogo'
import OnboardingPopup from '@/components/OnboardingPopup'

export default function WelcomePage() {
  const router = useRouter()

  return (
    <AppLayout>
      <OnboardingPopup />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center justify-center flex-1 px-8 py-12 min-h-screen gap-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <FlueLogo iconSize={96} />
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          className="text-base text-gray-400 font-medium text-center"
        >
          Learn English through pictures
        </motion.p>

        {/* CTA button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.75, duration: 0.4, type: 'spring', stiffness: 200 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/learn')}
          className="bg-primary text-white rounded-2xl py-5 px-12 text-2xl font-bold shadow-lg w-full max-w-xs"
        >
          Start Learning
        </motion.button>

        {/* Subtle bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="text-xs text-gray-300 text-center"
        >
          No reading required &bull; Tap and listen
        </motion.p>
      </motion.div>
    </AppLayout>
  )
}
