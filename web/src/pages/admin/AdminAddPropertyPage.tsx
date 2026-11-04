import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Building2,
  DollarSign,
  MapPin,
  Compass,
  CheckCircle2,
  Star,
  FileText,
  Upload,
  Plus,
  Trash2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { AdminLayout } from '@/components/admin/AdminLayout'
import type {
  ListingIntent,
  PropertyCategory,
  PropertyType,
  AreaUnit,
  RoadAccess,
  FacingDirection,
  OwnershipType,
  SellerCategory,
  PropertyStatus,
} from '@/types'

// Form validation schema
const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
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
  price: z.coerce.number().positive('Price must be greater than zero'),
  price_negotiable: z.boolean().default(false),
  area: z.coerce.number().positive('Area must be greater than zero'),
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
  length: z.coerce.number().optional().nullable(),
  breadth: z.coerce.number().optional().nullable(),
  address: z.string().min(5, 'Address is required'),
  city_name: z.string().min(2, 'City is required'),
  state_name: z.string().min(2, 'State is required'),
  pin_code: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit Indian PIN code'),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  road_width: z.coerce.number().optional().nullable(),
  road_access: z.enum(['pucca', 'kachha', 'both', 'none']).default('pucca'),
  facing_direction: z
    .enum([
      'north',
      'south',
      'east',
      'west',
      'northeast',
      'northwest',
      'southeast',
      'southwest',
    ])
    .default('east'),
  ownership_type: z
    .enum(['freehold', 'leasehold', 'cooperative', 'power_of_attorney', 'other'])
    .default('freehold'),
  is_corner_plot: z.boolean().default(false),
  is_on_main_road: z.boolean().default(false),
  seller_name: z.string().min(2, 'Seller name is required'),
  seller_phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  seller_email: z.string().email('Valid email is required'),
  seller_category: z.enum(['owner', 'agent', 'builder', 'developer']).default('owner'),
})

type FormData = z.infer<typeof propertySchema>

const AMENITY_OPTIONS = [
  'Electricity Connection',
  'Water Supply',
  'Sewage System',
  'Boundary Wall',
  'Pucca Paved Road',
  'Street Lights',
  'Gated Community',
  '24x7 Security',
  'Park & Green Belt',
  'Clear Title / Registry',
  'Borewell / Tubewell',
]

const POPULAR_STATES = [
  'Delhi',
  'Uttar Pradesh',
  'Haryana',
  'Rajasthan',
  'Maharashtra',
  'Karnataka',
  'Telangana',
  'Gujarat',
  'Punjab',
  'Madhya Pradesh',
  'Tamil Nadu',
]

