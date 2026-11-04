'use client'

import { useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import type { Profile, UserRole } from '@/types'

export function useAuth() {
  const { user, isLoading, isAuthenticated, setUser, setLoading, logout, refreshUser } = useAuthStore()

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setLoading(false)
        return
      }

      supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
        .then(
          ({ data: profile, error }) => {
            if (profile && !error) {
              setUser(profile as Profile)
            }
            setLoading(false)
          },
          () => {
            setLoading(false)
          }
        )
    })

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
        }
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setLoading])

  const role = user?.role
  const isAdmin = role === 'admin' || role === 'super_admin'
  const isSuperAdmin = role === 'super_admin'
  const isSeller = role === 'owner' || role === 'agent'
  const isOwner = role === 'owner'
  const isAgent = role === 'agent'
  const isBuyer = role === 'buyer'

  return {
    user,
    isLoading,
    isAuthenticated,
    role,
    isAdmin,
    isSuperAdmin,
    isSeller,
    isOwner,
    isAgent,
    isBuyer,
    logout,
    refreshUser,
  }
}

export default useAuth
