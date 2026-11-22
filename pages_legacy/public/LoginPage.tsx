'use client'
import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
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
  CheckCircle2,
  TrendingUp,
  MapPin,
  Users,
  Star,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

const stats = [
  { icon: TrendingUp, label: 'Plots Listed', value: '12,000+' },
  { icon: Users, label: 'Happy Buyers', value: '50,000+' },
  { icon: MapPin, label: 'Cities Covered', value: '120+' },
]

const trustPoints = [
  { icon: ShieldCheck, text: '100% Verified Listings' },
  { icon: Star, text: 'Zero Commission Platform' },
  { icon: Building2, text: 'Direct Owner Contacts' },
]

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
    <div className="min-h-screen flex">
      {/* ── LEFT BRANDING PANEL ── */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-[55%] xl:w-[58%] relative flex-col justify-between overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 40%, #0F3460 70%, #1A1A2E 100%)',
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div
            className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #F47B20, transparent)' }}
          />
          <div
            className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #F47B20, transparent)' }}
          />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        {/* Top Logo */}
        <div className="relative z-10 p-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#E96512] to-[#F47B20] flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold font-['Poppins'] tracking-tight text-white">
                Sasta<span className="text-[#F47B20]">Plots</span>
              </span>
              <span className="block text-[10px] uppercase tracking-widest font-semibold text-white/50">
                Verified Land Marketplace
              </span>
            </div>
          </Link>
        </div>

        {/* Centre Content */}
        <div className="relative z-10 px-10 pb-6 flex-1 flex flex-col justify-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="text-4xl xl:text-5xl font-bold text-white font-['Poppins'] leading-tight mb-4">
              Find Your
              <br />
              <span className="text-[#F47B20]">Dream Plot</span>
              <br />
              in India
            </h1>
            <p className="text-white/60 text-base leading-relaxed mb-10 max-w-sm">
              Discover verified residential, agricultural, and commercial plots across 120+ cities — zero commission, direct from owners.
            </p>

            {/* Property visual card */}
            <div
              className="rounded-2xl overflow-hidden border border-white/10 mb-8 shadow-2xl"
              style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)' }}
            >
              <div
                className="h-40 relative flex items-end p-4"
                style={{
                  background: 'linear-gradient(to bottom, rgba(244,123,32,0.3), rgba(26,26,46,0.9))',
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.4,
                    mixBlendMode: 'overlay',
                  }}
                />
                <div className="relative z-10">
                  <span className="inline-flex items-center gap-1 bg-[#F47B20] text-white text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                  <p className="text-white font-semibold text-sm">Premium Residential Plot</p>
                  <p className="text-white/60 text-xs flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> Sector 12, Noida, Uttar Pradesh
                  </p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-white/40 text-xs">Starting from</p>
                  <p className="text-white font-bold text-lg">₹45 Lakh</p>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-xs">Plot Area</p>
                  <p className="text-white font-semibold text-sm">200 Sq.Yd.</p>
                </div>
                <div className="bg-[#F47B20]/20 border border-[#F47B20]/30 rounded-lg px-3 py-1.5">
                  <p className="text-[#F47B20] text-xs font-semibold">₹2,250/sqyd</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl p-3 text-center border border-white/10"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <s.icon className="w-5 h-5 text-[#F47B20] mx-auto mb-1" />
                  <p className="text-white font-bold text-sm">{s.value}</p>
                  <p className="text-white/40 text-[10px]">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Trust Points */}
            <div className="space-y-2.5">
              {trustPoints.map((t) => (
                <div key={t.text} className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#F47B20]/20 flex items-center justify-center flex-shrink-0">
                    <t.icon className="w-3.5 h-3.5 text-[#F47B20]" />
                  </div>
                  <span className="text-white/70 text-sm">{t.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 p-10 pt-0">
          <p className="text-white/30 text-xs italic">
            "India's most trusted plot marketplace — connecting buyers directly with verified owners."
          </p>
        </div>
      </motion.div>

      {/* ── RIGHT FORM PANEL ── */}
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex-1 flex flex-col justify-center bg-[#FFF8F2] overflow-y-auto"
      >
        {/* Mobile top banner */}
        <div
          className="lg:hidden flex items-center gap-3 px-6 py-4"
          style={{ background: 'linear-gradient(135deg, #1A1A2E, #0F3460)' }}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E96512] to-[#F47B20] flex items-center justify-center text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold font-['Poppins'] text-white">
              Sasta<span className="text-[#F47B20]">Plots</span>
            </span>
            <span className="block text-[10px] text-white/50 uppercase tracking-wider">Verified Land Marketplace</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-14 xl:px-20 py-10 max-w-lg mx-auto w-full">
          {/* Heading */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-[#202124] font-['Poppins']">Welcome back</h2>
            <p className="mt-2 text-sm text-[#727272]">
              Sign in to manage your listings, favourites and buyer enquiries
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            {/* Success message */}
            <AnimatePresence>
              {messageParam && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-5 p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 text-green-800 text-sm"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{messageParam}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auth error */}
            <AnimatePresence>
              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 text-sm"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Authentication Failed</p>
                    <p className="mt-0.5 text-xs text-red-700">{authError}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[#555] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-white text-sm text-[#202124] placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-[#F47B20]/30 focus:border-[#F47B20] ${
                      errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-[#EAEAEA]'
                    }`}
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-[#555]">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-[#F47B20] hover:text-[#E96512] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-11 py-3 border rounded-xl bg-white text-sm text-[#202124] placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-[#F47B20]/30 focus:border-[#F47B20] ${
                      errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-[#EAEAEA]'
                    }`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
              </div>

              {/* Remember Me */}
              <div>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-[#F47B20] focus:ring-[#F47B20] accent-[#F47B20]"
                    {...register('rememberMe')}
                  />
                  <span className="text-sm text-[#727272]">Remember me for 30 days</span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
                style={{
                  background: isSubmitting
                    ? '#ccc'
                    : 'linear-gradient(135deg, #E96512 0%, #F47B20 50%, #F5924A 100%)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
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

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-[#EAEAEA]" />
              <span className="text-xs text-[#BBBBBE] font-medium">or</span>
              <div className="flex-1 h-px bg-[#EAEAEA]" />
            </div>

            {/* Google Sign In — placeholder, uncomment when OAuth is configured */}
            {/* <button
              type="button"
              className="w-full py-3 rounded-xl border border-[#EAEAEA] bg-white text-sm font-medium text-[#202124] flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <svg viewBox="0 0 48 48" className="w-5 h-5">
                <path fill="#EA4335" d="M24 9.5c3.4 0 6.1 1.2 8.3 3.1l6.2-6.2C34.6 2.9 29.7 1 24 1 14.8 1 7 6.4 3.4 14l7.3 5.7C12.5 13.6 17.8 9.5 24 9.5z"/>
                <path fill="#34A853" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.4c-.5 2.8-2.1 5.2-4.5 6.8l7 5.4c4.1-3.8 6.5-9.4 6.5-16.2z"/>
                <path fill="#FBBC05" d="M10.7 28.3A14.5 14.5 0 0 1 9.5 24c0-1.5.3-2.9.7-4.3L2.9 14C1.1 17.3 0 21 0 24s1.1 6.7 2.9 10l7.8-5.7z"/>
                <path fill="#4285F4" d="M24 47c5.7 0 10.5-1.9 14-5.1l-7-5.4c-1.9 1.3-4.3 2-7 2-6.2 0-11.5-4.1-13.3-9.8l-7.3 5.7C7 41.6 14.8 47 24 47z"/>
              </svg>
              Continue with Google
            </button> */}

            {/* Register link */}
            <p className="text-center text-sm text-[#727272]">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-[#F47B20] hover:text-[#E96512] transition-colors inline-flex items-center gap-1"
              >
                Create one for free <ArrowRight className="w-3 h-3" />
              </Link>
            </p>

            {/* Trust row */}
            <div className="mt-8 flex items-center justify-center gap-5 text-xs text-[#BBBBBE]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#168653]" />
                <span>SSL Secured</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F47B20]" />
                <span>Data Protected</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0F3460]" />
                <span>Verified Platform</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage
