'use client'
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
const SAMPLE_PROPERTIES: Property[] = []

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
        setProperties(Array.isArray(data) ? data : [])
      } catch { if (!isMounted) return; setProperties([]) } finally {
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
