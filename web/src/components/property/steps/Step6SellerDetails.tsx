import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User,
  Phone,
  Mail,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  MessageCircle,
  Info
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import type { SellerCategory } from '@/types'

const step6Schema = z.object({
  seller_name: z
    .string()
    .min(2, 'Seller name must be at least 2 characters')
    .max(80, 'Seller name cannot exceed 80 characters'),
  seller_phone: z
    .string()
    .refine(
      (val) => /^[6-9]\d{9}$/.test(val.replace(/[\s-+()]/g, '')),
      'Enter a valid 10-digit Indian phone number starting with 6-9'
    ),
  seller_email: z.string().email('Please enter a valid email address'),
  seller_category: z.enum(['owner', 'agent', 'builder', 'developer']),
  allow_whatsapp: z.boolean().optional(),
})

export type Step6FormData = z.infer<typeof step6Schema>

interface Step6Props {
  initialData: Partial<Step6FormData>
  onNext: (data: Step6FormData) => void
  onBack: () => void
}

export const Step6SellerDetails: React.FC<Step6Props> = ({
  initialData,
  onNext,
  onBack,
}) => {
  const user = useAuthStore((state) => state.user)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Step6FormData>({
    resolver: zodResolver(step6Schema),
    defaultValues: {
      seller_name: initialData.seller_name || user?.full_name || '',
      seller_phone: initialData.seller_phone || user?.phone || '',
      seller_email: initialData.seller_email || user?.email || '',
      seller_category: initialData.seller_category || user?.seller_category || 'owner',
      allow_whatsapp: initialData.allow_whatsapp ?? true,
    },
  })

  // Pre-fill from user profile if not present in initialData
  useEffect(() => {
    if (user) {
      if (!initialData.seller_name && user.full_name) {
        setValue('seller_name', user.full_name)
      }
      if (!initialData.seller_phone && user.phone) {
        setValue('seller_phone', user.phone)
      }
      if (!initialData.seller_email && user.email) {
        setValue('seller_email', user.email)
      }
      if (!initialData.seller_category && user.seller_category) {
        setValue('seller_category', user.seller_category)
      }
    }
  }, [user, initialData, setValue])

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-8">
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAEAEA] shadow-xs space-y-5">
        <div>
          <h3 className="font-bold text-base text-[#202124] font-['Poppins'] flex items-center gap-2">
            <User className="w-5 h-5 text-[#F47B20]" />
            <span>Contact & Seller Information</span>
          </h3>
          <p className="text-xs text-[#727272]">
            These details will be shown to buyers who view your listing and wish to contact you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Seller Name */}
          <div>
            <label className="form-label text-xs uppercase tracking-wider text-[#555]">
              Contact Person / Agency Name <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Anand Kumar"
                className={`input-field pl-10 text-sm ${errors.seller_name ? 'border-red-400' : ''}`}
                {...register('seller_name')}
              />
            </div>
            {errors.seller_name && (
              <p className="form-error">{errors.seller_name.message}</p>
            )}
          </div>

          {/* Seller Category */}
          <div>
            <label className="form-label text-xs uppercase tracking-wider text-[#555]">
              You are listing as <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <select
                className="input-field text-sm"
                {...register('seller_category')}
              >
                <option value="owner">Direct Property Owner (0% Brokerage)</option>
                <option value="agent">Real Estate Agent / Consultant</option>
                <option value="builder">Builder</option>
                <option value="developer">Plot Developer / Layout Promoter</option>
              </select>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="form-label text-xs uppercase tracking-wider text-[#555]">
              Mobile Number for Enquiries <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-semibold text-xs">
                +91
              </div>
              <input
                type="tel"
                placeholder="9876543210"
                className={`input-field pl-12 text-sm ${errors.seller_phone ? 'border-red-400' : ''}`}
                {...register('seller_phone')}
              />
            </div>
            {errors.seller_phone && (
              <p className="form-error">{errors.seller_phone.message}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="form-label text-xs uppercase tracking-wider text-[#555]">
              Email Address for Lead Notifications <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="anand@example.com"
                className={`input-field pl-10 text-sm ${errors.seller_email ? 'border-red-400' : ''}`}
                {...register('seller_email')}
              />
            </div>
            {errors.seller_email && (
              <p className="form-error">{errors.seller_email.message}</p>
            )}
          </div>
        </div>

        {/* WhatsApp Permission Toggle */}
        <div className="pt-3 border-t border-gray-100">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-[#168653] focus:ring-[#168653]"
              {...register('allow_whatsapp')}
            />
            <div className="flex items-center gap-1.5 text-xs text-[#202124]">
              <MessageCircle className="w-4 h-4 text-green-600" />
              <span className="font-semibold">Allow buyers to contact me directly on WhatsApp</span>
            </div>
          </label>
          <p className="text-[11px] text-[#727272] pl-7 mt-0.5">
            Adds a direct 1-click WhatsApp enquiry button to your listing. Highly recommended for faster conversions.
          </p>
        </div>
      </div>

      {/* Trust Notice */}
      <div className="bg-[#FFF8F2] border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#F47B20] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-[#727272] leading-relaxed">
          <span className="font-bold text-[#202124]">Privacy Guarantee: </span>
          We mask your personal phone number on public search previews. Only registered, authenticated buyers can request contact details or send messages.
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-[#EAEAEA]">
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary py-3 px-6 text-sm font-semibold flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          className="btn-primary py-3 px-8 text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
        >
          <span>Continue to Final Review</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}

export default Step6SellerDetails
