'use client'
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Menu,
  X,
  Bell,
  Plus,
  Building2,
  ChevronRight,
  Home,
  LayoutDashboard,
  PlusCircle,
  Heart,
  MessageSquare,
  UserCheck,
  Settings,
} from 'lucide-react'
import { UserSidebar } from './UserSidebar'
import { useAuthStore, useNotificationStore } from '@/store/auth'
import { motion, AnimatePresence } from 'framer-motion'

interface UserDashboardLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  action?: React.ReactNode
}

// Bottom tab items (5 for mobile nav)
const BOTTOM_TABS = [
  { label: 'Home', to: '/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Listings', to: '/dashboard/listings', icon: Home },
  { label: 'Post', to: '/post-property', icon: PlusCircle, highlight: true },
  { label: 'Enquiries', to: '/dashboard/enquiries', icon: MessageSquare },
  { label: 'Profile', to: '/dashboard/profile', icon: UserCheck },
]

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

  const getBreadcrumb = () => {
    const parts = location.pathname.split('/').filter(Boolean)
    return parts.map((part, i) => ({
      label: part.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      to: '/' + parts.slice(0, i + 1).join('/'),
      isLast: i === parts.length - 1,
    }))
  }

  const breadcrumbs = getBreadcrumb()

  return (
    <div className="min-h-screen bg-gray-50/80 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-64 flex-shrink-0 sticky top-0 h-screen z-30">
        <UserSidebar />
      </div>

      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
          >
            <div className="relative h-full">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-3 p-1.5 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 z-10 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
              <UserSidebar onClose={() => setMobileMenuOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
            {/* Left: Hamburger + Title/Breadcrumb */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 focus:outline-none transition-colors flex-shrink-0"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="min-w-0">
                {title ? (
                  <div>
                    <h1 className="text-base sm:text-lg font-black font-['Poppins'] text-[#1A1A2E] leading-tight truncate">
                      {title}
                    </h1>
                    {subtitle && (
                      <p className="text-xs text-gray-400 hidden sm:block mt-0.5 truncate">
                        {subtitle}
                      </p>
                    )}
                  </div>
                ) : (
                  <nav className="flex items-center gap-1 text-xs text-gray-400" aria-label="Breadcrumb">
                    <Link to="/dashboard" className="hover:text-[#F47B20] font-semibold transition-colors">
                      Dashboard
                    </Link>
                    {breadcrumbs.length > 1 && breadcrumbs.slice(1).map((crumb) => (
                      <React.Fragment key={crumb.to}>
                        <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                        <span
                          className={
                            crumb.isLast
                              ? 'text-[#1A1A2E] font-bold capitalize'
                              : 'hover:text-[#F47B20] font-medium capitalize cursor-pointer'
                          }
                        >
                          {crumb.label}
                        </span>
                      </React.Fragment>
                    ))}
                  </nav>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {action}

              <Link
                to="/post-property"
                className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-[#F47B20] to-[#E96512] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all hover:from-[#E96512] hover:to-[#D4550A]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Property</span>
              </Link>

              <Link
                to="/dashboard/notifications"
                className="relative p-2 rounded-xl text-gray-500 hover:bg-orange-50 hover:text-[#F47B20] transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#F47B20] ring-2 ring-white flex items-center justify-center">
                    <span className="text-[8px] text-white font-black leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </span>
                )}
              </Link>

              <Link
                to="/dashboard/profile"
                className="flex items-center gap-2 pl-2 border-l border-gray-100 ml-1"
              >
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name || 'Profile'}
                    className="w-8 h-8 rounded-full object-cover border-2 border-orange-100"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E96512] to-[#F47B20] text-white font-black text-xs flex items-center justify-center">
                    {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="hidden sm:block text-xs font-bold text-[#1A1A2E] max-w-[80px] truncate">
                  {user?.full_name?.split(' ')[0] || 'Account'}
                </span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 shadow-lg">
        <div className="flex items-stretch h-16">
          {BOTTOM_TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = tab.end
              ? location.pathname === tab.to
              : location.pathname.startsWith(tab.to)
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all ${
                  tab.highlight
                    ? 'relative -mt-4'
                    : isActive
                    ? 'text-[#F47B20]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.highlight ? (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F47B20] to-[#E96512] text-white flex items-center justify-center shadow-lg border-4 border-white">
                    <Icon className="w-5 h-5" />
                  </div>
                ) : (
                  <>
                    <div
                      className={`p-1.5 rounded-xl transition-all ${
                        isActive ? 'bg-orange-50' : ''
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] font-bold ${
                        isActive ? 'text-[#F47B20]' : 'text-gray-400'
                      }`}
                    >
                      {tab.label}
                    </span>
                  </>
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default UserDashboardLayout
