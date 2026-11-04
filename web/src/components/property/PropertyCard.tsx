import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Heart, ShieldCheck, Sparkles, ArrowRight, Layers } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Property } from '@/types'
import { formatPrice, formatArea, PROPERTY_TYPE_LABELS, getCoverImage } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/api'

export interface PropertyCardProps {
  property: Property
  showFavouriteButton?: boolean
  className?: string
  priority?: boolean
  viewMode?: 'grid' | 'list'
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  showFavouriteButton = true,
  className = '',
}) => {
  const { isAuthenticated } = useAuthStore()
  const [isFavourite, setIsFavourite] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const coverUrl = getCoverImage(property)

  const locationText = [
    property.locality?.name,
    property.city?.name,
    property.state?.name,
  ]
    .filter(Boolean)
    .join(', ') || property.address || 'Location on request'

  const propertyTypeDisplay =
    PROPERTY_TYPE_LABELS[property.property_type] ||
    (property.property_type
      ? property.property_type.replace(/_/g, ' ').toUpperCase()
      : 'PLOT')

  const sellerCategoryDisplay = property.seller_category
    ? property.seller_category.charAt(0).toUpperCase() + property.seller_category.slice(1)
    : 'Owner'

  const handleFavouriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.error('Please log in to save properties to your favourites')
      return
    }

    try {
      setIsSaving(true)
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
      // Keep optimistic UI state for seamless experience
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-200 hover:shadow-card-hover ${className}`}
    >
      <Link
        to={`/properties/${property.slug}`}
        className="block flex-1 flex flex-col text-inherit no-underline"
      >
        {/* ================= Image Container (4:3 Aspect Ratio) ================= */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-[#FFF3E6] via-[#FFF8F2] to-[#FFE8D6]">
          {coverUrl && !imgError ? (
            <img
              src={coverUrl}
              alt={property.title}
              onError={() => setImgError(true)}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            // Graceful Plot Placeholder with warm orange gradient & topography motif
            <div className="relative flex h-full w-full flex-col items-center justify-center p-6 text-center">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#F47B20_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-[#F47B20] shadow-sm mb-2">
                <Layers className="h-7 w-7" />
              </div>
              <span className="relative z-10 text-xs font-bold tracking-wider text-[#F47B20] uppercase">
                {propertyTypeDisplay}
              </span>
              <span className="relative z-10 text-[11px] text-gray-500 mt-0.5">
                Verified Sasta Plot
              </span>
            </div>
          )}

          {/* Top Overlays: Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
            {property.is_featured && (
              <span className="badge-featured flex items-center gap-1 shadow-sm">
                <Sparkles className="h-3 w-3" />
                Featured
              </span>
            )}
            {property.is_verified && (
              <span className="badge-verified flex items-center gap-1 shadow-sm">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>

          {/* Property Type Floating Tag (Bottom Left of Image) */}
          <div className="absolute bottom-3 left-3 z-10">
            <span className="rounded-lg bg-black/60 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white backdrop-blur-md">
              {propertyTypeDisplay}
            </span>
          </div>

          {/* Favourite / Save Heart Button (Top Right of Image) */}
          {showFavouriteButton && (
            <button
              type="button"
              onClick={handleFavouriteToggle}
              disabled={isSaving}
              aria-label={isFavourite ? 'Remove from saved' : 'Save property'}
              className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 backdrop-blur-md shadow-md transition-all duration-200 hover:scale-110 hover:bg-white hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
            >
              <Heart
                className={`h-4.5 w-4.5 transition-colors ${
                  isFavourite ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`}
              />
            </button>
          )}
        </div>

        {/* ================= Card Content ================= */}
        <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
          <div>
            {/* Price & Area Header */}
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                  {formatPrice(property.price)}
                </span>
                {property.listing_intent === 'rent' && (
                  <span className="text-xs font-medium text-gray-500">/mo</span>
                )}
              </div>

              <div className="text-right">
                <span className="inline-block rounded-md bg-orange-50 px-2.5 py-1 text-xs font-semibold text-[#E96512]">
                  {formatArea(property.area, property.area_unit)}
                </span>
              </div>
            </div>

            {/* Title (2 lines clamp) */}
            <h3
              className="mt-2.5 text-base font-semibold leading-snug text-gray-900 transition-colors line-clamp-2 group-hover:text-[#F47B20]"
              title={property.title}
            >
              {property.title}
            </h3>

            {/* Location with Pin Icon */}
            <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-600">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#F47B20]" />
              <span className="truncate">{locationText}</span>
            </div>
          </div>

          {/* ================= Bottom Strip: Seller Category & Action ================= */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span>By {sellerCategoryDisplay}</span>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#F47B20] transition-colors group-hover:text-[#E96512]">
              View Details
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default PropertyCard
