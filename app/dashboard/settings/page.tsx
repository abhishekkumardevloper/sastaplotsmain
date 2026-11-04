'use client'
import React, { Suspense } from 'react'

import { AccountSettingsPage } from '@/pages_legacy/user/AccountSettingsPage'

export default function Page() {
  return (<Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center text-sm text-gray-500">Loading...</div>}><AccountSettingsPage /></Suspense>); }
