import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
  RefreshCw
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

export const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [resendStatus, setResendStatus] = useState<string | null>(null)

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
            role: 'owner',
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        setAuthError(error.message)
        return
      }

      // If Supabase returns a user or requires email confirmation
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
          Create an Account
        </h2>
        <p className="mt-2 text-sm text-[#727272]">
          Join thousands of buyers, plot owners, and certified agents across India
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-[#EAEAEA] rounded-2xl">
          {registeredEmail ? (
            /* Post-registration email confirmation screen */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-orange-100 mx-auto flex items-center justify-center text-[#F47B20]">
                <Mail className="w-8 h-8 animate-bounce" />
              </div>
              <h3 className="text-xl font-bold text-[#202124] font-['Poppins']">
                Check your email to verify your account
              </h3>
              <p className="text-sm text-[#727272] leading-relaxed max-w-sm mx-auto">
                We have sent a verification link to{' '}
                <strong className="text-[#202124]">{registeredEmail}</strong>. Please click the link inside to activate your Sasta Plots account.
              </p>

              <div className="p-4 bg-orange-50/60 rounded-xl border border-orange-100 text-left text-xs text-[#727272] space-y-2">
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

              {resendStatus && (
                <p className="text-xs font-medium text-green-700 bg-green-50 p-2.5 rounded-lg border border-green-200">
                  {resendStatus}
                </p>
              )}

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resending}
                  className="btn-secondary text-xs py-2.5 px-4 flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  <span>Resend Verification Email</span>
                </button>
                <Link
                  to="/login"
                  className="btn-primary text-xs py-2.5 px-6 flex items-center justify-center gap-1.5"
                >
                  <span>Go to Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <>
              {authError && (
                <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 text-sm">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Registration Failed</p>
                    <p className="mt-0.5 text-xs text-red-700">{authError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="form-label text-xs uppercase tracking-wider text-[#555]">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <User className="h-5 h-5" />
                    </div>
                    <input
                      id="fullName"
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      className={`input-field pl-10 ${errors.fullName ? 'border-red-400 focus:border-red-500' : ''}`}
                      {...register('fullName')}
                    />
                  </div>
                  {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="email" className="form-label text-xs uppercase tracking-wider text-[#555]">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Mail className="h-5 h-5" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="rahul@example.com"
                      className={`input-field pl-10 ${errors.email ? 'border-red-400 focus:border-red-500' : ''}`}
                      {...register('email')}
                    />
                  </div>
                  {errors.email && <p className="form-error">{errors.email.message}</p>}
                </div>

                {/* Phone Number (Optional) */}
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="phone" className="form-label text-xs uppercase tracking-wider text-[#555]">
                      Mobile Number
                    </label>
                    <span className="text-[11px] text-[#727272]">Optional</span>
                  </div>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 text-sm font-semibold">
                      +91
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="98765 43210"
                      className={`input-field pl-12 ${errors.phone ? 'border-red-400 focus:border-red-500' : ''}`}
                      {...register('phone')}
                    />
                  </div>
                  {errors.phone && <p className="form-error">{errors.phone.message}</p>}
                </div>

                {/* Password Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="form-label text-xs uppercase tracking-wider text-[#555]">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Lock className="h-4 h-4" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className={`input-field pl-9 pr-9 text-sm ${errors.password ? 'border-red-400 focus:border-red-500' : ''}`}
                        {...register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="h-4 h-4" /> : <Eye className="h-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="form-error">{errors.password.message}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="form-label text-xs uppercase tracking-wider text-[#555]">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Lock className="h-4 h-4" />
                      </div>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className={`input-field pl-9 pr-9 text-sm ${errors.confirmPassword ? 'border-red-400 focus:border-red-500' : ''}`}
                        {...register('confirmPassword')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 h-4" /> : <Eye className="h-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="form-error">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                {/* Terms Agreement Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#F47B20] focus:ring-[#F47B20]"
                      {...register('agreeTerms')}
                    />
                    <span className="text-xs text-[#727272] leading-relaxed">
                      I agree to Sasta Plots{' '}
                      <Link to="/terms" className="text-[#F47B20] hover:underline font-medium">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-[#F47B20] hover:underline font-medium">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.agreeTerms && (
                    <p className="form-error mt-1">{errors.agreeTerms.message}</p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-3 mt-4 text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
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

              <div className="mt-6 pt-6 border-t border-[#EAEAEA] text-center">
                <p className="text-sm text-[#727272]">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-[#F47B20] hover:text-[#E96512] transition-colors inline-flex items-center gap-1"
                  >
                    Log in here
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center text-xs text-[#727272] flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#168653]" />
          <span>Your contact info is safe. We never sell your data to telemarketers.</span>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
