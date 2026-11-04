'use client'

import React, { Suspense } from 'react'

import { AdminPropertyReviewPage } from '@/pages_legacy/admin/AdminPropertyReviewPage'

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center text-sm text-gray-500">Loading...</div>}>
      <AdminPropertyReviewPage />
    </Suspense>
  )
}
