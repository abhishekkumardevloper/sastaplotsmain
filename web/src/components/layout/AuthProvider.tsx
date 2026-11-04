import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import type { Profile, UserRole } from '@/types'

export interface AuthContextType {
  user: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  role?: UserRole
  isAdmin: boolean
  isSuperAdmin: boolean
  isSeller: boolean
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, setUser, setLoading, logout, refreshUser } = useAuthStore()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    let isMounted = true

    // Check active session on initial app mount
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error || !session) {
          if (isMounted) {
            setUser(null)
            setLoading(false)
            setIsInitialized(true)
          }
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (isMounted) {
          if (profile) {
            setUser(profile as Profile)
          } else {
            setUser({
              id: session.user.id,
              email: session.user.email ?? '',
              full_name:
                session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                session.user.email?.split('@')[0] ||
                'User',
              role: (session.user.user_metadata?.role as UserRole) || 'buyer',
              phone: session.user.phone,
              phone_verified: !!session.user.phone_confirmed_at,
              is_active: true,
              is_email_verified: !!session.user.email_confirmed_at,
              verification_status: 'unverified',
              avatar_url: session.user.user_metadata?.avatar_url,
              created_at: session.user.created_at,
              updated_at: new Date().toISOString(),
            })
          }
          setLoading(false)
          setIsInitialized(true)
        }
      } catch {
        if (isMounted) {
          setUser(null)
          setLoading(false)
          setIsInitialized(true)
        }
      }
    }

    initAuth()

    // Listen to all auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null)
        setLoading(false)
        return
      }

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          setUser(profile as Profile)
        } else {
          setUser({
            id: session.user.id,
            email: session.user.email ?? '',
            full_name:
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.email?.split('@')[0] ||
              'User',
            role: (session.user.user_metadata?.role as UserRole) || 'buyer',
            phone: session.user.phone,
            phone_verified: !!session.user.phone_confirmed_at,
            is_active: true,
            is_email_verified: !!session.user.email_confirmed_at,
            verification_status: 'unverified',
            avatar_url: session.user.user_metadata?.avatar_url,
            created_at: session.user.created_at,
            updated_at: new Date().toISOString(),
          })
        }
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [setUser, setLoading])

  const role = user?.role
  const isAdmin = role === 'admin' || role === 'super_admin'
  const isSuperAdmin = role === 'super_admin'
  const isSeller = role === 'owner' || role === 'agent'

  const value: AuthContextType = {
    user,
    isLoading: !isInitialized || isLoading,
    isAuthenticated,
    role,
    isAdmin,
    isSuperAdmin,
    isSeller,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

export default AuthProvider
