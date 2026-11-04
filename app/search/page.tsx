'use client'
import React, { Suspense } from 'react'

import PublicLayout from '@/components/layout/PublicLayout'
import { SearchPage } from '@/pages_legacy/public/SearchPage'

export default function Page() {
  return (<PublicLayout><Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center text-sm text-gray-500">Loading...</div>}><SearchPage /></Suspense></PublicLayout>)
}
