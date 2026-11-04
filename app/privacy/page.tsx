'use client'
import React, { Suspense } from 'react'

import PublicLayout from '@/components/layout/PublicLayout'
import { PrivacyPolicyPage } from '@/pages_legacy/public/PrivacyPolicyPage'

export default function Page() {
  return (<PublicLayout><Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center text-sm text-gray-500">Loading...</div>}><PrivacyPolicyPage /></Suspense></PublicLayout>)
}
