import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import slugify from 'slugify'
import type { Property, Profile, Enquiry, SiteSettings, AuditLog } from '@/types'
import { supabaseAdmin, isSupabaseConfigured } from './supabase'

const DATA_DIR = path.join(process.cwd(), '.data')
const DATA_FILE = path.join(DATA_DIR, 'sastaplots.json')

interface DatabaseSchema {
  properties: Property[]
  profiles: Profile[]
  enquiries: Enquiry[]
  audit_logs: AuditLog[]
  site_settings: Record<string, any>
}

// In-memory cache
let memoryDb: DatabaseSchema = {
  properties: [],
  profiles: [
    {
      id: 'admin-1',
      email: 'admin@sastaplots.com',
      full_name: 'Super Administrator',
      role: 'super_admin',
      is_active: true,
      phone_verified: true,
      is_email_verified: true,
      verification_status: 'verified',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  enquiries: [],
  audit_logs: [],
  site_settings: {
    brand_name: 'Sasta Plots',
    contact_email: 'support@sastaplots.com',
    contact_phone: '+91 98765 43210',
    maintenance_mode: false,
  },
}

// Load data from file if available
function loadLocalDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8')
      const parsed = JSON.parse(raw)
      memoryDb = {
        ...memoryDb,
        ...parsed,
        properties: parsed.properties || [],
      }
    }
  } catch (err) {
    console.warn('Notice: using memory store for local database:', err)
  }
  return memoryDb
}

// Save data to file
function saveLocalDb(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryDb, null, 2), 'utf-8')
  } catch (err) {
    // Read-only filesystem on Vercel serverless — in-memory cache remains active
  }
}

// Initialize on module load
loadLocalDb()

