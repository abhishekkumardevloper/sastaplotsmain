import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Search,
  Filter,
  SlidersHorizontal,
  Grid,
  List,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  RefreshCw,
  Home,
  Tag,
  Sparkles,
} from 'lucide-react'
import PropertyCard from './PropertyCard'
import type { Property, PropertyCategory, ListingIntent } from '@/types'
import api from '@/lib/api'

// Fallback sample properties so UI is immediately rich and interactive even without seeded DB
const SAMPLE_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    slug: 'prime-residential-plot-sector-62-noida',
    title: 'Corner Villa Plot in Gated Community',
    description: 'Ready to build residential plot with boundary wall, 40ft wide sector road, DTCP approved, 24x7 security.',
    listing_intent: 'sell',
    category: 'residential_plot',
    property_type: 'plot',
    price: 4500000,
    price_negotiable: true,
    area: 1800,
    area_unit: 'sqft',
    state: { id: 26, name: 'Uttar Pradesh', code: 'UP', is_active: true },
    city: { id: 725, state_id: 26, name: 'Noida', is_popular: true, is_active: true },
    locality: { id: 1, city_id: 725, name: 'Sector 62' },
    address: 'Plot #14, Green Enclave, Sector 62',
    is_corner_plot: true,
    is_on_main_road: true,
    road_width: 40,
    facing_direction: 'northeast',
    status: 'approved',
    is_featured: true,
    is_verified: true,
    is_admin_managed: false,
    view_count: 142,
    enquiry_count: 8,
    favourite_count: 12,
    images: [
      {
        id: 'img-1',
        property_id: 'prop-1',
        url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
        storage_path: 'prop-1/1.jpg',
        is_cover: true,
        sort_order: 1,
        created_at: new Date().toISOString(),
      },
    ],
    seller_name: 'Rajesh Sharma',
    seller_phone: '+919876543210',
    seller_category: 'owner',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prop-2',
    slug: 'commercial-scf-retail-plot-lucknow',
    title: 'High Street Commercial Showroom Plot',
    description: 'Main road facing commercial land ideal for hospital, showroom or corporate office. RERA approved project.',
    listing_intent: 'sell',
    category: 'commercial',
    property_type: 'showroom',
    price: 18500000,
    price_negotiable: false,
    area: 3200,
    area_unit: 'sqft',
    state: { id: 26, name: 'Uttar Pradesh', code: 'UP', is_active: true },
    city: { id: 724, state_id: 26, name: 'Lucknow', is_popular: true, is_active: true },
    locality: { id: 2, city_id: 724, name: 'Gomti Nagar Extension' },
    address: 'Near Shaheed Path, Gomti Nagar Extension',
    is_corner_plot: false,
    is_on_main_road: true,
    road_width: 60,
    facing_direction: 'east',
    status: 'approved',
    is_featured: true,
    is_verified: true,
    is_admin_managed: false,
    view_count: 320,
    enquiry_count: 19,
    favourite_count: 35,
    images: [
      {
        id: 'img-2',
        property_id: 'prop-2',
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
        storage_path: 'prop-2/1.jpg',
        is_cover: true,
        sort_order: 1,
        created_at: new Date().toISOString(),
      },
    ],
    seller_name: 'Anil Gupta',
    seller_phone: '+919812345678',
    seller_category: 'builder',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prop-3',
    slug: 'fertile-agricultural-farmland-pune',
    title: '5 Acre Fertile Farmland with River Frontage',
    description: 'Black soil agricultural land with perennial water source, drip irrigation, electricity connection, clear 7/12 title deeds.',
    listing_intent: 'sell',
    category: 'agricultural_land',
    property_type: 'farm_land',
    price: 7500000,
    price_negotiable: true,
    area: 5,
    area_unit: 'acre',
    state: { id: 14, name: 'Maharashtra', code: 'MH', is_active: true },
    city: { id: 710, state_id: 14, name: 'Pune', is_popular: true, is_active: true },
    locality: { id: 3, city_id: 710, name: 'Khed Shivapur' },
    address: 'Survey No. 45, Khed Shivapur',
    is_corner_plot: false,
    is_on_main_road: false,
    road_width: 25,
    facing_direction: 'north',
    status: 'approved',
    is_featured: false,
    is_verified: true,
    is_admin_managed: false,
    view_count: 412,
    enquiry_count: 24,
    favourite_count: 48,
    images: [
      {
        id: 'img-3',
        property_id: 'prop-3',
        url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
        storage_path: 'prop-3/1.jpg',
        is_cover: true,
        sort_order: 1,
        created_at: new Date().toISOString(),
      },
    ],
    seller_name: 'Suresh Patil',
    seller_phone: '+919922334455',
    seller_category: 'owner',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prop-4',
    slug: 'commercial-warehouse-space-bengaluru-rent',
    title: 'Prime Logistics & Warehouse Plot on Lease',
    description: 'Heavy vehicle accessible industrial plot for lease with high power connection, borewell water, 24/7 security.',
    listing_intent: 'rent',
    category: 'commercial',
    property_type: 'warehouse',
    price: 65000,
    price_negotiable: true,
    area: 12000,
    area_unit: 'sqft',
    state: { id: 11, name: 'Karnataka', code: 'KA', is_active: true },
    city: { id: 713, state_id: 11, name: 'Bengaluru', is_popular: true, is_active: true },
    locality: { id: 4, city_id: 713, name: 'Peenya Industrial Area' },
    address: 'Peenya 2nd Stage, Outer Ring Road Link',
    is_corner_plot: true,
    is_on_main_road: true,
    road_width: 80,
    facing_direction: 'south',
    status: 'approved',
    is_featured: true,
    is_verified: true,
    is_admin_managed: false,
    view_count: 180,
    enquiry_count: 12,
    favourite_count: 16,
    images: [
      {
        id: 'img-4',
        property_id: 'prop-4',
        url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
        storage_path: 'prop-4/1.jpg',
        is_cover: true,
        sort_order: 1,
        created_at: new Date().toISOString(),
      },
    ],
    seller_name: 'Venkatesh Rao',
    seller_phone: '+919845012345',
    seller_category: 'agent',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prop-5',
    slug: 'luxury-gated-community-plot-jaipur',
    title: 'JDA Approved Villa Plot in Vaishali Nagar',
    description: 'Clear title residential plot inside premium township with clubhouse, swimming pool, underground wiring, water harvesting.',
    listing_intent: 'sell',
    category: 'residential_plot',
    property_type: 'plot',
    price: 3600000,
    price_negotiable: true,
    area: 2160,
    area_unit: 'sqft',
    state: { id: 21, name: 'Rajasthan', code: 'RJ', is_active: true },
    city: { id: 718, state_id: 21, name: 'Jaipur', is_popular: true, is_active: true },
    locality: { id: 5, city_id: 718, name: 'Vaishali Nagar' },
    address: 'Block C, Royal Residency',
    is_corner_plot: false,
    is_on_main_road: false,
    road_width: 30,
    facing_direction: 'east',
    status: 'approved',
    is_featured: false,
    is_verified: true,
    is_admin_managed: false,
    view_count: 245,
    enquiry_count: 14,
    favourite_count: 22,
    images: [
      {
        id: 'img-5',
        property_id: 'prop-5',
        url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
        storage_path: 'prop-5/1.jpg',
        is_cover: true,
        sort_order: 1,
        created_at: new Date().toISOString(),
      },
    ],
    seller_name: 'Mahesh Meena',
    seller_phone: '+919414012345',
    seller_category: 'owner',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prop-6',
    slug: 'agricultural-orchard-land-dehradun',
    title: 'Mango & Litchi Orchard Farmland',
    description: 'Scenic farm plot with panoramic Doon valley views, natural spring water, fenced boundary, ideal for weekend retreat or organic farming.',
    listing_intent: 'sell',
    category: 'agricultural_land',
    property_type: 'orchard',
    price: 5200000,
    price_negotiable: true,
    area: 3,
    area_unit: 'bigha',
    state: { id: 27, name: 'Uttarakhand', code: 'UK', is_active: true },
    city: { id: 750, state_id: 27, name: 'Dehradun', is_popular: true, is_active: true },
    locality: { id: 6, city_id: 750, name: 'Vikasnagar' },
    address: 'Shimla Bypass Road, Vikasnagar',
    is_corner_plot: true,
    is_on_main_road: true,
    road_width: 30,
    facing_direction: 'southwest',
    status: 'approved',
    is_featured: true,
    is_verified: true,
    is_admin_managed: false,
    view_count: 310,
    enquiry_count: 17,
    favourite_count: 29,
    images: [
      {
        id: 'img-6',
        property_id: 'prop-6',
        url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80',
        storage_path: 'prop-6/1.jpg',
        is_cover: true,
        sort_order: 1,
        created_at: new Date().toISOString(),
      },
    ],
    seller_name: 'Devendra Rawat',
    seller_phone: '+919719012345',
    seller_category: 'owner',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export interface PropertyBrowseViewProps {
  pageTitle: string
  pageSubtitle: string
  badgeText?: string
  defaultIntent?: ListingIntent
  defaultCategory?: PropertyCategory
  bannerBgImage?: string
  hideIntentFilter?: boolean
  hideCategoryFilter?: boolean
}

