import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart,
  Building2,
  MapPin,
  Trash2,
  ExternalLink,
  ArrowRight,
  Phone,
  MessageSquare,
  ShieldCheck,
  Check,
  RefreshCw
} from 'lucide-react'
import { UserDashboardLayout } from '@/components/user/UserDashboardLayout'
import { useAuthStore } from '@/store/auth'
import { formatPrice, formatArea, formatWhatsAppUrl } from '@/lib/utils'
import type { Property } from '@/types'
import { supabase } from '@/lib/supabase'
import api from '@/lib/api'

export const MyFavouritesPage: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const [favourites, setFavourites] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const fetchFavourites = async () => {
    try {
      setLoading(true)

      // Try API first
      try {
        const res = await api.get('/user/favourites')
        if (res.data?.data) {
          setFavourites(res.data.data)
          setLoading(false)
          return
        }
      } catch {
        // Fall back to Supabase
      }

      if (user?.id) {
        const { data, error } = await supabase
          .from('favourites')
          .select('property:properties(*, images(*))')
          .eq('user_id', user.id)

        if (!error && data) {
          const props = data
            .map((item: any) => item.property)
            .filter(Boolean) as Property[]
          setFavourites(props)
        }
      }
    } catch (err) {
      console.error('Failed to fetch favourites:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFavourites()
  }, [user?.id])

  const handleRemoveFavourite = async (propertyId: string) => {
    try {
      setRemovingId(propertyId)

      // Try API
      try {
        await api.delete(`/user/favourites/${propertyId}`)
      } catch {
        if (user?.id) {
          await supabase
            .from('favourites')
            .delete()
            .eq('user_id', user.id)
            .eq('property_id', propertyId)
        }
      }

      setFavourites((prev) => prev.filter((p) => p.id !== propertyId))
    } catch (err) {
      console.error('Failed to remove favourite:', err)
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <UserDashboardLayout
      title="My Saved Properties"
      subtitle="Keep track of plots and lands you are interested in buying or visiting."
      action={
        <Link to="/search" className="btn-secondary py-2 px-3 sm:px-4 text-xs font-semibold flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-[#F47B20]" />
          <span>Browse More Plots</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 skeleton rounded-2xl" />
            ))}
          </div>
        ) : favourites.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EAEAEA] p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#202124] font-['Poppins']">
              No saved properties yet
            </h3>
            <p className="text-xs sm:text-sm text-[#727272] mt-1 mb-6">
              When browsing plots, click the heart icon on any card to save it to your personal watchlist for easy comparison.
            </p>
            <Link
              to="/search"
              className="btn-primary py-2.5 px-6 text-xs sm:text-sm inline-flex items-center gap-2"
            >
              <span>Explore Available Plots</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favourites.map((property) => {
              const coverImg =
                property.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80'

              return (
                <div
                  key={property.id}
                  className="bg-white rounded-2xl border border-[#EAEAEA] shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
                >
                  {/* Image container */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                    <img
                      src={coverImg}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {property.is_featured && (
                        <span className="badge-featured text-[10px]">
                          Featured
                        </span>
                      )}
                      {property.is_verified && (
                        <span className="badge-verified text-[10px] flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Remove from Favourites Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveFavourite(property.id)}
                      disabled={removingId === property.id}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-red-50 text-rose-500 flex items-center justify-center transition-colors shadow-xs"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Bottom overlay with Intent */}
                    <div className="absolute bottom-2 left-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white px-2 py-0.5 rounded">
                        For {property.listing_intent}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Price & Area */}
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-lg font-bold font-['Poppins'] text-[#F47B20]">
                          {formatPrice(property.price)}
                        </span>
                        <span className="text-xs font-semibold text-[#202124] bg-orange-50 px-2 py-0.5 rounded-md">
                          {formatArea(property.area, property.area_unit)}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="font-bold text-sm text-[#202124] group-hover:text-[#F47B20] transition-colors line-clamp-1">
                        <Link to={`/property/${property.slug || property.id}`}>
                          {property.title}
                        </Link>
                      </h4>

                      {/* Location */}
                      <p className="text-xs text-[#727272] flex items-center gap-1 mt-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">
                          {property.address || 'Address on request'}
                        </span>
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-[#EAEAEA] flex items-center gap-2">
                      <Link
                        to={`/property/${property.slug || property.id}`}
                        className="btn-secondary py-2 flex-1 text-xs text-center flex items-center justify-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                        <span>View Details</span>
                      </Link>

                      {property.seller_phone && (
                        <a
                          href={formatWhatsAppUrl(
                            property.seller_phone,
                            `Hi, I saw your plot "${property.title}" on Sasta Plots and would like more details.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary py-2 px-3 text-xs flex items-center justify-center gap-1 bg-[#168653] hover:bg-[#126c42]"
                          title="Contact on WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </UserDashboardLayout>
  )
}

export default MyFavouritesPage
