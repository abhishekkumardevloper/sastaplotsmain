'use client'
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Building2,
  TreePine,
  Briefcase,
  Home,
  Factory,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2
} from 'lucide-react'
import type { ListingIntent, PropertyCategory, PropertyType } from '@/types'

const step1Schema = z.object({
  listing_intent: z.enum(['sell', 'rent']),
  category: z.enum([
    'residential_plot',
    'agricultural_land',
    'commercial',
    'residential',
    'industrial',
    'institutional',
  ]),
  property_type: z.string().min(1, 'Please select property type'),
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(120, 'Title cannot exceed 120 characters'),
  description: z
    .string()
    .min(25, 'Please provide a detailed description (at least 25 characters) to attract genuine buyers')
    .max(3000, 'Description cannot exceed 3000 characters'),
})

export type Step1FormData = z.infer<typeof step1Schema>

interface Step1Props {
  initialData: Partial<Step1FormData>
  onNext: (data: Step1FormData) => void
}

const CATEGORY_CONFIG: Array<{
  id: PropertyCategory
  label: string
  subtext: string
  icon: React.ElementType
  types: Array<{ value: PropertyType; label: string }>
}> = [
  {
    id: 'residential_plot',
    label: 'Residential Plot',
    subtext: 'Gated community, layout plot, villa site',
    icon: Home,
    types: [
      { value: 'plot', label: 'Residential Plot / Site' },
      { value: 'villa', label: 'Villa Plot / Gated Community' },
      { value: 'mixed_use', label: 'Mixed Residential Plot' },
    ],
  },
  {
    id: 'agricultural_land',
    label: 'Agricultural Land',
    subtext: 'Farmland, farmhouse land, orchard',
    icon: TreePine,
    types: [
      { value: 'farm_land', label: 'Farm Land' },
      { value: 'agricultural_plot', label: 'Agricultural Plot' },
      { value: 'orchard', label: 'Orchard / Plantation' },
    ],
  },
  {
    id: 'commercial',
    label: 'Commercial Land / Site',
    subtext: 'Showroom site, commercial plot, office plot',
    icon: Briefcase,
    types: [
      { value: 'plot', label: 'Commercial Plot' },
      { value: 'shop', label: 'Shop / Retail Plot' },
      { value: 'office', label: 'Office Space / IT Plot' },
      { value: 'showroom', label: 'Showroom Plot' },
      { value: 'warehouse', label: 'Warehouse / Godown Site' },
    ],
  },
  {
    id: 'industrial',
    label: 'Industrial Land',
    subtext: 'MIDC/KIADB plot, factory land, shed',
    icon: Factory,
    types: [
      { value: 'industrial_land', label: 'Industrial Plot / Estate' },
      { value: 'factory', label: 'Factory Site' },
      { value: 'warehouse', label: 'Logistics / Warehouse Land' },
    ],
  },
  {
    id: 'institutional',
    label: 'Institutional / Mixed',
    subtext: 'School, hospital, resort, mixed use land',
    icon: Layers,
    types: [
      { value: 'institutional_land', label: 'Institutional Land' },
      { value: 'mixed_use', label: 'Mixed Use Commercial-Residential' },
    ],
  },
  {
    id: 'residential',
    label: 'Built Residential',
    subtext: 'Independent house, bungalow, constructed villa',
    icon: Building2,
    types: [
      { value: 'house', label: 'Independent House / Bungalow' },
      { value: 'villa', label: 'Independent Villa' },
      { value: 'flat', label: 'Apartment / Flat' },
      { value: 'penthouse', label: 'Penthouse' },
    ],
  },
]

