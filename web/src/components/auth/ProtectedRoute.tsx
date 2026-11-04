import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation()
  const { isAuthenticated, isLoading, refreshUser } = useAuthStore()

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF8F2] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F47B20] animate-spin mb-3" />
        <p className="text-xs font-semibold text-[#727272]">Loading your account...</p>
      </div>
    )
  }

  // If not authenticated, redirect to login with returnTo
  if (!isAuthenticated) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
