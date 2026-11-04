import { Request } from 'express';

// ================================================
// DATABASE ENUMS
// ================================================

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
  | 'plot'
  | 'flat'
  | 'house'
  | 'villa'
  | 'penthouse'
  | 'studio'
  | 'shop'
  | 'office'
  | 'showroom'
  | 'warehouse'
  | 'factory'
  | 'farm_land'
  | 'agricultural_plot'
  | 'orchard'
  | 'industrial_land'
  | 'institutional_land'
  | 'mixed_use';

export type AreaUnit =
  | 'sqft'
  | 'sqyd'
  | 'sqm'
  | 'acre'
  | 'hectare'
  | 'bigha'
  | 'marla'
  | 'kanal'
  | 'guntha'
  | 'ground';

export type SellerCategory = 'owner' | 'agent' | 'builder' | 'developer';

export type EnquiryStatus = 'new' | 'read' | 'responded' | 'closed';

export type NotificationType =
  | 'property_submitted'
  | 'property_approved'
  | 'property_rejected'
  | 'property_needs_changes'
  | 'property_suspended'
  | 'enquiry_received'
  | 'enquiry_responded'
  | 'listing_expiring'
  | 'account_verified'
  | 'general';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type AuditAction =
  | 'property_approve'
  | 'property_reject'
  | 'property_suspend'
  | 'property_restore'
  | 'property_delete'
  | 'user_suspend'
  | 'user_activate'
  | 'user_role_change'
  | 'settings_update'
  | 'content_update'
  | 'faq_update'
  | 'admin_login';

export type FacingDirection =
  | 'north'
  | 'south'
  | 'east'
  | 'west'
  | 'northeast'
  | 'northwest'
  | 'southeast'
  | 'southwest';

export type RoadAccess = 'pucca' | 'kachha' | 'both' | 'none';

export type OwnershipType = 'freehold' | 'leasehold' | 'cooperative' | 'power_of_attorney' | 'other';

// ================================================
// DATABASE ENTITIES
// ================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  phone_verified?: boolean;
  avatar_url?: string | null;
  role: UserRole;
  is_active: boolean;
  is_email_verified: boolean;
  seller_category?: SellerCategory | null;
  about?: string | null;
  website?: string | null;
  verification_status?: VerificationStatus;
  verification_notes?: string | null;
  rera_number?: string | null;
  company_name?: string | null;
  last_login_at?: string | null;
  deactivated_at?: string | null;
  deactivation_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface State {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface City {
  id: number;
  state_id: number;
  name: string;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  state?: State;
}

export interface Locality {
  id: number;
  city_id: number;
  name: string;
  pin_code?: string | null;
  is_active: boolean;
  created_at: string;
  city?: City;
}

export interface PropertyCategoryEntity {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  storage_path: string;
  is_cover: boolean;
  sort_order: number;
  alt_text?: string | null;
  size_bytes?: number | null;
  width?: number | null;
  height?: number | null;
  uploaded_by?: string | null;
  created_at: string;
}

export interface PropertyDocument {
  id: string;
  property_id: string;
  name: string;
  storage_path: string;
  document_type?: string | null;
  size_bytes?: number | null;
  is_verified: boolean;
  verified_by?: string | null;
  verified_at?: string | null;
  uploaded_by?: string | null;
  created_at: string;
}

export interface PropertyStatusHistory {
  id: string;
  property_id: string;
  old_status?: PropertyStatus | null;
  new_status: PropertyStatus;
  changed_by?: string | null;
  reason?: string | null;
  feedback?: string | null;
  created_at: string;
}

export interface Property {
  id: string;
  slug: string;
  owner_id?: string | null;
  title: string;
  description: string;
  listing_intent: ListingIntent;
  category: PropertyCategory;
  property_type: PropertyType;
  price: number;
  price_negotiable: boolean;
  price_per_unit?: number | null;
  area: number;
  area_unit: AreaUnit;
  length?: number | null;
  breadth?: number | null;
  state_id?: number | null;
  city_id?: number | null;
  locality_id?: number | null;
  address?: string | null;
  pin_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  road_width?: number | null;
  road_access?: RoadAccess | null;
  facing_direction?: FacingDirection | null;
  ownership_type?: OwnershipType | null;
  is_corner_plot: boolean;
  is_on_main_road: boolean;
  nearby_landmarks?: string[] | null;
  amenities?: string[] | null;
  seller_name?: string | null;
  seller_phone?: string | null;
  seller_email?: string | null;
  seller_category?: SellerCategory | null;
  status: PropertyStatus;
  rejection_reason?: string | null;
  admin_notes?: string | null;
  moderation_feedback?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  is_featured: boolean;
  is_admin_managed: boolean;
  is_verified: boolean;
  featured_until?: string | null;
  expires_at?: string | null;
  sold_at?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  view_count: number;
  enquiry_count: number;
  favourite_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string | null;

  // Joined relations
  images?: PropertyImage[];
  state?: State;
  city?: City;
  locality?: Locality;
  owner?: Partial<Profile>;
}

export interface Enquiry {
  id: string;
  property_id?: string | null;
  property_owner_id?: string | null;
  buyer_id?: string | null;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  message?: string | null;
  status: EnquiryStatus;
  response?: string | null;
  responded_by?: string | null;
  responded_at?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  updated_at: string;

  // Joined relations
  property?: Partial<Property>;
}

export interface Favourite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
  property?: Property;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  filters: Record<string, any>;
  alert_enabled: boolean;
  last_run_at?: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  is_read: boolean;
  meta?: Record<string, any>;
  created_at: string;
}

