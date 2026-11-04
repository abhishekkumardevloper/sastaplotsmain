import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Building2,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
  KeyRound
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export const ForgotPasswordPage: React.FC = () => {
  const [authError, setAuthError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      setIsSubmitting(true)
      setAuthError(null)

      const { error } = await supabase.auth.resetPasswordForEmail(values.email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setAuthError(error.message)
        return
      }

      setSubmittedEmail(values.email)
      setIsSubmitted(true)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send password reset email. Please try again.'
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
          Reset Password
        </h2>
        <p className="mt-2 text-sm text-[#727272]">
          Enter your registered email address and we will send you a password reset link
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-[#EAEAEA] rounded-2xl">
          {isSubmitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 mx-auto flex items-center justify-center text-green-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#202124] font-['Poppins']">
                Check Your Inbox
              </h3>
              <p className="text-sm text-[#727272] leading-relaxed">
                We have emailed a secure password reset link to{' '}
                <strong className="text-[#202124]">{submittedEmail}</strong>.
              </p>
              <p className="text-xs text-[#727272]">
                Please check your inbox (and spam folder if not received in 2 minutes). The link is valid for 1 hour.
              </p>

              <div className="pt-4 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="btn-secondary text-xs py-2.5 px-4"
                >
                  Try another email address
                </button>
                <Link
                  to="/login"
                  className="btn-primary text-xs py-2.5 px-6 flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Login</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {authError && (
                <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 text-sm">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Reset Request Failed</p>
                    <p className="mt-0.5 text-xs text-red-700">{authError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label htmlFor="email" className="form-label text-xs uppercase tracking-wider text-[#555]">
                    Registered Email Address
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending Link...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Send Reset Link</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-[#EAEAEA] text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#727272] hover:text-[#202124] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
