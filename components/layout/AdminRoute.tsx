'use client'
import React from 'react'
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import Spinner from '@/components/ui/Spinner'

export interface AdminRouteProps {
  children?: React.ReactNode
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const location = useLocation()
  const { user, isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" color="primary" />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Validating administrative privileges...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md p-8 rounded-3xl bg-white border border-gray-200 text-center shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center border border-rose-100">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 font-sans">
            Access Restricted
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            You do not have administrative permissions to view this control panel. If you believe this is an error, please contact your platform administrator.
          </p>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 btn-primary text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to My Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return children ? <>{children}</> : <Outlet />
}

export default AdminRoute