export interface Report {
  id: string;
  property_id: string;
  reporter_id?: string | null;
  reason: string;
  details?: string | null;
  is_resolved: boolean;
  resolved_by?: string | null;
  resolved_at?: string | null;
  resolution_note?: string | null;
  created_at: string;
}

export interface AdminNote {
  id: string;
  property_id: string;
  author_id?: string | null;
  note: string;
  created_at: string;
  author?: Partial<Profile>;
}

export interface AuditLog {
  id: string;
  actor_id?: string | null;
  action: AuditAction;
  target_type?: string | null;
  target_id?: string | null;
  details?: Record<string, any>;
  ip_address?: string | null;
  created_at: string;
}

export interface SiteSetting {
  key: string;
  value: any;
  description?: string | null;
  updated_by?: string | null;
  updated_at: string;
}

export interface Faq {
  id: string;
  category: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  is_chatbot_knowledge: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface HomepageSection {
  id: string;
  section_key: string;
  title?: string | null;
  subtitle?: string | null;
  content: Record<string, any>;
  is_active: boolean;
  sort_order: number;
  updated_by?: string | null;
  updated_at: string;
}

export interface ListingPlan {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  duration_days: number;
  max_images: number;
  is_featured: boolean;
  features: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface ChatbotSession {
  id: string;
  user_id?: string | null;
  session_token: string;
  messages: Array<{
    role: 'user' | 'model';
    content: string;
    timestamp?: string;
  }>;
  created_at: string;
  updated_at: string;
  last_message_at?: string | null;
}

export interface PropertyDraft {
  id: string;
  user_id: string;
  data: Record<string, any>;
  current_step: number;
  created_at: string;
  updated_at: string;
}

// ================================================
// API & REQUEST TYPES
// ================================================

export interface AuthenticatedUser extends Profile {
  auth_user_id?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export interface PropertySearchParams {
  intent?: ListingIntent;
  category?: PropertyCategory;
  property_type?: PropertyType;
  state_id?: number;
  city_id?: number;
  locality_id?: number;
  min_price?: number;
  max_price?: number;
  min_area?: number;
  max_area?: number;
  area_unit?: AreaUnit;
  is_verified?: boolean;
  is_featured?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'created_at_desc' | 'created_at_asc' | 'popular';
  q?: string;
  page?: number;
  limit?: number;
  status?: PropertyStatus;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}
