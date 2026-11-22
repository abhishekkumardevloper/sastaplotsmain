'use client'
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
  ChevronDown,
  ChevronUp,
  SearchX,
} from 'lucide-react'
import api from '@/lib/api'
import type { Property, AreaUnit, PropertyCategory, PropertyType } from '@/types'
import { PropertyCard } from '@/components/property/PropertyCard'
import { PropertyCardSkeleton } from '@/components/property/PropertyCardSkeleton'
import { INDIAN_STATES, INDIAN_CITIES } from '@/lib/constants'
import {
  PROPERTY_CATEGORY_LABELS,
  PROPERTY_TYPE_LABELS,
  AREA_UNIT_OPTIONS,
  formatPrice,
} from '@/lib/utils'

/* ─────────────────────────── Collapsible filter section ─────────────────────────── */
function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 pb-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-2 text-sm font-semibold text-gray-800 hover:text-[#F47B20] transition-colors"
      >
        {title}
        {open ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {open && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  )
}

/* ─────────────────────────── Active filter chip ─────────────────────────── */
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-2.5 py-1 text-xs font-semibold text-[#F47B20]">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="ml-0.5 rounded-full hover:text-red-500 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SEARCH PAGE
══════════════════════════════════════════════════════════════════════════════= */
export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [, startTransition] = useTransition()

  /* ── Local state for debounced text/number inputs ── */
  const [keyword, setKeyword] = useState(searchParams.get('q') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '')
  const [minArea, setMinArea] = useState(searchParams.get('min_area') || '')
  const [maxArea, setMaxArea] = useState(searchParams.get('max_area') || '')

  /* ── UI state ── */
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  /* ── Keep local inputs in sync when URL changes externally ── */
  useEffect(() => {
    setKeyword(searchParams.get('q') || '')
    setMinPrice(searchParams.get('min_price') || '')
    setMaxPrice(searchParams.get('max_price') || '')
    setMinArea(searchParams.get('min_area') || '')
    setMaxArea(searchParams.get('max_area') || '')
  }, [searchParams])

  /* ── Debounced URL sync (300 ms) ── */
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
          if (next.get('page') && next.get('page') !== '1') next.set('page', '1')
          return next
        },
        { replace: true }
      )
    }, 300)
    return () => clearTimeout(handler)
  }, [keyword, minPrice, maxPrice, minArea, maxArea, setSearchParams])

  /* ── Read current URL filter values ── */
  const currentIntent = searchParams.get('intent') || ''
  const currentCategory = (searchParams.get('category') as PropertyCategory) || ''
  const currentType = (searchParams.get('property_type') as PropertyType) || ''
  const currentStateId = searchParams.get('state_id') || ''
  const currentCityId = searchParams.get('city_id') || ''
  const currentAreaUnit = (searchParams.get('area_unit') as AreaUnit) || 'sqft'
  const currentSellerCategory = searchParams.get('seller_category') || ''
  const isVerifiedOnly = searchParams.get('is_verified') === 'true'
  const isFeaturedOnly = searchParams.get('is_featured') === 'true'
  const currentSort = searchParams.get('sort') || 'newest'
  const currentPage = Number(searchParams.get('page')) || 1

  /* ── Cascading city filter ── */
  const availableCities = useMemo(() => {
    if (!currentStateId) return INDIAN_CITIES
    return INDIAN_CITIES.filter((c) => String(c.state_id) === currentStateId)
  }, [currentStateId])

  /* ── Filter helpers ── */
  const updateFilter = (key: string, value: string | boolean | null) => {
    startTransition(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (value === null || value === '' || value === false) next.delete(key)
        else next.set(key, String(value))
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

  /* ── Active filter count ── */
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
    if (currentAreaUnit && currentAreaUnit !== 'sqft') count++
    if (currentSellerCategory) count++
    if (isVerifiedOnly) count++
    if (isFeaturedOnly) count++
    if (keyword) count++
    return count
  }, [
    currentIntent, currentCategory, currentType, currentStateId, currentCityId,
    minPrice, maxPrice, minArea, maxArea, isVerifiedOnly, isFeaturedOnly, keyword,
  ])

  /* ── Data fetching ── */
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
          return { properties: resData, total: response.data?.total || resData.length, totalPages: response.data?.totalPages || 1 }
        }
        if (resData?.data && Array.isArray(resData.data)) {
          return { properties: resData.data, total: resData.total || resData.data.length, totalPages: resData.totalPages || 1 }
        }
        return { properties: [], total: 0, totalPages: 1 }
      } catch {
        return { properties: [], total: 0, totalPages: 1 }
      }
    },
  })

  /* ══════════════════════ FILTER SIDEBAR CONTENT ══════════════════════ */
  const FilterContent = (
    <div className="space-y-0 divide-y divide-gray-100">
      {/* Intent / Listing type */}
      <FilterSection title="Listing Type">
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-gray-100 p-1">
          {(['', 'sell', 'rent'] as const).map((val) => (
            <button
              key={val || 'all'}
              type="button"
              onClick={() => updateFilter('intent', val)}
              className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${
                currentIntent === val
                  ? val === '' ? 'bg-white text-gray-900 shadow-sm' : 'bg-[#F47B20] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {val === '' ? 'All' : val === 'sell' ? 'Buy' : 'Rent'}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Listed By / Seller Type */}
      <FilterSection title="Listed By">
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-gray-100 p-1">
          {[
            { val: '', label: 'All' },
            { val: 'owner', label: 'Owner' },
            { val: 'broker', label: 'Broker' },
          ].map(({ val, label }) => (
            <button
              key={val || 'all'}
              type="button"
              onClick={() => updateFilter('seller_category', val)}
              className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${
                currentSellerCategory === val
                  ? val === '' ? 'bg-white text-gray-900 shadow-sm' : 'bg-[#F47B20] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Budget */}
      <FilterSection title="Budget (₹)">
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
        {/* Quick presets */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {[
            { label: '< 25L', max: '2500000' },
            { label: '25–50L', min: '2500000', max: '5000000' },
            { label: '50L–1Cr', min: '5000000', max: '10000000' },
            { label: '1Cr+', min: '10000000' },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => { setMinPrice(preset.min || ''); setMaxPrice(preset.max || '') }}
              className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] font-medium text-gray-600 transition-colors hover:border-[#F47B20] hover:bg-orange-50 hover:text-[#F47B20]"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Category */}
      <FilterSection title="Category" defaultOpen={false}>
        <select
          value={currentCategory}
          onChange={(e) => updateFilter('category', e.target.value)}
          className="input-field text-sm"
        >
          <option value="">All Categories</option>
          {Object.entries(PROPERTY_CATEGORY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </FilterSection>

      {/* Property Type */}
      <FilterSection title="Property Type" defaultOpen={false}>
        <div className="space-y-1.5">
          {Object.entries(PROPERTY_TYPE_LABELS).map(([val, label]) => (
            <label key={val} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-[#F47B20] select-none">
              <input
                type="checkbox"
                checked={currentType === val}
                onChange={() => updateFilter('property_type', currentType === val ? '' : val)}
                className="h-4 w-4 rounded border-gray-300 text-[#F47B20] focus:ring-[#F47B20]"
              />
              {label}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Area */}
      <FilterSection title="Area" defaultOpen={false}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">Range</span>
          <select
            value={currentAreaUnit}
            onChange={(e) => updateFilter('area_unit', e.target.value)}
            className="rounded border border-gray-200 px-1.5 py-0.5 text-[11px] text-gray-600 font-medium"
          >
            {AREA_UNIT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label.split(' ')[0]}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minArea}
            onChange={(e) => setMinArea(e.target.value)}
            className="input-field text-xs py-2 px-2.5"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxArea}
            onChange={(e) => setMaxArea(e.target.value)}
            className="input-field text-xs py-2 px-2.5"
          />
        </div>
      </FilterSection>

      {/* Location */}
      <FilterSection title="Location" defaultOpen={false}>
        <select
          value={currentStateId}
          onChange={(e) => { updateFilter('state_id', e.target.value); updateFilter('city_id', '') }}
          className="input-field text-sm mb-2"
        >
          <option value="">All States</option>
          {INDIAN_STATES.map((st) => (
            <option key={st.id} value={st.id}>{st.name}</option>
          ))}
        </select>
        <select
          value={currentCityId}
          onChange={(e) => updateFilter('city_id', e.target.value)}
          className="input-field text-sm"
        >
          <option value="">All Cities</option>
          {availableCities.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </FilterSection>

      {/* Toggles */}
      <FilterSection title="Quality Filters">
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
      </FilterSection>

      {/* Clear all */}
      {activeFiltersCount > 0 && (
        <div className="pt-4">
          <button
            type="button"
            onClick={clearAllFilters}
            className="btn-secondary w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 text-gray-600 hover:text-red-600"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear All Filters ({activeFiltersCount})
          </button>
        </div>
      )}
    </div>
  )

  /* ══════════════════════ PAGINATION HELPER ══════════════════════ */
  const totalPages = data?.totalPages || 1
  const renderPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('ellipsis')
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push('ellipsis')
      pages.push(totalPages)
    }
    return pages
  }

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════════= */
  return (
    <div className="min-h-screen bg-[#FFFDFB] pb-24 pt-6">
      <div className="container-custom">

        {/* ═══ TOP SEARCH + CONTROLS BAR ═══ */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by locality, city, project name or keywords..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-9 text-sm text-gray-800 placeholder-gray-400 transition-colors focus:border-[#F47B20] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F47B20]/20"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile filter trigger */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="md:hidden inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 shadow-sm hover:border-[#F47B20] hover:text-[#F47B20] transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F47B20] text-[10px] font-bold text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline text-xs font-medium text-gray-500 whitespace-nowrap">Sort:</span>
              <select
                value={currentSort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="input-field text-xs py-2 px-3 w-auto min-w-[150px]"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="area_asc">Area: Small → Large</option>
                <option value="featured">Featured First</option>
              </select>
            </div>

            {/* Grid / List toggle */}
            <div className="hidden sm:flex items-center rounded-xl border border-gray-200 p-1 bg-gray-50">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Grid view"
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white text-[#F47B20] shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                title="List view"
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white text-[#F47B20] shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ═══ MAIN LAYOUT: SIDEBAR + RESULTS ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8 items-start">

          {/* Desktop sidebar */}
          <aside className="hidden md:block col-span-1 rounded-2xl border border-gray-200 bg-white shadow-sm sticky top-24 overflow-hidden">
            {/* Sidebar header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 bg-gradient-to-r from-orange-50 to-white">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#F47B20]" />
                <h3 className="text-sm font-bold text-gray-900">Filters</h3>
                {activeFiltersCount > 0 && (
                  <span className="flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-[#F47B20] text-[10px] font-bold text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-[#F47B20] hover:text-[#E96512] transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="p-5">
              {FilterContent}
            </div>
          </aside>

          {/* Results area */}
          <main className="col-span-1 md:col-span-3">

            {/* Results header */}
            <div className="mb-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-base font-bold text-gray-900">
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2 text-gray-500">
                      <span className="inline-block h-4 w-48 animate-pulse rounded bg-gray-200" />
                    </span>
                  ) : (
                    <>
                      <span className="text-[#F47B20]">{data?.total ?? 0}</span>{' '}
                      {(data?.total ?? 0) === 1 ? 'property' : 'properties'} found
                      {data && totalPages > 1 && (
                        <span className="ml-2 text-xs font-medium text-gray-400">
                          · Page {currentPage} of {totalPages}
                        </span>
                      )}
                    </>
                  )}
                </h2>
              </div>

              {/* Active filter chips */}
              {activeFiltersCount > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium">Applied:</span>
                  {keyword && (
                    <FilterChip label={`"${keyword}"`} onRemove={() => setKeyword('')} />
                  )}
                  {currentIntent && (
                    <FilterChip
                      label={currentIntent === 'sell' ? 'Buy' : 'Rent'}
                      onRemove={() => updateFilter('intent', '')}
                    />
                  )}
                  {currentCategory && (
                    <FilterChip
                      label={PROPERTY_CATEGORY_LABELS[currentCategory] || currentCategory}
                      onRemove={() => updateFilter('category', '')}
                    />
                  )}
                  {currentType && (
                    <FilterChip
                      label={PROPERTY_TYPE_LABELS[currentType] || currentType}
                      onRemove={() => updateFilter('property_type', '')}
                    />
                  )}
                  {currentSellerCategory && (
                    <FilterChip
                      label={`Listed By: ${currentSellerCategory === 'owner' ? 'Owner' : currentSellerCategory === 'broker' ? 'Broker' : 'Builder'}`}
                      onRemove={() => updateFilter('seller_category', '')}
                    />
                  )}
                  {currentStateId && (
                    <FilterChip
                      label={`State: ${INDIAN_STATES.find((s) => String(s.id) === currentStateId)?.name ?? currentStateId}`}
                      onRemove={() => updateFilter('state_id', '')}
                    />
                  )}
                  {currentCityId && (
                    <FilterChip
                      label={`City: ${INDIAN_CITIES.find((c) => String(c.id) === currentCityId)?.name ?? currentCityId}`}
                      onRemove={() => updateFilter('city_id', '')}
                    />
                  )}
                  {(minPrice || maxPrice) && (
                    <FilterChip
                      label={`₹${minPrice ? formatPrice(Number(minPrice)) : '0'} – ${maxPrice ? formatPrice(Number(maxPrice)) : 'Any'}`}
                      onRemove={() => { setMinPrice(''); setMaxPrice('') }}
                    />
                  )}
                  {(minArea || maxArea) && (
                    <FilterChip
                      label={`Area: ${minArea || '0'} – ${maxArea || 'Any'} ${currentAreaUnit}`}
                      onRemove={() => { setMinArea(''); setMaxArea('') }}
                    />
                  )}
                  {isVerifiedOnly && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Verified Only
                      <button type="button" onClick={() => updateFilter('is_verified', false)} className="ml-0.5 hover:text-red-500 transition-colors"><X className="h-3 w-3" /></button>
                    </span>
                  )}
                  {isFeaturedOnly && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      Featured Only
                      <button type="button" onClick={() => updateFilter('is_featured', false)} className="ml-0.5 hover:text-red-500 transition-colors"><X className="h-3 w-3" /></button>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs font-bold text-gray-400 hover:text-red-600 underline transition-colors ml-1"
                  >
                    Reset all
                  </button>
                </div>
              )}
            </div>

            {/* ── Results grid / list ── */}
            {isLoading ? (
              <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {Array.from({ length: 6 }).map((_, idx) => (
                  <PropertyCardSkeleton key={idx} />
                ))}
              </div>
            ) : !data?.properties || data.properties.length === 0 ? (
              /* ── Empty state ── */
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white py-16 px-8 text-center shadow-sm">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-100 text-[#F47B20] shadow-sm">
                  <SearchX className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">No properties found</h3>
                <p className="mt-2 max-w-sm text-sm text-gray-500 leading-relaxed">
                  We couldn't find any plots matching your criteria. Try adjusting your filters or clearing some.
                </p>
                <ul className="mt-4 text-xs text-left text-gray-500 space-y-1 list-disc list-inside">
                  <li>Broaden your budget or area range</li>
                  <li>Search a different city or state</li>
                  <li>Remove "Verified Only" or "Featured Only"</li>
                  <li>Check your keyword spelling</li>
                </ul>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="btn-primary mt-7 inline-flex items-center gap-2 text-sm"
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {data.properties.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} viewMode={viewMode} />
                ))}
              </div>
            )}

            {/* ── Pagination ── */}
            {data && totalPages > 1 && (
              <div className="mt-12 flex flex-col items-center gap-3">
                <p className="text-xs text-gray-400 font-medium">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => updateFilter('page', String(currentPage - 1))}
                    className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm transition-all hover:border-[#F47B20] hover:text-[#F47B20] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </button>

                  {renderPageNumbers().map((page, idx) =>
                    page === 'ellipsis' ? (
                      <span key={`ellipsis-${idx}`} className="px-1 text-xs text-gray-400">…</span>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        onClick={() => updateFilter('page', String(page))}
                        className={`h-9 w-9 rounded-xl text-xs font-bold transition-all ${
                          page === currentPage
                            ? 'bg-[#F47B20] text-white shadow-sm'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-[#F47B20] hover:text-[#F47B20]'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => updateFilter('page', String(currentPage + 1))}
                    className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm transition-all hover:border-[#F47B20] hover:text-[#F47B20] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ═══ MOBILE FILTER DRAWER ═══ */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          {/* Drawer panel — slides from right */}
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white shadow-2xl overflow-hidden">
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 bg-gradient-to-r from-orange-50 to-white shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-[#F47B20]" />
                <h3 className="font-bold text-base text-gray-900">Filter Properties</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable filter content */}
            <div className="flex-1 overflow-y-auto p-5">
              {FilterContent}
            </div>

            {/* Apply button */}
            <div className="border-t border-gray-100 bg-white p-4 shrink-0">
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="btn-primary w-full py-3 text-sm font-bold"
              >
                Show {data?.total ?? 0} Results
              </button>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={() => { clearAllFilters(); setIsMobileDrawerOpen(false) }}
                  className="mt-2 w-full text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors py-1"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchPage
