'use client'
import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Building2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/dashboard'
  const messageParam = searchParams.get('message')

  const refreshUser = useAuthStore((state) => state.refreshUser)
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setIsSubmitting(true)
      setAuthError(null)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email.trim(),
        password: values.password,
      })

      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          setAuthError('Incorrect email or password. Please try again.')
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          setAuthError('Please verify your email address before logging in.')
        } else {
          setAuthError(error.message)
        }
        return
      }

      if (data.session) {
        await refreshUser()
        navigate(returnTo, { replace: true })
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      setAuthError(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF8F2] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E96512] to-[#F47B20] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-bold font-['Poppins'] tracking-tight text-[#202124]">
              Sasta<span className="text-[#F47B20]">Plots</span>
            </span>
            <span className="block text-[10px] uppercase tracking-wider font-semibold text-[#727272]">
              Verified Land Marketplace
            </span>
          </div>
        </Link>
        <h2 className="mt-6 text-2xl sm:text-3xl font-bold text-[#202124] font-['Poppins']">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-[#727272]">
          Sign in to manage your listings, favourites, and buyer enquiries
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-[#EAEAEA] rounded-2xl">
          {messageParam && (
            <div className="mb-6 p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 text-green-800 text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>{messageParam}</span>
            </div>
          )}

          {authError && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 text-sm animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Authentication Failed</p>
                <p className="mt-0.5 text-xs text-red-700">{authError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="email" className="form-label text-xs uppercase tracking-wider text-[#555]">
                Email Address
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-5 h-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  className={`input-field pl-10 ${errors.email ? 'border-red-400 focus:border-red-500' : ''}`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="form-label text-xs uppercase tracking-wider text-[#555] mb-0">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#F47B20] hover:text-[#E96512] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-5 h-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400 focus:border-red-500' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 h-5" /> : <Eye className="h-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-[#F47B20] focus:ring-[#F47B20]"
                  {...register('rememberMe')}
                />
                <span className="text-sm text-[#727272]">Remember me for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#EAEAEA] text-center">
            <p className="text-sm text-[#727272]">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-[#F47B20] hover:text-[#E96512] transition-colors inline-flex items-center gap-1"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-[#727272]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#168653]" />
            <span>100% Verified Listings</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[#F47B20]" />
            <span>Direct Owners & Agents</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
