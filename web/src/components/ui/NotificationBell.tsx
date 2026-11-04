import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Bell, CheckCheck, Clock, ArrowRight, ShieldCheck, MessageSquare, AlertCircle } from 'lucide-react'
import { useNotificationStore, useAuthStore } from '@/store/auth'
import { formatRelativeTime } from '@/lib/utils'
import type { Notification } from '@/types'

// Default mock notifications for preview/initial state
const initialNotifications: Notification[] = [
  {
    id: 'n1',
    user_id: 'user-1',
    type: 'listing_approved',
    title: 'Listing Approved',
    message: 'Your property listing in Gomti Nagar has been verified and published.',
    link: '/dashboard/listings',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'n2',
    user_id: 'user-1',
    type: 'enquiry',
    title: 'New Buyer Enquiry',
    message: 'Rohit Sharma enquired about 1200 sq.ft residential plot in Indira Nagar.',
    link: '/dashboard/enquiries',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'n3',
    user_id: 'user-1',
    type: 'price_update',
    title: 'Market Trend Alert',
    message: 'Prices in Kisan Path zone increased by 8% this month.',
    link: '/search?locality=kisan-path',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
]

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { unreadCount, setUnreadCount } = useNotificationStore()
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

  const actualUnread = notifications.filter((n) => !n.is_read).length
  const displayCount = unreadCount || actualUnread

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  const handleNotificationClick = (item: Notification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
    )
    if (!item.is_read && displayCount > 0) {
      setUnreadCount(Math.max(0, displayCount - 1))
    }
    if (item.link) {
      navigate(item.link)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'listing_approved':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />
      case 'enquiry':
        return <MessageSquare className="w-4 h-4 text-[#F47B20]" />
      default:
        return <AlertCircle className="w-4 h-4 text-sky-600" />
    }
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="View notifications"
          className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-colors focus:outline-none"
        >
          <Bell className="w-5 h-5" />
          {displayCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#F47B20] text-[10px] font-bold text-white shadow-xs">
              {displayCount > 9 ? '9+' : displayCount}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-80 sm:w-96 rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden focus:outline-none animate-in fade-in-50 zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#FFF8F2]/60 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-900 font-sans">Notifications</span>
              {displayCount > 0 && (
                <span className="bg-[#F47B20]/15 text-[#F47B20] text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {displayCount} new
                </span>
              )}
            </div>

            {displayCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 text-xs text-[#F47B20] hover:text-[#E96512] font-medium transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50 scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No notifications right now
              </div>
            ) : (
              notifications.map((item) => (
                <DropdownMenu.Item
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`flex items-start gap-3 p-3.5 cursor-pointer transition-colors outline-none ${
                    !item.is_read ? 'bg-orange-50/30 hover:bg-orange-50/60' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-semibold truncate ${!item.is_read ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>
                        {item.title}
                      </p>
                      {!item.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#F47B20] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatRelativeTime(item.created_at)}</span>
                    </div>
                  </div>
                </DropdownMenu.Item>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-gray-100 bg-gray-50/50 text-center">
            <Link
              to={isAuthenticated ? '/dashboard/notifications' : '/login'}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-gray-700 hover:text-[#F47B20] py-1.5 px-3 rounded-lg transition-colors w-full"
            >
              <span>View all notifications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default NotificationBell
