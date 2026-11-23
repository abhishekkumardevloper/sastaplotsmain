'use client'
import React, { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Menu, Shield } from 'lucide-react'
import { AdminSidebar } from './AdminSidebar'
import { useAuthStore } from '@/store/auth'

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  subtitle,
  actions,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const location = useLocation()
  const { user, isAuthenticated, isLoading, refreshUser } = useAuthStore()

  // Verify active Supabase session on mount
  useEffect(() => {
    if (!isAuthenticated) {
      refreshUser()
    }
  }, [isAuthenticated, refreshUser])

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

  // 1. Show loading state while session/profile is being verified
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 rounded-full border-2 border-[#F47B20] border-t-transparent animate-spin" />
        <p className="text-xs font-medium text-[#727272]">Verifying admin access...</p>
      </div>
    )
  }

  // 2. Redirect to login if not logged in
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 3. Redirect non-admin users (buyers/sellers) to normal dashboard
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex">
      {/* Admin Sidebar */}
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#EAEAEA] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition shrink-0"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold font-poppins text-[#202124] tracking-tight truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-[#727272] hidden sm:block truncate">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {actions}

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>{user.role === 'super_admin' ? 'Super Admin' : 'Admin Access'}</span>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
