import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  MapPin,
  Menu,
  X,
  Bell,
  User,
  PlusCircle,
  Compass,
  Building,
  Home,
  LogOut,
  ChevronDown,
} from 'lucide-react'
import { useAuthStore, useNotificationStore } from '@/store/auth'

export const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { unreadCount } = useNotificationStore()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setUserDropdownOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAEAEA] shadow-2xs">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 py-1">
            <img
              src="/logo.png"
              alt="Sasta Plots - Plots Made Simple"
              className="h-11 sm:h-13 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <NavLink
              to="/buy"
              className={({ isActive }) =>
                `text-sm font-semibold transition-colors ${
                  isActive ? 'text-[#F47B20]' : 'text-gray-700 hover:text-[#F47B20]'
                }`
              }
            >
              Buy Plots
            </NavLink>
            <NavLink
              to="/rent"
              className={({ isActive }) =>
                `text-sm font-semibold transition-colors ${
                  isActive ? 'text-[#F47B20]' : 'text-gray-700 hover:text-[#F47B20]'
                }`
              }
            >
              Rent / Lease
            </NavLink>
            <NavLink
              to="/plots"
              className={({ isActive }) =>
                `text-sm font-semibold transition-colors ${
                  isActive ? 'text-[#F47B20]' : 'text-gray-700 hover:text-[#F47B20]'
                }`
              }
            >
              Residential Plots
            </NavLink>
            <NavLink
              to="/agricultural-land"
              className={({ isActive }) =>
                `text-sm font-semibold transition-colors ${
                  isActive ? 'text-[#F47B20]' : 'text-gray-700 hover:text-[#F47B20]'
                }`
              }
            >
              Farmland
            </NavLink>
            <NavLink
              to="/commercial"
              className={({ isActive }) =>
                `text-sm font-semibold transition-colors ${
                  isActive ? 'text-[#F47B20]' : 'text-gray-700 hover:text-[#F47B20]'
                }`
              }
            >
              Commercial
            </NavLink>
            <NavLink
              to="/locations"
              className={({ isActive }) =>
                `text-sm font-semibold transition-colors flex items-center gap-1 ${
                  isActive ? 'text-[#F47B20]' : 'text-gray-700 hover:text-[#F47B20]'
                }`
              }
            >
              <MapPin className="w-3.5 h-3.5 text-[#F47B20]" />
              Locations
            </NavLink>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-xl text-gray-700 hover:text-[#F47B20] hover:bg-orange-50/50 transition-colors"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#F47B20] border-2 border-white" />
              )}
            </Link>

            {/* Post Property CTA Button */}
            <Link
              to="/post-property"
              className="hidden sm:inline-flex btn-primary btn-sm text-xs py-2 px-3.5"
            >
              <PlusCircle className="w-4 h-4" />
              Post Property
            </Link>

            {/* User Profile or Login */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-gray-200 hover:border-[#F47B20] bg-gray-50 transition-all text-xs font-semibold text-[#202124]"
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#F47B20] flex items-center justify-center font-bold">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden md:block max-w-[90px] truncate">
                    {user?.full_name || 'My Account'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-[#EAEAEA] rounded-2xl shadow-xl py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-bold text-[#202124] truncate">{user?.full_name}</p>
                      <p className="text-[11px] text-[#727272] truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-[#F47B20]"
                    >
                      <User className="w-3.5 h-3.5" /> Profile Dashboard
                    </Link>
                    <Link
                      to="/notifications"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-[#F47B20]"
                    >
                      <Bell className="w-3.5 h-3.5" /> Notifications ({unreadCount})
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-secondary btn-sm text-xs py-2 px-3.5"
              >
                Login
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 space-y-2 text-sm font-semibold">
            <Link
              to="/buy"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-orange-50 hover:text-[#F47B20]"
            >
              Buy Plots
            </Link>
            <Link
              to="/rent"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-orange-50 hover:text-[#F47B20]"
            >
              Rent / Lease
            </Link>
            <Link
              to="/plots"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-orange-50 hover:text-[#F47B20]"
            >
              Residential Plots
            </Link>
            <Link
              to="/agricultural-land"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-orange-50 hover:text-[#F47B20]"
            >
              Agricultural Land
            </Link>
            <Link
              to="/commercial"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-orange-50 hover:text-[#F47B20]"
            >
              Commercial Properties
            </Link>
            <Link
              to="/locations"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-orange-50 hover:text-[#F47B20]"
            >
              All Locations
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-orange-50 hover:text-[#F47B20]"
            >
              About Sasta Plots
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-orange-50 hover:text-[#F47B20]"
            >
              Contact Us
            </Link>
            <Link
              to="/post-property"
              onClick={() => setMobileMenuOpen(false)}
              className="block mt-3 btn-primary text-center"
            >
              + Post Your Property
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
