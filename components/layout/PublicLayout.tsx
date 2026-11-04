'use client'

import React from 'react'
import Header from './Header'
import Footer from './Footer'
import ChatWidget from '@/components/chat/ChatWidget'

export const PublicLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F2]/30 text-[#202124]">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </div>
  )
}

export default PublicLayout
