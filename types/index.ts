// Sasta Plots — Type Definitions

export type UserRole = 'guest' | 'buyer' | 'owner' | 'agent' | 'admin' | 'super_admin';

export type PropertyStatus =
  | 'draft'
  | 'pending_review'
  | 'needs_changes'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'archived'
  | 'sold'
  | 'rented';

export type ListingIntent = 'sell' | 'rent';

export type PropertyCategory =
  | 'residential_plot'
  | 'agricultural_land'
  | 'commercial'
  | 'residential'
  | 'industrial'
  | 'institutional';

export type PropertyType =
  | 'plot' | 'flat' | 'house' | 'villa' | 'penthouse' | 'studio'
  | 'shop' | 'office' | 'showroom' | 'warehouse' | 'factory'
  | 'farm_land' | 'agricultural_plot' | 'orchard'
  | 'industrial_land' | 'institutional_land' | 'mixed_use';

export type AreaUnit = 'sqft' | 'sqyd' | 'sqm' | 'acre' | 'hectare' | 'bigha' | 'marla' | 'kanal' | 'guntha' | 'ground';

export type SellerCategory = 'owner' | 'agent' | 'builder' | 'developer';

export type EnquiryStatus = 'new' | 'read' | 'responded' | 'closed';

export type FacingDirection = 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest';

export type RoadAccess = 'pucca' | 'kachha' | 'both' | 'none';

export type OwnershipType = 'freehold' | 'leasehold' | 'cooperative' | 'power_of_attorney' | 'other';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  phone_verified: boolean;
  avatar_url?: string;
  role: UserRole;
  is_active: boolean;
  is_email_verified: boolean;
  seller_category?: SellerCategory;
  about?: string;
  website?: string;
  verification_status: VerificationStatus;
  rera_number?: string;
  company_name?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  storage_path: string;
  is_cover: boolean;
  sort_order: number;
  alt_text?: string;
  created_at: string;
}

export interface Property {
  id: string;
  slug: string;
  owner_id?: string;
  owner?: Profile;
  title: string;
  description: string;
  listing_intent: ListingIntent;
  category: PropertyCategory;
  property_type: PropertyType;
  price: number;
  price_negotiable: boolean;
  price_per_unit?: number;
  area: number;
  area_unit: AreaUnit;
  length?: number;
  breadth?: number;
  state_id?: number;
  city_id?: number;
  locality_id?: number;
  address?: string;
  pin_code?: string;
  latitude?: number;
  longitude?: number;
  road_width?: number;
  road_access?: RoadAccess;
  facing_direction?: FacingDirection;
  ownership_type?: OwnershipType;
  is_corner_plot: boolean;
  is_on_main_road: boolean;
  nearby_landmarks?: string[];
  amenities?: string[];
  seller_name?: string;
  seller_phone?: string;
  seller_email?: string;
  seller_category?: SellerCategory;
  status: PropertyStatus;
  rejection_reason?: string;
  moderation_feedback?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  is_featured: boolean;
  is_admin_managed: boolean;
  is_verified: boolean;
  featured_until?: string;
  expires_at?: string;
  sold_at?: string;
  view_count: number;
  enquiry_count: number;
  favourite_count: number;
  images?: PropertyImage[];
  state?: State;
  city?: City;
  locality?: Locality;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface State {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
}

export interface City {
  id: number;
  state_id: number;
  name: string;
  is_popular: boolean;
  is_active: boolean;
}

export interface Locality {
  id: number;
  city_id: number;
  name: string;
  pin_code?: string;
}

export interface Enquiry {
  id: string;
  property_id: string;
  property?: Property;
  buyer_id?: string;
  buyer?: Profile;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  message?: string;
  status: EnquiryStatus;
  response?: string;
  responded_at?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  is_chatbot_knowledge: boolean;
}

export interface SiteSettings {
  brand: {
    name: string;
    tagline: string;
    logo_url?: string;
    contact_email: string;
    contact_phone: string;
    address: string;
  };
  social: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    whatsapp?: string;
  };
  hero: {
    headline: string;
    subtext: string;
    background_image?: string;
  };
  featured_locations: string[];
  listings: {
    default_duration_days: number;
    max_images: number;
    max_image_size_mb: number;
    require_phone_verification: boolean;
    auto_expire: boolean;
  };
  email: {
    from_name: string;
    from_email: string;
    enabled: boolean;
  };
  chatbot?: {
    welcome_message: string;
    enabled: boolean;
  };
}

