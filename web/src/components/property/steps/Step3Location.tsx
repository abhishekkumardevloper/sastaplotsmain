import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  MapPin,
  Navigation,
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Info,
  Layers,
  Crosshair,
  ExternalLink
} from 'lucide-react'
import { INDIAN_STATES_DATA } from '@/data/indianLocations'

const step3Schema = z.object({
  state_id: z.number({ invalid_type_error: 'Please select a state' }).positive('Please select a state'),
  city_id: z.number({ invalid_type_error: 'Please select a city' }).positive('Please select a city'),
  locality_name: z.string().min(2, 'Please enter or select locality name'),
  address: z
    .string()
    .min(5, 'Please enter full property address / survey number')
    .max(250, 'Address cannot exceed 250 characters'),
  pin_code: z
    .string()
    .regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit Indian PIN code'),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
})

export type Step3FormData = z.infer<typeof step3Schema>

interface Step3Props {
  initialData: Partial<Step3FormData>
  onNext: (data: Step3FormData) => void
  onBack: () => void
}

export const Step3Location: React.FC<Step3Props> = ({
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
  } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      state_id: initialData.state_id || 1, // Default to Karnataka
      city_id: initialData.city_id || 101, // Bengaluru
      locality_name: initialData.locality_name || '',
      address: initialData.address || '',
      pin_code: initialData.pin_code || '',
      latitude: initialData.latitude || 12.9716,
      longitude: initialData.longitude || 77.5946,
    },
  })

  const selectedStateId = watch('state_id')
  const selectedCityId = watch('city_id')
  const localityValue = watch('locality_name')
  const latitudeValue = watch('latitude')
  const longitudeValue = watch('longitude')

  const [gettingLocation, setGettingLocation] = useState(false)
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null)

  // Current State & Cities list
  const currentState = INDIAN_STATES_DATA.find((s) => s.id === Number(selectedStateId))
  const cities = currentState?.cities || []
  const currentCity = cities.find((c) => c.id === Number(selectedCityId)) || cities[0]

  // When State changes, default to first city
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = Number(e.target.value)
    setValue('state_id', sId, { shouldValidate: true })
    const matchedState = INDIAN_STATES_DATA.find((s) => s.id === sId)
    if (matchedState && matchedState.cities.length > 0) {
      setValue('city_id', matchedState.cities[0].id, { shouldValidate: true })
      setValue('locality_name', '', { shouldValidate: false })
    }
  }

  // Use browser geolocation to set latitude & longitude
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    setGettingLocation(true)
    setLocationSuccessMsg(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6))
        const lng = parseFloat(pos.coords.longitude.toFixed(6))
        setValue('latitude', lat, { shouldValidate: true })
        setValue('longitude', lng, { shouldValidate: true })
        setGettingLocation(false)
        setLocationSuccessMsg(`Coordinates captured: ${lat}, ${lng}`)
      },
      (err) => {
        setGettingLocation(false)
        console.warn('Geolocation error:', err.message)
        alert('Could not retrieve current location coordinates. Please enter manually or click on map.')
      },
      { timeout: 10000 }
    )
  }

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-8">
      {/* Cascading State, City, Locality Grid */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAEAEA] shadow-xs space-y-5">
        <h3 className="font-bold text-base text-[#202124] font-['Poppins'] flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#F47B20]" />
          <span>Regional Location</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. State Select */}
          <div>
            <label className="form-label text-xs uppercase tracking-wider text-[#555]">
              State <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedStateId}
              onChange={handleStateChange}
              className={`input-field text-sm mt-1 ${errors.state_id ? 'border-red-400' : ''}`}
            >
              {INDIAN_STATES_DATA.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
            {errors.state_id && <p className="form-error">{errors.state_id.message}</p>}
          </div>

          {/* 2. City Select (Cascading) */}
          <div>
            <label className="form-label text-xs uppercase tracking-wider text-[#555]">
              City / District <span className="text-red-500">*</span>
            </label>
            <select
              className={`input-field text-sm mt-1 ${errors.city_id ? 'border-red-400' : ''}`}
              {...register('city_id', { valueAsNumber: true })}
            >
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
            {errors.city_id && <p className="form-error">{errors.city_id.message}</p>}
          </div>

          {/* 3. Locality / Area Name */}
          <div>
            <label className="form-label text-xs uppercase tracking-wider text-[#555]">
              Locality / Layout Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Devanahalli or Whitefield"
              className={`input-field text-sm mt-1 ${errors.locality_name ? 'border-red-400' : ''}`}
              {...register('locality_name')}
            />
            {errors.locality_name && (
              <p className="form-error">{errors.locality_name.message}</p>
            )}
          </div>
        </div>

        {/* Popular Localities Quick Pills */}
        {currentCity && currentCity.popularLocalities.length > 0 && (
          <div>
            <p className="text-xs text-[#727272] mb-1.5 font-medium">
              Popular localities in {currentCity.name}:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {currentCity.popularLocalities.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setValue('locality_name', loc, { shouldValidate: true })}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    localityValue === loc
                      ? 'bg-orange-100 text-[#F47B20] border-[#F47B20] font-semibold'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-[#FFF8F2]'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Street Address & Pincode */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAEAEA] shadow-xs space-y-4">
        <h3 className="font-bold text-base text-[#202124] font-['Poppins'] flex items-center gap-2">
          <Navigation className="w-5 h-5 text-[#F47B20]" />
          <span>Street Address & Pin Code</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="form-label text-xs uppercase tracking-wider text-[#555]">
              Complete Property Address / Survey No. <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Survey No. 42/3, Behind Decathlon, Near NH-44 Toll Plaza"
              className={`input-field text-sm mt-1 ${errors.address ? 'border-red-400' : ''}`}
              {...register('address')}
            />
            {errors.address && <p className="form-error">{errors.address.message}</p>}
          </div>

          <div>
            <label className="form-label text-xs uppercase tracking-wider text-[#555]">
              PIN Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="e.g. 560064"
              className={`input-field text-sm mt-1 ${errors.pin_code ? 'border-red-400' : ''}`}
              {...register('pin_code')}
            />
            {errors.pin_code && <p className="form-error">{errors.pin_code.message}</p>}
          </div>
        </div>
      </div>

      {/* Map Coordinates & GPS Pin Picker */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAEAEA] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-[#202124] font-['Poppins'] flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#F47B20]" />
              <span>Map Coordinates (GPS Pin)</span>
            </h3>
            <p className="text-xs text-[#727272]">
              Helps buyers locate your exact plot boundary and navigate for site visits
            </p>
          </div>

          <button
            type="button"
            onClick={handleDetectCurrentLocation}
            disabled={gettingLocation}
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Crosshair className={`w-3.5 h-3.5 ${gettingLocation ? 'animate-spin text-[#F47B20]' : 'text-[#F47B20]'}`} />
            <span>{gettingLocation ? 'Locating...' : 'Use Current GPS Location'}</span>
          </button>
        </div>

        {locationSuccessMsg && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span>{locationSuccessMsg}</span>
          </div>
        )}

        {/* Map Visual Placeholder */}
        <div className="relative h-48 sm:h-56 rounded-xl border border-gray-200 overflow-hidden bg-[#e5e3df] flex items-center justify-center shadow-inner">
          {/* Subtle grid background simulating map tiles */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#9ca3af_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {/* Water/road visual accents */}
          <div className="absolute top-1/3 left-0 right-0 h-4 bg-gray-300 -rotate-3 opacity-60" />
          <div className="absolute top-1/2 left-0 right-0 h-2 bg-yellow-200/90 rotate-1" />

          {/* Center Pin Marker */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#F47B20] text-white flex items-center justify-center shadow-lg ring-4 ring-orange-200 animate-bounce">
              <MapPin className="w-5 h-5 fill-white" />
            </div>
            <div className="mt-1 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-bold text-[#202124] shadow-xs border border-gray-200">
              {latitudeValue && longitudeValue
                ? `${latitudeValue}, ${longitudeValue}`
                : 'Select on Map'}
            </div>
          </div>

          <div className="absolute bottom-2 left-3 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-gray-500">
            OpenStreetMap &bull; Sasta Plots GeoEngine
          </div>
        </div>

        {/* Lat / Lng inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-semibold uppercase text-gray-500">Latitude</label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 12.9716"
              className="input-field text-xs mt-1"
              {...register('latitude', { valueAsNumber: true })}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase text-gray-500">Longitude</label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 77.5946"
              className="input-field text-xs mt-1"
              {...register('longitude', { valueAsNumber: true })}
            />
          </div>
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
          <span>Continue to Features</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}

export default Step3Location
