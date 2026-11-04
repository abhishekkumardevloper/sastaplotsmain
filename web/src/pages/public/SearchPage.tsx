import React, { useState, useEffect, useMemo, useTransition } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  LayoutGrid,
  List,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  MapPin,
  HelpCircle,
} from 'lucide-react'
import api from '@/lib/api'
import type { Property, AreaUnit, PropertyCategory, PropertyType } from '@/types'
import { PropertyCard } from '@/components/property/PropertyCard'
import { PropertyCardSkeleton } from '@/components/property/PropertyCardSkeleton'
import {
  MOCK_PROPERTIES,
  MOCK_STATES,
  MOCK_CITIES,
} from '@/lib/mockData'
import {
  PROPERTY_CATEGORY_LABELS,
  PROPERTY_TYPE_LABELS,
  AREA_UNIT_OPTIONS,
  formatPrice,
} from '@/lib/utils'

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [, startTransition] = useTransition()

  // Local state for debounced text/number inputs
  const [keyword, setKeyword] = useState(searchParams.get('q') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '')
  const [minArea, setMinArea] = useState(searchParams.get('min_area') || '')
  const [maxArea, setMaxArea] = useState(searchParams.get('max_area') || '')

  // View mode: Grid or List
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  // Mobile filter drawer state
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  // Keep local debounced fields in sync if URL changes externally
  useEffect(() => {
    setKeyword(searchParams.get('q') || '')
    setMinPrice(searchParams.get('min_price') || '')
    setMaxPrice(searchParams.get('max_price') || '')
    setMinArea(searchParams.get('min_area') || '')
    setMaxArea(searchParams.get('max_area') || '')
  }, [searchParams])

  // Debounced URL sync helper (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          const setOrDelete = (key: string, val: string) => {
            if (val.trim()) next.set(key, val.trim())
            else next.delete(key)
          }

          setOrDelete('q', keyword)
          setOrDelete('min_price', minPrice)
          setOrDelete('max_price', maxPrice)
          setOrDelete('min_area', minArea)
          setOrDelete('max_area', maxArea)

          // Reset page when search term changes
          if (next.get('page') && next.get('page') !== '1') {
            next.set('page', '1')
          }
          return next
        },
        { replace: true }
      )
    }, 300)

    return () => clearTimeout(handler)
  }, [keyword, minPrice, maxPrice, minArea, maxArea, setSearchParams])

  // Read current URL filter values
  const currentIntent = searchParams.get('intent') || ''
  const currentCategory = (searchParams.get('category') as PropertyCategory) || ''
  const currentType = (searchParams.get('property_type') as PropertyType) || ''
  const currentStateId = searchParams.get('state_id') || ''
  const currentCityId = searchParams.get('city_id') || ''
  const currentAreaUnit = (searchParams.get('area_unit') as AreaUnit) || 'sqft'
  const isVerifiedOnly = searchParams.get('is_verified') === 'true'
  const isFeaturedOnly = searchParams.get('is_featured') === 'true'
  const currentSort = searchParams.get('sort') || 'newest'
  const currentPage = Number(searchParams.get('page')) || 1

  // Filter available cities by chosen state
  const availableCities = useMemo(() => {
    if (!currentStateId) return MOCK_CITIES
    return MOCK_CITIES.filter((c) => String(c.state_id) === currentStateId)
  }, [currentStateId])

  // Direct param setter
  const updateFilter = (key: string, value: string | boolean | null) => {
    startTransition(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (value === null || value === '' || value === false) {
          next.delete(key)
        } else {
          next.set(key, String(value))
        }
        next.set('page', '1')
        return next
      })
    })
  }

  const clearAllFilters = () => {
    setKeyword('')
    setMinPrice('')
    setMaxPrice('')
    setMinArea('')
    setMaxArea('')
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  // Count active filters for badge
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (currentIntent) count++
    if (currentCategory) count++
    if (currentType) count++
    if (currentStateId) count++
    if (currentCityId) count++
    if (minPrice) count++
    if (maxPrice) count++
    if (minArea) count++
    if (maxArea) count++
    if (isVerifiedOnly) count++
    if (isFeaturedOnly) count++
    if (keyword) count++
    return count
  }, [
    currentIntent,
    currentCategory,
    currentType,
    currentStateId,
    currentCityId,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    isVerifiedOnly,
    isFeaturedOnly,
    keyword,
  ])

  // Data fetching with TanStack Query
  const { data, isLoading } = useQuery<{
    properties: Property[]
    total: number
    totalPages: number
  }>({
    queryKey: ['properties', 'search', searchParams.toString()],
    queryFn: async () => {
      try {
        const params = Object.fromEntries(searchParams.entries())
        const response = await api.get('/properties', { params })
        const resData = response.data?.data || response.data

        if (Array.isArray(resData)) {
          return {
            properties: resData,
            total: response.data?.total || resData.length,
            totalPages: response.data?.totalPages || 1,
          }
        }
        if (resData?.data && Array.isArray(resData.data)) {
          return {
            properties: resData.data,
            total: resData.total || resData.data.length,
            totalPages: resData.totalPages || 1,
          }
        }
        throw new Error('Use mock fallback')
      } catch {
        // Fallback filter mock data locally
        let filtered = [...MOCK_PROPERTIES]

        if (currentIntent) {
          filtered = filtered.filter((p) => p.listing_intent === currentIntent)
        }
        if (currentCategory) {
          filtered = filtered.filter((p) => p.category === currentCategory)
        }
        if (currentType) {
          filtered = filtered.filter((p) => p.property_type === currentType)
        }
        if (currentStateId) {
          filtered = filtered.filter((p) => String(p.state_id) === currentStateId)
        }
        if (currentCityId) {
          filtered = filtered.filter((p) => String(p.city_id) === currentCityId)
        }
        if (minPrice) {
          filtered = filtered.filter((p) => p.price >= Number(minPrice))
        }
        if (maxPrice) {
          filtered = filtered.filter((p) => p.price <= Number(maxPrice))
        }
        if (minArea) {
          filtered = filtered.filter((p) => p.area >= Number(minArea))
        }
        if (maxArea) {
          filtered = filtered.filter((p) => p.area <= Number(maxArea))
        }
        if (isVerifiedOnly) {
          filtered = filtered.filter((p) => p.is_verified)
        }
        if (isFeaturedOnly) {
          filtered = filtered.filter((p) => p.is_featured)
        }
        if (keyword) {
          const q = keyword.toLowerCase()
          filtered = filtered.filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q) ||
              p.city?.name?.toLowerCase().includes(q) ||
              p.state?.name?.toLowerCase().includes(q) ||
              p.locality?.name?.toLowerCase().includes(q)
          )
        }

        // Sorting
        if (currentSort === 'price_asc') {
          filtered.sort((a, b) => a.price - b.price)
        } else if (currentSort === 'price_desc') {
          filtered.sort((a, b) => b.price - a.price)
        } else if (currentSort === 'featured') {
          filtered.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
        } else {
          filtered.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        }

        const limit = 9
        const total = filtered.length
        const totalPages = Math.max(1, Math.ceil(total / limit))
        const start = (currentPage - 1) * limit
        const paginated = filtered.slice(start, start + limit)

        return {
          properties: paginated,
          total,
          totalPages,
        }
      }
    },
  })

  // Filter sidebar content (reusable for desktop & mobile drawer)
  const FilterContent = (
    <div className="space-y-6">
      {/* Intent Toggle */}
      <div>
        <label className="form-label text-xs uppercase tracking-wider text-gray-500">
          Listing Intent
        </label>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => updateFilter('intent', '')}
            className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${
              !currentIntent
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => updateFilter('intent', 'sell')}
            className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${
              currentIntent === 'sell'
                ? 'bg-[#F47B20] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => updateFilter('intent', 'rent')}
            className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${
              currentIntent === 'rent'
                ? 'bg-[#F47B20] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Rent
          </button>
        </div>
      </div>

      {/* Property Category */}
      <div>
        <label className="form-label text-xs uppercase tracking-wider text-gray-500">
          Category
        </label>
        <select
          value={currentCategory}
          onChange={(e) => updateFilter('category', e.target.value)}
          className="input-field text-sm"
        >
          <option value="">All Categories</option>
          {Object.entries(PROPERTY_CATEGORY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Property Type */}
      <div>
        <label className="form-label text-xs uppercase tracking-wider text-gray-500">
          Property Type
        </label>
        <select
          value={currentType}
          onChange={(e) => updateFilter('property_type', e.target.value)}
          className="input-field text-sm"
        >
          <option value="">All Types</option>
          {Object.entries(PROPERTY_TYPE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* State */}
      <div>
        <label className="form-label text-xs uppercase tracking-wider text-gray-500">
          State
        </label>
        <select
          value={currentStateId}
          onChange={(e) => {
            updateFilter('state_id', e.target.value)
            updateFilter('city_id', '')
          }}
          className="input-field text-sm"
        >
          <option value="">All States</option>
          {MOCK_STATES.map((st) => (
            <option key={st.id} value={st.id}>
              {st.name}
            </option>
          ))}
        </select>
      </div>

      {/* City */}
      <div>
        <label className="form-label text-xs uppercase tracking-wider text-gray-500">
          City
        </label>
        <select
          value={currentCityId}
          onChange={(e) => updateFilter('city_id', e.target.value)}
          className="input-field text-sm"
        >
          <option value="">All Cities</option>
          {availableCities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range (INR) */}
      <div>
        <label className="form-label text-xs uppercase tracking-wider text-gray-500">
          Price Range (₹)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="input-field text-xs py-2 px-2.5"
          />
          <input
            type="number"
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="input-field text-xs py-2 px-2.5"
          />
        </div>
        {/* Quick price presets */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[
            { label: '< 25L', max: '2500000' },
            { label: '25L - 50L', min: '2500000', max: '5000000' },
            { label: '50L - 1Cr', min: '5000000', max: '10000000' },
            { label: '1Cr+', min: '10000000' },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setMinPrice(preset.min || '')
                setMaxPrice(preset.max || '')
              }}
              className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-600 hover:border-[#F47B20] hover:text-[#F47B20]"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Area Range and Unit */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="form-label text-xs uppercase tracking-wider text-gray-500 mb-0">
            Area Range
          </label>
          <select
            value={currentAreaUnit}
            onChange={(e) => updateFilter('area_unit', e.target.value)}
            className="rounded border border-gray-200 px-1.5 py-0.5 text-[11px] text-gray-600 font-medium"
          >
            {AREA_UNIT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label.split(' ')[0]}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min area"
            value={minArea}
            onChange={(e) => setMinArea(e.target.value)}
            className="input-field text-xs py-2 px-2.5"
          />
          <input
            type="number"
            placeholder="Max area"
            value={maxArea}
            onChange={(e) => setMaxArea(e.target.value)}
            className="input-field text-xs py-2 px-2.5"
          />
        </div>
      </div>

      {/* Checkbox Toggles */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-gray-700 select-none">
          <input
            type="checkbox"
            checked={isVerifiedOnly}
            onChange={(e) => updateFilter('is_verified', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#F47B20] focus:ring-[#F47B20]"
          />
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Verified Plots Only
          </span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-gray-700 select-none">
          <input
            type="checkbox"
            checked={isFeaturedOnly}
            onChange={(e) => updateFilter('is_featured', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#F47B20] focus:ring-[#F47B20]"
          />
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-[#F47B20]" />
            Featured Plots Only
          </span>
        </label>
      </div>

      {/* Clear Filters Button */}
      {activeFiltersCount > 0 && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="btn-secondary w-full text-xs font-semibold py-2.5 text-gray-600 hover:text-red-600"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Clear All Filters ({activeFiltersCount})
        </button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FFFDFB] pb-20 pt-6">
      <div className="container-custom">
        {/* Top Search & Filter Bar */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by locality, city, project name or keywords..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 transition-colors focus:border-[#F47B20] focus:bg-white focus:outline-none"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Right Controls: Sort, View Mode, Mobile Filter Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="md:hidden flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 shadow-xs"
            >
              <Filter className="h-4 w-4 text-[#F47B20]" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F47B20] text-[10px] font-bold text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline-block text-xs font-medium text-gray-500 whitespace-nowrap">
                Sort By:
              </span>
              <select
                value={currentSort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="input-field text-xs py-2 px-3 w-auto min-w-[140px]"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="featured">Featured First</option>
              </select>
            </div>

            {/* Grid / List View Toggle */}
            <div className="hidden sm:flex items-center rounded-xl border border-gray-200 p-1 bg-gray-50">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#F47B20] shadow-xs'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-[#F47B20] shadow-xs'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ================= Main Layout: Sidebar + Results ================= */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          {/* Desktop Left Sidebar Filters */}
          <aside className="hidden md:block col-span-1 rounded-2xl border border-gray-200 bg-white p-5 shadow-xs sticky top-24">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#F47B20]" />
                <h3 className="text-sm font-bold text-gray-900">Filters</h3>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-[#F47B20] hover:text-[#E96512]"
                >
                  Clear All
                </button>
              )}
            </div>
            {FilterContent}
          </aside>

          {/* Right Main Results Area */}
          <main className="col-span-1 md:col-span-3">
            {/* Header: Results Count & Active Filter Chips */}
            <div className="mb-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  {isLoading ? (
                    'Searching verified properties...'
                  ) : (
                    <span>
                      Showing{' '}
                      <span className="text-[#F47B20]">{data?.total || 0}</span>{' '}
                      {data?.total === 1 ? 'property' : 'properties'} found
                    </span>
                  )}
                </h2>
              </div>

              {/* Active Filter Chips */}
              {activeFiltersCount > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium">Applied:</span>
                  {currentIntent && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-2.5 py-1 text-xs font-semibold text-[#F47B20]">
                      {currentIntent === 'sell' ? 'Buy Plot' : 'Rent Plot'}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-500"
                        onClick={() => updateFilter('intent', '')}
                      />
                    </span>
                  )}
                  {currentCategory && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-2.5 py-1 text-xs font-semibold text-[#F47B20]">
                      {PROPERTY_CATEGORY_LABELS[currentCategory]}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-500"
                        onClick={() => updateFilter('category', '')}
                      />
                    </span>
                  )}
                  {currentType && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-2.5 py-1 text-xs font-semibold text-[#F47B20]">
                      {PROPERTY_TYPE_LABELS[currentType]}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-500"
                        onClick={() => updateFilter('property_type', '')}
                      />
                    </span>
                  )}
                  {currentStateId && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-2.5 py-1 text-xs font-semibold text-[#F47B20]">
                      State: {MOCK_STATES.find((s) => String(s.id) === currentStateId)?.name}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-500"
                        onClick={() => updateFilter('state_id', '')}
                      />
                    </span>
                  )}
                  {currentCityId && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-2.5 py-1 text-xs font-semibold text-[#F47B20]">
                      City: {MOCK_CITIES.find((c) => String(c.id) === currentCityId)?.name}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-500"
                        onClick={() => updateFilter('city_id', '')}
                      />
                    </span>
                  )}
                  {(minPrice || maxPrice) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-2.5 py-1 text-xs font-semibold text-[#F47B20]">
                      Price: {minPrice ? formatPrice(Number(minPrice)) : '₹0'} -{' '}
                      {maxPrice ? formatPrice(Number(maxPrice)) : 'Any'}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-500"
                        onClick={() => {
                          setMinPrice('')
                          setMaxPrice('')
                        }}
                      />
                    </span>
                  )}
                  {isVerifiedOnly && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Verified Only
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-500"
                        onClick={() => updateFilter('is_verified', false)}
                      />
                    </span>
                  )}
                  {isFeaturedOnly && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      Featured Only
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-500"
                        onClick={() => updateFilter('is_featured', false)}
                      />
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs font-bold text-gray-500 hover:text-red-600 underline ml-1"
                  >
                    Reset all
                  </button>
                </div>
              )}
            </div>

            {/* Results Grid / List */}
            {isLoading ? (
              <div
                className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                }`}
              >
                {Array.from({ length: 6 }).map((_, idx) => (
                  <PropertyCardSkeleton key={idx} />
                ))}
              </div>
            ) : !data?.properties || data.properties.length === 0 ? (
              // Empty State with Suggestions
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-xs">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-[#F47B20] mb-4">
                  <HelpCircle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">No matching plots found</h3>
                <p className="mt-2 max-w-md text-sm text-gray-500 leading-relaxed">
                  We couldn't find any properties matching all your criteria. Here are some
                  suggestions to find what you are looking for:
                </p>

                <ul className="mt-4 text-xs text-left text-gray-600 space-y-1.5 list-disc list-inside">
                  <li>Try clearing specific filters like minimum or maximum price.</li>
                  <li>Broaden your location search to all cities in the state.</li>
                  <li>Check spelling of your keyword search.</li>
                  <li>Remove the "Verified Only" or "Featured Only" constraint.</li>
                </ul>

                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="btn-primary mt-6 text-sm"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                }`}
              >
                {data.properties.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </div>
            )}

            {/* ================= Pagination ================= */}
            {data && data.totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => updateFilter('page', String(currentPage - 1))}
                  className="btn-secondary px-3 py-2 text-xs font-semibold disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: data.totalPages }).map((_, idx) => {
                    const pageNum = idx + 1
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => updateFilter('page', String(pageNum))}
                        className={`h-9 w-9 rounded-xl text-xs font-bold transition-all ${
                          pageNum === currentPage
                            ? 'bg-[#F47B20] text-white shadow-xs'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-[#F47B20] hover:text-[#F47B20]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  type="button"
                  disabled={currentPage >= data.totalPages}
                  onClick={() => updateFilter('page', String(currentPage + 1))}
                  className="btn-secondary px-3 py-2 text-xs font-semibold disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ================= Mobile Filter Drawer ================= */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white shadow-2xl p-5 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-[#F47B20]" />
                <h3 className="font-bold text-base text-gray-900">Filter Properties</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {FilterContent}

            <div className="mt-8 pt-4 border-t border-gray-100 sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="btn-primary w-full py-3 text-sm font-bold"
              >
                Show Results ({data?.total || 0})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchPage
