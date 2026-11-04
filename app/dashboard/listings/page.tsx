'use client'
import React, { Suspense } from 'react'

import { MyListingsPage } from '@/pages_legacy/user/MyListingsPage'

export default function Page() {
  return (<Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center text-sm text-gray-500">Loading...</div>}><MyListingsPage /></Suspense>); }