export const Step1BasicDetails: React.FC<Step1Props> = ({ initialData, onNext }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      listing_intent: initialData.listing_intent || 'sell',
      category: initialData.category || 'residential_plot',
      property_type: initialData.property_type || 'plot',
      title: initialData.title || '',
      description: initialData.description || '',
    },
  })

  const currentIntent = watch('listing_intent')
  const currentCategory = watch('category')
  const currentType = watch('property_type')
  const titleValue = watch('title') || ''

  const currentCategoryObj =
    CATEGORY_CONFIG.find((c) => c.id === currentCategory) || CATEGORY_CONFIG[0]

  const handleCategorySelect = (catId: PropertyCategory) => {
    setValue('category', catId, { shouldValidate: true })
    const config = CATEGORY_CONFIG.find((c) => c.id === catId)
    if (config && config.types.length > 0) {
      setValue('property_type', config.types[0].value as PropertyType, { shouldValidate: true })
    }
  }

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-8">
      {/* 1. Listing Intent (Sell vs Rent) */}
      <div>
        <label className="form-label text-xs uppercase tracking-wider text-[#555] mb-2">
          I Want To <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <button
            type="button"
            onClick={() => setValue('listing_intent', 'sell', { shouldValidate: true })}
            className={`py-3 px-4 rounded-xl font-bold text-sm border-2 transition-all cursor-pointer text-center ${
              currentIntent === 'sell'
                ? 'border-[#F47B20] bg-orange-50 text-[#F47B20] shadow-xs'
                : 'border-gray-200 bg-white text-gray-700 hover:border-orange-200'
            }`}
          >
            Sell Property
          </button>
          <button
            type="button"
            onClick={() => setValue('listing_intent', 'rent', { shouldValidate: true })}
            className={`py-3 px-4 rounded-xl font-bold text-sm border-2 transition-all cursor-pointer text-center ${
              currentIntent === 'rent'
                ? 'border-[#F47B20] bg-orange-50 text-[#F47B20] shadow-xs'
                : 'border-gray-200 bg-white text-gray-700 hover:border-orange-200'
            }`}
          >
            Rent / Lease Out
          </button>
        </div>
      </div>

      {/* 2. Property Category Grid */}
      <div>
        <label className="form-label text-xs uppercase tracking-wider text-[#555] mb-2">
          Property Category <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CATEGORY_CONFIG.map((cat) => {
            const Icon = cat.icon
            const isSelected = currentCategory === cat.id
            return (
              <div
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                  isSelected
                    ? 'border-[#F47B20] bg-orange-50/70 shadow-xs ring-1 ring-[#F47B20]'
                    : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-[#FFF8F2]/30'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-[#F47B20] text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4
                    className={`text-sm font-bold ${
                      isSelected ? 'text-[#F47B20]' : 'text-[#202124]'
                    }`}
                  >
                    {cat.label}
                  </h4>
                  <p className="text-xs text-[#727272] mt-0.5 line-clamp-1">{cat.subtext}</p>
                </div>
              </div>
            )
          })}
        </div>
        {errors.category && <p className="form-error">{errors.category.message}</p>}
      </div>

      {/* 3. Specific Property Type (Pills) */}
      <div>
        <label className="form-label text-xs uppercase tracking-wider text-[#555] mb-2">
          Property Type <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {currentCategoryObj.types.map((t) => {
            const isSelected = currentType === t.value
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setValue('property_type', t.value as PropertyType, { shouldValidate: true })}
                className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? 'border-[#F47B20] bg-[#F47B20] text-white shadow-xs'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-[#FFF8F2]'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>
        {errors.property_type && (
          <p className="form-error">{errors.property_type.message}</p>
        )}
      </div>

      {/* 4. Title Input with suggestions */}
      <div>
        <div className="flex items-center justify-between">
          <label className="form-label text-xs uppercase tracking-wider text-[#555]">
            Property Title <span className="text-red-500">*</span>
          </label>
          <span className="text-xs text-[#727272]">{titleValue.length}/120</span>
        </div>
        <input
          type="text"
          maxLength={120}
          placeholder="e.g. 2400 Sq.Ft East Facing DC Converted Plot in Sarjapur Road"
          className={`input-field text-sm mt-1 ${errors.title ? 'border-red-400' : ''}`}
          {...register('title')}
        />
        {errors.title && <p className="form-error">{errors.title.message}</p>}
        <p className="text-[11px] text-[#727272] mt-1.5 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span>Tip: Mention plot size, facing direction, key approvals (e.g. BDA, DTCP, RERA) and landmark for faster inquiries.</span>
        </p>
      </div>

      {/* 5. Detailed Description */}
      <div>
        <label className="form-label text-xs uppercase tracking-wider text-[#555]">
          Detailed Description <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={5}
          placeholder="Provide complete details about the plot: nearby highways, water & electricity connectivity, soil type, boundary wall, title deed status, proximity to schools, hospitals and transport hubs..."
          className={`input-field text-sm mt-1 leading-relaxed ${errors.description ? 'border-red-400' : ''}`}
          {...register('description')}
        />
        {errors.description && (
          <p className="form-error">{errors.description.message}</p>
        )}
      </div>

      {/* Next Step CTA */}
      <div className="flex justify-end pt-4 border-t border-[#EAEAEA]">
        <button
          type="submit"
          className="btn-primary py-3 px-8 text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
        >
          <span>Continue to Price & Area</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}

export default Step1BasicDetails
