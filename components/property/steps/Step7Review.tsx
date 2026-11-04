'use client'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  IndianRupee,
  Maximize2,
  Compass,
  FileText,
  User,
  ShieldCheck,
  Edit2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  ExternalLink,
  Plus
} from 'lucide-react'
import {
  formatPrice,
  formatArea,
  FACING_LABELS,
  OWNERSHIP_LABELS,
  PROPERTY_CATEGORY_LABELS,
  PROPERTY_TYPE_LABELS
} from '@/lib/utils'
import type { UploadedMediaItem, UploadedDocItem } from './Step5Media'
import api from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'

export interface CompletePropertyData {
  // Step 1
  listing_intent: 'sell' | 'rent'
  category: any
  property_type: any
  title: string
  description: string
  // Step 2
  price: number
  price_negotiable: boolean
  area: number
  area_unit: any
  length?: number | null
  breadth?: number | null
  // Step 3
  state_id: number
  city_id: number
  locality_name: string
  address: string
  pin_code: string
  latitude?: number | null
  longitude?: number | null
  // Step 4
  road_width?: number | null
  road_access?: any
  facing_direction?: any
  ownership_type?: any
  is_corner_plot: boolean
  is_on_main_road: boolean
  amenities: string[]
  nearby_landmarks: string[]
  // Step 5
  images: UploadedMediaItem[]
  documents?: UploadedDocItem[]
  // Step 6
  seller_name: string
  seller_phone: string
  seller_email: string
  seller_category: any
  allow_whatsapp?: boolean
}

interface Step7Props {
  formData: CompletePropertyData
  onJumpToStep: (stepNumber: number) => void
  onBack: () => void
  onSuccess: (propertyId: string) => void
}