export const AdminAddPropertyPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Additional dynamic form states
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Electricity Connection',
    'Water Supply',
    'Pucca Paved Road',
  ])
  const [landmarks, setLandmarks] = useState<string[]>([])
  const [newLandmark, setNewLandmark] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
  ])
  const [newImageUrl, setNewImageUrl] = useState('')
  const [coverIndex, setCoverIndex] = useState(0)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(propertySchema) as any,
    defaultValues: {
      listing_intent: 'sell',
      category: 'residential_plot',
      property_type: 'plot',
      area_unit: 'sqyd',
      road_access: 'pucca',
      facing_direction: 'east',
      ownership_type: 'freehold',
      price_negotiable: false,
      is_corner_plot: false,
      is_on_main_road: false,
      seller_category: 'owner',
      state_name: 'Uttar Pradesh',
      city_name: 'Noida',
    },
  })

  // Submit mutation
  const createPropertyMutation = useMutation({
    mutationFn: async ({
      data,
      status,
      isFeatured,
    }: {
      data: FormData
      status: PropertyStatus
      isFeatured: boolean
    }) => {
      // Generate slug from title
      const slug = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`

      const payload = {
        ...data,
        slug,
        status,
        is_featured: isFeatured,
        is_verified: true, // admin created listings are verified
        is_admin_managed: true,
        amenities: selectedAmenities,
        nearby_landmarks: landmarks,
        images: imageUrls.map((url, idx) => ({
          url,
          storage_path: `properties/${slug}/${idx}.jpg`,
          is_cover: idx === coverIndex,
          sort_order: idx + 1,
        })),
      }

      const res = await api.post('/admin/properties', payload)
      return res.data
    },
    onSuccess: (data, variables) => {
      toast.success(
        variables.isFeatured
          ? 'Property created & featured on homepage!'
          : variables.status === 'approved'
          ? 'Property created and published live!'
          : 'Property saved as draft'
      )
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      navigate('/admin/properties')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create property')
    },
  })

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    )
  }

  const handleAddLandmark = () => {
    if (newLandmark.trim()) {
      setLandmarks([...landmarks, newLandmark.trim()])
      setNewLandmark('')
    }
  }

  const handleRemoveLandmark = (idx: number) => {
    setLandmarks(landmarks.filter((_, i) => i !== idx))
  }

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()])
      setNewImageUrl('')
    }
  }

  const handleRemoveImageUrl = (idx: number) => {
    if (imageUrls.length <= 1) {
      toast.error('At least one property image is required')
      return
    }
    const updated = imageUrls.filter((_, i) => i !== idx)
    setImageUrls(updated)
    if (coverIndex >= updated.length) setCoverIndex(0)
  }

  const onSubmitWithMode = (mode: 'draft' | 'publish' | 'featured') => {
    handleSubmit((formData: any) => {
      let status: PropertyStatus = 'draft'
      let isFeatured = false

      if (mode === 'draft') {
        status = 'draft'
        isFeatured = false
      } else if (mode === 'publish') {
        status = 'approved'
        isFeatured = false
      } else if (mode === 'featured') {
        status = 'approved'
        isFeatured = true
      }

      createPropertyMutation.mutate({
        data: formData as FormData,
        status,
        isFeatured,
      })
    })()
  }

  return (
    <AdminLayout
      title="Add New Property Listing"
      subtitle="Direct admin creation bypasses standard queue • Publish instantly or save as draft"
      actions={
        <Link to="/admin/properties" className="btn-secondary btn-sm flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </Link>
      }
    >
      <form onSubmit={(e) => e.preventDefault()} className="max-w-4xl space-y-8">
        {/* Step 1: Basic Info */}
        <div className="card p-6 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F0F0F0]">
            <Building2 className="w-5 h-5 text-[#F47B20]" />
            <h3 className="font-poppins font-bold text-base text-[#202124]">
              Basic Property Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="form-label text-xs">Listing Intent *</label>
              <select {...register('listing_intent')} className="input-field text-xs">
                <option value="sell">For Sale</option>
                <option value="rent">For Rent / Lease</option>
              </select>
            </div>

            <div>
              <label className="form-label text-xs">Category *</label>
              <select {...register('category')} className="input-field text-xs">
                <option value="residential_plot">Residential Plot</option>
                <option value="agricultural_land">Agricultural Land</option>
                <option value="commercial">Commercial Land / SCO</option>
                <option value="residential">Residential Built</option>
                <option value="industrial">Industrial Land</option>
                <option value="institutional">Institutional Plot</option>
              </select>
            </div>

            <div>
              <label className="form-label text-xs">Property Sub-Type *</label>
              <select {...register('property_type')} className="input-field text-xs">
                <option value="plot">Residential Plot</option>
                <option value="farm_land">Farm Land / Agriculture</option>
                <option value="agricultural_plot">Agricultural Plot</option>
                <option value="industrial_land">Industrial Land</option>
                <option value="commercial">Commercial SCO / Showroom Plot</option>
                <option value="villa">Villa / Independent House</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label text-xs">Listing Title *</label>
            <input
              type="text"
              placeholder="e.g. 300 sq.yd North-East Facing Corner Plot in Sector 62"
              {...register('title')}
              className="input-field text-xs"
            />
            {errors.title && <p className="form-error">{errors.title.message}</p>}
          </div>

          <div>
            <label className="form-label text-xs">Detailed Description *</label>
            <textarea
              rows={4}
              placeholder="Detailed description of the property, road connectivity, title status, immediate possession, nearby infrastructure..."
              {...register('description')}
              className="input-field text-xs resize-none"
            />
            {errors.description && <p className="form-error">{errors.description.message}</p>}
          </div>
        </div>

        {/* Step 2: Pricing & Dimensions */}
        <div className="card p-6 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F0F0F0]">
            <DollarSign className="w-5 h-5 text-[#F47B20]" />
            <h3 className="font-poppins font-bold text-base text-[#202124]">
              Pricing & Land Dimensions
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="form-label text-xs">Total Price (₹ INR) *</label>
              <input
                type="number"
                placeholder="e.g. 15000000"
                {...register('price')}
                className="input-field text-xs"
              />
              {errors.price && <p className="form-error">{errors.price.message}</p>}
            </div>

            <div>
              <label className="form-label text-xs">Total Area *</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 300"
                {...register('area')}
                className="input-field text-xs"
              />
              {errors.area && <p className="form-error">{errors.area.message}</p>}
            </div>

            <div>
              <label className="form-label text-xs">Area Unit *</label>
              <select {...register('area_unit')} className="input-field text-xs">
                <option value="sqyd">Square Yards (sq.yd / gaj)</option>
                <option value="sqft">Square Feet (sq.ft)</option>
                <option value="sqm">Square Meters (sq.m)</option>
                <option value="acre">Acres</option>
                <option value="hectare">Hectares</option>
                <option value="bigha">Bigha</option>
                <option value="marla">Marla</option>
                <option value="kanal">Kanal</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="form-label text-xs">Length (ft)</label>
              <input
                type="number"
                placeholder="e.g. 60"
                {...register('length')}
                className="input-field text-xs"
              />
            </div>
            <div>
              <label className="form-label text-xs">Breadth / Frontage (ft)</label>
              <input
                type="number"
                placeholder="e.g. 45"
                {...register('breadth')}
                className="input-field text-xs"
              />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#202124] cursor-pointer">
                <input
                  type="checkbox"
                  {...register('price_negotiable')}
                  className="w-4 h-4 rounded text-[#F47B20] focus:ring-[#F47B20]"
                />
                <span>Price is Negotiable</span>
              </label>
            </div>
          </div>
        </div>

        {/* Step 3: Location Details */}
        <div className="card p-6 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F0F0F0]">
            <MapPin className="w-5 h-5 text-[#F47B20]" />
            <h3 className="font-poppins font-bold text-base text-[#202124]">
              Location & Address
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="form-label text-xs">State *</label>
              <select {...register('state_name')} className="input-field text-xs">
                {POPULAR_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label text-xs">City *</label>
              <input
                type="text"
                placeholder="e.g. Noida / Gurgaon / Lucknow"
                {...register('city_name')}
                className="input-field text-xs"
              />
              {errors.city_name && <p className="form-error">{errors.city_name.message}</p>}
            </div>
            <div>
              <label className="form-label text-xs">PIN Code *</label>
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 201301"
                {...register('pin_code')}
                className="input-field text-xs font-mono"
              />
              {errors.pin_code && <p className="form-error">{errors.pin_code.message}</p>}
            </div>
          </div>

          <div>
            <label className="form-label text-xs">Full Address / Landmark *</label>
            <input
              type="text"
              placeholder="e.g. Plot B-44, Sector 62, Near Electronic City Metro"
              {...register('address')}
              className="input-field text-xs"
            />
            {errors.address && <p className="form-error">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label text-xs">Latitude (Optional)</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 28.6280"
                {...register('latitude')}
                className="input-field text-xs font-mono"
              />
            </div>
            <div>
              <label className="form-label text-xs">Longitude (Optional)</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 77.3649"
                {...register('longitude')}
                className="input-field text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Step 4: Road & Property Specifications */}
        <div className="card p-6 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F0F0F0]">
            <Compass className="w-5 h-5 text-[#F47B20]" />
            <h3 className="font-poppins font-bold text-base text-[#202124]">
              Road Specs & Property Features
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="form-label text-xs">Road Width (ft)</label>
              <input
                type="number"
                placeholder="e.g. 40"
                {...register('road_width')}
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="form-label text-xs">Road Access</label>
              <select {...register('road_access')} className="input-field text-xs">
                <option value="pucca">Pucca (Paved/Tar)</option>
                <option value="kachha">Kachha (Unpaved)</option>
                <option value="both">Both</option>
                <option value="none">None</option>
              </select>
            </div>

            <div>
              <label className="form-label text-xs">Facing Direction</label>
              <select {...register('facing_direction')} className="input-field text-xs">
                <option value="east">East Facing</option>
                <option value="north">North Facing</option>
                <option value="northeast">North-East (Ishanya)</option>
                <option value="west">West Facing</option>
                <option value="south">South Facing</option>
                <option value="northwest">North-West</option>
                <option value="southeast">South-East</option>
                <option value="southwest">South-West</option>
              </select>
            </div>

            <div>
              <label className="form-label text-xs">Ownership Type</label>
              <select {...register('ownership_type')} className="input-field text-xs">
                <option value="freehold">Freehold Title</option>
                <option value="leasehold">Leasehold (99 Yrs)</option>
                <option value="cooperative">Co-operative Society</option>
                <option value="power_of_attorney">Power of Attorney</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-[#202124] cursor-pointer">
              <input
                type="checkbox"
                {...register('is_corner_plot')}
                className="w-4 h-4 rounded text-[#F47B20] focus:ring-[#F47B20]"
              />
              <span>Corner Plot (Two Side Road)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-[#202124] cursor-pointer">
              <input
                type="checkbox"
                {...register('is_on_main_road')}
                className="w-4 h-4 rounded text-[#F47B20] focus:ring-[#F47B20]"
              />
              <span>Direct Main Road Frontage</span>
            </label>
          </div>

          {/* Amenities Multi-Select */}
          <div className="pt-3 border-t border-[#F0F0F0]">
            <label className="form-label text-xs mb-2">Amenities & Infrastructure</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITY_OPTIONS.map((item) => {
                const isSelected = selectedAmenities.includes(item)
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium text-left border transition ${
                      isSelected
                        ? 'bg-orange-50 border-[#F47B20] text-[#F47B20] font-semibold'
                        : 'bg-white border-[#EAEAEA] text-[#727272] hover:bg-gray-50'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {item}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Nearby Landmarks Dynamic List */}
          <div className="pt-3 border-t border-[#F0F0F0]">
            <label className="form-label text-xs">Nearby Landmarks (Optional)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="e.g. Metro Station 500m, Fortis Hospital 1km"
                value={newLandmark}
                onChange={(e) => setNewLandmark(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddLandmark()
                  }
                }}
                className="input-field text-xs flex-1"
              />
              <button
                type="button"
                onClick={handleAddLandmark}
                className="btn-secondary btn-sm"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {landmarks.map((lm, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full bg-gray-100 text-xs text-[#202124] flex items-center gap-1.5"
                >
                  {lm}
                  <button
                    type="button"
                    onClick={() => handleRemoveLandmark(idx)}
                    className="text-gray-400 hover:text-rose-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Step 5: Images */}
        <div className="card p-6 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F0F0F0]">
            <Upload className="w-5 h-5 text-[#F47B20]" />
            <h3 className="font-poppins font-bold text-base text-[#202124]">
              Property Photos
            </h3>
          </div>

          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Enter image URL (Unsplash or hosted image)..."
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="input-field text-xs flex-1"
            />
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="btn-secondary btn-sm"
            >
              Add Photo
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {imageUrls.map((url, idx) => (
              <div
                key={idx}
                className={`relative rounded-xl overflow-hidden aspect-video border-2 group ${
                  coverIndex === idx ? 'border-[#F47B20]' : 'border-[#EAEAEA]'
                }`}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCoverIndex(idx)}
                    className="p-1 rounded bg-white text-xs text-[#202124] font-semibold"
                    title="Make Cover Photo"
                  >
                    ★
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveImageUrl(idx)}
                    className="p-1 rounded bg-rose-600 text-white text-xs"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {coverIndex === idx && (
                  <span className="absolute bottom-1.5 left-1.5 bg-[#F47B20] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    Cover Photo
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 6: Seller Contact */}
        <div className="card p-6 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F0F0F0]">
            <ShieldCheck className="w-5 h-5 text-[#F47B20]" />
            <h3 className="font-poppins font-bold text-base text-[#202124]">
              Seller Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="form-label text-xs">Seller Type *</label>
              <select {...register('seller_category')} className="input-field text-xs">
                <option value="owner">Direct Owner</option>
                <option value="agent">Broker / Agent</option>
                <option value="builder">Builder</option>
                <option value="developer">Developer</option>
              </select>
            </div>
            <div>
              <label className="form-label text-xs">Seller Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Rajesh Verma"
                {...register('seller_name')}
                className="input-field text-xs"
              />
              {errors.seller_name && <p className="form-error">{errors.seller_name.message}</p>}
            </div>
            <div>
              <label className="form-label text-xs">Phone Number *</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                {...register('seller_phone')}
                className="input-field text-xs"
              />
              {errors.seller_phone && <p className="form-error">{errors.seller_phone.message}</p>}
            </div>
            <div>
              <label className="form-label text-xs">Email Address *</label>
              <input
                type="email"
                placeholder="seller@domain.com"
                {...register('seller_email')}
                className="input-field text-xs"
              />
              {errors.seller_email && <p className="form-error">{errors.seller_email.message}</p>}
            </div>
          </div>
        </div>

        {/* Step 7: Creation Action Buttons (Draft / Direct Publish / Featured) */}
        <div className="card p-5 bg-[#FFF8F2] border border-[#FFE4CC] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-poppins font-bold text-sm text-[#202124]">
              Publishing Options
            </h4>
            <p className="text-xs text-[#727272]">
              As an Administrator, you can bypass the standard moderation queue and publish directly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onSubmitWithMode('draft')}
              disabled={createPropertyMutation.isPending}
              className="btn-secondary btn-sm"
            >
              Save as Draft
            </button>

            <button
              type="button"
              onClick={() => onSubmitWithMode('publish')}
              disabled={createPropertyMutation.isPending}
              className="btn-primary btn-sm !bg-emerald-600 hover:!bg-emerald-700 text-white flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Publish Live</span>
            </button>

            <button
              type="button"
              onClick={() => onSubmitWithMode('featured')}
              disabled={createPropertyMutation.isPending}
              className="btn-primary btn-sm flex items-center gap-1.5 shadow-md shadow-[#F47B20]/25"
            >
              <Sparkles className="w-4 h-4" />
              <span>Save & Make Featured</span>
            </button>
          </div>
        </div>
      </form>
    </AdminLayout>
  )
}

export default AdminAddPropertyPage
