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
    (set) => ({
      // 1. Default state null aur unauthenticated hona chahiye
      user: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),

      logout: async () => {
        try {
          await supabase.auth.signOut()
        } catch {
          // ignore
        }
        set({ user: null, isAuthenticated: false, isLoading: false })
      },

      refreshUser: async () => {
        set({ isLoading: true })
        try {
          const {
            data: { user: authUser },
            error: authError,
          } = await supabase.auth.getUser()

          // 2. Agar valid Supabase session nahi hai toh user ko logout state mein bhejein
          if (authError || !authUser) {
            set({ user: null, isAuthenticated: false, isLoading: false })
            return
          }

          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single()

          if (profileError || !profile) {
            set({ user: null, isAuthenticated: false, isLoading: false })
            return
          }

          set({ user: profile, isAuthenticated: true, isLoading: false })
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      },
    }),
    {
      // 3. Key name badalne se purana cached 'admin-1' localStorage automatically ignore ho jayega
      name: 'sastaplots-auth-v2',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
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
