'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
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
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navLinks = [
    { label: 'Buy', href: '/buy' },
    { label: 'Rent', href: '/rent' },
    { label: 'Commercial', href: '/commercial' },
    { label: 'Plots', href: '/plots' },
    { label: 'Agricultural', href: '/agricultural-land' },
  ]

  const handleLogout = async () => {
    setUserMenuOpen(false)
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
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#EAEAEA] transition-all">
      <div className="container-custom flex h-18 items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <img
            src="/logo.png"
            alt="Sasta Plots - Plots Made Simple"
            className="h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </Link>

        {/* Desktop Primary Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'text-[#F47B20] bg-orange-50/70'
                    : 'text-[#202124] hover:text-[#F47B20] hover:bg-gray-50'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right CTA / Action Area */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Post Property Button (Always Visible) */}
          <Link
            to={isAuthenticated ? '/dashboard/add-property' : '/post-property'}
            className="btn-primary text-xs sm:text-sm py-2 px-3.5 sm:px-4 shrink-0 shadow-xs flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Property</span>
            <span className="hidden lg:inline-block bg-white/20 text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase">
              Free
            </span>
          </Link>

          {/* Notifications (Logged In) */}
          {isAuthenticated && <NotificationBell />}

          {/* User Profile Dropdown or Auth Links */}
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
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

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95">
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
                  <Link
                    to="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-[#FFF8F2] hover:text-[#F47B20] transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-gray-400" />
                    <span>User Dashboard</span>
                  </Link>

                  <Link
                    to="/dashboard/listings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-[#FFF8F2] hover:text-[#F47B20] transition-colors"
                  >
                    <Building className="w-4 h-4 text-gray-400" />
                    <span>My Listings</span>
                  </Link>

                  <Link
                    to="/dashboard/favourites"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-[#FFF8F2] hover:text-[#F47B20] transition-colors"
                  >
                    <Heart className="w-4 h-4 text-gray-400" />
                    <span>Saved Properties</span>
                  </Link>

                  <Link
                    to="/dashboard/enquiries"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-[#FFF8F2] hover:text-[#F47B20] transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    <span>Buyer Enquiries</span>
                  </Link>

                  <Link
                    to="/dashboard/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-[#FFF8F2] hover:text-[#F47B20] transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    <span>Profile & KYC</span>
                  </Link>

                  <Link
                    to="/dashboard/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-[#FFF8F2] hover:text-[#F47B20] transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    <span>Settings</span>
                  </Link>

                  {isAdmin && (
                    <>
                      <div className="my-1 border-t border-gray-100" />
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#F47B20] hover:bg-orange-50 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-[#F47B20]" />
                        <span>Admin Control Panel</span>
                      </Link>
                    </>
                  )}

                  <div className="my-1 border-t border-gray-100" />

                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
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
                      onClick={handleLogout}
                      className="text-left py-2 text-sm font-medium text-rose-600 hover:text-rose-700"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 text-center rounded-xl text-sm font-semibold text-[#202124] border border-gray-200"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 text-center rounded-xl text-sm font-semibold text-white bg-[#F47B20]"
                    >
                      Create Account
                    </Link>
                  </>
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
