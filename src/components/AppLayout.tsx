'use client'

import React from 'react'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="relative max-w-md mx-auto min-h-screen bg-white flex flex-col">
      {children}
    </div>
  )
}
