'use client'
import React, { Suspense } from 'react'

import { AdminUsersPage } from '@/pages_legacy/admin/AdminUsersPage'

export default function Page() {
  return (<Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center text-sm text-gray-500">Loading...</div>}><AdminUsersPage /></Suspense>); }
