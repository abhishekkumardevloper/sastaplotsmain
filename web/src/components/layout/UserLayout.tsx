import React, { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  Heart,
  MessageSquare,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Shield,
  ExternalLink,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/auth'
import NotificationBell from '@/components/ui/NotificationBell'

export const UserLayout: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

  const navItems = [
    { label: 'Dashboard Overview', href: '/dashboard', icon: LayoutDashboard, end: true },
    { label: 'My Listings', href: '/dashboard/listings', icon: Building2 },
    { label: 'Post New Property', href: '/dashboard/add-property', icon: PlusCircle },
    { label: 'Saved Properties', href: '/dashboard/favourites', icon: Heart },
    { label: 'Buyer Enquiries', href: '/dashboard/enquiries', icon: MessageSquare },
    { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { label: 'My Profile & KYC', href: '/dashboard/profile', icon: User },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Sidebar Header / Brand */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#F47B20] flex items-center justify-center text-white">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline">
              <span className="font-extrabold text-base text-gray-900 font-poppins">SASTA</span>
              <span className="font-extrabold text-base text-[#F47B20] ml-1 font-poppins">PLOTS</span>
            </div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              Seller Portal
            </p>
          </div>
        </Link>
      </div>

      {/* User Short Profile Card */}
      <div className="p-4 mx-3 my-3 rounded-2xl bg-[#FFF8F2] border border-[#FFE4CC]">
        <div className="flex items-center gap-3">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-10 h-10 rounded-xl object-cover border border-orange-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-white text-[#F47B20] font-bold text-xs flex items-center justify-center shadow-xs border border-orange-200">
              {getInitials(user?.full_name)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-gray-900 truncate">
              {user?.full_name || 'User Account'}
            </p>
            <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
            <span className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider text-[#F47B20] bg-white px-2 py-0.5 rounded-full border border-orange-200">
              {user?.role || 'Buyer'}
            </span>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#FFF0E0] text-[#F47B20]'
                  : 'text-gray-600 hover:text-[#F47B20] hover:bg-orange-50/50'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <div className="pt-2">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Admin
            </div>
            <Link
              to="/admin"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#F47B20] hover:bg-orange-50 transition-colors"
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span>Admin Portal</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        <Link
          to="/"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Home className="w-4 h-4 text-gray-400" />
            <span>Public Marketplace</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-64 lg:w-72 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-xl text-gray-700 hover:bg-gray-100"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <Link to="/" className="flex items-center gap-1.5 font-poppins font-bold text-base">
          <span className="text-gray-900">SASTA</span>
          <span className="text-[#F47B20]">PLOTS</span>
        </Link>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <Link
            to="/dashboard/add-property"
            className="p-2 rounded-xl bg-[#F47B20] text-white"
            title="Post Property"
          >
            <PlusCircle className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl md:hidden"
            >
              <div className="absolute top-4 right-4 z-10">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}

export default UserLayout
