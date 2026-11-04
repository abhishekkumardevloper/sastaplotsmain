'use client'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  CheckCircle2,
  Clock,
  MessageSquare,
  Building2,
  Trash2,
  Check,
  ShieldCheck,
  ExternalLink
} from 'lucide-react'
import { UserDashboardLayout } from '@/components/user/UserDashboardLayout'
import { useAuthStore, useNotificationStore } from '@/store/auth'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import type { Notification } from '@/types'
import { supabase } from '@/lib/supabase'

export const NotificationsPage: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      if (user?.id) {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (!error && data) {
          setNotifications(data as Notification[])
          const unread = data.filter((n: any) => !n.is_read).length
          setUnreadCount(unread)
        }
      }
    } catch (err) {
      console.error('Failed to load notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [user?.id])

  const markAllAsRead = async () => {
    if (!user?.id) return
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
      setUnreadCount(
        Math.max(
          0,
          notifications.filter((n) => !n.is_read && n.id !== id).length
        )
      )
    } catch {
      // ignore
    }
  }

  return (
    <UserDashboardLayout
      title="Notifications"
      subtitle="Alerts regarding your listing verifications, buyer inquiries, and account updates."
      action={
        notifications.some((n) => !n.is_read) ? (
          <button
            type="button"
            onClick={markAllAsRead}
            className="btn-secondary py-2 px-3 text-xs font-semibold flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 text-green-600" />
            <span>Mark All as Read</span>
          </button>
        ) : undefined
      }
    >
      <div className="bg-white rounded-2xl border border-[#EAEAEA] shadow-xs overflow-hidden max-w-3xl">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 skeleton rounded-xl" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#F47B20] flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[#202124] font-['Poppins']">
              No new notifications
            </h3>
            <p className="text-xs text-[#727272] max-w-xs mx-auto mt-1">
              You are all caught up! When you receive enquiries or your listings get approved, you will see notifications here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#EAEAEA]">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => markAsRead(item.id)}
                className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                  item.is_read ? 'hover:bg-gray-50/70' : 'bg-orange-50/40 hover:bg-orange-50/70'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    item.is_read ? 'bg-gray-100 text-gray-500' : 'bg-[#F47B20] text-white shadow-2xs'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-xs sm:text-sm truncate ${
                        item.is_read ? 'font-medium text-[#202124]' : 'font-bold text-[#202124]'
                      }`}
                    >
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {formatRelativeTime(item.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-[#727272] mt-0.5 leading-relaxed">{item.message}</p>

                  {item.link && (
                    <Link
                      to={item.link}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#F47B20] hover:underline mt-2"
                    >
                      <span>View details</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                {!item.is_read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F47B20] flex-shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </UserDashboardLayout>
  )
}

export default NotificationsPage
