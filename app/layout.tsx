import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sasta Plots — Buy & Sell Verified Land, Plots & Properties in India',
  description: 'India’s transparent real estate marketplace for residential plots, agricultural land, commercial plots, and properties. Direct owner listings, zero commission options, and verified paperwork.',
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-[#202124] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
