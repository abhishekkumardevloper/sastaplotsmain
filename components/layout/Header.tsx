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
  PhoneCall,
  Search,
  Sparkles,
  MapPin,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/auth'
import NotificationBell from '@/components/ui/NotificationBell'

export const Header: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [buyDropdownOpen, setBuyDropdownOpen] = useState(false)
  const [citiesDropdownOpen, setCitiesDropdownOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const buyMenuRef = useRef<HTMLDivElement>(null)
  const citiesMenuRef = useRef<HTMLDivElement>(null)

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
      if (buyMenuRef.current && !buyMenuRef.current.contains(e.target as Node)) {
        setBuyDropdownOpen(false)
      }
      if (citiesMenuRef.current && !citiesMenuRef.current.contains(e.target as Node)) {
        setCitiesDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const popularCities = [
    { name: 'Noida', state: 'Uttar Pradesh', tag: 'High Growth' },
    { name: 'Lucknow', state: 'Uttar Pradesh', tag: 'Fast Developing' },
    { name: 'Jaipur', state: 'Rajasthan', tag: 'Popular' },
    { name: 'Pune', state: 'Maharashtra', tag: 'IT Hub' },
    { name: 'Bangalore', state: 'Karnataka', tag: 'Tech Corridor' },
    { name: 'Hyderabad', state: 'Telangana', tag: 'Expressway' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-xs transition-all">
      {/* ──────────────── Top Ticker / Trust Strip ──────────────── */}
      <div className="bg-[#0F172A] text-slate-300 text-xs py-1.5 border-b border-slate-800">
        <div className="container-custom flex items-center justify-between">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="inline-flex items-center gap-1.5 font-semibold text-[#F47B20] shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-[#F47B20] animate-pulse" />
              <span>MagicBricks-Grade Land Portal</span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                100% Admin-Reviewed Plots
              </span>
              <span>•</span>
              <span>Direct Owner & Verified Broker Listings</span>
              <span>•</span>
              <span className="text-amber-300 font-medium">Zero Brokerage Options</span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-slate-300 font-medium">
            <a
              href="tel:+919876543210"
              className="flex items-center gap-1.5 hover:text-[#F47B20] transition-colors"
            >
              <PhoneCall className="w-3 h-3 text-[#F47B20]" />
              <span className="hidden sm:inline">Toll Free: </span>+91 98765 43210
            </a>
          </div>
        </div>
      </div>

      {/* ──────────────── Main Navigation Bar ──────────────── */}
      <div className="container-custom flex h-18 items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <img
            src="/logo.png"
            alt="SastaPlots - Plots Made Simple"
            className="h-10 sm:h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <div className="hidden xl:flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#F47B20] leading-none">
              India's Dedicated
            </span>
            <span className="text-xs font-semibold text-slate-500 leading-tight">
              Land & Plot Marketplace
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {/* Buy Plots Mega Dropdown */}
          <div className="relative" ref={buyMenuRef}>
            <button
              type="button"
              onClick={() => setBuyDropdownOpen(!buyDropdownOpen)}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                buyDropdownOpen
                  ? 'text-[#F47B20] bg-orange-50'
                  : 'text-slate-700 hover:text-[#F47B20] hover:bg-slate-50'
              }`}
            >
              <span>Buy Plots</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${buyDropdownOpen ? 'rotate-180 text-[#F47B20]' : 'text-slate-400'}`} />
            </button>

            {buyDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white shadow-2xl border border-slate-100 p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 mb-1">
                  Explore Plot Types
                </div>
                <Link
                  to="/plots"
                  onClick={() => setBuyDropdownOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-orange-50 group transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-[#F47B20]">
                      Residential Plots
                    </p>
                    <p className="text-xs text-slate-400">Gated, Villa & Colony Land</p>
                  </div>
                  <span className="text-[10px] font-bold bg-orange-100 text-[#F47B20] px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                </Link>

                <Link
                  to="/agricultural-land"
                  onClick={() => setBuyDropdownOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50 group transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-600">
                      Agricultural Land
                    </p>
                    <p className="text-xs text-slate-400">Farmland, Agro & Orchards</p>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    High ROI
                  </span>
                </Link>

                <Link
                  to="/commercial"
                  onClick={() => setBuyDropdownOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50 group transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600">
                      Commercial Plots
                    </p>
                    <p className="text-xs text-slate-400">SCO, Showrooms & Warehousing</p>
                  </div>
                </Link>

                <div className="my-1.5 border-t border-slate-100" />
                <Link
                  to="/search?is_verified=true"
                  onClick={() => setBuyDropdownOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100/70 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>View All 100% Verified Plots</span>
                </Link>
              </div>
            )}
          </div>

          <NavLink
            to="/commercial"
            className={({ isActive }) =>
              `px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isActive
                  ? 'text-[#F47B20] bg-orange-50'
                  : 'text-slate-700 hover:text-[#F47B20] hover:bg-slate-50'
              }`
            }
          >
            Commercial Land
          </NavLink>

          <NavLink
            to="/agricultural-land"
            className={({ isActive }) =>
              `px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isActive
                  ? 'text-[#F47B20] bg-orange-50'
                  : 'text-slate-700 hover:text-[#F47B20] hover:bg-slate-50'
              }`
            }
          >
            Agricultural
          </NavLink>

          {/* Top Cities Dropdown */}
          <div className="relative" ref={citiesMenuRef}>
            <button
              type="button"
              onClick={() => setCitiesDropdownOpen(!citiesDropdownOpen)}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                citiesDropdownOpen
                  ? 'text-[#F47B20] bg-orange-50'
                  : 'text-slate-700 hover:text-[#F47B20] hover:bg-slate-50'
              }` }
            >
              <MapPin className="w-3.5 h-3.5 text-[#F47B20]" />
              <span>Top Cities</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${citiesDropdownOpen ? 'rotate-180 text-[#F47B20]' : 'text-slate-400'}`} />
            </button>

            {citiesDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white shadow-2xl border border-slate-100 p-2.5 z-50 animate-in fade-in zoom-in-95">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 mb-1">
                  High-Demand Plot Markets
                </div>
                {popularCities.map((city) => (
                  <Link
                    key={city.name}
                    to={`/search?q=${encodeURIComponent(city.name)}`}
                    onClick={() => setCitiesDropdownOpen(false)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-orange-50 group transition-colors"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-800 group-hover:text-[#F47B20]">
                        {city.name}
                      </p>
                      <p className="text-xs text-slate-400">{city.state}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {city.tag}
                    </span>
                  </Link>
                ))}
                <div className="mt-1.5 pt-1.5 border-t border-slate-100 text-center">
                  <Link
                    to="/locations"
                    onClick={() => setCitiesDropdownOpen(false)}
                    className="text-xs font-bold text-[#F47B20] hover:underline"
                  >
                    View All 48+ Cities →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right CTA / Auth Area */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Button */}
          <Link
            to="/search"
            aria-label="Search Properties"
            className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-600 hover:text-[#F47B20] hover:bg-orange-50 transition-colors"
          >
            <Search className="w-5 h-5" />
          </Link>

          {/* Post Property Button (Highlighted with Free Badge) */}
          <Link
            to={isAuthenticated ? '/dashboard/add-property' : '/post-property'}
            className="btn-primary text-xs sm:text-sm py-2 px-3.5 sm:px-4.5 shrink-0 shadow-sm flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span className="font-bold">Post Property</span>
            <span className="bg-white/25 text-[10px] font-black uppercase px-1.5 py-0.5 rounded-full tracking-wider">
              FREE
            </span>
          </Link>

          {/* Notifications if authenticated */}
          {isAuthenticated && <NotificationBell />}

          {/* User Account Button or Sign In Links */}
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="User account menu"
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
              >
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-orange-100 border border-orange-200 text-[#F47B20] font-bold text-xs flex items-center justify-center">
                    {getInitials(user?.full_name)}
                  </div>
                )}
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {user?.full_name || 'My Account'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-[#E96512] px-2 py-0.5 rounded-full">
                        {user?.role || 'Buyer'}
                      </span>
                      {user?.seller_category && (
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {user.seller_category}
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#F47B20] transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-400" />
                    <span>My Dashboard</span>
                  </Link>

                  <Link
                    to="/dashboard/listings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#F47B20] transition-colors"
                  >
                    <Building className="w-4 h-4 text-slate-400" />
                    <span>My Property Listings</span>
                  </Link>

                  <Link
                    to="/dashboard/favourites"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#F47B20] transition-colors"
                  >
                    <Heart className="w-4 h-4 text-slate-400" />
                    <span>Saved Properties</span>
                  </Link>

                  <Link
                    to="/dashboard/enquiries"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#F47B20] transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <span>Buyer Enquiries</span>
                  </Link>

                  <Link
                    to="/dashboard/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#F47B20] transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Profile & KYC Status</span>
                  </Link>

                  {isAdmin && (
                    <>
                      <div className="my-1 border-t border-slate-100" />
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-amber-600" />
                        <span>Admin Approval Panel</span>
                      </Link>
                    </>
                  )}

                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#F47B20] transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="hidden sm:inline-flex btn-secondary text-xs sm:text-sm py-2 px-3.5"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle mobile navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ──────────────── Mobile Navigation Drawer ──────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 top-26 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-26 right-0 bottom-0 z-50 w-80 bg-white shadow-2xl border-l border-slate-100 flex flex-col p-6 overflow-y-auto lg:hidden"
            >
              <div className="pb-4 border-b border-slate-100 space-y-2">
                <Link
                  to={isAuthenticated ? '/dashboard/add-property' : '/post-property'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#F47B20] to-[#E96512] shadow-md"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post Property (FREE)</span>
                </Link>

                <Link
                  to="/search"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
                >
                  <Search className="w-4 h-4" />
                  <span>Search All Plots</span>
                </Link>
              </div>

              <div className="flex flex-col gap-1 py-4 border-b border-slate-100">
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                  Plot Categories
                </span>
                <Link
                  to="/plots"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-sm font-bold text-slate-800 hover:text-[#F47B20]"
                >
                  Residential Plots
                </Link>
                <Link
                  to="/agricultural-land"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-sm font-bold text-slate-800 hover:text-[#F47B20]"
                >
                  Agricultural Land & Farmland
                </Link>
                <Link
                  to="/commercial"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-sm font-bold text-slate-800 hover:text-[#F47B20]"
                >
                  Commercial Land & SCO Plots
                </Link>
                <Link
                  to="/locations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-sm font-bold text-slate-800 hover:text-[#F47B20]"
                >
                  Explore Top Cities
                </Link>
              </div>

              {/* Account Section in Mobile Drawer */}
              <div className="mt-4 flex flex-col gap-1">
                {isAuthenticated ? (
                  <>
                    <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                      My Account
                    </span>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 text-sm font-semibold text-slate-700 hover:text-[#F47B20]"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/dashboard/listings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 text-sm font-semibold text-slate-700 hover:text-[#F47B20]"
                    >
                      My Property Listings
                    </Link>
                    <Link
                      to="/dashboard/favourites"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 text-sm font-semibold text-slate-700 hover:text-[#F47B20]"
                    >
                      Saved Properties
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-2 text-sm font-bold text-amber-700"
                      >
                        Admin Approval Portal
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="text-left py-2 text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 pt-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 text-center rounded-xl text-sm font-bold text-slate-800 border border-slate-200"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 text-center rounded-xl text-sm font-bold text-white bg-[#F47B20]"
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
