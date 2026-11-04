import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Lock,
  Mail,
  Bell,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  Trash2,
  LogOut
} from 'lucide-react'
import { UserDashboardLayout } from '@/components/user/UserDashboardLayout'
import { useAuthStore } from '@/store/auth'
import { supabase } from '@/lib/supabase'

// Change Password Schema
const passwordSchema = z
  .object({
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// Change Email Schema
const emailSchema = z.object({
  newEmail: z.string().email('Please enter a valid email address'),
})

type PasswordFormValues = z.infer<typeof passwordSchema>
type EmailFormValues = z.infer<typeof emailSchema>

export const AccountSettingsPage: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  // Password state
  const [showPassword, setShowPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [updatingPassword, setUpdatingPassword] = useState(false)

  // Email state
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [updatingEmail, setUpdatingEmail] = useState(false)

  // Notification toggles
  const [emailEnquiries, setEmailEnquiries] = useState(true)
  const [whatsappAlerts, setWhatsappAlerts] = useState(true)
  const [marketingDigest, setMarketingDigest] = useState(false)
  const [savedPrefs, setSavedPrefs] = useState(false)

  // Danger zone modal
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [deactivateConfirmText, setDeactivateConfirmText] = useState('')
  const [isDeactivating, setIsDeactivating] = useState(false)

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  })

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    reset: resetEmailForm,
    formState: { errors: emailErrors },
  } = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
  })

  const onUpdatePassword = async (values: PasswordFormValues) => {
    try {
      setUpdatingPassword(true)
      setPasswordSuccess(null)
      setPasswordError(null)

      const { error } = await supabase.auth.updateUser({
        password: values.newPassword,
      })

      if (error) {
        throw error
      }

      setPasswordSuccess('Password changed successfully!')
      resetPasswordForm()
      setTimeout(() => setPasswordSuccess(null), 4000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update password'
      setPasswordError(msg)
    } finally {
      setUpdatingPassword(false)
    }
  }

  const onUpdateEmail = async (values: EmailFormValues) => {
    try {
      setUpdatingEmail(true)
      setEmailSuccess(null)
      setEmailError(null)

      const { error } = await supabase.auth.updateUser({
        email: values.newEmail.trim(),
      })

      if (error) {
        throw error
      }

      setEmailSuccess('Confirmation link sent! Please verify the new email address.')
      resetEmailForm()
      setTimeout(() => setEmailSuccess(null), 5000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to change email'
      setEmailError(msg)
    } finally {
      setUpdatingEmail(false)
    }
  }

  const handleSavePreferences = () => {
    setSavedPrefs(true)
    setTimeout(() => setSavedPrefs(false), 3000)
  }

  const handleDeactivateAccount = async () => {
    if (deactivateConfirmText !== 'DELETE') return
    try {
      setIsDeactivating(true)
      // Call Supabase / API to deactivate
      if (user?.id) {
        await supabase
          .from('profiles')
          .update({ is_active: false })
          .eq('id', user.id)
      }
      await logout()
      window.location.href = '/'
    } catch (err) {
      console.error('Account deactivation error:', err)
    } finally {
      setIsDeactivating(false)
    }
  }

  return (
    <UserDashboardLayout
      title="Account Settings"
      subtitle="Manage your credentials, notification channels, and account security."
    >
      <div className="max-w-3xl space-y-8">
        {/* Change Password Card */}
        <div className="bg-white rounded-2xl border border-[#EAEAEA] p-6 sm:p-7 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#EAEAEA] mb-5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#F47B20] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#202124]">
                Change Password
              </h3>
              <p className="text-xs text-[#727272]">
                Ensure your account is using a long, random password to stay secure
              </p>
            </div>
          </div>

          {passwordSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-green-800">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit(onUpdatePassword)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label text-xs uppercase tracking-wider text-[#555]">
                  New Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    className={`input-field pr-9 text-sm ${passwordErrors.newPassword ? 'border-red-400' : ''}`}
                    {...registerPassword('newPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 h-4" /> : <Eye className="h-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="form-error">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="form-label text-xs uppercase tracking-wider text-[#555]">
                  Confirm New Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repeat new password"
                    className={`input-field pr-9 text-sm ${passwordErrors.confirmPassword ? 'border-red-400' : ''}`}
                    {...registerPassword('confirmPassword')}
                  />
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="form-error">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={updatingPassword}
                className="btn-primary py-2 px-5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {updatingPassword ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Change Email Card */}
        <div className="bg-white rounded-2xl border border-[#EAEAEA] p-6 sm:p-7 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#EAEAEA] mb-5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#202124]">
                Change Email Address
              </h3>
              <p className="text-xs text-[#727272]">
                Current email:{' '}
                <strong className="text-[#202124]">{user?.email || 'Not loaded'}</strong>
              </p>
            </div>
          </div>

          {emailSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-green-800">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>{emailSuccess}</span>
            </div>
          )}

          {emailError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>{emailError}</span>
            </div>
          )}

          <form onSubmit={handleEmailSubmit(onUpdateEmail)} className="space-y-4">
            <div>
              <label className="form-label text-xs uppercase tracking-wider text-[#555]">
                New Email Address
              </label>
              <input
                type="email"
                placeholder="new-address@example.com"
                className={`input-field text-sm mt-1 max-w-md ${emailErrors.newEmail ? 'border-red-400' : ''}`}
                {...registerEmail('newEmail')}
              />
              {emailErrors.newEmail && (
                <p className="form-error">{emailErrors.newEmail.message}</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={updatingEmail}
                className="btn-primary py-2 px-5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {updatingEmail ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Verification...</span>
                  </>
                ) : (
                  <span>Send Email Verification</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-2xl border border-[#EAEAEA] p-6 sm:p-7 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#EAEAEA] mb-5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#202124]">
                Notification Preferences
              </h3>
              <p className="text-xs text-[#727272]">
                Choose how and when Sasta Plots communicates lead updates with you
              </p>
            </div>
          </div>

          {savedPrefs && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-green-800">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Notification preferences updated!</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Toggle 1 */}
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="font-semibold text-sm text-[#202124]">Instant Lead & Enquiry Emails</p>
                <p className="text-xs text-[#727272]">Receive an immediate email whenever a prospective buyer submits an inquiry.</p>
              </div>
              <input
                type="checkbox"
                checked={emailEnquiries}
                onChange={(e) => setEmailEnquiries(e.target.checked)}
                className="w-4 h-4 text-[#F47B20] rounded border-gray-300 focus:ring-[#F47B20] cursor-pointer"
              />
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="font-semibold text-sm text-[#202124]">WhatsApp Notifications for Listing Approval</p>
                <p className="text-xs text-[#727272]">Get notified on WhatsApp when our team reviews and approves your plot listings.</p>
              </div>
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                className="w-4 h-4 text-[#F47B20] rounded border-gray-300 focus:ring-[#F47B20] cursor-pointer"
              />
            </div>

            {/* Toggle 3 */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-semibold text-sm text-[#202124]">Market Intelligence & Weekly Digest</p>
                <p className="text-xs text-[#727272]">Receive weekly insights on plot price movements in your city or locality.</p>
              </div>
              <input
                type="checkbox"
                checked={marketingDigest}
                onChange={(e) => setMarketingDigest(e.target.checked)}
                className="w-4 h-4 text-[#F47B20] rounded border-gray-300 focus:ring-[#F47B20] cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#EAEAEA] mt-4">
            <button
              type="button"
              onClick={handleSavePreferences}
              className="btn-secondary py-2 px-5 text-xs font-semibold"
            >
              Save Preferences
            </button>
          </div>
        </div>

        {/* Danger Zone: Account Deactivation */}
        <div className="bg-red-50/50 border border-red-200 rounded-2xl p-6 sm:p-7">
          <div className="flex items-center gap-2.5 pb-3 border-b border-red-200 mb-4">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-red-900">
                Danger Zone
              </h3>
              <p className="text-xs text-red-700">
                Permanently deactivate your Sasta Plots account and delist all properties
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-[#727272] max-w-md">
              Once deactivated, your listings will no longer be visible to buyers and any active enquiry threads will be paused.
            </p>
            <button
              type="button"
              onClick={() => setShowDeactivateModal(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Deactivate Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-red-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-center font-bold text-base text-[#202124] font-['Poppins']">
              Are you absolutely sure?
            </h3>
            <p className="text-xs text-[#727272] text-center mt-1 mb-5">
              This action cannot be undone. To confirm, please type <strong className="text-red-600">DELETE</strong> below:
            </p>

            <input
              type="text"
              value={deactivateConfirmText}
              onChange={(e) => setDeactivateConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="input-field text-center text-sm font-bold tracking-wider mb-4 uppercase"
            />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeactivateModal(false)
                  setDeactivateConfirmText('')
                }}
                className="btn-secondary py-2 flex-1 text-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deactivateConfirmText !== 'DELETE' || isDeactivating}
                onClick={handleDeactivateAccount}
                className="btn-primary bg-red-600 hover:bg-red-700 py-2 flex-1 text-xs disabled:opacity-50"
              >
                {isDeactivating ? 'Deactivating...' : 'Confirm Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </UserDashboardLayout>
  )
}

export default AccountSettingsPage
