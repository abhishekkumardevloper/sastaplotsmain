'use client'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User,
  Phone,
  Mail,
  Building,
  Globe,
  FileBadge,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Loader2,
  Camera,
  Info,
  Sparkles,
  Award
} from 'lucide-react'
import { UserDashboardLayout } from '@/components/user/UserDashboardLayout'
import { useAuthStore } from '@/store/auth'
import { supabase } from '@/lib/supabase'
import api from '@/lib/api'
import type { SellerCategory } from '@/types'

const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name cannot exceed 80 characters'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[6-9]\d{9}$/.test(val.replace(/[\s-+()]/g, '')),
      'Enter a valid 10-digit Indian phone number'
    ),
  sellerCategory: z.enum(['owner', 'agent', 'builder', 'developer']),
  companyName: z.string().max(100).optional(),
  reraNumber: z.string().max(50).optional(),
  website: z
    .string()
    .optional()
    .refine((val) => !val || /^https?:\/\/.+/.test(val), 'Website must start with http:// or https://'),
  about: z.string().max(1000, 'About cannot exceed 1000 characters').optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export const ProfilePage: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const refreshUser = useAuthStore((state) => state.refreshUser)

  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url || null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Verification request state
  const [kycRequested, setKycRequested] = useState(user?.verification_status === 'pending')

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.full_name || '',
      phone: user?.phone || '',
      sellerCategory: user?.seller_category || 'owner',
      companyName: user?.company_name || '',
      reraNumber: user?.rera_number || '',
      website: user?.website || '',
      about: user?.about || '',
    },
  })

  const selectedCategory = watch('sellerCategory')

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.full_name || '',
        phone: user.phone || '',
        sellerCategory: user.seller_category || 'owner',
        companyName: user.company_name || '',
        reraNumber: user.rera_number || '',
        website: user.website || '',
        about: user.about || '',
      })
      setAvatarUrl(user.avatar_url || null)
      setKycRequested(user.verification_status === 'pending')
    }
  }, [user, reset])

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user?.id) return
    try {
      setSaving(true)
      setSuccessMessage(null)
      setErrorMessage(null)

      const updateData = {
        full_name: values.fullName.trim(),
        phone: values.phone ? values.phone.replace(/[\s-+()]/g, '') : null,
        seller_category: values.sellerCategory,
        company_name: values.companyName?.trim() || null,
        rera_number: values.reraNumber?.trim() || null,
        website: values.website?.trim() || null,
        about: values.about?.trim() || null,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }

      // Update in Supabase
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

      if (error) {
        throw error
      }

      await refreshUser()
      setSuccessMessage('Profile saved successfully!')
      setTimeout(() => setSuccessMessage(null), 4000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile'
      setErrorMessage(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB limit.')
      return
    }

    try {
      setUploadingAvatar(true)
      const fileExt = file.name.split('.').pop()
      const filePath = `avatars/${user.id}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        // Fall back to object URL for local display if storage bucket isn't yet configured
        const localUrl = URL.createObjectURL(file)
        setAvatarUrl(localUrl)
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)
        setAvatarUrl(publicUrlData.publicUrl)
      }
    } catch (err) {
      console.error('Avatar upload failed:', err)
      const localUrl = URL.createObjectURL(file)
      setAvatarUrl(localUrl)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleRequestVerification = async () => {
    if (!user?.id) return
    try {
      await supabase
        .from('profiles')
        .update({ verification_status: 'pending' })
        .eq('id', user.id)

      setKycRequested(true)
      await refreshUser()
      alert('Verification request submitted! Our team will verify your details within 24-48 hours.')
    } catch (err) {
      console.error('Failed to request verification:', err)
    }
  }

  const renderVerificationBadge = () => {
    const status = user?.verification_status || 'unverified'
    switch (status) {
      case 'verified':
        return (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-900 text-xs">
            <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-bold">Verified Sasta Plots Seller</p>
              <p className="text-green-700">Your profile badge is active and shown on all your property listings.</p>
            </div>
          </div>
        )
      case 'pending':
        return (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-bold">Verification In Progress</p>
              <p className="text-amber-700">Our operations team is reviewing your details and credentials.</p>
            </div>
          </div>
        )
      default:
        return (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-orange-50/70 border border-orange-200 rounded-xl text-xs">
            <div className="flex items-start gap-2.5">
              <Award className="w-5 h-5 text-[#F47B20] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#202124]">Become a Verified Seller</p>
                <p className="text-[#727272]">Get green verification badge and higher visibility for your plots.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRequestVerification}
              disabled={kycRequested}
              className="btn-primary py-1.5 px-3.5 text-xs whitespace-nowrap self-stretch sm:self-auto text-center"
            >
              {kycRequested ? 'Request Submitted' : 'Request Verification'}
            </button>
          </div>
        )
    }
  }

  return (
    <UserDashboardLayout
      title="Profile & Verification"
      subtitle="Update your personal details, seller credentials, and verified trust status."
    >
      <div className="max-w-4xl space-y-6">
        {/* Verification Status Banner */}
        {renderVerificationBadge()}

        {/* Notifications */}
        {successMessage && (
          <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-green-800">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-red-800">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-[#EAEAEA] p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-[#EAEAEA]">
              <div className="relative group">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="User Avatar"
                    className="w-20 h-20 rounded-full object-cover border-2 border-orange-200 shadow-xs"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-orange-100 text-[#F47B20] text-2xl font-bold flex items-center justify-center border-2 border-orange-200 shadow-xs">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                )}
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#F47B20] text-white hover:bg-[#E96512] transition-colors cursor-pointer shadow-md"
                  title="Upload new photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#202124]">Profile Photo</h4>
                <p className="text-xs text-[#727272] mt-0.5 mb-2">
                  Square image recommended. PNG, JPG or WebP up to 5MB.
                </p>
                {uploadingAvatar && (
                  <p className="text-xs text-[#F47B20] flex items-center gap-1 font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading photo...</span>
                  </p>
                )}
              </div>
            </div>

            {/* Grid: Name, Email, Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="form-label text-xs uppercase tracking-wider text-[#555]">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    className={`input-field pl-10 text-sm ${errors.fullName ? 'border-red-400' : ''}`}
                    placeholder="e.g. Ramesh Chandra"
                    {...register('fullName')}
                  />
                </div>
                {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
              </div>

              {/* Email (Read-only) */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="form-label text-xs uppercase tracking-wider text-[#555]">
                    Email Address
                  </label>
                  <span className="text-[11px] text-green-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    Verified
                  </span>
                </div>
                <div className="relative mt-1">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input-field pl-10 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="form-label text-xs uppercase tracking-wider text-[#555]">
                  Phone Number
                </label>
                <div className="relative mt-1">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-semibold">
                    +91
                  </div>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    className={`input-field pl-12 text-sm ${errors.phone ? 'border-red-400' : ''}`}
                    {...register('phone')}
                  />
                </div>
                {errors.phone && <p className="form-error">{errors.phone.message}</p>}
              </div>

              {/* Seller Category */}
              <div>
                <label className="form-label text-xs uppercase tracking-wider text-[#555]">
                  I am listing as <span className="text-red-500">*</span>
                </label>
                <select
                  className="input-field mt-1 text-sm capitalize"
                  {...register('sellerCategory')}
                >
                  <option value="owner">Individual Owner</option>
                  <option value="agent">Real Estate Agent / Broker</option>
                  <option value="builder">Builder</option>
                  <option value="developer">Plot Developer / Layout Promoter</option>
                </select>
              </div>
            </div>

            {/* Conditional Business Details for Agent / Builder / Developer */}
            {selectedCategory !== 'owner' && (
              <div className="p-4 bg-[#FFF8F2]/50 border border-orange-100 rounded-xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#F47B20] flex items-center gap-1.5">
                  <Building className="w-4 h-4" />
                  <span>Business & Professional Credentials</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Company Name */}
                  <div>
                    <label className="form-label text-xs text-[#555]">
                      Company / Agency Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Skyline Realty Ltd"
                      className="input-field text-sm"
                      {...register('companyName')}
                    />
                  </div>

                  {/* RERA Number */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="form-label text-xs text-[#555]">
                        RERA Registration No.
                      </label>
                      <span className="text-[10px] text-gray-500">e.g. PRM/KA/RERA/...</span>
                    </div>
                    <div className="relative">
                      <FileBadge className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="RERA Agent / Project Number"
                        className="input-field pl-9 text-sm"
                        {...register('reraNumber')}
                      />
                    </div>
                  </div>

                  {/* Website */}
                  <div className="sm:col-span-2">
                    <label className="form-label text-xs text-[#555]">
                      Website or Social Page
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        placeholder="https://example.com"
                        className={`input-field pl-9 text-sm ${errors.website ? 'border-red-400' : ''}`}
                        {...register('website')}
                      />
                    </div>
                    {errors.website && <p className="form-error">{errors.website.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* About / Bio */}
            <div>
              <label className="form-label text-xs uppercase tracking-wider text-[#555]">
                About You / Your Experience in Real Estate
              </label>
              <textarea
                rows={3}
                placeholder="Share a brief introduction with prospective buyers (e.g. Over 8 years dealing with NA plots in Bangalore outskirts...)"
                className="input-field text-sm"
                {...register('about')}
              />
              {errors.about && <p className="form-error">{errors.about.message}</p>}
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAEAEA]">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary py-2.5 px-6 text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </UserDashboardLayout>
  )
}

export default ProfilePage
