import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile } from '@/types'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: Profile | null) => void
  setLoading: (loading: boolean) => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: {
        id: 'admin-1',
        email: 'admin@sastaplots.com',
        full_name: 'Administrator',
        role: 'super_admin',
        is_active: true,
        phone_verified: true,
        is_email_verified: true,
        verification_status: 'verified',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      isLoading: false,
      isAuthenticated: true,

      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),

      logout: async () => {
        try {
          await supabase.auth.signOut()
        } catch {
          // ignore
        }
        set({ user: null, isAuthenticated: false })
      },

      refreshUser: async () => {
        set({ isLoading: true })
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser()
          if (!authUser) {
            // Keep existing state if offline
            set({ isLoading: false })
            return
          }
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single()
          if (profile) {
            set({ user: profile, isAuthenticated: true, isLoading: false })
          } else {
            set({ isLoading: false })
          }
        } catch {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'sastaplots-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)

// Notification count store
interface NotificationState {
  unreadCount: number
  setUnreadCount: (count: number) => void
  decrementCount: () => void
  incrementCount: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  decrementCount: () => set({ unreadCount: Math.max(0, get().unreadCount - 1) }),
  incrementCount: () => set({ unreadCount: get().unreadCount + 1 }),
}))
