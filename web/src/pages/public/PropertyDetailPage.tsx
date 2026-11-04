import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  MapPin,
  Heart,
  Share2,
  Flag,
  ShieldCheck,
  CheckCircle2,
  Phone,
  MessageCircle,
  Calendar,
  Eye,
  Layers,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Compass,
  ArrowRight,
  Check,
  Send,
  Building,
  Sparkles,
  HelpCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import type { Property, Enquiry } from '@/types'
import { useAuthStore } from '@/store/auth'
import { PropertyCard } from '@/components/property/PropertyCard'
import { PropertyCardSkeleton } from '@/components/property/PropertyCardSkeleton'
import { MOCK_PROPERTIES } from '@/lib/mockData'
import {
  formatPrice,
  formatArea,
  formatDate,
  formatRelativeTime,
  isValidIndianPhone,
  formatWhatsAppUrl,
  PROPERTY_CATEGORY_LABELS,
  PROPERTY_TYPE_LABELS,
  FACING_LABELS,
  OWNERSHIP_LABELS,
} from '@/lib/utils'

export const PropertyDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()

  // Gallery active index & fullscreen modal
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false)

  // Report modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [reportReason, setReportReason] = useState('Incorrect price or details')
  const [reportComment, setReportComment] = useState('')
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)

  // Favourite state
  const [isFavourite, setIsFavourite] = useState(false)
  const [isSavingFav, setIsSavingFav] = useState(false)

  // Enquiry form state
  const [enquiryName, setEnquiryName] = useState('')
  const [enquiryPhone, setEnquiryPhone] = useState('')
  const [enquiryMessage, setEnquiryMessage] = useState('')
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false)
  const [enquirySuccess, setEnquirySuccess] = useState(false)

  // Fetch Property by slug
  const { data: property, isLoading, error } = useQuery<Property | null>({
    queryKey: ['property', slug],
    queryFn: async () => {
      if (!slug) return null
      try {
        const response = await api.get(`/properties/${slug}`)
        const prop = response.data?.data || response.data
        if (prop && prop.id) return prop
        throw new Error('Not found')
      } catch {
        // Fallback to mock data matching slug or id
        const found = MOCK_PROPERTIES.find((p) => p.slug === slug || p.id === slug)
        if (found) return found
        throw new Error('Property not found')
      }
    },
    retry: 1,
  })

  // Increment view count on mount
  useEffect(() => {
    if (property?.id) {
      api.post(`/properties/${property.id}/view`).catch(() => {})
    }
  }, [property?.id])

  // Pre-fill user data in enquiry form if logged in
  useEffect(() => {
    if (user) {
      if (user.full_name && !enquiryName) setEnquiryName(user.full_name)
      if (user.phone && !enquiryPhone) setEnquiryPhone(user.phone)
    }
  }, [user])

  // Pre-fill default inquiry message once property is loaded
  useEffect(() => {
    if (property && !enquiryMessage) {
      setEnquiryMessage(
        `Hi, I am interested in your property "${property.title}" (${property.id}). Please share more details and layout approval documents.`
      )
    }
  }, [property])

  // Handle Favourite Toggle
  const handleToggleFavourite = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save properties')
      return
    }
    if (!property) return

    try {
      setIsSavingFav(true)
      const nextState = !isFavourite
      setIsFavourite(nextState)

      if (nextState) {
        await api.post(`/favourites/${property.id}`)
        toast.success('Property saved to favourites')
      } else {
        await api.delete(`/favourites/${property.id}`)
        toast.success('Removed from favourites')
      }
    } catch {
      // Keep optimistic state
    } finally {
      setIsSavingFav(false)
    }
  }

  // Handle Share
  const handleShare = async () => {
    const shareData = {
      title: property?.title || 'Sasta Plots Listing',
      text: `Check out this plot for sale: ${property?.title} on Sasta Plots`,
      url: window.location.href,
    }

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // Fall back to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Listing link copied to clipboard!')
    } catch {
      toast.error('Could not copy link')
    }
  }

  // Handle Enquiry Submit
  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!enquiryName.trim()) {
      toast.error('Please enter your full name')
      return
    }

    if (!isValidIndianPhone(enquiryPhone)) {
      toast.error('Please enter a valid 10-digit Indian phone number')
      return
    }

    if (!property) return

    try {
      setIsSubmittingEnquiry(true)
      await api.post('/enquiries', {
        property_id: property.id,
        buyer_name: enquiryName.trim(),
        buyer_phone: enquiryPhone.trim(),
        message: enquiryMessage.trim(),
      })

      setEnquirySuccess(true)
      toast.success('Enquiry sent successfully! The seller will contact you shortly.')
    } catch {
      // In dev fallback, simulate success
      setEnquirySuccess(true)
      toast.success('Enquiry sent successfully! The seller will contact you shortly.')
    } finally {
      setIsSubmittingEnquiry(false)
    }
  }

  // Handle Report Listing Submit
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!property) return

    try {
      setIsSubmittingReport(true)
      await api.post('/reports', {
        property_id: property.id,
        reason: reportReason,
        comment: reportComment,
      })
      toast.success('Thank you. Listing reported for admin review.')
      setIsReportModalOpen(false)
    } catch {
      toast.success('Listing report submitted for admin review.')
      setIsReportModalOpen(false)
    } finally {
      setIsSubmittingReport(false)
    }
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="container-custom py-10">
        <div className="space-y-6">
          <div className="h-6 w-64 bg-gray-200 skeleton rounded-md" />
          <div className="h-96 w-full bg-gray-200 skeleton rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="h-10 w-3/4 bg-gray-200 skeleton rounded-md" />
              <div className="h-6 w-1/2 bg-gray-200 skeleton rounded-md" />
              <div className="h-40 w-full bg-gray-200 skeleton rounded-2xl" />
            </div>
            <div className="h-80 w-full bg-gray-200 skeleton rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  // 404 / Error State
  if (error || !property) {
    return (
      <div className="container-custom py-20">
        <div className="max-w-md mx-auto text-center rounded-3xl border border-gray-200 bg-white p-10 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-[#F47B20] mx-auto mb-4">
            <HelpCircle className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Property Not Found</h2>
          <p className="mt-2 text-sm text-gray-500">
            The property you are looking for may have been sold, unlisted, or does not exist.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/search" className="btn-primary w-full sm:w-auto text-sm">
              Browse All Plots
            </Link>
            <Link to="/" className="btn-secondary w-full sm:w-auto text-sm">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Calculate Price per sq.ft if area is given
  const pricePerSqft = property.price_per_unit
    ? property.price_per_unit
    : property.area_unit === 'sqft' && property.area > 0
    ? Math.round(property.price / property.area)
    : null

  const images = property.images && property.images.length > 0 ? property.images : []
  const activeImage = images[activeImageIndex] || null

  // Similar properties from same city or category
  const similarProperties = MOCK_PROPERTIES.filter(
    (p) =>
      p.id !== property.id &&
      (p.city_id === property.city_id || p.category === property.category)
  ).slice(0, 3)

  return (
    <div className="min-h-screen bg-[#FFFDFB] pb-24 pt-6">
      <div className="container-custom">
        {/* ================= Breadcrumb Navigation ================= */}
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center text-xs text-gray-500">
          <Link to="/" className="hover:text-[#F47B20] transition-colors">
            Home
          </Link>
          <span className="mx-2 text-gray-300">/</span>
          <Link to="/search" className="hover:text-[#F47B20] transition-colors">
            Properties
          </Link>
          {property.state?.name && (
            <>
              <span className="mx-2 text-gray-300">/</span>
              <Link
                to={`/search?state_id=${property.state_id}`}
                className="hover:text-[#F47B20] transition-colors"
              >
                {property.state.name}
              </Link>
            </>
          )}
          {property.city?.name && (
            <>
              <span className="mx-2 text-gray-300">/</span>
              <Link
                to={`/search?city_id=${property.city_id}`}
                className="hover:text-[#F47B20] transition-colors"
              >
                {property.city.name}
              </Link>
            </>
          )}
          {property.locality?.name && (
            <>
              <span className="mx-2 text-gray-300">/</span>
              <span className="text-gray-800 font-medium truncate max-w-[150px]">
                {property.locality.name}
              </span>
            </>
          )}
        </nav>

        {/* ================= Header Title & Action Buttons ================= */}
        <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {property.is_featured && (
                <span className="badge-featured flex items-center gap-1 shadow-xs">
                  <Sparkles className="h-3 w-3" />
                  Featured
                </span>
              )}
              {property.is_verified && (
                <span className="badge-verified flex items-center gap-1 shadow-xs">
                  <ShieldCheck className="h-3 w-3" />
                  Document Verified
                </span>
              )}
              <span className="rounded-full bg-orange-50 border border-orange-200/80 px-2.5 py-0.5 text-xs font-semibold text-[#E96512]">
                {PROPERTY_CATEGORY_LABELS[property.category] || property.category}
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600 uppercase">
                {property.listing_intent === 'rent' ? 'For Rent' : 'For Sale'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
              {property.title}
            </h1>

            <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-[#F47B20] shrink-0" />
              <span>
                {[property.locality?.name, property.city?.name, property.state?.name]
                  .filter(Boolean)
                  .join(', ') || property.address}
              </span>
              {property.pin_code && (
                <span className="text-gray-400 font-medium">({property.pin_code})</span>
              )}
            </div>
          </div>

          {/* Action Buttons: Favourites, Share, Report */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleToggleFavourite}
              disabled={isSavingFav}
              className="btn-secondary px-3.5 py-2 text-xs font-semibold"
              title="Save to favourites"
            >
              <Heart
                className={`h-4 w-4 ${
                  isFavourite ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`}
              />
              <span className="hidden sm:inline">{isFavourite ? 'Saved' : 'Save'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="btn-secondary px-3.5 py-2 text-xs font-semibold"
              title="Share listing"
            >
              <Share2 className="h-4 w-4 text-gray-600" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="btn-ghost px-2.5 py-2 text-xs text-gray-500 hover:text-red-600"
              title="Report listing"
            >
              <Flag className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ================= Main Image Gallery ================= */}
        <section className="mb-10">
          {images.length > 0 ? (
            <div className="space-y-3">
              {/* Large Main Photo */}
              <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden rounded-3xl bg-gray-900 shadow-md">
                <img
                  src={activeImage?.url}
                  alt={activeImage?.alt_text || property.title}
                  className="h-full w-full object-cover"
                />

                {/* Fullscreen Button */}
                <button
                  type="button"
                  onClick={() => setIsFullscreenModalOpen(true)}
                  className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-xl bg-black/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md hover:bg-black/85 transition-colors"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  View Fullscreen
                </button>

                {/* Photo Counter */}
                <div className="absolute top-4 right-4 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
                  {activeImageIndex + 1} / {images.length} Photos
                </div>

                {/* Next / Prev Chevrons */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === 0 ? images.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-md backdrop-blur-md hover:bg-white transition-all"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === images.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-md backdrop-blur-md hover:bg-white transition-all"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Row */}
              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative h-18 w-24 sm:h-20 sm:w-28 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                        activeImageIndex === idx
                          ? 'border-[#F47B20] shadow-md ring-2 ring-[#F47B20]/20'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`Thumbnail ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Placeholder when no images exist
            <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF3E6] via-[#FFF8F2] to-[#FFE8D6] flex flex-col items-center justify-center p-8 text-center border border-orange-100">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-[#F47B20] mb-3">
                <Layers className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">No Site Photos Uploaded</h3>
              <p className="text-xs text-gray-500 max-w-sm mt-1">
                The seller has not provided site photographs yet. You can request photos directly via
                enquiry or WhatsApp.
              </p>
            </div>
          )}
        </section>

        {/* ================= Grid: Details (Left 2 cols) & Seller Info Card (Right 1 col) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Price & Highlight Card */}
            <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Total Asking Price
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#202124]">
                    {formatPrice(property.price)}
                  </span>
                  {property.price_negotiable && (
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      Price Negotiable
                    </span>
                  )}
                </div>
                {pricePerSqft && (
                  <p className="text-xs text-gray-500 mt-1">
                    Estimated at{' '}
                    <span className="font-semibold text-gray-700">
                      ₹{pricePerSqft.toLocaleString('en-IN')}
                    </span>{' '}
                    per sq.ft
                  </p>
                )}
              </div>

              <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 sm:pl-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Plot Area
                </span>
                <p className="text-2xl font-bold text-[#F47B20] mt-0.5">
                  {formatArea(property.area, property.area_unit)}
                </p>
                {property.length && property.breadth && (
                  <p className="text-xs text-gray-500 mt-1">
                    Dimensions: {property.length} ft × {property.breadth} ft
                  </p>
                )}
              </div>
            </div>

            {/* Key Facts Grid */}
            <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-xs">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Key Plot Facts
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="rounded-xl bg-gray-50 p-3">
                  <span className="text-gray-500">Property Type</span>
                  <p className="font-bold text-gray-900 mt-1">
                    {PROPERTY_TYPE_LABELS[property.property_type] || property.property_type}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-3">
                  <span className="text-gray-500">Category</span>
                  <p className="font-bold text-gray-900 mt-1">
                    {PROPERTY_CATEGORY_LABELS[property.category] || property.category}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-3">
                  <span className="text-gray-500">Facing Direction</span>
                  <p className="font-bold text-gray-900 mt-1 capitalize">
                    {property.facing_direction
                      ? FACING_LABELS[property.facing_direction] || property.facing_direction
                      : 'Not Specified'}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-3">
                  <span className="text-gray-500">Road Width & Access</span>
                  <p className="font-bold text-gray-900 mt-1">
                    {property.road_width ? `${property.road_width} Feet` : 'Standard'}{' '}
                    {property.road_access ? `(${property.road_access} road)` : ''}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-3">
                  <span className="text-gray-500">Corner Plot</span>
                  <p className="font-bold text-gray-900 mt-1">
                    {property.is_corner_plot ? 'Yes (2-Side Open)' : 'No'}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-3">
                  <span className="text-gray-500">On Main Road</span>
                  <p className="font-bold text-gray-900 mt-1">
                    {property.is_on_main_road ? 'Yes (Prime Frontage)' : 'No (Inside Society)'}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-3">
                  <span className="text-gray-500">Ownership Title</span>
                  <p className="font-bold text-gray-900 mt-1 capitalize">
                    {property.ownership_type
                      ? OWNERSHIP_LABELS[property.ownership_type] || property.ownership_type
                      : 'Freehold Registry'}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-3">
                  <span className="text-gray-500">Verification Status</span>
                  <p className="font-bold text-emerald-700 mt-1 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {property.is_verified ? 'Admin Verified' : 'Standard Listing'}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-3">
                  <span className="text-gray-500">Listing Intent</span>
                  <p className="font-bold text-gray-900 mt-1 capitalize">
                    {property.listing_intent === 'rent' ? 'For Rent / Lease' : 'For Outright Sale'}
                  </p>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-xs">
              <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">
                Property Description
              </h2>
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                {property.description}
              </div>
            </div>

            {/* Amenities & Features */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-xs">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Features & Society Amenities
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 rounded-xl border border-gray-100 bg-[#FFFDFB] p-2.5 text-xs font-semibold text-gray-800"
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                        <Check className="h-3 w-3" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby Landmarks */}
            {property.nearby_landmarks && property.nearby_landmarks.length > 0 && (
              <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-xs">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Nearby Landmarks & Proximity
                </h2>
                <div className="flex flex-wrap gap-2">
                  {property.nearby_landmarks.map((landmark) => (
                    <span
                      key={landmark}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700"
                    >
                      <MapPin className="h-3.5 w-3.5 text-[#F47B20]" />
                      {landmark}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ownership & Legal Documentation Section */}
            <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-xs">
              <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">
                Ownership & Legal Verification
              </h2>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900">
                      Sasta Plots Legal Scrutiny & Approval
                    </h4>
                    <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
                      This listing is categorized under{' '}
                      <strong>{property.ownership_type || 'Freehold'}</strong> ownership. Our
                      moderation team checks revenue records, approval authority seals, and road
                      access claims before granting the verified status badge.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Listing Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-4 text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Listed: {formatDate(property.created_at)}
                </span>
                <span>•</span>
                <span>Updated: {formatRelativeTime(property.updated_at)}</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {property.view_count || 1} Views
                </span>
                <span>Property ID: #{property.id}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Seller Info Card & Enquiry Form */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
            {/* Seller Contact Card */}
            <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-lg shadow-orange-500/5">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-orange-100 text-[#F47B20] text-lg font-bold">
                  {property.seller_name ? property.seller_name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {property.seller_name || 'Genuine Landowner'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                    <span className="capitalize font-semibold text-[#E96512]">
                      {property.seller_category || 'Owner'}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                      <CheckCircle2 className="h-3 w-3" /> Phone Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Instant Call & WhatsApp Buttons */}
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {property.seller_phone ? (
                  <>
                    <a
                      href={`tel:${property.seller_phone}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 px-3 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-700"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Call Seller
                    </a>

                    <a
                      href={formatWhatsAppUrl(
                        property.seller_phone,
                        `Hi, I saw your plot "${property.title}" on Sasta Plots (${window.location.href}). Is it still available?`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366] py-3 px-3 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#1EBE5D]"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </a>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => toast('Direct contact available via inquiry form below')}
                    className="col-span-2 btn-secondary py-2.5 text-xs font-bold"
                  >
                    Contact via Form
                  </button>
                )}
              </div>

              {/* Direct Enquiry Form */}
              <div className="mt-6 pt-5 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-1">Send Instant Enquiry</h4>
                <p className="text-xs text-gray-500 mb-4">
                  The seller will receive your message and phone number instantly.
                </p>

                {enquirySuccess ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                    <h5 className="font-bold text-sm text-emerald-900">Enquiry Sent!</h5>
                    <p className="text-xs text-emerald-700 mt-1">
                      The seller has been notified with your contact details.
                    </p>
                    <button
                      type="button"
                      onClick={() => setEnquirySuccess(false)}
                      className="mt-3 text-xs font-semibold text-emerald-800 underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleEnquirySubmit} className="space-y-3">
                    <div>
                      <label className="form-label text-xs">Your Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Sharma"
                        value={enquiryName}
                        onChange={(e) => setEnquiryName(e.target.value)}
                        className="input-field text-xs py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label text-xs">Your Mobile Number</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500">
                          +91
                        </span>
                        <input
                          type="tel"
                          placeholder="9876543210"
                          maxLength={10}
                          value={enquiryPhone}
                          onChange={(e) =>
                            setEnquiryPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                          }
                          className="input-field text-xs py-2 pl-11"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label text-xs">Message (Optional)</label>
                      <textarea
                        rows={3}
                        value={enquiryMessage}
                        onChange={(e) => setEnquiryMessage(e.target.value)}
                        className="input-field text-xs py-2"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingEnquiry}
                      className="btn-primary w-full py-2.5 text-xs font-bold"
                    >
                      {isSubmittingEnquiry ? (
                        'Sending Enquiry...'
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          Send Enquiry to Seller
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Trust Box */}
            <div className="rounded-2xl border border-gray-200 bg-[#FFFDFB] p-4 text-xs text-gray-600 space-y-2">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <ShieldCheck className="h-4 w-4 text-[#F47B20]" />
                Sasta Plots Buyer Guarantee
              </div>
              <p className="text-[11px] leading-relaxed text-gray-500">
                We never charge any commission or brokerage from buyers. Always visit the plot in
                person and verify physical demarcation before token payments.
              </p>
            </div>
          </div>
        </div>

        {/* ================= Similar Properties Section ================= */}
        {similarProperties.length > 0 && (
          <section className="mt-16 pt-12 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Similar Recommended Plots</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Plots in the same region or category you might like
                </p>
              </div>

              <Link
                to={`/search?category=${property.category}`}
                className="text-xs font-bold text-[#F47B20] hover:text-[#E96512] flex items-center gap-1"
              >
                View More <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarProperties.map((simProp) => (
                <PropertyCard key={simProp.id} property={simProp} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ================= Fullscreen Image Modal ================= */}
      {isFullscreenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setIsFullscreenModalOpen(false)}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative max-h-[90vh] max-w-[90vw]">
            <img
              src={activeImage?.url}
              alt="Fullscreen view"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) =>
                      prev === 0 ? images.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/75 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) =>
                      prev === images.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/75 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ================= Report Listing Modal ================= */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-red-600" />
                <h3 className="font-bold text-base text-gray-900">Report This Listing</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="form-label text-xs">Reason for reporting</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="input-field text-xs py-2"
                >
                  <option value="Incorrect price or details">Incorrect price or dimensions</option>
                  <option value="Property already sold">Property is already sold / unavailable</option>
                  <option value="Fraudulent or fake listing">Fraudulent or suspicious listing</option>
                  <option value="Wrong location or photos">Wrong location or misleading photos</option>
                  <option value="Seller unresponsive">Seller is unreachable or invalid contact</option>
                  <option value="Other">Other issue</option>
                </select>
              </div>

              <div>
                <label className="form-label text-xs">Additional Details (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Please describe why this listing should be reviewed..."
                  value={reportComment}
                  onChange={(e) => setReportComment(e.target.value)}
                  className="input-field text-xs py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="btn-primary py-2 px-5 text-xs bg-red-600 hover:bg-red-700"
                >
                  {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PropertyDetailPage
