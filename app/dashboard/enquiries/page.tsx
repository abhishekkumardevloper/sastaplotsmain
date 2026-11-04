'use client'
import React, { Suspense } from 'react'

import { MyEnquiriesPage } from '@/pages_legacy/user/MyEnquiriesPage'

export default function Page() {
  return (<Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center text-sm text-gray-500">Loading...</div>}><MyEnquiriesPage /></Suspense>); }
