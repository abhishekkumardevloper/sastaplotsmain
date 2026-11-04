'use client'
import React from 'react'
import { NavLink, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Home,
  PlusCircle,
  Heart,
  MessageSquare,
  Bell,
  UserCheck,
  Settings,
  LogOut,
  Building2,
  ShieldCheck,
  Clock,
  AlertTriangle,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import { useAuthStore, useNotificationStore } from '@/store/auth'
import { cn } from '@/lib/utils'

interface UserSidebarProps {
  onClose?: () => void
  className?: string
}

export const UserSidebar: React.FC<UserSidebarProps> = ({ onClose, className }) => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const unreadCount = useNotificationStore((state) => state.unreadCount)

  const handleLogout = async () => {
    await logout()
    if (onClose) onClose()
    navigate('/login')
  }

  const navItems = [
    {
      label: 'Dashboard Overview',
      to: '/dashboard',
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: 'My Listings',
      to: '/dashboard/listings',
      icon: Home,
    },
    {
      label: 'Add Property',
      to: '/post-property',
      icon: PlusCircle,
      highlight: true,
    },
    {
      label: 'My Favourites',
      to: '/dashboard/favourites',
      icon: Heart,
    },
    {
      label: 'Enquiries',
      to: '/dashboard/enquiries',
      icon: MessageSquare,
    },
    {
      label: 'Notifications',
      to: '/dashboard/notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      label: 'Profile & Verification',
      to: '/dashboard/profile',
      icon: UserCheck,
    },
    {
      label: 'Account Settings',
      to: '/dashboard/settings',
      icon: Settings,
    },
  ]

  const getVerificationBadge = () => {
    const status = user?.verification_status || 'unverified'
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
            <ShieldCheck className="w-3 h-3 text-green-600" />
            Verified Seller
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Verification Pending
          </span>
        )
      default:
        return (
          <Link
            to="/dashboard/profile"
            onClick={onClose}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-orange-50 hover:text-[#F47B20] px-2 py-0.5 rounded-full transition-colors"
          >
            <AlertTriangle className="w-3 h-3 text-orange-500" />
            Get Verified
          </Link>
        )
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return 'SP'
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <aside
      className={cn(
        'w-64 bg-white border-r border-[#EAEAEA] flex flex-col h-full select-none',
        className
      )}
    >
      {/* Brand & User Card */}
      <div className="p-4 border-b border-[#EAEAEA]">
        <Link
          to="/"
          className="flex items-center gap-2.5 px-2 py-1.5 mb-4 group"
          onClick={onClose}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E96512] to-[#F47B20] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold font-['Poppins'] text-[#202124]">
              Sasta<span className="text-[#F47B20]">Plots</span>
            </span>
            <span className="block text-[9px] uppercase font-semibold text-[#727272] tracking-wider">
              User Portal
            </span>
          </div>
        </Link>

        {/* Profile Snapshot */}
        <div className="bg-[#FFF8F2] rounded-xl p-3 border border-[#FDE8D2] flex items-center gap-3">
          <div className="relative">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name || 'User avatar'}
                className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#F47B20] text-white font-bold text-sm flex items-center justify-center border-2 border-white shadow-xs">
                {getInitials(user?.full_name)}
              </div>
            )}
            {user?.verification_status === 'verified' && (
              <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full p-0.5 text-white ring-2 ring-white">
                <ShieldCheck className="w-2.5 h-2.5" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-[#202124] truncate leading-tight">
              {user?.full_name || 'My Account'}
            </h4>
            <p className="text-xs text-[#727272] truncate mb-1.5">
              {user?.email || 'Logged in user'}
            </p>
            <div>{getVerificationBadge()}</div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                  item.highlight && !isActive
                    ? 'bg-gradient-to-r from-orange-50 to-amber-50 text-[#F47B20] border border-orange-200/60 font-semibold'
                    : '',
                  isActive
                    ? 'bg-[#FFF0E0] text-[#F47B20] font-semibold shadow-xs'
                    : 'text-[#505050] hover:bg-[#FFF8F2] hover:text-[#F47B20]'
                )
              }
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-transform group-hover:scale-110',
                    item.highlight ? 'text-[#F47B20]' : ''
                  )}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className="bg-[#F47B20] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}

              {item.highlight && !item.badge && (
                <span className="text-[10px] uppercase font-bold text-[#F47B20] bg-orange-100 px-1.5 py-0.5 rounded">
                  Fast
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Quick Public Site Link & Logout footer */}
      <div className="p-3 border-t border-[#EAEAEA] space-y-1">
        <Link
          to="/"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-[#727272] hover:bg-gray-100 hover:text-[#202124] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5" />
            Explore Sasta Plots
          </span>
          <ExternalLink className="w-3 h-3 text-gray-400" />
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

export default UserSidebar
