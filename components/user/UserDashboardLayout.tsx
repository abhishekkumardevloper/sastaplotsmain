'use client'
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Menu, 
  X, 
  Bell, 
  Plus, 
  Building2, 
  ShieldCheck, 
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import { UserSidebar } from './UserSidebar'
import { useAuthStore, useNotificationStore } from '@/store/auth'

interface UserDashboardLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  action?: React.ReactNode
}

export const UserDashboardLayout: React.FC<UserDashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  action,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const user = useAuthStore((state) => state.user)
  const unreadCount = useNotificationStore((state) => state.unreadCount)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[#FFF8F2]/60 flex">
      {/* Desktop Sidebar (fixed/sticky) */}
      <div className="hidden lg:block w-64 flex-shrink-0 sticky top-0 h-screen z-30">
        <UserSidebar />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform duration-200 ease-in-out lg:hidden shadow-xl ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative h-full">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-4 right-3 p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 z-10"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
          <UserSidebar onClose={() => setMobileMenuOpen(false)} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[#EAEAEA] px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 focus:outline-none"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              {title ? (
                <div>
                  <h1 className="text-lg sm:text-xl font-bold font-['Poppins'] text-[#202124]">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-xs text-[#727272] hidden sm:block">
                      {subtitle}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-[#727272]">
                  <Link to="/dashboard" className="hover:text-[#F47B20] font-medium">Dashboard</Link>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[#202124] font-medium capitalize">
                    {location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Overview'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Header CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {action}

            <Link
              to="/post-property"
              className="btn-primary py-2 px-3.5 sm:px-4 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Property</span>
            </Link>

            <Link
              to="/dashboard/notifications"
              className="relative p-2 rounded-xl text-gray-600 hover:bg-[#FFF8F2] hover:text-[#F47B20] transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F47B20] ring-2 ring-white" />
              )}
            </Link>

            <Link
              to="/dashboard/profile"
              className="flex items-center gap-2 pl-2 border-l border-gray-200"
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name || 'Profile'}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-orange-100 text-[#F47B20] font-semibold text-xs flex items-center justify-center">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default UserDashboardLayout