export async function getProperties(params: {
  intent?: string
  category?: string
  property_type?: string
  status?: string
  state_id?: number
  city_id?: number
  min_price?: number
  max_price?: number
  min_area?: number
  max_area?: number
  is_featured?: boolean
  is_verified?: boolean
  q?: string
  sort?: string
  page?: number
  limit?: number
}): Promise<{ data: Property[]; total: number }> {
  // If Supabase is configured with real credentials, query Supabase
  if (isSupabaseConfigured) {
    try {
      const page = params.page || 1
      const limit = params.limit || 20
      const from = (page - 1) * limit
      const to = from + limit - 1

      let query = supabaseAdmin
        .from('properties')
        .select(
          `*, owner:profiles(id, full_name, email, phone), state:states(id, name), city:cities(id, name), locality:localities(id, name), images:property_images(id, url, storage_path, is_cover, sort_order)`,
          { count: 'exact' }
        )

      if (params.status) {
        query = query.eq('status', params.status)
      } else {
        query = query.eq('status', 'approved')
      }

      if (params.intent) query = query.eq('listing_intent', params.intent)
      if (params.category) query = query.eq('category', params.category)
      if (params.property_type) query = query.eq('property_type', params.property_type)
      if (params.is_featured !== undefined) query = query.eq('is_featured', params.is_featured)
      if (params.is_verified !== undefined) query = query.eq('is_verified', params.is_verified)
      if (params.min_price) query = query.gte('price', params.min_price)
      if (params.max_price) query = query.lte('price', params.max_price)
      if (params.min_area) query = query.gte('area', params.min_area)
      if (params.max_area) query = query.lte('area', params.max_area)

      if (params.q) {
        const term = params.q.trim()
        query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%,address.ilike.%${term}%`)
      }

      query = query.order('created_at', { ascending: false }).range(from, to)

      const { data, count, error } = await query
      if (!error && data) {
        return { data: data as Property[], total: count || data.length }
      }
    } catch (err) {
      console.warn('Supabase query failed, falling back to local store:', err)
    }
  }

  // Fallback to local store
  loadLocalDb()
  let list = [...memoryDb.properties]

  if (params.status && params.status !== 'all') {
    list = list.filter((p) => p.status === params.status)
  } else if (!params.status) {
    // Default public view only shows approved properties
    list = list.filter((p) => p.status === 'approved')
  }

  if (params.intent) {
    list = list.filter((p) => p.listing_intent === params.intent)
  }

  if (params.category) {
    list = list.filter((p) => p.category === params.category)
  }

  if (params.property_type) {
    list = list.filter((p) => p.property_type === params.property_type)
  }

  if (params.is_featured !== undefined) {
    list = list.filter((p) => p.is_featured === params.is_featured)
  }

  if (params.is_verified !== undefined) {
    list = list.filter((p) => p.is_verified === params.is_verified)
  }

  if (params.min_price) {
    list = list.filter((p) => p.price >= params.min_price!)
  }

  if (params.max_price) {
    list = list.filter((p) => p.price <= params.max_price!)
  }

  if (params.min_area) {
    list = list.filter((p) => p.area >= params.min_area!)
  }

  if (params.max_area) {
    list = list.filter((p) => p.area <= params.max_area!)
  }

  if (params.q) {
    const qLower = params.q.toLowerCase()
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(qLower) ||
        p.description.toLowerCase().includes(qLower) ||
        (p.address && p.address.toLowerCase().includes(qLower)) ||
        (p.city?.name && p.city.name.toLowerCase().includes(qLower))
    )
  }

  // Sort
  if (params.sort === 'price_asc') {
    list.sort((a, b) => a.price - b.price)
  } else if (params.sort === 'price_desc') {
    list.sort((a, b) => b.price - a.price)
  } else {
    // Newest first
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  const total = list.length
  const page = params.page || 1
  const limit = params.limit || 20
  const startIndex = (page - 1) * limit
  const paginated = list.slice(startIndex, startIndex + limit)

  return { data: paginated, total }
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseAdmin
        .from('properties')
        .select(
          `*, owner:profiles(id, full_name, email, phone, role, seller_category), state:states(id, name), city:cities(id, name), locality:localities(id, name), images:property_images(id, url, storage_path, is_cover, sort_order)`
        )
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .single()

      if (!error && data) return data as Property
    } catch {
      // fallback
    }
  }

  loadLocalDb()
  return (
    memoryDb.properties.find(
      (p) => p.slug === slug || p.id === slug
    ) || null
  )
}

export async function createProperty(payload: any, userId?: string, isAdmin: boolean = false): Promise<Property> {
  const title = payload.title || 'Untitled Property'
  const baseSlug = slugify(title, { lower: true, strict: true, trim: true }) || 'prop'
  const slug = `${baseSlug}-${uuidv4().substring(0, 6)}`

  let pricePerUnit = payload.price_per_unit
  if (!pricePerUnit && payload.price && payload.area) {
    pricePerUnit = Math.round((payload.price / payload.area) * 100) / 100
  }

  const propertyId = `prop-${uuidv4()}`
  const now = new Date().toISOString()

  // Format images
  const images = (payload.images || []).map((img: any, idx: number) => ({
    id: `img-${uuidv4()}`,
    property_id: propertyId,
    url: typeof img === 'string' ? img : img.url,
    storage_path: img.storage_path || `properties/${slug}/${idx}.jpg`,
    is_cover: img.is_cover ?? idx === 0,
    sort_order: img.sort_order ?? idx + 1,
    created_at: now,
  }))

  const newProperty: Property = {
    id: propertyId,
    slug,
    owner_id: userId || 'admin-1',
    title,
    description: payload.description || '',
    listing_intent: payload.listing_intent || 'sell',
    category: payload.category || 'residential_plot',
    property_type: payload.property_type || 'plot',
    price: Number(payload.price) || 0,
    price_negotiable: Boolean(payload.price_negotiable),
    price_per_unit: pricePerUnit,
    area: Number(payload.area) || 0,
    area_unit: payload.area_unit || 'sqft',
    length: payload.length ? Number(payload.length) : undefined,
    breadth: payload.breadth ? Number(payload.breadth) : undefined,
    address: payload.address || '',
    pin_code: payload.pin_code || '',
    road_width: payload.road_width ? Number(payload.road_width) : undefined,
    road_access: payload.road_access || 'pucca',
    facing_direction: payload.facing_direction || 'east',
    ownership_type: payload.ownership_type || 'freehold',
    is_corner_plot: Boolean(payload.is_corner_plot),
    is_on_main_road: Boolean(payload.is_on_main_road),
    nearby_landmarks: payload.nearby_landmarks || [],
    amenities: payload.amenities || [],
    seller_name: payload.seller_name || 'Admin',
    seller_phone: payload.seller_phone || '',
    seller_email: payload.seller_email || '',
    seller_category: payload.seller_category || 'owner',
    status: isAdmin ? (payload.status || 'approved') : (payload.status || 'pending_review'),
    is_featured: Boolean(payload.is_featured),
    is_admin_managed: isAdmin,
    is_verified: isAdmin,
    view_count: 0,
    enquiry_count: 0,
    favourite_count: 0,
    images,
    city: payload.city_name ? { id: 1, state_id: 1, name: payload.city_name, is_popular: true, is_active: true } : undefined,
    state: payload.state_name ? { id: 1, name: payload.state_name, code: 'IN', is_active: true } : undefined,
    created_at: now,
    updated_at: now,
    published_at: (payload.status === 'approved' || (isAdmin && (!payload.status || payload.status === 'approved'))) ? now : undefined,
  }

  // If Supabase configured, attempt Supabase insert
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseAdmin.from('properties').insert({
        ...payload,
        id: propertyId,
        slug,
        owner_id: userId || 'admin-1',
        price_per_unit: pricePerUnit,
        status: newProperty.status,
        is_verified: newProperty.is_verified,
        is_featured: newProperty.is_featured,
        published_at: newProperty.published_at,
      }).select().single()

      if (!error && data) {
        if (images.length > 0) {
          await supabaseAdmin.from('property_images').insert(
            images.map(img => ({
              property_id: propertyId,
              url: img.url,
              storage_path: img.storage_path,
              is_cover: img.is_cover,
              sort_order: img.sort_order,
            }))
          )
        }
      }
    } catch (err) {
      console.warn('Supabase property insert error:', err)
    }
  }

  // Always save to local store as well
  loadLocalDb()
  memoryDb.properties.unshift(newProperty)
  memoryDb.audit_logs.unshift({
    id: `audit-${uuidv4()}`,
    actor_id: userId || 'admin-1',
    action: 'property_create',
    target_type: 'property',
    target_id: propertyId,
    details: { title: newProperty.title },
    created_at: now,
  })
  saveLocalDb()

  return newProperty
}

export async function updateProperty(id: string, payload: Partial<Property>): Promise<Property | null> {
  loadLocalDb()
  const index = memoryDb.properties.findIndex((p) => p.id === id || p.slug === id)
  if (index === -1) return null

  const existing = memoryDb.properties[index]
  const updated: Property = {
    ...existing,
    ...payload,
    updated_at: new Date().toISOString(),
  }

  memoryDb.properties[index] = updated
  saveLocalDb()

  if (isSupabaseConfigured) {
    try {
      await supabaseAdmin.from('properties').update(payload).eq('id', id)
    } catch {
      // ignore
    }
  }

  return updated
}

export async function deleteProperty(id: string): Promise<boolean> {
  loadLocalDb()
  const initialLength = memoryDb.properties.length
  memoryDb.properties = memoryDb.properties.filter((p) => p.id !== id && p.slug !== id)
  saveLocalDb()

  if (isSupabaseConfigured) {
    try {
      await supabaseAdmin.from('properties').delete().eq('id', id)
    } catch {
      // ignore
    }
  }

  return memoryDb.properties.length < initialLength
}

export async function getAdminStats() {
  loadLocalDb()
  const total = memoryDb.properties.length
  const pending = memoryDb.properties.filter((p) => p.status === 'pending_review').length
  const approved = memoryDb.properties.filter((p) => p.status === 'approved').length
  const featured = memoryDb.properties.filter((p) => p.is_featured).length
  const enquiries = memoryDb.enquiries.length

  return {
    totalProperties: total,
    pendingProperties: pending,
    approvedProperties: approved,
    featuredProperties: featured,
    totalEnquiries: enquiries,
    totalUsers: memoryDb.profiles.length,
  }
}

export async function createEnquiry(data: Partial<Enquiry>): Promise<Enquiry> {
  loadLocalDb()
  const newEnquiry: Enquiry = {
    id: `enq-${uuidv4()}`,
    property_id: data.property_id || '',
    buyer_name: data.buyer_name || 'Anonymous',
    buyer_email: data.buyer_email || '',
    buyer_phone: data.buyer_phone || '',
    message: data.message || '',
    status: 'new',
    created_at: new Date().toISOString(),
  }

  memoryDb.enquiries.unshift(newEnquiry)
  saveLocalDb()
  return newEnquiry
}

export async function getEnquiries(): Promise<Enquiry[]> {
  loadLocalDb()
  return memoryDb.enquiries
}

export async function updateEnquiry(id: string, payload: Partial<Enquiry>): Promise<Enquiry | null> {
  loadLocalDb()
  const idx = memoryDb.enquiries.findIndex((e) => e.id === id)
  if (idx === -1) return null
  memoryDb.enquiries[idx] = { ...memoryDb.enquiries[idx], ...payload }
  saveLocalDb()
  return memoryDb.enquiries[idx]
}

export async function updateUser(id: string, payload: Partial<Profile>): Promise<Profile | null> {
  loadLocalDb()
  const idx = memoryDb.profiles.findIndex((p) => p.id === id)
  if (idx === -1) return null
  memoryDb.profiles[idx] = { ...memoryDb.profiles[idx], ...payload, updated_at: new Date().toISOString() }
  saveLocalDb()
  return memoryDb.profiles[idx]
}

export async function updateSetting(key: string, value: any): Promise<Record<string, any>> {
  loadLocalDb()
  memoryDb.site_settings = memoryDb.site_settings || {}
  memoryDb.site_settings[key] = value
  saveLocalDb()
  return memoryDb.site_settings
}
