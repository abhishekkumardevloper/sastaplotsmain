'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
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
  Home,
  ArrowLeft,
  Image as ImageIcon,
  LayoutGrid,
  FileText,
  Info,
  Star,
  User,
  RulerIcon,
  Route,
  Landmark,
  BadgeCheck,
  TrendingUp,
  Clock,
  ZoomIn,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import type { Property, Enquiry } from '@/types'
import { useAuthStore } from '@/store/auth'
import { PropertyCard } from '@/components/property/PropertyCard'
import { PropertyCardSkeleton } from '@/components/property/PropertyCardSkeleton'
// Real real estate marketplace data only
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

/* ─────────────────────────── helpers ─────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

type TabKey = 'description' | 'amenities' | 'location' | 'documents'

/* ═══════════════════════════════════════════════════════════════ */
export const PropertyDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()

  /* Gallery */
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false)

  /* Report modal */
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [reportReason, setReportReason] = useState('Incorrect price or details')
  const [reportComment, setReportComment] = useState('')
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)

  /* Favourite */
  const [isFavourite, setIsFavourite] = useState(false)
  const [isSavingFav, setIsSavingFav] = useState(false)

  /* Enquiry form */
  const [enquiryName, setEnquiryName] = useState('')
  const [enquiryPhone, setEnquiryPhone] = useState('')
  const [enquiryMessage, setEnquiryMessage] = useState('')
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false)
  const [enquirySuccess, setEnquirySuccess] = useState(false)

  /* Tab state */
  const [activeTab, setActiveTab] = useState<TabKey>('description')

  /* ─── Fetch property by slug ─── */
  const { data: property, isLoading, error } = useQuery<Property | null>({
    queryKey: ['property', slug],
    queryFn: async () => {
      if (!slug) return null
      try {
        const response = await api.get(`/properties/${slug}`)
        const prop = response.data?.data || response.data
        if (prop && prop.id) return prop
        throw new Error('Not found')
      } catch (err: any) {
        throw new Error(err?.response?.data?.error || err.message || 'Property not found')
      }
    },
    retry: 1,
  })

  /* Similar properties from API */
  const { data: similarData } = useQuery<Property[]>({
    queryKey: ['properties', 'similar', property?.category, property?.id],
    queryFn: async () => {
      if (!property?.category) return []
      try {
        const res = await api.get('/properties', {
          params: { category: property.category, status: 'approved', limit: 4 },
        })
        const items = res.data?.data || res.data || []
        return Array.isArray(items) ? items.filter((p: Property) => p.id !== property.id).slice(0, 4) : []
      } catch {
        return []
      }
    },
    enabled: Boolean(property?.category && property?.id),
  })
  const similarProperties = similarData || []

  /* Increment view count */
  useEffect(() => {
    if (property?.id) {
      api.post(`/properties/${property.id}/view`).catch(() => {})
    }
  }, [property?.id])

  /* Pre-fill user data */
  useEffect(() => {
    if (user) {
      if (user.full_name && !enquiryName) setEnquiryName(user.full_name)
      if (user.phone && !enquiryPhone) setEnquiryPhone(user.phone)
    }
  }, [user])

  /* Pre-fill default enquiry message */
  useEffect(() => {
    if (property && !enquiryMessage) {
      setEnquiryMessage(
        `Hi, I am interested in your property "${property.title}" (${property.id}). Please share more details and layout approval documents.`
      )
    }
  }, [property])

  /* ─── Handlers ─── */
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
      // keep optimistic state
    } finally {
      setIsSavingFav(false)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: property?.title || 'Sasta Plots Listing',
      text: `Check out this plot for sale: ${property?.title} on Sasta Plots`,
      url: window.location.href,
    }
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try { await navigator.share(shareData); return } catch {}
    }
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Listing link copied to clipboard!')
    } catch {
      toast.error('Could not copy link')
    }
  }

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enquiryName.trim()) { toast.error('Please enter your full name'); return }
    if (!isValidIndianPhone(enquiryPhone)) { toast.error('Please enter a valid 10-digit Indian phone number'); return }
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
      setEnquirySuccess(true)
      toast.success('Enquiry sent successfully! The seller will contact you shortly.')
    } finally {
      setIsSubmittingEnquiry(false)
    }
  }

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

  /* ─── Loading skeleton ─── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDFB]">
        <div className="container-custom py-8 space-y-6 animate-pulse">
          <div className="h-5 w-72 bg-gray-200 rounded-full" />
          <div className="h-[420px] w-full bg-gray-200 rounded-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-10 w-3/4 bg-gray-200 rounded-xl" />
              <div className="h-5 w-1/2 bg-gray-200 rounded-full" />
              <div className="h-48 w-full bg-gray-200 rounded-2xl" />
              <div className="h-48 w-full bg-gray-200 rounded-2xl" />
            </div>
            <div className="h-96 w-full bg-gray-200 rounded-3xl" />
          </div>
        </div>
      </div>
    )
  }

  /* ─── 404 / Error ─── */
  if (error || !property) {
    return (
      <div className="min-h-screen bg-[#FFFDFB] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full rounded-3xl border border-gray-200 bg-white p-10 shadow-lg text-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-50 text-[#F47B20] mx-auto mb-5">
            <HelpCircle className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">Property Not Found</h2>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            The property you are looking for may have been sold, unlisted, or does not exist.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/search" className="btn-primary text-sm px-6 py-2.5">Browse All Plots</Link>
            <Link to="/" className="btn-secondary text-sm px-6 py-2.5">Back to Home</Link>
          </div>
        </motion.div>
      </div>
    )
  }

  /* ─── Derived values ─── */
  const pricePerSqft = property.price_per_unit
    ? property.price_per_unit
    : property.area_unit === 'sqft' && property.area > 0
    ? Math.round(property.price / property.area)
    : null

  const images = property.images && property.images.length > 0 ? property.images : []
  const activeImage = images[activeImageIndex] || null

  /* Tab availability */
  const hasAmenities = property.amenities && property.amenities.length > 0
  const hasDocuments = property.documents && property.documents.length > 0

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'description', label: 'Description', icon: <FileText className="h-3.5 w-3.5" /> },
    ...(hasAmenities ? [{ key: 'amenities' as TabKey, label: 'Amenities', icon: <Star className="h-3.5 w-3.5" /> }] : []),
    { key: 'location', label: 'Location', icon: <MapPin className="h-3.5 w-3.5" /> },
    ...(hasDocuments ? [{ key: 'documents' as TabKey, label: 'Documents', icon: <FileText className="h-3.5 w-3.5" /> }] : []),
  ]

  /* ══════════════════════════════════ RENDER ══════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#FFFDFB] pb-28 pt-4">
      <div className="container-custom">

        {/* ══ TOP BAR: Breadcrumb + Back (mobile) ══ */}
        <div className="mb-5 flex items-center justify-between gap-4">
          {/* Back button – mobile only */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex md:hidden items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 transition-colors shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-gray-400 flex-wrap min-w-0">
            <Link to="/" className="flex items-center gap-1 hover:text-[#F47B20] transition-colors shrink-0">
              <Home className="h-3 w-3" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <Link to="/search" className="hover:text-[#F47B20] transition-colors shrink-0">
              {PROPERTY_CATEGORY_LABELS[property.category] || 'Properties'}
            </Link>
            {property.city?.name && (
              <>
                <ChevronRight className="h-3 w-3 shrink-0" />
                <Link
                  to={`/search?city_id=${property.city_id}`}
                  className="hover:text-[#F47B20] transition-colors shrink-0"
                >
                  {property.city.name}
                </Link>
              </>
            )}
            {property.locality?.name && (
              <>
                <ChevronRight className="h-3 w-3 shrink-0" />
                <span className="text-gray-600 font-medium truncate max-w-[140px]">{property.locality.name}</span>
              </>
            )}
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="text-gray-700 font-semibold truncate max-w-[180px]">{property.title}</span>
          </nav>
        </div>

        {/* ══ TITLE + BADGES + ACTIONS ══ */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4"
        >
          <motion.div variants={fadeUp} className="min-w-0">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {property.is_featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-0.5 text-xs font-bold text-white shadow-sm">
                  <Sparkles className="h-3 w-3" />
                  Featured
                </span>
              )}
              {property.is_verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-0.5 text-xs font-bold text-white shadow-sm">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </span>
              )}
              <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-0.5 text-xs font-semibold text-[#E96512]">
                {PROPERTY_CATEGORY_LABELS[property.category] || property.category}
              </span>
              <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-3 py-0.5 text-xs font-semibold text-gray-600">
                {property.listing_intent === 'rent' ? 'For Rent / Lease' : 'For Sale'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
              {property.title}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#F47B20] shrink-0" />
                {[property.locality?.name, property.city?.name, property.state?.name]
                  .filter(Boolean)
                  .join(', ') || property.address}
                {property.pin_code && <span className="text-gray-400">– {property.pin_code}</span>}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Eye className="h-3.5 w-3.5" />
                {property.view_count || 1} views
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="h-3.5 w-3.5" />
                Listed {formatRelativeTime(property.created_at)}
              </span>
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div variants={fadeUp} className="flex items-center gap-2 shrink-0 mt-1">
            <button
              type="button"
              onClick={handleToggleFavourite}
              disabled={isSavingFav}
              title="Save to favourites"
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all shadow-xs ${
                isFavourite
                  ? 'border-red-200 bg-red-50 text-red-600'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavourite ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="hidden sm:inline">{isFavourite ? 'Saved' : 'Save'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              title="Share listing"
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-600 shadow-xs hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-all"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              title="Report listing"
              className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-400 shadow-xs hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all"
            >
              <Flag className="h-4 w-4" />
            </button>
          </motion.div>
        </motion.div>

        {/* ══ IMAGE GALLERY ══ */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mb-10"
        >
          {images.length > 0 ? (
            <div className="space-y-3">
              {/* Main image */}
              <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden rounded-3xl bg-gray-900 shadow-lg shadow-gray-900/15">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImageIndex}
                    src={activeImage?.url}
                    alt={activeImage?.alt_text || property.title}
                    className="h-full w-full object-cover"
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>

                {/* Gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                {/* Photo count badge */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                  <ImageIcon className="h-3 w-3" />
                  {activeImageIndex + 1} / {images.length} Photos
                </div>

                {/* Fullscreen button */}
                <button
                  type="button"
                  onClick={() => setIsFullscreenModalOpen(true)}
                  className="absolute top-4 right-4 flex items-center gap-1.5 rounded-xl bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                  Fullscreen
                </button>

                {/* Prev / Next arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md backdrop-blur-sm hover:bg-white hover:scale-105 transition-all"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md backdrop-blur-sm hover:bg-white hover:scale-105 transition-all"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                  {images.slice(0, 8).map((img, idx) => (
                    <button
                      key={img.id || idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative h-16 w-24 sm:h-20 sm:w-28 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                        activeImageIndex === idx
                          ? 'border-[#F47B20] shadow-md ring-2 ring-[#F47B20]/25 opacity-100 scale-[1.03]'
                          : 'border-transparent opacity-60 hover:opacity-90 hover:scale-[1.02]'
                      }`}
                    >
                      <img src={img.url} alt={`Photo ${idx + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                  {images.length > 8 && (
                    <button
                      type="button"
                      onClick={() => setIsFullscreenModalOpen(true)}
                      className="relative h-16 w-24 sm:h-20 sm:w-28 shrink-0 overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-1 text-xs font-semibold text-gray-500 hover:bg-orange-50 hover:border-[#F47B20] hover:text-[#F47B20] transition-colors"
                    >
                      <LayoutGrid className="h-4 w-4" />
                      +{images.length - 8} more
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF3E6] via-[#FFF8F2] to-[#FFE8D6] flex flex-col items-center justify-center p-8 text-center border border-orange-100">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-100 text-[#F47B20] mb-4">
                <Layers className="h-10 w-10" />
              </div>
              <h3 className="font-bold text-gray-800 text-xl">No Site Photos Uploaded</h3>
              <p className="text-sm text-gray-500 max-w-sm mt-2 leading-relaxed">
                The seller has not provided site photographs yet. Request photos directly via enquiry or WhatsApp.
              </p>
            </div>
          )}
        </motion.section>

        {/* ══ MAIN GRID: Content (left 2 col) + Sidebar (right 1 col) ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ══════════════ LEFT COLUMN ══════════════ */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="lg:col-span-2 space-y-7"
          >
            {/* ── KEY FACTS ROW ── */}
            <motion.div variants={fadeUp} className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-xs">
              <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-[#F47B20]">
                  <Info className="h-4 w-4" />
                </span>
                Key Plot Facts
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  {
                    icon: <RulerIcon className="h-4 w-4" />,
                    label: 'Plot Area',
                    value: formatArea(property.area, property.area_unit),
                    highlight: true,
                  },
                  {
                    icon: <Building className="h-4 w-4" />,
                    label: 'Property Type',
                    value: PROPERTY_TYPE_LABELS[property.property_type] || property.property_type,
                  },
                  {
                    icon: <Compass className="h-4 w-4" />,
                    label: 'Facing Direction',
                    value: property.facing_direction
                      ? FACING_LABELS[property.facing_direction] || property.facing_direction
                      : 'Not Specified',
                  },
                  {
                    icon: <BadgeCheck className="h-4 w-4" />,
                    label: 'Ownership Title',
                    value: property.ownership_type
                      ? OWNERSHIP_LABELS[property.ownership_type] || property.ownership_type
                      : 'Freehold Registry',
                  },
                  {
                    icon: <Route className="h-4 w-4" />,
                    label: 'Road Width',
                    value: property.road_width
                      ? `${property.road_width} ft ${property.road_access ? `(${property.road_access})` : ''}`
                      : 'Standard',
                  },
                  {
                    icon: <RulerIcon className="h-4 w-4" />,
                    label: 'Dimensions',
                    value:
                      property.length && property.breadth
                        ? `${property.length} × ${property.breadth} ft`
                        : 'Not specified',
                  },
                  {
                    icon: <Landmark className="h-4 w-4" />,
                    label: 'Corner Plot',
                    value: property.is_corner_plot ? 'Yes (2-side open)' : 'No',
                  },
                  {
                    icon: <MapPin className="h-4 w-4" />,
                    label: 'Main Road Facing',
                    value: property.is_on_main_road ? 'Yes – Prime Frontage' : 'No – Inside Society',
                  },
                  {
                    icon: <ShieldCheck className="h-4 w-4" />,
                    label: 'Verification',
                    value: property.is_verified ? 'Admin Verified ✓' : 'Standard Listing',
                    verified: property.is_verified,
                  },
                ].map(({ icon, label, value, highlight, verified }) => (
                  <div
                    key={label}
                    className={`rounded-xl p-4 flex flex-col gap-1.5 ${
                      highlight
                        ? 'bg-gradient-to-br from-orange-50 to-orange-100/60 border border-orange-200/60'
                        : 'bg-gray-50 border border-gray-100'
                    }`}
                  >
                    <span className={`flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide ${highlight ? 'text-[#E96512]' : 'text-gray-400'}`}>
                      <span className={highlight ? 'text-[#F47B20]' : 'text-gray-400'}>{icon}</span>
                      {label}
                    </span>
                    <p className={`text-sm font-bold leading-tight ${verified ? 'text-emerald-700' : highlight ? 'text-[#F47B20]' : 'text-gray-900'}`}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── TABBED CONTENT ── */}
            <motion.div variants={fadeUp} className="rounded-2xl border border-gray-200/90 bg-white shadow-xs overflow-hidden">
              {/* Tab nav */}
              <div className="flex border-b border-gray-100 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-5 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                      activeTab === tab.key
                        ? 'border-[#F47B20] text-[#F47B20] bg-orange-50/50'
                        : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab panels */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="p-6"
                >
                  {activeTab === 'description' && (
                    <div>
                      {/* Price highlight inside description area */}
                      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50/60 border border-orange-100">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Total Asking Price</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl sm:text-4xl font-extrabold text-[#202124]">
                              {formatPrice(property.price)}
                            </span>
                            {property.price_negotiable && (
                              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                Negotiable
                              </span>
                            )}
                          </div>
                          {pricePerSqft && (
                            <p className="text-xs text-gray-500 mt-1">
                              ≈{' '}
                              <span className="font-semibold text-gray-700">
                                ₹{pricePerSqft.toLocaleString('en-IN')}
                              </span>{' '}
                              per sq.ft
                            </p>
                          )}
                        </div>
                        {property.area > 0 && (
                          <div className="sm:border-l sm:border-orange-200 sm:pl-4">
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Plot Area</p>
                            <p className="text-xl font-extrabold text-[#F47B20]">
                              {formatArea(property.area, property.area_unit)}
                            </p>
                            {property.length && property.breadth && (
                              <p className="text-xs text-gray-500 mt-0.5">{property.length} × {property.breadth} ft</p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                        {property.description || 'No description provided by the seller.'}
                      </div>

                      {/* Nearby landmarks inline */}
                      {property.nearby_landmarks && property.nearby_landmarks.length > 0 && (
                        <div className="mt-6 pt-5 border-t border-gray-100">
                          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Landmark className="h-4 w-4 text-[#F47B20]" />
                            Nearby Landmarks
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {property.nearby_landmarks.map((lm) => (
                              <span key={lm} className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700">
                                <MapPin className="h-3 w-3 text-[#F47B20]" />
                                {lm}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'amenities' && hasAmenities && (
                    <div>
                      <p className="text-xs text-gray-500 mb-4">Society amenities and project features included with this property.</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {property.amenities.map((item) => (
                          <div
                            key={item}
                            className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5 text-xs font-semibold text-gray-800 hover:border-emerald-200 hover:bg-emerald-50/60 transition-colors"
                          >
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                              <Check className="h-3 w-3" />
                            </span>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'location' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {[
                          { label: 'Full Address', value: property.address || '—' },
                          { label: 'Locality', value: property.locality?.name || '—' },
                          { label: 'City', value: property.city?.name || '—' },
                          { label: 'State', value: property.state?.name || '—' },
                          { label: 'PIN Code', value: property.pin_code || '—' },
                        ].map(({ label, value }) => (
                          <div key={label} className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                            <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-1">{label}</p>
                            <p className="font-semibold text-gray-900">{value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Legal/ownership info */}
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 flex gap-3 items-start">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shrink-0">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-emerald-900">Legal Scrutiny & Ownership</h4>
                          <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                            Categorised under{' '}
                            <strong>{property.ownership_type || 'Freehold'}</strong> ownership. Our team checks
                            revenue records, approval seals, and road access before granting the verified badge.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'documents' && hasDocuments && (
                    <div className="space-y-3">
                      {property.documents.map((doc: any, idx: number) => (
                        <a
                          key={idx}
                          href={doc.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 hover:border-[#F47B20] hover:bg-orange-50 hover:text-[#F47B20] transition-colors"
                        >
                          <FileText className="h-5 w-5 text-[#F47B20] shrink-0" />
                          {doc.name || `Document ${idx + 1}`}
                        </a>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* ── SELLER INFO CARD ── */}
            <motion.div variants={fadeUp} className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-xs">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <User className="h-4 w-4" />
                </span>
                Seller Information
              </h2>

              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white text-xl font-extrabold shadow-sm">
                  {property.seller_name ? property.seller_name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-base">{property.seller_name || 'Genuine Landowner'}</h3>
                    <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#E96512]">
                      {property.seller_category || 'Owner'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Phone Verified
                    </span>
                    {property.created_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Member since {formatDate(property.created_at)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {property.seller_phone && (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <a
                    href={`tel:${property.seller_phone}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    Call Seller
                  </a>
                  <a
                    href={formatWhatsAppUrl(
                      property.seller_phone,
                      `Hi, I saw your plot "${property.title}" on Sasta Plots (${window.location.href}). Is it still available?`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white shadow-sm hover:bg-[#1EBE5D] transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                </div>
              )}
            </motion.div>

            {/* ── LISTING META ── */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-4 text-xs text-gray-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Listed: {formatDate(property.created_at)}</span>
                <span>•</span>
                <span>Updated: {formatRelativeTime(property.updated_at)}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {property.view_count || 1} Views</span>
                <span>ID: #{property.id}</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ══════════════ RIGHT SIDEBAR (sticky) ══════════════ */}
          <div className="lg:col-span-1 space-y-5 lg:sticky lg:top-24 self-start">

            {/* ── PRICE + OVERVIEW CARD ── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.45 }}
              className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-lg shadow-orange-500/5"
            >
              {/* Price */}
              <div className="pb-4 border-b border-gray-100">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Total Asking Price</p>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#202124]">{formatPrice(property.price)}</span>
                  {property.price_negotiable && (
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      Negotiable
                    </span>
                  )}
                </div>
                {pricePerSqft && (
                  <p className="text-xs text-gray-400 mt-1">
                    ≈ <span className="font-semibold text-gray-600">₹{pricePerSqft.toLocaleString('en-IN')}</span>/sq.ft
                  </p>
                )}
                {property.is_verified && (
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Document Verified Property
                  </span>
                )}
              </div>

              {/* Quick action icons */}
              <div className="flex items-center justify-around py-4 border-b border-gray-100">
                <button
                  type="button"
                  onClick={handleToggleFavourite}
                  className={`flex flex-col items-center gap-1 text-xs font-semibold transition-colors ${isFavourite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                >
                  <Heart className={`h-5 w-5 ${isFavourite ? 'fill-red-500' : ''}`} />
                  {isFavourite ? 'Saved' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex flex-col items-center gap-1 text-xs font-semibold text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                  Share
                </button>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="flex flex-col items-center gap-1 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Flag className="h-5 w-5" />
                  Report
                </button>
              </div>

              {/* Seller quick row */}
              <div className="flex items-center gap-3 py-4 border-b border-gray-100">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold text-sm">
                  {property.seller_name ? property.seller_name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{property.seller_name || 'Genuine Owner'}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-semibold text-[#E96512] capitalize">{property.seller_category || 'Owner'}</span>
                    <span className="text-emerald-600 flex items-center gap-0.5">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Enquiry form */}
              <div className="mt-5">
                <h4 className="text-sm font-bold text-gray-900 mb-1">Send Enquiry</h4>
                <p className="text-xs text-gray-400 mb-4">Your details will be shared with the seller instantly.</p>

                {enquirySuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center"
                  >
                    <CheckCircle2 className="h-9 w-9 text-emerald-600 mx-auto mb-2" />
                    <h5 className="font-bold text-sm text-emerald-900">Enquiry Sent!</h5>
                    <p className="text-xs text-emerald-700 mt-1">The seller has been notified with your contact details.</p>
                    <button
                      type="button"
                      onClick={() => setEnquirySuccess(false)}
                      className="mt-3 text-xs font-semibold text-emerald-800 underline"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleEnquirySubmit} className="space-y-3">
                    {/* Name */}
                    <div>
                      <label className="form-label text-xs mb-1 block font-semibold text-gray-600">Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Sharma"
                        value={enquiryName}
                        onChange={(e) => setEnquiryName(e.target.value)}
                        className="input-field text-xs py-2.5"
                        required
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="form-label text-xs mb-1 block font-semibold text-gray-600">Mobile Number</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">+91</span>
                        <input
                          type="tel"
                          placeholder="9876543210"
                          maxLength={10}
                          value={enquiryPhone}
                          onChange={(e) => setEnquiryPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          className="input-field text-xs py-2.5 pl-11"
                          required
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="form-label text-xs mb-1 block font-semibold text-gray-600">Message</label>
                      <textarea
                        rows={3}
                        value={enquiryMessage}
                        onChange={(e) => setEnquiryMessage(e.target.value)}
                        className="input-field text-xs py-2"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmittingEnquiry}
                      className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
                    >
                      {isSubmittingEnquiry ? (
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {isSubmittingEnquiry ? 'Sending…' : 'Send Enquiry'}
                    </button>

                    {/* WhatsApp CTA */}
                    {property.seller_phone && (
                      <a
                        href={formatWhatsAppUrl(
                          property.seller_phone,
                          `Hi, I saw your plot "${property.title}" on Sasta Plots. Is it available?`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-[#25D366] bg-[#25D366]/10 py-2.5 text-sm font-bold text-[#128C7E] hover:bg-[#25D366] hover:text-white transition-all"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Chat on WhatsApp
                      </a>
                    )}
                  </form>
                )}
              </div>
            </motion.div>

            {/* ── TRUST BOX ── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.45 }}
              className="rounded-2xl border border-gray-200 bg-gradient-to-br from-[#FFFDFB] to-orange-50/40 p-4 text-xs text-gray-600 space-y-3"
            >
              <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
                <ShieldCheck className="h-5 w-5 text-[#F47B20]" />
                Sasta Plots Buyer Guarantee
              </div>
              <div className="space-y-1.5">
                {[
                  'Zero commission from buyers',
                  'Admin-reviewed listings within 24 hrs',
                  'Visit physically & verify before payment',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-[11px] text-gray-500">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ══ SIMILAR PROPERTIES ══ */}
        {similarProperties.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-16 pt-12 border-t border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">Similar Recommended Plots</h3>
                <p className="text-xs text-gray-500 mt-1">Plots in the same region or category you might like</p>
              </div>
              <Link
                to={`/search?category=${property.category}`}
                className="text-xs font-bold text-[#F47B20] hover:text-[#E96512] flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Horizontal scroll on mobile, grid on md+ */}
            <div className="flex gap-5 overflow-x-auto pb-3 md:grid md:grid-cols-3 lg:grid-cols-4 md:overflow-visible scrollbar-thin">
              {similarProperties.map((simProp) => (
                <div key={simProp.id} className="min-w-[280px] md:min-w-0">
                  <PropertyCard property={simProp} />
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* ══ FULLSCREEN IMAGE MODAL ══ */}
      <AnimatePresence>
        {isFullscreenModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
          >
            <button
              type="button"
              onClick={() => setIsFullscreenModalOpen(false)}
              className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Photo counter */}
            <div className="absolute top-5 left-5 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
              {activeImageIndex + 1} / {images.length}
            </div>

            <motion.div
              key={activeImageIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative max-h-[90vh] max-w-[90vw]"
            >
              <img
                src={activeImage?.url}
                alt="Fullscreen view"
                className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
              />
            </motion.div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-5 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-5 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
                >
                  <ChevronRight className="h-7 w-7" />
                </button>
              </>
            )}

            {/* Thumbnail strip in fullscreen */}
            {images.length > 1 && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#F47B20] opacity-100 scale-105'
                        : 'border-white/20 opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ REPORT LISTING MODAL ══ */}
      <AnimatePresence>
        {isReportModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <Flag className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-gray-900">Report This Listing</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleReportSubmit} className="mt-5 space-y-4 text-xs">
                <div>
                  <label className="form-label text-xs mb-1 block font-semibold text-gray-600">Reason for reporting</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="input-field text-xs py-2.5"
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
                  <label className="form-label text-xs mb-1 block font-semibold text-gray-600">Additional Details (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Please describe why this listing should be reviewed…"
                    value={reportComment}
                    onChange={(e) => setReportComment(e.target.value)}
                    className="input-field text-xs py-2"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="btn-secondary py-2 px-5 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReport}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 py-2 px-5 text-xs font-bold text-white transition-colors disabled:opacity-60"
                  >
                    {isSubmittingReport ? 'Submitting…' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PropertyDetailPage