export interface SearchFilters {
  intent?: ListingIntent;
  category?: PropertyCategory;
  property_type?: PropertyType;
  state_id?: number;
  city_id?: number;
  locality_id?: number;
  pin_code?: string;
  min_price?: number;
  max_price?: number;
  min_area?: number;
  max_area?: number;
  area_unit?: AreaUnit;
  is_verified?: boolean;
  is_featured?: boolean;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'featured';
  q?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  properties?: Property[];
  timestamp: string;
}

export interface AdminStats {
  total_listings: number;
  published_listings: number;
  pending_approvals: number;
  rejected_listings: number;
  suspended_listings: number;
  total_users: number;
  owners_agents: number;
  new_enquiries: number;
  listings_today: number;
  recent_activity: RecentActivity[];
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  created_at: string;
  actor?: string;
}

// Property submission form data (multi-step)
export interface PropertyFormData {
  // Step 1
  listing_intent: ListingIntent;
  category: PropertyCategory;
  property_type: PropertyType;
  title: string;
  description: string;
  // Step 2
  price: number;
  price_negotiable: boolean;
  area: number;
  area_unit: AreaUnit;
  length?: number;
  breadth?: number;
  // Step 3
  state_id?: number;
  city_id?: number;
  locality_id?: number;
  address?: string;
  pin_code?: string;
  latitude?: number;
  longitude?: number;
  // Step 4
  road_width?: number;
  road_access?: RoadAccess;
  facing_direction?: FacingDirection;
  ownership_type?: OwnershipType;
  is_corner_plot: boolean;
  is_on_main_road: boolean;
  amenities: string[];
  nearby_landmarks: string[];
  // Step 5 - files handled separately
  // Step 6
  seller_name?: string;
  seller_phone?: string;
  seller_email?: string;
  seller_category?: SellerCategory;
}

export interface PropertyDocument {
  id: string;
  property_id: string;
  name: string;
  storage_path: string;
  document_type?: string;
  size_bytes?: number;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  uploaded_by?: string;
  created_at: string;
}

export interface PropertyStatusHistory {
  id: string;
  property_id: string;
  old_status?: PropertyStatus;
  new_status: PropertyStatus;
  changed_by?: string;
  changer?: Profile;
  reason?: string;
  feedback?: string;
  created_at: string;
}

export interface AdminNote {
  id: string;
  property_id: string;
  author_id?: string;
  author?: Profile;
  note: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  actor?: Profile;
  action: string;
  target_type?: string;
  target_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface AdminDashboardData {
  stats: AdminStats;
  recent_activity: RecentActivity[];
  pending_listings: Property[];
  growth_chart: { date: string; count: number; day: string }[];
  category_distribution: { category: string; label: string; count: number }[];
  approval_metrics: {
    approval_rate: number;
    avg_approval_hours: number;
    approved_count: number;
    rejected_count: number;
  };
}

export interface AdminAnalyticsData {
  status_breakdown: { status: PropertyStatus; count: number; label: string; color: string }[];
  category_breakdown: { category: string; label: string; count: number; percentage: number }[];
  top_cities: { city: string; count: number }[];
  weekly_enquiries: { week: string; count: number }[];
  user_registrations: { month: string; count: number }[];
  approval_stats: {
    approval_rate: number;
    average_hours_to_approve: number;
    total_reviewed: number;
    fastest_hours: number;
  };
}

