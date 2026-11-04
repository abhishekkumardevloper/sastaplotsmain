import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import type { Profile, UserRole } from '@/types'

export function useAuth() {
  const { user, isLoading, isAuthenticated, setUser, setLoading, logout, refreshUser } = useAuthStore()

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setUser(null)
        setLoading(false)
        return
      }

      // Fetch or assemble user profile
      supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
        .then(
          ({ data: profile, error }) => {
            if (profile && !error) {
              setUser(profile as Profile)
            } else {
              // Fallback profile from session metadata
              const fallbackProfile: Profile = {
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
              }
              setUser(fallbackProfile)
            }
            setLoading(false)
          },
          () => {
            setLoading(false)
          }
        )
    })

    // Listen to Supabase auth state change events
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
