import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Compass,
  Route,
  Shield,
  Layers,
  CheckSquare,
  Plus,
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  MapPin,
  Check
} from 'lucide-react'
import {
  COMMON_AMENITIES,
  FACING_LABELS,
  OWNERSHIP_LABELS
} from '@/lib/utils'
import type { FacingDirection, RoadAccess, OwnershipType } from '@/types'

const step4Schema = z.object({
  road_width: z.number().optional().nullable(),
  road_access: z.enum(['pucca', 'kachha', 'both', 'none']).optional(),
  facing_direction: z.enum([
    'north',
    'south',
    'east',
    'west',
    'northeast',
    'northwest',
    'southeast',
    'southwest',
  ]).optional(),
  ownership_type: z.enum([
    'freehold',
    'leasehold',
    'cooperative',
    'power_of_attorney',
    'other',
  ]).optional(),
  is_corner_plot: z.boolean(),
  is_on_main_road: z.boolean(),
  amenities: z.array(z.string()),
  nearby_landmarks: z.array(z.string()),
})

export type Step4FormData = z.infer<typeof step4Schema>

interface Step4Props {
  initialData: Partial<Step4FormData>
  onNext: (data: Step4FormData) => void
  onBack: () => void
}

export const Step4Features: React.FC<Step4Props> = ({
  initialData,
  onNext,
  onBack,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      road_width: initialData.road_width || 30,
      road_access: initialData.road_access || 'pucca',
      facing_direction: initialData.facing_direction || 'east',
      ownership_type: initialData.ownership_type || 'freehold',
      is_corner_plot: initialData.is_corner_plot || false,
      is_on_main_road: initialData.is_on_main_road || false,
      amenities: initialData.amenities || ['Electricity', 'Water Connection', 'Compound Wall'],
      nearby_landmarks: initialData.nearby_landmarks || ['Highway 1.5 km', 'Hospital 3 km'],
    },
  })

  const selectedAmenities = watch('amenities') || []
  const landmarks = watch('nearby_landmarks') || []
  const [landmarkInput, setLandmarkInput] = useState('')

  // Toggle amenity in array
  const handleToggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setValue(
        'amenities',
        selectedAmenities.filter((a) => a !== amenity),
        { shouldValidate: true }
      )
    } else {
      setValue('amenities', [...selectedAmenities, amenity], { shouldValidate: true })
    }
  }

  // Add landmark tag
  const handleAddLandmark = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return
    e.preventDefault()
    const trimmed = landmarkInput.trim()
    if (trimmed && !landmarks.includes(trimmed)) {
      setValue('nearby_landmarks', [...landmarks, trimmed], { shouldValidate: true })
      setLandmarkInput('')
    }
  }

  // Remove landmark tag
  const handleRemoveLandmark = (tagToRemove: string) => {
    setValue(
      'nearby_landmarks',
      landmarks.filter((tag) => tag !== tagToRemove),
      { shouldValidate: true }
    )
  }

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-8">
      {/* 1. Road & Facing Details */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAEAEA] shadow-xs space-y-5">
        <h3 className="font-bold text-base text-[#202124] font-['Poppins'] flex items-center gap-2">
          <Route className="w-5 h-5 text-[#F47B20]" />
          <span>Road & Access Specifications</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Road Width */}
          <div>
            <label className="form-label text-xs uppercase tracking-wider text-[#555]">
              Road Width Facing Plot
            </label>
            <div className="relative mt-1">
              <input
                type="number"
                step="any"
                placeholder="e.g. 30"
                className="input-field pr-12 text-sm"
                {...register('road_width', { valueAsNumber: true })}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                Feet
              </span>
            </div>
          </div>

          {/* Road Access Type */}
          <div>
            <label className="form-label text-xs uppercase tracking-wider text-[#555]">
              Road Approach Type
            </label>
            <select className="input-field text-sm mt-1" {...register('road_access')}>
              <option value="pucca">Pucca (Tar / Asphalt Road)</option>
              <option value="kachha">Kachha (Gravel / Mud Road)</option>
              <option value="both">Both / Concrete Pavers</option>
              <option value="none">No direct road</option>
            </select>
          </div>

          {/* Facing Direction */}
          <div>
            <label className="form-label text-xs uppercase tracking-wider text-[#555]">
              Facing Direction
            </label>
            <select className="input-field text-sm mt-1" {...register('facing_direction')}>
              {Object.entries(FACING_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label} Facing
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ownership Type & High-value toggles */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="form-label text-xs uppercase tracking-wider text-[#555]">
              Ownership Type
            </label>
            <select className="input-field text-sm mt-1" {...register('ownership_type')}>
              {Object.entries(OWNERSHIP_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Corner Plot Toggle */}
          <div className="sm:col-span-2 flex flex-col sm:flex-row gap-4 items-start sm:items-center sm:pt-6">
            <label className="flex items-center gap-2.5 cursor-pointer bg-gray-50 hover:bg-orange-50/50 p-2.5 rounded-xl border border-gray-200 transition-colors flex-1 w-full sm:w-auto">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-[#F47B20] focus:ring-[#F47B20]"
                {...register('is_corner_plot')}
              />
              <span className="text-xs font-semibold text-[#202124]">
                Corner Plot (Two sides open)
              </span>
            </label>

            {/* Main Road Toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer bg-gray-50 hover:bg-orange-50/50 p-2.5 rounded-xl border border-gray-200 transition-colors flex-1 w-full sm:w-auto">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-[#F47B20] focus:ring-[#F47B20]"
                {...register('is_on_main_road')}
              />
              <span className="text-xs font-semibold text-[#202124]">
                Directly on Main Road
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* 2. Amenities Multi-Select Grid */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAEAEA] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-[#202124] font-['Poppins'] flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#F47B20]" />
            <span>Plot Amenities & Infrastructure</span>
          </h3>
          <span className="text-xs text-[#727272]">
            {selectedAmenities.length} selected
          </span>
        </div>

        <p className="text-xs text-[#727272]">
          Select all amenities already available or approved on site:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {COMMON_AMENITIES.map((amenity) => {
            const isChecked = selectedAmenities.includes(amenity)
            return (
              <div
                key={amenity}
                onClick={() => handleToggleAmenity(amenity)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isChecked
                    ? 'border-[#F47B20] bg-orange-50 text-[#F47B20] shadow-2xs'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                    isChecked ? 'bg-[#F47B20] text-white' : 'border border-gray-300 bg-white'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="truncate">{amenity}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. Nearby Landmarks Dynamic Tags */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAEAEA] shadow-xs space-y-4">
        <h3 className="font-bold text-base text-[#202124] font-['Poppins'] flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#F47B20]" />
          <span>Nearby Key Landmarks</span>
        </h3>
        <p className="text-xs text-[#727272]">
          Add distance to nearby schools, metro stations, expressways, or IT parks to highlight connectivity:
        </p>

        {/* Input box */}
        <div className="flex gap-2 max-w-md">
          <input
            type="text"
            value={landmarkInput}
            onChange={(e) => setLandmarkInput(e.target.value)}
            onKeyDown={handleAddLandmark}
            placeholder="e.g. Metro Station 1.5 km"
            className="input-field text-xs sm:text-sm"
          />
          <button
            type="button"
            onClick={handleAddLandmark}
            className="btn-primary py-2 px-4 text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

        {/* Tags List */}
        {landmarks.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {landmarks.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FFF8F2] text-[#F47B20] border border-orange-200"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveLandmark(tag)}
                  className="hover:text-red-600 transition-colors cursor-pointer"
                  title="Remove landmark"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
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
          <span>Continue to Photos</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}

export default Step4Features
