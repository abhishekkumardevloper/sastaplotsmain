'use client'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Home,
  Briefcase,
  Users,
  HardHat,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(80, 'Full name cannot exceed 80 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[6-9]\d{9}$/.test(val.replace(/[\s-+()]/g, '')),
        'Enter a valid 10-digit Indian mobile number'
      ),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the Terms of Service & Privacy Policy',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

type RoleOption = {
  value: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const roles: RoleOption[] = [
  { value: 'buyer', label: 'Buyer', description: 'Looking to buy', icon: Home },
  { value: 'owner', label: 'Owner / Seller', description: 'Have a property', icon: Building2 },
  { value: 'broker', label: 'Broker', description: 'Real estate agent', icon: Briefcase },
  { value: 'builder', label: 'Builder', description: 'Developer / Builder', icon: HardHat },
]

const panelBenefits = [
  'Post unlimited property listings',
  'Receive direct buyer enquiries',
  'Zero commission — keep all profits',
  'Verified seller badge on all listings',
  'Access to 50,000+ active buyers',
]

export const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [resendStatus, setResendStatus] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>('buyer')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setIsSubmitting(true)
      setAuthError(null)

      const cleanedPhone = values.phone ? values.phone.replace(/[\s-+()]/g, '') : undefined

      const { data, error } = await supabase.auth.signUp({
        email: values.email.trim(),
        password: values.password,
        options: {
          data: {
            full_name: values.fullName.trim(),
            phone: cleanedPhone,
            role: selectedRole,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        setAuthError(error.message)
        return
      }

      if (data.user) {
        setRegisteredEmail(values.email)
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setAuthError(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!registeredEmail) return
    try {
      setResending(true)
      setResendStatus(null)
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: registeredEmail,
      })
      if (error) {
        setResendStatus('Failed to resend confirmation email: ' + error.message)
      } else {
        setResendStatus('Verification link re-sent successfully!')
      }
    } catch {
      setResendStatus('Failed to send verification link.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT BRANDING PANEL ── */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-[42%] xl:w-[40%] relative flex-col justify-between overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 40%, #0F3460 70%, #1A1A2E 100%)',
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div
            className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #F47B20, transparent)' }}
          />
          <div
            className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #F47B20, transparent)' }}
          />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        {/* Logo */}
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
            <h1 className="text-3xl xl:text-4xl font-bold text-white font-['Poppins'] leading-tight mb-4">
              Join India's #1
              <br />
              <span className="text-[#F47B20]">Plot Marketplace</span>
            </h1>
            <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-xs">
              Thousands of buyers, sellers, brokers and builders trust SastaPlots every day for verified land deals.
            </p>

            {/* Benefits */}
            <div className="space-y-3 mb-8">
              {panelBenefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#F47B20]/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-[#F47B20]" />
                  </div>
                  <span className="text-white/70 text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div
              className="rounded-2xl p-5 border border-white/10"
              style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)' }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-white font-bold text-xl">12,000+</p>
                  <p className="text-white/40 text-xs mt-0.5">Active Listings</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-xl">50,000+</p>
                  <p className="text-white/40 text-xs mt-0.5">Registered Users</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-xl">120+</p>
                  <p className="text-white/40 text-xs mt-0.5">Cities Covered</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-xl">Zero</p>
                  <p className="text-white/40 text-xs mt-0.5">Commission Fee</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 p-10 pt-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#168653]" />
            <p className="text-white/40 text-xs">Your data is safe — we never sell to third parties.</p>
          </div>
        </div>
      </motion.div>

      {/* ── RIGHT FORM PANEL ── */}
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex-1 flex flex-col bg-[#FFF8F2] overflow-y-auto"
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

        <div className="flex-1 px-6 sm:px-10 lg:px-12 xl:px-16 py-8 max-w-2xl mx-auto w-full">
          {/* Heading */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mb-7"
          >
            <h2 className="text-3xl font-bold text-[#202124] font-['Poppins']">Create your account</h2>
            <p className="mt-2 text-sm text-[#727272]">
              Join thousands of buyers, plot owners, and certified agents across India
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            {registeredEmail ? (
              /* ── POST-REGISTRATION EMAIL CONFIRMATION ── */
              <div className="text-center py-6 space-y-5">
                <div className="w-20 h-20 rounded-full bg-orange-100 mx-auto flex items-center justify-center text-[#F47B20]">
                  <Mail className="w-10 h-10 animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold text-[#202124] font-['Poppins']">Check your inbox!</h3>
                <p className="text-sm text-[#727272] leading-relaxed max-w-sm mx-auto">
                  We&apos;ve sent a verification link to{' '}
                  <strong className="text-[#202124]">{registeredEmail}</strong>. Click the link to activate your Sasta Plots account.
                </p>

                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 text-left text-xs text-[#727272] space-y-2">
                  <p className="font-semibold text-[#202124] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#168653]" />
                    Why verification matters:
                  </p>
                  <ul className="list-disc list-inside space-y-1 pl-1">
                    <li>Keeps spam off the platform for clean buyer enquiries</li>
                    <li>Lets you post properties with instant owner badge</li>
                    <li>Ensures secure lead notifications via email</li>
                  </ul>
                </div>

                <AnimatePresence>
                  {resendStatus && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs font-medium text-green-700 bg-green-50 p-2.5 rounded-lg border border-green-200"
                    >
                      {resendStatus}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={resending}
                    className="py-2.5 px-5 rounded-xl border border-[#EAEAEA] bg-white text-xs font-semibold text-[#202124] flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                    <span>Resend Verification Email</span>
                  </button>
                  <Link
                    to="/login"
                    className="py-2.5 px-6 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    style={{ background: 'linear-gradient(135deg, #E96512, #F47B20)' }}
                  >
                    <span>Go to Login</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              /* ── REGISTRATION FORM ── */
              <>
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
                        <p className="font-medium">Registration Failed</p>
                        <p className="mt-0.5 text-xs text-red-700">{authError}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Role Selector */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#555] mb-2">
                      I am a... <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {roles.map((role) => {
                        const Icon = role.icon
                        const isSelected = selectedRole === role.value
                        return (
                          <button
                            key={role.value}
                            type="button"
                            onClick={() => setSelectedRole(role.value)}
                            className={`relative flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#F47B20] bg-orange-50 text-[#F47B20]'
                                : 'border-[#EAEAEA] bg-white text-[#727272] hover:border-[#F47B20]/40 hover:bg-orange-50/50'
                            }`}
                          >
                            <Icon className={`w-5 h-5 ${isSelected ? 'text-[#F47B20]' : 'text-gray-400'}`} />
                            <span className={`text-xs font-semibold leading-tight ${isSelected ? 'text-[#E96512]' : 'text-[#202124]'}`}>
                              {role.label}
                            </span>
                            <span className="text-[10px] text-[#BBBBBE] leading-tight hidden sm:block">{role.description}</span>
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#F47B20] flex items-center justify-center">
                                <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Full Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label htmlFor="fullName" className="block text-xs font-semibold uppercase tracking-wider text-[#555] mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <User className="h-4 w-4" />
                        </div>
                        <input
                          id="fullName"
                          type="text"
                          placeholder="e.g. Rahul Sharma"
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-white text-sm text-[#202124] placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-[#F47B20]/30 focus:border-[#F47B20] ${
                            errors.fullName ? 'border-red-400 focus:border-red-500' : 'border-[#EAEAEA]'
                          }`}
                          {...register('fullName')}
                        />
                      </div>
                      {errors.fullName && <p className="mt-1.5 text-xs text-red-600">{errors.fullName.message}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[#555] mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Mail className="h-4 w-4" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          autoComplete="email"
                          placeholder="rahul@example.com"
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-white text-sm text-[#202124] placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-[#F47B20]/30 focus:border-[#F47B20] ${
                            errors.email ? 'border-red-400 focus:border-red-500' : 'border-[#EAEAEA]'
                          }`}
                          {...register('email')}
                        />
                      </div>
                      {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-[#555]">
                        Mobile Number
                      </label>
                      <span className="text-[11px] text-[#BBBBBE] font-medium">Optional</span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <span className="text-sm font-semibold text-gray-500">+91</span>
                      </div>
                      <div className="absolute inset-y-0 left-14 w-px bg-[#EAEAEA]" />
                      <div className="absolute inset-y-0 left-0 pl-14 flex items-center pointer-events-none text-gray-400 ml-2">
                        <Phone className="h-4 w-4" />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="98765 43210"
                        className={`w-full pl-20 pr-4 py-3 border rounded-xl bg-white text-sm text-[#202124] placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-[#F47B20]/30 focus:border-[#F47B20] ${
                          errors.phone ? 'border-red-400 focus:border-red-500' : 'border-[#EAEAEA]'
                        }`}
                        {...register('phone')}
                      />
                    </div>
                    {errors.phone && <p className="mt-1.5 text-xs text-red-600">{errors.phone.message}</p>}
                  </div>

                  {/* Password + Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Password */}
                    <div>
                      <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-[#555] mb-1.5">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Lock className="h-4 w-4" />
                        </div>
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className={`w-full pl-10 pr-11 py-3 border rounded-xl bg-white text-sm text-[#202124] placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-[#F47B20]/30 focus:border-[#F47B20] ${
                            errors.password ? 'border-red-400 focus:border-red-500' : 'border-[#EAEAEA]'
                          }`}
                          {...register('password')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-[#555] mb-1.5">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Lock className="h-4 w-4" />
                        </div>
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className={`w-full pl-10 pr-11 py-3 border rounded-xl bg-white text-sm text-[#202124] placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-[#F47B20]/30 focus:border-[#F47B20] ${
                            errors.confirmPassword ? 'border-red-400 focus:border-red-500' : 'border-[#EAEAEA]'
                          }`}
                          {...register('confirmPassword')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Terms Agreement */}
                  <div>
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-[#F47B20] focus:ring-[#F47B20]"
                        {...register('agreeTerms')}
                      />
                      <span className="text-xs text-[#727272] leading-relaxed">
                        I agree to Sasta Plots{' '}
                        <Link to="/terms" className="text-[#F47B20] hover:underline font-semibold">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-[#F47B20] hover:underline font-semibold">
                          Privacy Policy
                        </Link>
                      </span>
                    </label>
                    {errors.agreeTerms && (
                      <p className="mt-1.5 text-xs text-red-600">{errors.agreeTerms.message}</p>
                    )}
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
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Free Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-[#EAEAEA] text-center">
                  <p className="text-sm text-[#727272]">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="font-semibold text-[#F47B20] hover:text-[#E96512] transition-colors inline-flex items-center gap-1"
                    >
                      Log in here <ArrowRight className="w-3 h-3" />
                    </Link>
                  </p>
                </div>
              </>
            )}
          </motion.div>

          {/* Security Note */}
          <div className="mt-6 text-center text-xs text-[#BBBBBE] flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#168653]" />
            <span>Your contact info is safe. We never sell your data to telemarketers.</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default RegisterPage