export const PropertyBrowseView: React.FC<PropertyBrowseViewProps> = ({
  pageTitle,
  pageSubtitle,
  badgeText,
  defaultIntent,
  defaultCategory,
  bannerBgImage = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80',
  hideIntentFilter = false,
  hideCategoryFilter = false,
}) => {
  const [searchParams, setSearchParams] = useSearchParams()

  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Filter states initialized from URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '')
  const [selectedCategory, setSelectedCategory] = useState<string>(
    defaultCategory || searchParams.get('category') || ''
  )
  const [selectedIntent, setSelectedIntent] = useState<string>(
    defaultIntent || searchParams.get('intent') || ''
  )
  const [priceMax, setPriceMax] = useState<string>(searchParams.get('max_price') || '')
  const [onlyVerified, setOnlyVerified] = useState<boolean>(
    searchParams.get('is_verified') === 'true'
  )
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sort') || 'newest')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Fetch properties
  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    const fetchProperties = async () => {
      try {
        const params: Record<string, string | number | boolean> = {}
        if (defaultIntent || selectedIntent) params.intent = defaultIntent || selectedIntent
        if (defaultCategory || selectedCategory) params.category = defaultCategory || selectedCategory
        if (selectedCity) params.city = selectedCity
        if (searchTerm) params.q = searchTerm
        if (priceMax) params.max_price = Number(priceMax)
        if (onlyVerified) params.is_verified = true
        if (sortBy) params.sort = sortBy

        const response = await api.get('/properties', { params })
        if (!isMounted) return

        const data = response.data?.data || response.data || []
        if (Array.isArray(data) && data.length > 0) {
          setProperties(data)
        } else {
          // If server returns empty list or isn't seeded, filter the sample data
          const filtered = SAMPLE_PROPERTIES.filter((p) => {
            if (defaultIntent && p.listing_intent !== defaultIntent) return false
            if (selectedIntent && p.listing_intent !== selectedIntent) return false
            if (defaultCategory && p.category !== defaultCategory) return false
            if (selectedCategory && p.category !== selectedCategory) return false
            if (selectedCity && !p.city?.name.toLowerCase().includes(selectedCity.toLowerCase())) return false
            if (onlyVerified && !p.is_verified) return false
            if (priceMax && p.price > Number(priceMax)) return false
            if (
              searchTerm &&
              !p.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
              !p.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
              !p.city?.name.toLowerCase().includes(searchTerm.toLowerCase())
            ) {
              return false
            }
            return true
          })
          setProperties(filtered)
        }
      } catch {
        if (!isMounted) return
        // On API error, fallback gracefully to matching sample properties
        const filtered = SAMPLE_PROPERTIES.filter((p) => {
          if (defaultIntent && p.listing_intent !== defaultIntent) return false
          if (selectedIntent && p.listing_intent !== selectedIntent) return false
          if (defaultCategory && p.category !== defaultCategory) return false
          if (selectedCategory && p.category !== selectedCategory) return false
          if (selectedCity && !p.city?.name.toLowerCase().includes(selectedCity.toLowerCase())) return false
          if (onlyVerified && !p.is_verified) return false
          if (priceMax && p.price > Number(priceMax)) return false
          if (
            searchTerm &&
            !p.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !p.description.toLowerCase().includes(searchTerm.toLowerCase())
          ) {
            return false
          }
          return true
        })
        setProperties(filtered)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchProperties()

    return () => {
      isMounted = false
    }
  }, [
    defaultIntent,
    defaultCategory,
    selectedIntent,
    selectedCategory,
    selectedCity,
    searchTerm,
    priceMax,
    onlyVerified,
    sortBy,
  ])

  // Sync state to URL params
  const updateUrlParams = (updates: Record<string, string | undefined>) => {
    const nextParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, val]) => {
      if (val) {
        nextParams.set(key, val)
      } else {
        nextParams.delete(key)
      }
    })
    setSearchParams(nextParams, { replace: true })
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedCity('')
    if (!defaultCategory) setSelectedCategory('')
    if (!defaultIntent) setSelectedIntent('')
    setPriceMax('')
    setOnlyVerified(false)
    setSortBy('newest')
    setCurrentPage(1)
    setSearchParams({})
  }

  // Sorted list
  const sortedProperties = useMemo(() => {
    const list = [...properties]
    if (sortBy === 'price_asc') {
      return list.sort((a, b) => a.price - b.price)
    }
    if (sortBy === 'price_desc') {
      return list.sort((a, b) => b.price - a.price)
    }
    // Default newest
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [properties, sortBy])

  // Paginated items
  const totalPages = Math.ceil(sortedProperties.length / itemsPerPage) || 1
  const paginatedProperties = sortedProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="min-h-screen bg-[#FFFDFB]">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 text-white py-14 md:py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay"
          style={{ backgroundImage: `url(${bannerBgImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />

        <div className="container-custom relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <Home className="w-3.5 h-3.5" /> Home
            </Link>
            <span>/</span>
            <span className="text-orange-400 font-medium">{pageTitle}</span>
          </nav>

          <div className="max-w-3xl">
            {badgeText && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F47B20]/20 text-orange-400 border border-orange-500/30 mb-3 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5" />
                {badgeText}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight">
              {pageTitle}
            </h1>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed">
              {pageSubtitle}
            </p>
          </div>

          {/* Quick Search Bar inside Hero */}
          <div className="mt-8 max-w-3xl bg-white p-2 sm:p-2.5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center gap-2 border border-gray-100">
            <div className="flex items-center gap-2 px-3 flex-1 w-full text-gray-700">
              <Search className="w-5 h-5 text-[#F47B20] shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  updateUrlParams({ q: e.target.value })
                }}
                placeholder="Search by location, plot size, landmarks..."
                className="w-full text-sm py-2 text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    updateUrlParams({ q: undefined })
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-44">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value)
                    updateUrlParams({ city: e.target.value })
                  }}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-7 py-2.5 text-gray-700 focus:outline-none focus:border-[#F47B20]"
                >
                  <option value="">All Cities</option>
                  <option value="Delhi">Delhi / NCR</option>
                  <option value="Noida">Noida</option>
                  <option value="Lucknow">Lucknow</option>
                  <option value="Jaipur">Jaipur</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Pune">Pune</option>
                  <option value="Hyderabad">Hyderabad</option>
                </select>
              </div>

              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="md:hidden p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                aria-label="Filter"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#F47B20]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container-custom py-8 md:py-12">
        {/* Filter & Sorting Controls Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAEAEA]">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[#202124]">
              {isLoading ? (
                'Loading properties...'
              ) : (
                <>
                  Showing <span className="text-[#F47B20]">{sortedProperties.length}</span> verified properties
                </>
              )}
            </p>
            {(selectedCity || priceMax || onlyVerified || searchTerm) && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs text-[#F47B20] hover:underline font-medium ml-2"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-[#727272]">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value)
                  updateUrlParams({ sort: e.target.value })
                }}
                className="bg-white border border-[#EAEAEA] rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#202124] focus:outline-none focus:border-[#F47B20]"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#F47B20] shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-[#F47B20] shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar Filter + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="bg-white border border-[#EAEAEA] rounded-2xl p-5 sticky top-24 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA]">
                <h3 className="font-bold text-sm text-[#202124] flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#F47B20]" />
                  Refine Search
                </h3>
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-[#727272] hover:text-[#F47B20] transition-colors"
                >
                  Clear all
                </button>
              </div>

              {/* Listing Intent Filter if not preset */}
              {!hideIntentFilter && (
                <div>
                  <label className="text-xs font-semibold text-[#202124] mb-2 block">
                    Listing Intent
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['sell', 'rent'].map((intentVal) => (
                      <button
                        key={intentVal}
                        onClick={() => {
                          const nextVal = selectedIntent === intentVal ? '' : intentVal
                          setSelectedIntent(nextVal)
                          updateUrlParams({ intent: nextVal })
                        }}
                        className={`text-xs py-2 px-3 rounded-xl font-medium border text-center transition-all ${
                          selectedIntent === intentVal
                            ? 'bg-[#FFF8F2] border-[#F47B20] text-[#F47B20]'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {intentVal === 'sell' ? 'Buy / Sale' : 'Lease / Rent'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Filter if not preset */}
              {!hideCategoryFilter && (
                <div>
                  <label className="text-xs font-semibold text-[#202124] mb-2 block">
                    Category
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { id: 'residential_plot', label: 'Residential Plots' },
                      { id: 'agricultural_land', label: 'Agricultural Land' },
                      { id: 'commercial', label: 'Commercial' },
                    ].map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer hover:text-[#F47B20]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategory === cat.id}
                          onChange={() => {
                            const next = selectedCategory === cat.id ? '' : cat.id
                            setSelectedCategory(next)
                            updateUrlParams({ category: next })
                          }}
                          className="rounded text-[#F47B20] focus:ring-[#F47B20]"
                        />
                        <span>{cat.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Maximum Price Filter */}
              <div>
                <label className="text-xs font-semibold text-[#202124] mb-2 block">
                  Budget (Max Price)
                </label>
                <select
                  value={priceMax}
                  onChange={(e) => {
                    setPriceMax(e.target.value)
                    updateUrlParams({ max_price: e.target.value })
                  }}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:border-[#F47B20]"
                >
                  <option value="">Any Budget</option>
                  <option value="1000000">Under ₹10 Lakh</option>
                  <option value="2500000">Under ₹25 Lakh</option>
                  <option value="5000000">Under ₹50 Lakh</option>
                  <option value="10000000">Under ₹1 Crore</option>
                  <option value="50000000">Under ₹5 Crore</option>
                </select>
              </div>

              {/* Verified Filter Toggle */}
              <div className="pt-2 border-t border-[#EAEAEA]">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-[#202124] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#168653]" />
                    Verified Only
                  </span>
                  <input
                    type="checkbox"
                    checked={onlyVerified}
                    onChange={(e) => {
                      setOnlyVerified(e.target.checked)
                      updateUrlParams({ is_verified: e.target.checked ? 'true' : undefined })
                    }}
                    className="w-4 h-4 rounded text-[#F47B20] focus:ring-[#F47B20]"
                  />
                </label>
              </div>

              {/* Quick links to explore other property types */}
              <div className="pt-3 border-t border-[#EAEAEA] text-xs space-y-1.5 text-gray-600">
                <p className="font-semibold text-gray-800">Quick Links</p>
                <Link to="/buy" className="block hover:text-[#F47B20]">Plots for Sale</Link>
                <Link to="/rent" className="block hover:text-[#F47B20]">Properties for Rent</Link>
                <Link to="/plots" className="block hover:text-[#F47B20]">Residential Plots</Link>
                <Link to="/agricultural-land" className="block hover:text-[#F47B20]">Agricultural Land</Link>
                <Link to="/commercial" className="block hover:text-[#F47B20]">Commercial Properties</Link>
              </div>
            </div>
          </aside>

          {/* Property Cards Grid */}
          <main className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="card p-4 space-y-3">
                    <div className="skeleton aspect-[4/3] w-full rounded-xl" />
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-3 w-1/2" />
                    <div className="skeleton h-8 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            ) : paginatedProperties.length > 0 ? (
              <>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }
                >
                  {paginatedProperties.map((prop) => (
                    <PropertyCard
                      key={prop.id}
                      property={prop}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        onClick={() => setCurrentPage(pg)}
                        className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all ${
                          currentPage === pg
                            ? 'bg-[#F47B20] text-white shadow-sm'
                            : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pg}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Next Page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white border border-[#EAEAEA] rounded-3xl p-12 text-center max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-orange-100 text-[#F47B20] flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-[#202124] mb-1">
                  No properties matched your criteria
                </h3>
                <p className="text-sm text-[#727272] mb-6">
                  Try broadening your price range, clearing search terms, or checking other cities.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="btn-primary btn-sm mx-auto"
                >
                  <RefreshCw className="w-4 h-4" /> Reset All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default PropertyBrowseView
