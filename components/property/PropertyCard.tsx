'use client'

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Heart,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Layers,
  Compass,
  CheckCircle2,
  PhoneCall,
  UserCheck,
} from 'lucide-react'
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
  viewMode = 'grid',
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
    .join(', ') || property.address || 'Prime Location'

  const propertyTypeDisplay =
    PROPERTY_TYPE_LABELS[property.property_type] ||
    (property.property_type
      ? property.property_type.replace(/_/g, ' ').toUpperCase()
      : 'PLOT')

  // Seller category styling & text
  const sellerCategory = (property.seller_category || 'owner').toLowerCase()
  const isBroker = sellerCategory === 'broker'
  const isBuilder = sellerCategory === 'builder'

  // Price per sqft calculation
  const calculatedPricePerSqft = property.price_per_unit || (
    property.price && property.area ? Math.round(property.price / property.area) : null
  )

  const handleFavouriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.error('Please log in to save properties')
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
      // optimistic state preserved
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-500/10 ${className}`}
    >
      <Link
        to={`/properties/${property.slug}`}
        className="block flex-1 flex flex-col text-inherit no-underline"
      >
        {/* ───────────── Card Image Header ───────────── */}
        <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-slate-100">
          {coverUrl && !imgError ? (
            <img
              src={coverUrl}
              alt={property.title}
              onError={() => setImgError(true)}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
            />
          ) : (
            <div className="relative flex h-full w-full flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-orange-50 via-amber-50/50 to-orange-100/40">
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#F47B20] shadow-md mb-2">
                <Layers className="h-7 w-7" />
              </div>
              <span className="relative z-10 text-xs font-bold tracking-wider text-[#F47B20] uppercase">
                {propertyTypeDisplay}
              </span>
              <span className="relative z-10 text-[11px] text-slate-500 mt-0.5">
                Admin Verified Plot
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
            {property.status === 'pending_review' && (
              <span className="badge-pending flex items-center gap-1 shadow-sm">
                Pending Approval
              </span>
            )}
          </div>

          {/* Seller Tag (Top Right or Bottom Left) */}
          <div className="absolute bottom-3 left-3 z-10">
            <span
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold tracking-wide backdrop-blur-md shadow-xs ${
                isBroker
                  ? 'bg-blue-600/90 text-white'
                  : isBuilder
                  ? 'bg-purple-600/90 text-white'
                  : 'bg-emerald-600/90 text-white'
              }`}
            >
              <UserCheck className="h-3 w-3" />
              {isBroker ? 'Broker Listing' : isBuilder ? 'Builder Listing' : 'Direct Owner'}
            </span>
          </div>

          {/* Property Type Tag (Bottom Right) */}
          <div className="absolute bottom-3 right-3 z-10">
            <span className="rounded-lg bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
              {propertyTypeDisplay}
            </span>
          </div>

          {/* Save / Favourite Button */}
          {showFavouriteButton && (
            <button
              type="button"
              onClick={handleFavouriteToggle}
              disabled={isSaving}
              aria-label={isFavourite ? 'Remove from saved' : 'Save property'}
              className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-white hover:text-red-500 cursor-pointer"
            >
              <Heart
                className={`h-4.5 w-4.5 transition-colors ${
                  isFavourite ? 'fill-red-500 text-red-500' : 'text-slate-600'
                }`}
              />
            </button>
          )}
        </div>

        {/* ───────────── Card Body Content ───────────── */}
        <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
          <div>
            {/* Price & Area Header */}
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                  {formatPrice(property.price)}
                </span>
                {property.listing_intent === 'rent' && (
                  <span className="text-xs font-semibold text-slate-500 ml-1">/month</span>
                )}
                {calculatedPricePerSqft && (
                  <p className="text-[11px] font-medium text-slate-500">
                    ₹{calculatedPricePerSqft.toLocaleString('en-IN')}/{property.area_unit || 'sq.ft'}
                  </p>
                )}
              </div>

              <div className="text-right">
                <span className="inline-block rounded-xl bg-orange-50 px-2.5 py-1 text-xs font-bold text-[#E96512] border border-orange-200/50">
                  {formatArea(property.area, property.area_unit)}
                </span>
              </div>
            </div>

            {/* Title (2 lines clamp) */}
            <h3
              className="mt-3 text-base font-bold leading-snug text-slate-900 transition-colors line-clamp-2 group-hover:text-[#F47B20]"
              title={property.title}
            >
              {property.title}
            </h3>

            {/* Location with Pin */}
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#F47B20]" />
              <span className="truncate">{locationText}</span>
            </div>

            {/* Key Highlights Tag Row */}
            <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-slate-600">
              {property.facing_direction && (
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-medium">
                  <Compass className="h-3 w-3 text-slate-400" />
                  {property.facing_direction.toUpperCase()} Facing
                </span>
              )}
              {property.is_corner_plot && (
                <span className="inline-block rounded-md bg-emerald-50 text-emerald-700 px-2 py-0.5 font-semibold">
                  Corner Plot
                </span>
              )}
              {property.road_width && (
                <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 font-medium">
                  {property.road_width}ft Road
                </span>
              )}
            </div>
          </div>

          {/* ───────────── Bottom Action Strip ───────────── */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{property.seller_name || (isBroker ? 'Certified Broker' : 'Direct Landowner')}</span>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#F47B20] transition-colors group-hover:text-[#E96512]">
              View Plot
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default PropertyCard