export const Step7Review: React.FC<Step7Props> = ({
  formData,
  onJumpToStep,
  onBack,
  onSuccess,
}) => {
  const user = useAuthStore((state) => state.user)
  const [confirmed, setConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [submittedPropertyId, setSubmittedPropertyId] = useState<string | null>(null)

  const handleSubmitProperty = async () => {
    if (!confirmed) {
      setErrorMsg('Please confirm the accuracy declaration before submitting.')
      return
    }

    try {
      setSubmitting(true)
      setErrorMsg(null)

      const payload = {
        ...formData,
        owner_id: user?.id,
        status: 'pending_review',
        slug: formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') + `-${Date.now().toString().slice(-4)}`,
      }

      let propertyId = ''

      // Attempt API call to /api/properties
      try {
        const res = await api.post('/properties', payload)
        if (res.data?.id || res.data?.data?.id) {
          propertyId = res.data.id || res.data.data.id
        }
      } catch {
        // Fallback: direct Supabase insert
        const { data: insertedProp, error: insertError } = await supabase
          .from('properties')
          .insert({
            title: formData.title,
            slug: payload.slug,
            description: formData.description,
            listing_intent: formData.listing_intent,
            category: formData.category,
            property_type: formData.property_type,
            price: formData.price,
            price_negotiable: formData.price_negotiable,
            area: formData.area,
            area_unit: formData.area_unit,
            length: formData.length || null,
            breadth: formData.breadth || null,
            state_id: formData.state_id,
            city_id: formData.city_id,
            address: formData.address,
            pin_code: formData.pin_code,
            latitude: formData.latitude || null,
            longitude: formData.longitude || null,
            road_width: formData.road_width || null,
            road_access: formData.road_access || null,
            facing_direction: formData.facing_direction || null,
            ownership_type: formData.ownership_type || null,
            is_corner_plot: formData.is_corner_plot,
            is_on_main_road: formData.is_on_main_road,
            amenities: formData.amenities,
            nearby_landmarks: formData.nearby_landmarks,
            seller_name: formData.seller_name,
            seller_phone: formData.seller_phone,
            seller_email: formData.seller_email,
            seller_category: formData.seller_category,
            owner_id: user?.id || null,
            status: 'pending_review',
          })
          .select()
          .single()

        if (insertError) {
          throw insertError
        }

        propertyId = insertedProp.id

        // Insert images into property_images table
        if (formData.images.length > 0 && propertyId) {
          const imgRecords = formData.images.map((img, idx) => ({
            property_id: propertyId,
            url: img.url,
            storage_path: img.url,
            is_cover: img.is_cover,
            sort_order: idx,
          }))
          await supabase.from('property_images').insert(imgRecords)
        }
      }

      // Clear local storage draft
      localStorage.removeItem('sastaplots_property_draft')

      setSubmittedPropertyId(propertyId || `SP-${Date.now().toString().slice(-6)}`)
      onSuccess(propertyId || `SP-${Date.now().toString().slice(-6)}`)
    } catch (err: unknown) {
      console.error('Submission failed:', err)
      const msg = err instanceof Error ? err.message : 'Property submission failed. Please try again.'
      setErrorMsg(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Success Confirmation View
  if (submittedPropertyId) {
    return (
      <div className="bg-white rounded-3xl border border-[#EAEAEA] p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm space-y-6">
        <div className="w-20 h-20 rounded-full bg-green-100 text-[#168653] flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 mb-3">
            <Clock className="w-3.5 h-3.5" />
            Status: Pending Moderation Review
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#202124] font-['Poppins']">
            Property Submitted Successfully!
          </h2>
          <p className="text-sm text-[#727272] mt-2 max-w-md mx-auto leading-relaxed">
            Your listing has been assigned tracking ID:{' '}
            <strong className="text-[#202124] font-mono">{submittedPropertyId}</strong>.
          </p>
        </div>

        <div className="bg-[#FFF8F2] border border-orange-200 rounded-2xl p-5 text-left text-xs text-[#727272] space-y-2.5 max-w-lg mx-auto">
          <h4 className="font-bold text-sm text-[#202124] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#F47B20]" />
            What happens next?
          </h4>
          <p>
            1. Our real estate moderation team will verify the plot coordinates, title description, and images within <strong>24 business hours</strong>.
          </p>
          <p>
            2. Once approved, your listing goes live to active buyers across India and you will receive an instant notification.
          </p>
          <p>
            3. You can track buyer views, inquiries, and edits at any time from your dashboard.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to="/dashboard/listings"
            className="btn-primary py-3 px-6 text-sm font-semibold w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <span>View in My Listings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/post-property"
            onClick={() => window.location.reload()}
            className="btn-secondary py-3 px-6 text-sm font-semibold w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Post Another Plot</span>
          </Link>
        </div>
      </div>
    )
  }

  // Review & Confirmation Screen
  const coverImage = formData.images.find((img) => img.is_cover) || formData.images[0]

  return (
    <div className="space-y-8">
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Submission Error</p>
            <p className="text-xs text-red-700 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Review Card */}
      <div className="bg-white rounded-2xl border border-[#EAEAEA] overflow-hidden shadow-xs">
        {/* Header Preview Banner */}
        <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-white p-6 border-b border-[#EAEAEA]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold text-[#F47B20] tracking-wider">
                Listing Preview &bull; For {formData.listing_intent}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#202124] font-['Poppins'] mt-1">
                {formData.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#727272] flex items-center gap-1.5 mt-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{formData.locality_name}, {formData.address}</span>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-[#727272] block">Expected Price</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-['Poppins'] text-[#F47B20]">
                {formatPrice(formData.price)}
              </span>
              {formData.price_negotiable && (
                <span className="text-[11px] text-green-700 block font-semibold">Negotiable</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 1: Photos & Media Preview */}
        <div className="p-6 border-b border-[#EAEAEA] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-[#202124] flex items-center gap-2">
              <span>Property Photos ({formData.images.length})</span>
            </h4>
            <button
              type="button"
              onClick={() => onJumpToStep(5)}
              className="text-xs font-semibold text-[#F47B20] hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Photos</span>
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {formData.images.map((img) => (
              <div
                key={img.id}
                className="relative aspect-square rounded-xl overflow-hidden border border-gray-200"
              >
                <img src={img.url} alt="Plot" className="w-full h-full object-cover" />
                {img.is_cover && (
                  <span className="absolute bottom-1 left-1 bg-[#F47B20] text-white text-[9px] font-bold px-1 rounded">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Key Specifications Breakdown */}
        <div className="p-6 border-b border-[#EAEAEA] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-[#202124]">Key Specifications</h4>
            <button
              type="button"
              onClick={() => onJumpToStep(1)}
              className="text-xs font-semibold text-[#F47B20] hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-400 block text-[11px]">Category</span>
              <span className="font-bold text-[#202124] capitalize">
                {PROPERTY_CATEGORY_LABELS[formData.category] || formData.category}
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-400 block text-[11px]">Plot Area</span>
              <span className="font-bold text-[#202124]">
                {formatArea(formData.area, formData.area_unit)}
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-400 block text-[11px]">Facing</span>
              <span className="font-bold text-[#202124] capitalize">
                {FACING_LABELS[formData.facing_direction] || formData.facing_direction || 'Not specified'}
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-400 block text-[11px]">Ownership</span>
              <span className="font-bold text-[#202124] capitalize">
                {OWNERSHIP_LABELS[formData.ownership_type] || formData.ownership_type || 'Freehold'}
              </span>
            </div>
          </div>

          {/* Description Snippet */}
          <div className="pt-2">
            <span className="text-xs font-semibold text-gray-500 block mb-1">Description:</span>
            <p className="text-xs text-[#202124] leading-relaxed bg-[#FFF8F2]/40 p-3 rounded-xl border border-orange-100">
              {formData.description}
            </p>
          </div>
        </div>

        {/* Section 3: Amenities & Landmarks */}
        <div className="p-6 border-b border-[#EAEAEA] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-[#202124]">Amenities & Landmarks</h4>
            <button
              type="button"
              onClick={() => onJumpToStep(4)}
              className="text-xs font-semibold text-[#F47B20] hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Features</span>
            </button>
          </div>

          {/* Amenities Pills */}
          <div>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
              Features:
            </span>
            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((item) => (
                <span
                  key={item}
                  className="px-2.5 py-1 rounded-lg bg-orange-50 text-[#F47B20] border border-orange-200 text-xs font-medium"
                >
                  ✓ {item}
                </span>
              ))}
              {formData.is_corner_plot && (
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium">
                  ★ Corner Plot
                </span>
              )}
              {formData.is_on_main_road && (
                <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-xs font-medium">
                  ★ On Main Road
                </span>
              )}
            </div>
          </div>

          {/* Landmarks */}
          {formData.nearby_landmarks.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Nearby Landmarks:
              </span>
              <div className="flex flex-wrap gap-2">
                {formData.nearby_landmarks.map((landmark) => (
                  <span
                    key={landmark}
                    className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span>{landmark}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Seller Contact */}
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-[#202124]">Seller & Contact Info</h4>
            <button
              type="button"
              onClick={() => onJumpToStep(6)}
              className="text-xs font-semibold text-[#F47B20] hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Contact</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="font-bold text-[#202124]">{formData.seller_name}</span>
            <span className="text-gray-300">&bull;</span>
            <span className="text-gray-600 font-mono">+91 {formData.seller_phone}</span>
            <span className="text-gray-300">&bull;</span>
            <span className="text-gray-600">{formData.seller_email}</span>
            <span className="text-gray-300">&bull;</span>
            <span className="capitalize font-semibold text-[#F47B20]">
              {formData.seller_category}
            </span>
          </div>
        </div>
      </div>

      {/* Confirmation Checkbox */}
      <div className="bg-[#FFF8F2] border border-orange-200 rounded-2xl p-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-[#F47B20] focus:ring-[#F47B20] mt-0.5 cursor-pointer"
          />
          <div className="text-xs text-[#202124] leading-relaxed">
            <span className="font-bold block text-sm mb-0.5">
              I confirm that all information provided is accurate and authentic.
            </span>
            I certify that I am the legal owner or authorized representative of this property, and have provided genuine plot specifications in accordance with Sasta Plots listing guidelines.
          </div>
        </label>
      </div>

      {/* Final Submit & Back Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-[#EAEAEA]">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="btn-secondary py-3 px-6 text-sm font-semibold flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleSubmitProperty}
          disabled={!confirmed || submitting}
          className="btn-primary py-3.5 px-10 text-base font-bold flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Submitting Property...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Publish & Submit for Verification</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default Step7Review
