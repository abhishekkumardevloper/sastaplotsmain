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
  ExternalLink,
  ChevronRight,
} from 'lucide-react'
import { useAuthStore, useNotificationStore } from '@/store/auth'
import { cn } from '@/lib/utils'

interface UserSidebarProps {
  onClose?: () => void
  className?: string
  listingCount?: number
}

export const UserSidebar: React.FC<UserSidebarProps> = ({ onClose, className, listingCount }) => {
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
      badge: listingCount && listingCount > 0 ? listingCount : undefined,
    },
    {
      label: 'Post New Property',
      to: '/post-property',
      icon: PlusCircle,
      highlight: true,
    },
    {
      label: 'Saved / Favourites',
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
      label: 'Profile & KYC',
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
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
            <ShieldCheck className="w-3 h-3 text-green-600" />
            Verified Seller
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Verification Pending
          </span>
        )
      default:
        return (
          <Link
            to="/dashboard/profile"
            onClick={onClose}
            className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-600 bg-gray-100 hover:bg-orange-50 hover:text-[#F47B20] px-2 py-0.5 rounded-full transition-colors"
          >
            <AlertTriangle className="w-3 h-3 text-orange-500" />
            Complete KYC
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
        'w-64 bg-white border-r border-gray-100 flex flex-col h-full select-none shadow-sm',
        className
      )}
    >
      {/* Brand Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <Link
          to="/"
          className="flex items-center gap-2.5 group mb-5"
          onClick={onClose}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E96512] to-[#F47B20] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black font-['Poppins'] text-[#1A1A2E]">
              Sasta<span className="text-[#F47B20]">Plots</span>
            </span>
            <span className="block text-[9px] uppercase font-bold text-gray-400 tracking-widest leading-none">
              Seller Portal
            </span>
          </div>
        </Link>

        {/* User Profile Card */}
        <div className="bg-gradient-to-br from-[#FFF8F2] to-orange-50 rounded-2xl p-3 border border-orange-100">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name || 'User avatar'}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E96512] to-[#F47B20] text-white font-black text-sm flex items-center justify-center border-2 border-white shadow-sm">
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
              <h4 className="text-sm font-bold text-[#1A1A2E] truncate leading-tight">
                {user?.full_name || 'My Account'}
              </h4>
              <p className="text-[11px] text-gray-500 truncate mb-1.5 leading-tight">
                {user?.email || 'User account'}
              </p>
              <div>{getVerificationBadge()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5 scrollbar-thin">
        <p className="text-[9px] uppercase font-black text-gray-400 tracking-widest px-3 pt-1 pb-2">
          Main Menu
        </p>

        {navItems.map((item, idx) => {
          const Icon = item.icon
          const showDividerBefore = idx === 2 // Before "Post New Property"
          return (
            <React.Fragment key={item.to}>
              {showDividerBefore && (
                <div className="pt-2 pb-1">
                  <div className="border-t border-gray-100" />
                </div>
              )}
              <NavLink
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                    item.highlight && !isActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-sm hover:shadow-md hover:from-orange-600 hover:to-amber-600'
                      : '',
                    !item.highlight && isActive
                      ? 'bg-orange-50 text-[#F47B20] font-bold'
                      : '',
                    !item.highlight && !isActive
                      ? 'text-gray-600 hover:bg-gray-50 hover:text-[#F47B20]'
                      : ''
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                          item.highlight
                            ? 'bg-white/20 text-white'
                            : isActive
                            ? 'bg-[#F47B20] text-white shadow-sm'
                            : 'bg-gray-100 text-gray-500 group-hover:bg-orange-50 group-hover:text-[#F47B20]'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={item.highlight ? 'text-white font-bold' : ''}>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge !== undefined && (
                        <span
                          className={cn(
                            'text-[11px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                            item.highlight
                              ? 'bg-white/30 text-white'
                              : 'bg-[#F47B20] text-white'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                      {!item.badge && !item.highlight && isActive && (
                        <ChevronRight className="w-3.5 h-3.5 text-[#F47B20]" />
                      )}
                    </div>
                  </>
                )}
              </NavLink>
            </React.Fragment>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-[#1A1A2E] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-[#F47B20]" />
            Explore SastaPlots
          </span>
          <ExternalLink className="w-3 h-3 text-gray-400" />
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
            <LogOut className="w-3.5 h-3.5 text-red-500" />
          </div>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

export default UserSidebar
