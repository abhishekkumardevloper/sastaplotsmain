import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  IndianRupee,
  Maximize2,
  Calculator,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Info,
  Scale
} from 'lucide-react'
import { AREA_UNIT_OPTIONS, formatPrice } from '@/lib/utils'
import type { AreaUnit, ListingIntent } from '@/types'

const step2Schema = z.object({
  price: z
    .number({ invalid_type_error: 'Enter a valid amount' })
    .min(1000, 'Price must be at least ₹1,000'),
  price_negotiable: z.boolean(),
  area: z
    .number({ invalid_type_error: 'Enter a valid plot area' })
    .positive('Plot area must be greater than zero'),
  area_unit: z.enum([
    'sqft',
    'sqyd',
    'sqm',
    'acre',
    'hectare',
    'bigha',
    'marla',
    'kanal',
    'guntha',
    'ground',
  ]),
  length: z.number().optional().nullable(),
  breadth: z.number().optional().nullable(),
})

export type Step2FormData = z.infer<typeof step2Schema>

interface Step2Props {
  initialData: Partial<Step2FormData>
  listingIntent?: ListingIntent
  onNext: (data: Step2FormData) => void
  onBack: () => void
}

export const Step2PriceArea: React.FC<Step2Props> = ({
  initialData,
  listingIntent = 'sell',
  onNext,
  onBack,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      price: initialData.price || undefined,
      price_negotiable: initialData.price_negotiable ?? true,
      area: initialData.area || undefined,
      area_unit: initialData.area_unit || 'sqft',
      length: initialData.length || null,
      breadth: initialData.breadth || null,
    },
  })

  const priceValue = watch('price')
  const areaValue = watch('area')
  const areaUnit = watch('area_unit')
  const lengthValue = watch('length')
  const breadthValue = watch('breadth')

  // Auto-calculate Area from Length x Breadth if entered (in feet, maps to sqft)
  useEffect(() => {
    if (lengthValue && breadthValue && lengthValue > 0 && breadthValue > 0) {
      const calculatedSqft = Math.round(lengthValue * breadthValue * 100) / 100
      if (areaUnit === 'sqft') {
        setValue('area', calculatedSqft, { shouldValidate: true })
      } else if (areaUnit === 'sqyd') {
        const sqyd = Math.round((calculatedSqft / 9) * 100) / 100
        setValue('area', sqyd, { shouldValidate: true })
      }
    }
  }, [lengthValue, breadthValue, areaUnit, setValue])

  // Calculate Price Per Unit live
  const calculatePricePerUnit = () => {
    if (!priceValue || !areaValue || areaValue <= 0) return null
    const rate = Math.round(priceValue / areaValue)
    const unitLabel = AREA_UNIT_OPTIONS.find((u) => u.value === areaUnit)?.label.split(' ')[0] || areaUnit
    return `₹${rate.toLocaleString('en-IN')} per ${unitLabel}`
  }

  const priceInWords = priceValue && priceValue > 0 ? formatPrice(priceValue) : null

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-8">
      {/* 1. Price / Rent Section */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAEAEA] shadow-xs space-y-4">
        <h3 className="font-bold text-base text-[#202124] font-['Poppins'] flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-[#F47B20]" />
          <span>{listingIntent === 'sell' ? 'Expected Price' : 'Monthly Rent / Lease'}</span>
        </h3>

        <div>
          <label className="form-label text-xs uppercase tracking-wider text-[#555]">
            {listingIntent === 'sell' ? 'Total Selling Price (INR)' : 'Monthly Rent (INR)'}{' '}
            <span className="text-red-500">*</span>
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-bold text-sm">
              ₹
            </div>
            <input
              type="number"
              step="any"
              placeholder="e.g. 4500000"
              className={`input-field pl-9 text-base font-semibold ${errors.price ? 'border-red-400' : ''}`}
              {...register('price', { valueAsNumber: true })}
            />
          </div>

          {priceInWords && (
            <p className="text-sm font-bold text-[#F47B20] mt-1.5 flex items-center gap-1.5">
              <span>Equivalent:</span>
              <span className="bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-200">
                {priceInWords}
              </span>
            </p>
          )}

          {errors.price && <p className="form-error">{errors.price.message}</p>}
        </div>

        {/* Price Negotiable Toggle */}
        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-[#F47B20] focus:ring-[#F47B20]"
              {...register('price_negotiable')}
            />
            <span className="text-sm font-medium text-[#202124]">
              Price is negotiable
            </span>
          </label>
        </div>
      </div>

      {/* 2. Area & Dimensions Section */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAEAEA] shadow-xs space-y-5">
        <h3 className="font-bold text-base text-[#202124] font-['Poppins'] flex items-center gap-2">
          <Maximize2 className="w-5 h-5 text-[#F47B20]" />
          <span>Plot Area & Dimensions</span>
        </h3>

        {/* Area + Unit input grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="form-label text-xs uppercase tracking-wider text-[#555]">
              Plot Area <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 1200"
              className={`input-field text-base font-semibold ${errors.area ? 'border-red-400' : ''}`}
              {...register('area', { valueAsNumber: true })}
            />
            {errors.area && <p className="form-error">{errors.area.message}</p>}
          </div>

          <div>
            <label className="form-label text-xs uppercase tracking-wider text-[#555]">
              Unit <span className="text-red-500">*</span>
            </label>
            <select
              className="input-field text-sm"
              {...register('area_unit')}
            >
              {AREA_UNIT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Optional Dimensions: Length x Breadth */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <label className="form-label text-xs uppercase tracking-wider text-[#555] mb-0">
              Plot Dimensions (Optional)
            </label>
            <span className="text-[11px] text-[#727272] flex items-center gap-1">
              <Calculator className="w-3 h-3 text-[#F47B20]" />
              Auto-computes area in feet
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  placeholder="Length (ft)"
                  className="input-field text-sm pr-9"
                  {...register('length', { valueAsNumber: true })}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  ft
                </span>
              </div>
            </div>

            <div>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  placeholder="Breadth / Width (ft)"
                  className="input-field text-sm pr-9"
                  {...register('breadth', { valueAsNumber: true })}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  ft
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Auto Calculated Rate Per Unit Indicator */}
        {calculatePricePerUnit() && (
          <div className="p-3.5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#F47B20]" />
              <span className="text-xs font-semibold text-[#202124]">
                Calculated Price per Unit:
              </span>
            </div>
            <span className="text-sm font-bold text-[#F47B20]">
              {calculatePricePerUnit()}
            </span>
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
          <span>Continue to Location</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}

export default Step2PriceArea
