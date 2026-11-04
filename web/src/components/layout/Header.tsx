import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {
  Menu,
  X,
  PlusCircle,
  User,
  LayoutDashboard,
  Building,
  Heart,
  MessageSquare,
  Settings,
  LogOut,
  Shield,
  ChevronDown,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/auth'
import NotificationBell from '@/components/ui/NotificationBell'

export const Header: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

  const navLinks = [
    { label: 'Buy', href: '/buy' },
    { label: 'Rent', href: '/rent' },
    { label: 'Commercial', href: '/commercial' },
    { label: 'Plots', href: '/plots' },
    { label: 'Agricultural', href: '/agricultural-land' },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs transition-all">
      <div className="container-custom h-18 flex items-center justify-between gap-4">
        {/* Official Sasta Plots Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group focus:outline-none py-1">
          <img
            src="/logo.png"
            alt="Sasta Plots - Plots Made Simple"
            className="h-12 sm:h-14 w-auto object-contain transition-transform group-hover:scale-102"
          />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                `text-sm font-semibold transition-colors duration-150 ${
                  isActive ? 'text-[#F47B20]' : 'text-gray-600 hover:text-[#F47B20]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Action Icons & Buttons */}
        <div className="flex items-center gap-3">
          {/* Post Property Button (Always visible on desktop) */}
          <Link
            to={isAuthenticated ? '/dashboard/add-property' : '/post-property'}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#F47B20] hover:bg-[#E96512] shadow-sm hover:shadow-md hover:shadow-[#F47B20]/25 transition-all transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Property</span>
            <span className="text-[10px] font-bold uppercase bg-white/25 px-1.5 py-0.5 rounded-full">
              FREE
            </span>
          </Link>

          {/* Notification Bell (Only if authenticated) */}
          {isAuthenticated && <NotificationBell />}

          {/* User Profile Dropdown or Login Button */}
          {isAuthenticated ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  aria-label="User account menu"
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
                >
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-9 h-9 rounded-xl object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-[#FFF8F2] border border-[#FFE4CC] text-[#F47B20] font-bold text-xs flex items-center justify-center">
                      {getInitials(user?.full_name)}
                    </div>
                  )}
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={8}
                  className="z-50 w-60 rounded-2xl bg-white shadow-xl border border-gray-100 p-2 focus:outline-none animate-in fade-in-50 zoom-in-95 duration-150"
                >
                  {/* User info header */}
                  <div className="px-3 py-2 border-b border-gray-100 mb-1">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {user?.full_name || 'My Account'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    <div className="mt-1">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-[#F47B20] px-2 py-0.5 rounded-full border border-orange-200/60">
                        {user?.role || 'Buyer'}
                      </span>
                    </div>
                  </div>

                  {/* Links */}
                  <DropdownMenu.Item asChild>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-[#FFF8F2] hover:text-[#F47B20] transition-colors outline-none cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-400" />
                      <span>User Dashboard</span>
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Item asChild>
                    <Link
                      to="/dashboard/listings"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-[#FFF8F2] hover:text-[#F47B20] transition-colors outline-none cursor-pointer"
                    >
                      <Building className="w-4 h-4 text-gray-400" />
                      <span>My Listings</span>
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Item asChild>
                    <Link
                      to="/dashboard/favourites"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-[#FFF8F2] hover:text-[#F47B20] transition-colors outline-none cursor-pointer"
                    >
                      <Heart className="w-4 h-4 text-gray-400" />
                      <span>Saved Properties</span>
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Item asChild>
                    <Link
                      to="/dashboard/enquiries"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-[#FFF8F2] hover:text-[#F47B20] transition-colors outline-none cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span>Buyer Enquiries</span>
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Item asChild>
                    <Link
                      to="/dashboard/profile"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-[#FFF8F2] hover:text-[#F47B20] transition-colors outline-none cursor-pointer"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span>Profile & KYC</span>
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Item asChild>
                    <Link
                      to="/dashboard/settings"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-[#FFF8F2] hover:text-[#F47B20] transition-colors outline-none cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenu.Item>

                  {isAdmin && (
                    <>
                      <div className="my-1 border-t border-gray-100" />
                      <DropdownMenu.Item asChild>
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#F47B20] hover:bg-orange-50 transition-colors outline-none cursor-pointer"
                        >
                          <Shield className="w-4 h-4 text-[#F47B20]" />
                          <span>Admin Control Panel</span>
                        </Link>
                      </DropdownMenu.Item>
                    </>
                  )}

                  <div className="my-1 border-t border-gray-100" />

                  <DropdownMenu.Item
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors outline-none cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-[#F47B20] transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="hidden sm:inline-flex btn-secondary text-sm py-2 px-3.5"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Toggle mobile navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-out Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 top-18 z-40 bg-black/40 backdrop-blur-xs md:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-18 right-0 bottom-0 z-50 w-72 bg-white shadow-2xl border-l border-gray-100 flex flex-col p-6 overflow-y-auto md:hidden"
            >
              <div className="flex flex-col gap-1 pb-4 border-b border-gray-100">
                <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                  Browse Properties
                </span>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-base font-semibold text-gray-800 hover:text-[#F47B20] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="py-4 border-b border-gray-100 space-y-3">
                <Link
                  to={isAuthenticated ? '/dashboard/add-property' : '/post-property'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#F47B20] hover:bg-[#E96512] shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post Property (FREE)</span>
                </Link>

                <Link
                  to="/search"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200"
                >
                  Search All Listings
                </Link>
              </div>

              {/* User Account Mobile Section */}
              <div className="mt-4 flex flex-col gap-1">
                {isAuthenticated ? (
                  <>
                    <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                      My Account
                    </span>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 text-sm font-medium text-gray-700 hover:text-[#F47B20]"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/dashboard/listings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 text-sm font-medium text-gray-700 hover:text-[#F47B20]"
                    >
                      My Listings
                    </Link>
                    <Link
                      to="/dashboard/favourites"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 text-sm font-medium text-gray-700 hover:text-[#F47B20]"
                    >
                      Saved Properties
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-2 text-sm font-bold text-[#F47B20]"
                      >
                        Admin Portal
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        handleLogout()
                      }}
                      className="text-left py-2 text-sm font-medium text-rose-600"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 pt-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 text-center text-sm font-semibold text-gray-800 border border-gray-200 rounded-xl"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 text-center text-sm font-semibold text-white bg-[#F47B20] rounded-xl"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Header
