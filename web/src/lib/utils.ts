import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

// Tailwind class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price in Indian number system
export function formatPrice(amount: number): string {
  if (amount >= 10000000) {
    const crore = amount / 10000000
    return `₹${crore % 1 === 0 ? crore.toFixed(0) : crore.toFixed(2)} Cr`
  }
  if (amount >= 100000) {
    const lakh = amount / 100000
    return `₹${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(2)} Lakh`
  }
  if (amount >= 1000) {
    const k = amount / 1000
    return `₹${k % 1 === 0 ? k.toFixed(0) : k.toFixed(2)}K`
  }
  return `₹${amount.toLocaleString('en-IN')}`
}

// Format area with unit display
export function formatArea(area: number, unit: string): string {
  const unitLabels: Record<string, string> = {
    sqft: 'sq.ft',
    sqyd: 'sq.yd',
    sqm: 'sq.m',
    acre: 'Acre',
    hectare: 'Hectare',
    bigha: 'Bigha',
    marla: 'Marla',
    kanal: 'Kanal',
    guntha: 'Guntha',
    ground: 'Ground',
  }
  const label = unitLabels[unit] || unit
  const formatted = area % 1 === 0 ? area.toFixed(0) : area.toFixed(2)
  return `${formatted} ${label}`
}

// Format date
export function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'dd MMM yyyy')
  } catch {
    return dateStr
  }
}

// Format relative time
export function formatRelativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
  } catch {
    return dateStr
  }
}

// Generate slug from title
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 80)
}

// Property category labels
export const PROPERTY_CATEGORY_LABELS: Record<string, string> = {
  residential_plot: 'Residential Plot',
  agricultural_land: 'Agricultural Land',
  commercial: 'Commercial',
  residential: 'Residential',
  industrial: 'Industrial',
  institutional: 'Institutional',
}

// Property type labels
export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  plot: 'Plot',
  flat: 'Flat / Apartment',
  house: 'Independent House',
  villa: 'Villa',
  penthouse: 'Penthouse',
  studio: 'Studio',
  shop: 'Shop',
  office: 'Office Space',
  showroom: 'Showroom',
  warehouse: 'Warehouse',
  factory: 'Factory',
  farm_land: 'Farm Land',
  agricultural_plot: 'Agricultural Plot',
  orchard: 'Orchard',
  industrial_land: 'Industrial Land',
  institutional_land: 'Institutional Land',
  mixed_use: 'Mixed Use',
}

// Status labels and colors
export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-gray-600', bg: 'bg-gray-100' },
  pending_review: { label: 'Pending Review', color: 'text-amber-700', bg: 'bg-amber-50' },
  needs_changes: { label: 'Needs Changes', color: 'text-orange-700', bg: 'bg-orange-50' },
  approved: { label: 'Approved', color: 'text-green-700', bg: 'bg-green-50' },
  rejected: { label: 'Rejected', color: 'text-red-700', bg: 'bg-red-50' },
  suspended: { label: 'Suspended', color: 'text-red-800', bg: 'bg-red-100' },
  archived: { label: 'Archived', color: 'text-gray-500', bg: 'bg-gray-50' },
  sold: { label: 'Sold', color: 'text-blue-700', bg: 'bg-blue-50' },
  rented: { label: 'Rented Out', color: 'text-purple-700', bg: 'bg-purple-50' },
}

// Area unit options
export const AREA_UNIT_OPTIONS = [
  { value: 'sqft', label: 'Square Feet (sq.ft)' },
  { value: 'sqyd', label: 'Square Yards (sq.yd)' },
  { value: 'sqm', label: 'Square Meters (sq.m)' },
  { value: 'acre', label: 'Acre' },
  { value: 'hectare', label: 'Hectare' },
  { value: 'bigha', label: 'Bigha' },
  { value: 'marla', label: 'Marla' },
  { value: 'kanal', label: 'Kanal' },
  { value: 'guntha', label: 'Guntha' },
  { value: 'ground', label: 'Ground' },
]

// Common amenities
export const COMMON_AMENITIES = [
  'Electricity', 'Water Connection', 'Sewage', 'Drainage', 'Compound Wall',
  'Gated Community', 'Security', 'CCTV', 'Park / Garden', 'Playground',
  'Swimming Pool', 'Club House', '24x7 Water', 'Borewell', 'Solar Power',
  'EV Charging', 'Parking', 'Community Hall', 'Temple / Prayer Hall', 'School Nearby',
  'Hospital Nearby', 'Market Nearby', 'Highway Access', 'Metro Nearby', 'Bus Stop Nearby',
]

// Facing direction labels
export const FACING_LABELS: Record<string, string> = {
  north: 'North', south: 'South', east: 'East', west: 'West',
  northeast: 'North-East', northwest: 'North-West',
  southeast: 'South-East', southwest: 'South-West',
}

// Ownership type labels
export const OWNERSHIP_LABELS: Record<string, string> = {
  freehold: 'Freehold',
  leasehold: 'Leasehold',
  cooperative: 'Cooperative Society',
  power_of_attorney: 'Power of Attorney',
  other: 'Other',
}

// Debounce utility
export function debounce<T extends (...args: Parameters<T>) => void>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Validate Indian phone number
export function isValidIndianPhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(phone.replace(/[\s-+()]/g, ''))
}

// Format phone for WhatsApp
export function formatWhatsAppUrl(phone: string, message?: string): string {
  const cleaned = phone.replace(/[\s-+()]/g, '')
  const withCountry = cleaned.startsWith('91') ? cleaned : `91${cleaned}`
  const encodedMsg = message ? encodeURIComponent(message) : ''
  return `https://wa.me/${withCountry}${encodedMsg ? `?text=${encodedMsg}` : ''}`
}

// Get cover image from property
export function getCoverImage(property: { images?: Array<{ is_cover: boolean; url: string }> }): string | null {
  if (!property.images || property.images.length === 0) return null
  const cover = property.images.find(img => img.is_cover)
  return (cover || property.images[0])?.url || null
}

// Parse URL search params to filters
export function parseSearchParams(params: URLSearchParams): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {}
  params.forEach((value, key) => {
    if (value === 'true') result[key] = true
    else if (value === 'false') result[key] = false
    else if (!isNaN(Number(value)) && value !== '') result[key] = Number(value)
    else result[key] = value
  })
  return result
}

// Build URL search params from filters
export function buildSearchParams(filters: Record<string, unknown>): URLSearchParams {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  })
  return params
}
