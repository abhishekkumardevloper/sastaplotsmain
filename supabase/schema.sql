-- ==============================================================================
-- SASTA PLOTS — COMPLETE PRODUCTION SUPABASE DATABASE SCHEMA & SEED DATA
-- ==============================================================================
-- INSTRUCTIONS FOR DEPLOYMENT ON SUPABASE:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project (or create a new free project)
-- 3. In the left navigation, click "SQL Editor"
-- 4. Click "New Query"
-- 5. Copy and paste the entire contents of this file into the editor
-- 6. Click "Run" (or Ctrl+Enter / Cmd+Enter)
-- 7. All tables, types, triggers, storage buckets, RLS policies, and seed data will be created!
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. CUSTOM ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('guest', 'buyer', 'owner', 'agent', 'admin', 'super_admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE property_status AS ENUM ('draft', 'pending_review', 'needs_changes', 'approved', 'rejected', 'suspended', 'archived', 'sold', 'rented');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE listing_intent AS ENUM ('sell', 'rent');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE property_category AS ENUM ('residential_plot', 'agricultural_land', 'commercial', 'residential', 'industrial', 'institutional');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE property_type AS ENUM (
    'plot', 'flat', 'house', 'villa', 'penthouse', 'studio',
    'shop', 'office', 'showroom', 'warehouse', 'factory',
    'farm_land', 'agricultural_plot', 'orchard',
    'industrial_land', 'institutional_land', 'mixed_use'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE area_unit AS ENUM ('sqft', 'sqyd', 'sqm', 'acre', 'hectare', 'bigha', 'marla', 'kanal', 'guntha', 'ground');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE seller_category AS ENUM ('owner', 'agent', 'builder', 'developer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE enquiry_status AS ENUM ('new', 'read', 'responded', 'closed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'property_submitted', 'property_approved', 'property_rejected',
    'property_needs_changes', 'property_suspended', 'enquiry_received',
    'enquiry_responded', 'listing_expiring', 'account_verified', 'general'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE audit_action AS ENUM (
    'property_approve', 'property_reject', 'property_suspend', 'property_restore',
    'property_delete', 'user_suspend', 'user_activate', 'user_role_change',
    'settings_update', 'content_update', 'faq_update', 'admin_login'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE facing_direction AS ENUM ('north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE road_access AS ENUM ('pucca', 'kachha', 'both', 'none');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE ownership_type AS ENUM ('freehold', 'leasehold', 'cooperative', 'power_of_attorney', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==============================================================================
-- 3. TABLES
-- ==============================================================================

-- Profiles (mirrors Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  role user_role DEFAULT 'buyer' NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  is_email_verified BOOLEAN DEFAULT FALSE NOT NULL,
  seller_category seller_category,
  about TEXT,
  website TEXT,
  verification_status verification_status DEFAULT 'unverified',
  verification_notes TEXT,
  rera_number TEXT,
  company_name TEXT,
  last_login_at TIMESTAMPTZ,
  deactivated_at TIMESTAMPTZ,
  deactivation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Locations: States
CREATE TABLE IF NOT EXISTS public.states (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations: Cities
CREATE TABLE IF NOT EXISTS public.cities (
  id SERIAL PRIMARY KEY,
  state_id INT REFERENCES public.states(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(state_id, name)
);

-- Locations: Localities
CREATE TABLE IF NOT EXISTS public.localities (
  id SERIAL PRIMARY KEY,
  city_id INT REFERENCES public.cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pin_code TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Categories
CREATE TABLE IF NOT EXISTS public.property_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Basic Info
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  listing_intent listing_intent NOT NULL DEFAULT 'sell',
  category property_category NOT NULL,
  property_type property_type NOT NULL,
  
  -- Price
  price NUMERIC(15,2) NOT NULL,
  price_negotiable BOOLEAN DEFAULT FALSE,
  price_per_unit NUMERIC(15,2),
  
  -- Area
  area NUMERIC(15,4) NOT NULL,
  area_unit area_unit NOT NULL,
  length NUMERIC(10,2),
  breadth NUMERIC(10,2),
  
  -- Location
  state_id INT REFERENCES public.states(id),
  city_id INT REFERENCES public.cities(id),
  locality_id INT REFERENCES public.localities(id),
  address TEXT,
  pin_code TEXT,
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  
  -- Features
  road_width NUMERIC(6,2),
  road_access road_access,
  facing_direction facing_direction,
  ownership_type ownership_type,
  is_corner_plot BOOLEAN DEFAULT FALSE,
  is_on_main_road BOOLEAN DEFAULT FALSE,
  nearby_landmarks TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  
  -- Seller Info
  seller_name TEXT,
  seller_phone TEXT,
  seller_email TEXT,
  seller_category seller_category,
  
  -- Moderation & Review
  status property_status DEFAULT 'pending_review' NOT NULL,
  rejection_reason TEXT,
  admin_notes TEXT,
  moderation_feedback TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  
  -- Flags
  is_featured BOOLEAN DEFAULT FALSE,
  is_admin_managed BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  featured_until TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  sold_at TIMESTAMPTZ,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Metrics
  view_count INT DEFAULT 0,
  enquiry_count INT DEFAULT 0,
  favourite_count INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  published_at TIMESTAMPTZ
);

-- Property Images
CREATE TABLE IF NOT EXISTS public.property_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  is_cover BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  alt_text TEXT,
  size_bytes BIGINT,
  width INT,
  height INT,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Documents (private/verification)
CREATE TABLE IF NOT EXISTS public.property_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  document_type TEXT,
  size_bytes BIGINT,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Status History
CREATE TABLE IF NOT EXISTS public.property_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  old_status property_status,
  new_status property_status NOT NULL,
  changed_by UUID REFERENCES public.profiles(id),
  reason TEXT,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enquiries
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  property_owner_id UUID REFERENCES public.profiles(id),
  
  buyer_id UUID REFERENCES public.profiles(id),
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  message TEXT,
  
  status enquiry_status DEFAULT 'new',
  response TEXT,
  responded_by UUID REFERENCES public.profiles(id),
  responded_at TIMESTAMPTZ,
  
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favourites
CREATE TABLE IF NOT EXISTS public.favourites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Saved Searches
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  alert_enabled BOOLEAN DEFAULT FALSE,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports / Flags
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES public.profiles(id),
  reason TEXT NOT NULL,
  details TEXT,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  resolution_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Notes
CREATE TABLE IF NOT EXISTS public.admin_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id),
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES public.profiles(id),
  action audit_action NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Site Settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAQs
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_chatbot_knowledge BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Homepage Sections
CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key TEXT UNIQUE NOT NULL,
  title TEXT,
  subtitle TEXT,
  content JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listing Plans
CREATE TABLE IF NOT EXISTS public.listing_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC(10,2) DEFAULT 0,
  duration_days INT DEFAULT 30,
  max_images INT DEFAULT 10,
  is_featured BOOLEAN DEFAULT FALSE,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chatbot Sessions
CREATE TABLE IF NOT EXISTS public.chatbot_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  session_token TEXT UNIQUE NOT NULL,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ
);

-- Property Drafts
CREATE TABLE IF NOT EXISTS public.property_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  current_step INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. STORAGE BUCKETS CONFIGURATION
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('property-images', 'property-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('property-documents', 'property-documents', false, 26214400, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ==============================================================================
-- 5. TRIGGERS & FUNCTIONS
-- ==============================================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_enquiries_updated_at ON public.enquiries;
CREATE TRIGGER update_enquiries_updated_at BEFORE UPDATE ON public.enquiries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_faqs_updated_at ON public.faqs;
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_chatbot_sessions_updated_at ON public.chatbot_sessions;
CREATE TRIGGER update_chatbot_sessions_updated_at BEFORE UPDATE ON public.chatbot_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_property_drafts_updated_at ON public.property_drafts;
CREATE TRIGGER update_property_drafts_updated_at BEFORE UPDATE ON public.property_drafts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto create profile on auth.users registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, 'user'), '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'buyer')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = '' THEN EXCLUDED.full_name ELSE public.profiles.full_name END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto set published_at when property approved
CREATE OR REPLACE FUNCTION public.handle_property_approved()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_property_approved ON public.properties;
CREATE TRIGGER on_property_approved
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.handle_property_approved();

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favourites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.localities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_plans ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Properties Policies
DROP POLICY IF EXISTS "Public can view approved properties" ON public.properties;
CREATE POLICY "Public can view approved properties" ON public.properties FOR SELECT
  USING (status = 'approved' OR owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners can insert properties" ON public.properties;
CREATE POLICY "Owners can insert properties" ON public.properties FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update own pending properties" ON public.properties;
CREATE POLICY "Owners can update own pending properties" ON public.properties FOR UPDATE
  USING (auth.uid() = owner_id AND status IN ('draft', 'needs_changes', 'pending_review'));

DROP POLICY IF EXISTS "Owners can delete own draft properties" ON public.properties;
CREATE POLICY "Owners can delete own draft properties" ON public.properties FOR DELETE
  USING (auth.uid() = owner_id AND status IN ('draft', 'needs_changes'));

-- Property Images Policies
DROP POLICY IF EXISTS "Property images follow property access" ON public.property_images;
CREATE POLICY "Property images follow property access" ON public.property_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p WHERE p.id = property_id
      AND (p.status = 'approved' OR p.owner_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Owners can manage own property images" ON public.property_images;
CREATE POLICY "Owners can manage own property images" ON public.property_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.owner_id = auth.uid())
  );

-- Property Documents Policies
DROP POLICY IF EXISTS "Owners can view own documents" ON public.property_documents;
CREATE POLICY "Owners can view own documents" ON public.property_documents FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.owner_id = auth.uid())
  );

-- Enquiries Policies
DROP POLICY IF EXISTS "Buyers and sellers see own enquiries" ON public.enquiries;
CREATE POLICY "Buyers and sellers see own enquiries" ON public.enquiries FOR SELECT
  USING (buyer_id = auth.uid() OR property_owner_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can create enquiry" ON public.enquiries;
CREATE POLICY "Anyone can create enquiry" ON public.enquiries FOR INSERT WITH CHECK (true);

-- Favourites Policies
DROP POLICY IF EXISTS "Users manage own favourites" ON public.favourites;
CREATE POLICY "Users manage own favourites" ON public.favourites FOR ALL USING (user_id = auth.uid());

-- Saved Searches Policies
DROP POLICY IF EXISTS "Users manage own saved searches" ON public.saved_searches;
CREATE POLICY "Users manage own saved searches" ON public.saved_searches FOR ALL USING (user_id = auth.uid());

-- Notifications Policies
DROP POLICY IF EXISTS "Users see own notifications" ON public.notifications;
CREATE POLICY "Users see own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can mark own notifications read" ON public.notifications;
CREATE POLICY "Users can mark own notifications read" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Reports Policies
DROP POLICY IF EXISTS "Authenticated users can create reports" ON public.reports;
CREATE POLICY "Authenticated users can create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Property Status History Policies
DROP POLICY IF EXISTS "Owners see own property history" ON public.property_status_history;
CREATE POLICY "Owners see own property history" ON public.property_status_history FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.owner_id = auth.uid())
  );

-- Admin Notes (Internal Only)
DROP POLICY IF EXISTS "Admin notes restricted" ON public.admin_notes;
CREATE POLICY "Admin notes restricted" ON public.admin_notes FOR SELECT USING (false);

-- Property Drafts Policies
DROP POLICY IF EXISTS "Users manage own drafts" ON public.property_drafts;
CREATE POLICY "Users manage own drafts" ON public.property_drafts FOR ALL USING (user_id = auth.uid());

-- Chatbot Sessions Policies
DROP POLICY IF EXISTS "Users manage own chatbot sessions" ON public.chatbot_sessions;
CREATE POLICY "Users manage own chatbot sessions" ON public.chatbot_sessions FOR ALL
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Public Directory Tables Policies (States, Cities, Localities, Categories, FAQs, Settings, Plans)
DROP POLICY IF EXISTS "Public read access to states" ON public.states;
CREATE POLICY "Public read access to states" ON public.states FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access to cities" ON public.cities;
CREATE POLICY "Public read access to cities" ON public.cities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access to localities" ON public.localities;
CREATE POLICY "Public read access to localities" ON public.localities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access to property_categories" ON public.property_categories;
CREATE POLICY "Public read access to property_categories" ON public.property_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access to site_settings" ON public.site_settings;
CREATE POLICY "Public read access to site_settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access to faqs" ON public.faqs;
CREATE POLICY "Public read access to faqs" ON public.faqs FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read access to homepage_sections" ON public.homepage_sections;
CREATE POLICY "Public read access to homepage_sections" ON public.homepage_sections FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read access to listing_plans" ON public.listing_plans;
CREATE POLICY "Public read access to listing_plans" ON public.listing_plans FOR SELECT USING (is_active = true);

-- Storage Objects Policies
DROP POLICY IF EXISTS "Public Access to Property Images" ON storage.objects;
CREATE POLICY "Public Access to Property Images" ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
CREATE POLICY "Authenticated users can upload property images" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Users can update and delete their own images" ON storage.objects;
CREATE POLICY "Users can update and delete their own images" ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Authenticated users can upload property documents" ON storage.objects;
CREATE POLICY "Authenticated users can upload property documents" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'property-documents');

DROP POLICY IF EXISTS "Owners can view their property documents" ON storage.objects;
CREATE POLICY "Owners can view their property documents" ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'property-documents');

-- ==============================================================================
-- 7. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS properties_search_idx ON public.properties USING GIN(to_tsvector('english', title || ' ' || description));
CREATE INDEX IF NOT EXISTS properties_status_idx ON public.properties(status);
CREATE INDEX IF NOT EXISTS properties_owner_idx ON public.properties(owner_id);
CREATE INDEX IF NOT EXISTS properties_category_idx ON public.properties(category);
CREATE INDEX IF NOT EXISTS properties_city_idx ON public.properties(city_id);
CREATE INDEX IF NOT EXISTS properties_state_idx ON public.properties(state_id);
CREATE INDEX IF NOT EXISTS properties_price_idx ON public.properties(price);
CREATE INDEX IF NOT EXISTS properties_created_idx ON public.properties(created_at DESC);
CREATE INDEX IF NOT EXISTS properties_featured_idx ON public.properties(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS properties_slug_idx ON public.properties(slug);

CREATE INDEX IF NOT EXISTS property_images_property_idx ON public.property_images(property_id);
CREATE INDEX IF NOT EXISTS property_images_cover_idx ON public.property_images(property_id, is_cover);
CREATE INDEX IF NOT EXISTS property_status_history_property_idx ON public.property_status_history(property_id);

CREATE INDEX IF NOT EXISTS enquiries_property_idx ON public.enquiries(property_id);
CREATE INDEX IF NOT EXISTS enquiries_owner_idx ON public.enquiries(property_owner_id);
CREATE INDEX IF NOT EXISTS enquiries_buyer_idx ON public.enquiries(buyer_id);
CREATE INDEX IF NOT EXISTS enquiries_status_idx ON public.enquiries(status);

CREATE INDEX IF NOT EXISTS favourites_user_idx ON public.favourites(user_id);
CREATE INDEX IF NOT EXISTS favourites_property_idx ON public.favourites(property_id);

CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_unread_idx ON public.notifications(user_id, is_read) WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS reports_property_idx ON public.reports(property_id);
CREATE INDEX IF NOT EXISTS reports_unresolved_idx ON public.reports(is_resolved) WHERE is_resolved = FALSE;

CREATE INDEX IF NOT EXISTS audit_logs_actor_idx ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON public.audit_logs(created_at DESC);

-- ==============================================================================
-- 8. COMPREHENSIVE SEED DATA
-- ==============================================================================

-- States
INSERT INTO public.states (name, code, is_active, sort_order) VALUES
('Andhra Pradesh', 'AP', TRUE, 1),
('Assam', 'AS', TRUE, 2),
('Bihar', 'BR', TRUE, 3),
('Chhattisgarh', 'CG', TRUE, 4),
('Delhi', 'DL', TRUE, 5),
('Goa', 'GA', TRUE, 6),
('Gujarat', 'GJ', TRUE, 7),
('Haryana', 'HR', TRUE, 8),
('Himachal Pradesh', 'HP', TRUE, 9),
('Jharkhand', 'JH', TRUE, 10),
('Karnataka', 'KA', TRUE, 11),
('Kerala', 'KL', TRUE, 12),
('Madhya Pradesh', 'MP', TRUE, 13),
('Maharashtra', 'MH', TRUE, 14),
('Manipur', 'MN', TRUE, 15),
('Meghalaya', 'ML', TRUE, 16),
('Mizoram', 'MZ', TRUE, 17),
('Nagaland', 'NL', TRUE, 18),
('Odisha', 'OD', TRUE, 19),
('Punjab', 'PB', TRUE, 20),
('Rajasthan', 'RJ', TRUE, 21),
('Sikkim', 'SK', TRUE, 22),
('Tamil Nadu', 'TN', TRUE, 23),
('Telangana', 'TG', TRUE, 24),
('Tripura', 'TR', TRUE, 25),
('Uttar Pradesh', 'UP', TRUE, 26),
('Uttarakhand', 'UK', TRUE, 27),
('West Bengal', 'WB', TRUE, 28),
('Jammu and Kashmir', 'JK', TRUE, 29),
('Ladakh', 'LA', TRUE, 30),
('Chandigarh', 'CH', TRUE, 31),
('Puducherry', 'PY', TRUE, 32)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;

-- Cities
INSERT INTO public.cities (state_id, name, is_popular, is_active, sort_order)
SELECT s.id, c.name, c.is_popular, TRUE, c.sort_order
FROM public.states s
JOIN (VALUES
  ('Delhi', 'Delhi', TRUE, 1),
  ('Delhi', 'New Delhi', FALSE, 2),
  ('Maharashtra', 'Mumbai', TRUE, 1),
  ('Maharashtra', 'Pune', TRUE, 2),
  ('Maharashtra', 'Nagpur', FALSE, 3),
  ('Maharashtra', 'Nashik', FALSE, 4),
  ('Karnataka', 'Bengaluru', TRUE, 1),
  ('Karnataka', 'Mysuru', FALSE, 2),
  ('Tamil Nadu', 'Chennai', TRUE, 1),
  ('Tamil Nadu', 'Coimbatore', FALSE, 2),
  ('Telangana', 'Hyderabad', TRUE, 1),
  ('Rajasthan', 'Jaipur', TRUE, 1),
  ('Rajasthan', 'Jodhpur', FALSE, 2),
  ('Rajasthan', 'Udaipur', FALSE, 3),
  ('Gujarat', 'Ahmedabad', TRUE, 1),
  ('Gujarat', 'Surat', FALSE, 2),
  ('Gujarat', 'Vadodara', FALSE, 3),
  ('Uttar Pradesh', 'Lucknow', TRUE, 1),
  ('Uttar Pradesh', 'Noida', TRUE, 2),
  ('Uttar Pradesh', 'Greater Noida', TRUE, 3),
  ('Uttar Pradesh', 'Agra', FALSE, 4),
  ('Uttar Pradesh', 'Kanpur', FALSE, 5),
  ('Uttar Pradesh', 'Varanasi', FALSE, 6),
  ('Haryana', 'Gurgaon', TRUE, 1),
  ('Haryana', 'Faridabad', FALSE, 2),
  ('Haryana', 'Panipat', FALSE, 3),
  ('West Bengal', 'Kolkata', TRUE, 1),
  ('Punjab', 'Amritsar', FALSE, 1),
  ('Punjab', 'Ludhiana', FALSE, 2),
  ('Madhya Pradesh', 'Bhopal', FALSE, 1),
  ('Madhya Pradesh', 'Indore', FALSE, 2),
  ('Kerala', 'Kochi', FALSE, 1),
  ('Kerala', 'Thiruvananthapuram', FALSE, 2)
) AS c(state_name, name, is_popular, sort_order)
ON s.name = c.state_name
ON CONFLICT (state_id, name) DO NOTHING;

-- Property Categories
INSERT INTO public.property_categories (name, slug, description, icon, is_active, sort_order) VALUES
('Residential Plots', 'residential_plot', 'Gated societies, villa plots, and individual residential parcels', 'Home', TRUE, 1),
('Commercial Land', 'commercial', 'Commercial plots for shops, complexes, and high-street retail', 'Building2', TRUE, 2),
('Agricultural Land', 'agricultural_land', 'Fertile farmlands, organic farm parcels, and orchard land', 'Trees', TRUE, 3),
('Industrial Land', 'industrial', 'MIDC, UPSIDC, and industrial park plots for factories and warehouses', 'Factory', TRUE, 4),
('Institutional Land', 'institutional', 'Land approved for schools, hospitals, and educational institutions', 'Landmark', TRUE, 5)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Listing Plans
INSERT INTO public.listing_plans (name, slug, description, price, duration_days, max_images, is_featured, features, is_active, sort_order) VALUES
('Free Basic', 'free', 'List your property for free with standard visibility', 0, 30, 5, FALSE, '["5 property photos", "30 days live visibility", "Direct buyer enquiries", "Basic support"]', TRUE, 1),
('Standard Plan', 'standard', 'Enhanced visibility with priority placement in search results', 499, 60, 15, FALSE, '["15 property photos", "60 days live visibility", "Priority in city search", "Verified seller badge", "Email instant alerts"]', TRUE, 2),
('Featured Spotlight', 'featured', 'Maximum exposure across homepage and category banners', 999, 90, 20, TRUE, '["20 HD photos & docs", "90 days live visibility", "Featured homepage badge", "Top rank in all searches", "Direct WhatsApp enquiries", "Dedicated account support"]', TRUE, 3)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, features = EXCLUDED.features;

-- FAQs
INSERT INTO public.faqs (category, question, answer, sort_order, is_active, is_chatbot_knowledge) VALUES
('listing', 'How do I post a plot or property on Sasta Plots?', 'Click "Post Property" in the top navigation, complete the 7 simple steps (Basic Info, Location, Pricing, Area & Dimensions, Features, Photos, and Seller Verification), and submit. Our moderation team reviews all listings within 24 hours.', 1, TRUE, TRUE),
('listing', 'How long does admin approval take?', 'Our admin verification team reviews submissions within 24 to 48 hours on business days. You will receive an instant email and dashboard notification as soon as your listing is approved or if any adjustments are needed.', 2, TRUE, TRUE),
('listing', 'Why was my listing requested for changes or rejected?', 'Listings may need changes if photos are blurry, location address is ambiguous, documents are missing, or pricing seems inaccurate. You will receive specific notes in your dashboard to update and resubmit effortlessly.', 3, TRUE, TRUE),
('buying', 'How do I contact sellers or schedule a site visit?', 'Open any property listing and use the "Send Enquiry" or "Call Seller" button. Registered buyers can connect directly with genuine owners and verified agents.', 1, TRUE, TRUE),
('buying', 'Are property listings on Sasta Plots verified?', 'Yes! Every property undergoes an administrative review before being published. Look for the "Admin Approved" and "Document Verified" badges on property cards for extra peace of mind.', 2, TRUE, TRUE),
('account', 'Is listing a property on Sasta Plots free?', 'Yes! Our Free Basic plan allows every individual owner to post their property at zero cost. We also offer optional featured plans for agents and builders who want higher exposure.', 1, TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- Site Settings
INSERT INTO public.site_settings (key, value, description) VALUES
('brand', '{"name": "Sasta Plots", "tagline": "Your Dream Property. Your Smart Investment.", "logo_url": "/assets/logo.png", "contact_email": "contact@sastaplots.com", "contact_phone": "+91 98765 43210", "address": "New Delhi, India"}', 'Brand identity and contact details'),
('social', '{"facebook": "https://facebook.com", "twitter": "https://twitter.com", "instagram": "https://instagram.com", "youtube": "https://youtube.com", "whatsapp": "+919876543210"}', 'Official social media handles'),
('hero', '{"headline": "Find Your Perfect Plot. Build Your Future.", "subtext": "Explore verified plots, compare prime locations, connect with genuine sellers, and secure high-return land that fits your budget.", "background_image": "/assets/hero.png"}', 'Homepage hero banner configuration'),
('listings', '{"default_duration_days": 30, "max_images": 20, "max_image_size_mb": 10, "require_phone_verification": false, "auto_expire": true}', 'Global property listing parameters'),
('chatbot', '{"welcome_message": "Namaste! I am the Sasta Plots AI Assistant. I can help you find affordable plots, compare prime locations, calculate prices per sq. yard, or guide your listing submission. How can I assist you today?", "enabled": true}', 'Chatbot settings')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Seed Sample Approved Properties for Immediate Display
DO $$
DECLARE
  v_delhi_state_id INT;
  v_delhi_city_id INT;
  v_haryana_state_id INT;
  v_gurgaon_city_id INT;
  v_karnataka_state_id INT;
  v_bengaluru_city_id INT;
  v_maharashtra_state_id INT;
  v_pune_city_id INT;
  v_prop_id UUID;
BEGIN
  SELECT id INTO v_delhi_state_id FROM public.states WHERE code = 'DL' LIMIT 1;
  SELECT id INTO v_delhi_city_id FROM public.cities WHERE name = 'Delhi' AND state_id = v_delhi_state_id LIMIT 1;
  SELECT id INTO v_haryana_state_id FROM public.states WHERE code = 'HR' LIMIT 1;
  SELECT id INTO v_gurgaon_city_id FROM public.cities WHERE name = 'Gurgaon' AND state_id = v_haryana_state_id LIMIT 1;
  SELECT id INTO v_karnataka_state_id FROM public.states WHERE code = 'KA' LIMIT 1;
  SELECT id INTO v_bengaluru_city_id FROM public.cities WHERE name = 'Bengaluru' AND state_id = v_karnataka_state_id LIMIT 1;
  SELECT id INTO v_maharashtra_state_id FROM public.states WHERE code = 'MH' LIMIT 1;
  SELECT id INTO v_pune_city_id FROM public.cities WHERE name = 'Pune' AND state_id = v_maharashtra_state_id LIMIT 1;

  -- 1. Gurgaon Commercial Plot
  INSERT INTO public.properties (
    id, slug, title, description, listing_intent, category, property_type,
    price, price_negotiable, price_per_unit, area, area_unit,
    state_id, city_id, address, pin_code, road_width, road_access,
    facing_direction, ownership_type, is_corner_plot, is_on_main_road,
    nearby_landmarks, amenities, seller_name, seller_phone, seller_email, seller_category,
    status, is_featured, is_verified, view_count, published_at
  ) VALUES (
    'a1111111-1111-1111-1111-111111111111',
    'prime-highway-commercial-plot-gurgaon',
    'Prime Highway Commercial Plot in Sector 65',
    'Exceptional commercial corner plot directly facing the 60m main sector road in Sector 65, Golf Course Extension Road corridor. Ideal for commercial showroom, corporate office, or high-street retail development. Fully clear title, freehold ownership with municipal approvals in place.',
    'sell', 'commercial', 'plot',
    45000000, true, 90000, 500, 'sqyd',
    v_haryana_state_id, v_gurgaon_city_id, 'Sector 65, Golf Course Extension Road', '122018', 60, 'pucca',
    'north', 'freehold', true, true,
    ARRAY['Metro Station (2km)', 'WorldMark Mall (1.5km)', 'Grand Hyatt (1km)'],
    ARRAY['Water Connection', 'Electricity Grid', 'Corner Plot', 'Gated Security', 'Main Road Facing'],
    'Rajesh Sharma', '+91 98111 22334', 'rajesh.sharma@example.com', 'agent',
    'approved', true, true, 342, NOW()
  ) ON CONFLICT (slug) DO NOTHING;

  INSERT INTO public.property_images (property_id, url, storage_path, is_cover, sort_order) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80', 'seed/gurgaon-1.jpg', true, 0),
  ('a1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80', 'seed/gurgaon-2.jpg', false, 1)
  ON CONFLICT DO NOTHING;

  -- 2. Bengaluru Villa Plot
  INSERT INTO public.properties (
    id, slug, title, description, listing_intent, category, property_type,
    price, price_negotiable, price_per_unit, area, area_unit,
    state_id, city_id, address, pin_code, road_width, road_access,
    facing_direction, ownership_type, is_corner_plot, is_on_main_road,
    nearby_landmarks, amenities, seller_name, seller_phone, seller_email, seller_category,
    status, is_featured, is_verified, view_count, published_at
  ) VALUES (
    'b2222222-2222-2222-2222-222222222222',
    'east-facing-residential-villa-plot-whitefield',
    'East Facing Residential Villa Plot in Gated Community',
    'BMRDA approved East facing residential plot in a premium gated layout in Whitefield. Features 40ft wide black top roads, underground cabling, 24/7 security, club house access, and borewell water. Perfect for constructing a custom luxury villa.',
    'sell', 'residential_plot', 'plot',
    11500000, false, 4791, 2400, 'sqft',
    v_karnataka_state_id, v_bengaluru_city_id, 'Near Hope Farm Junction, Whitefield', '560066', 40, 'pucca',
    'east', 'freehold', false, false,
    ARRAY['ITPB Tech Park (3km)', 'Columbia Asia Hospital (2.5km)', 'Whitefield Metro (1.8km)'],
    ARRAY['Gated Community', 'Clubhouse', 'Children Park', 'Underground Sewage', '24x7 Security'],
    'Kavita Reddy', '+91 97400 11223', 'kavita.reddy@example.com', 'owner',
    'approved', true, true, 512, NOW()
  ) ON CONFLICT (slug) DO NOTHING;

  INSERT INTO public.property_images (property_id, url, storage_path, is_cover, sort_order) VALUES
  ('b2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=80', 'seed/bengaluru-1.jpg', true, 0),
  ('b2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80', 'seed/bengaluru-2.jpg', false, 1)
  ON CONFLICT DO NOTHING;

  -- 3. Pune Agricultural Farmland
  INSERT INTO public.properties (
    id, slug, title, description, listing_intent, category, property_type,
    price, price_negotiable, price_per_unit, area, area_unit,
    state_id, city_id, address, pin_code, road_width, road_access,
    facing_direction, ownership_type, is_corner_plot, is_on_main_road,
    nearby_landmarks, amenities, seller_name, seller_phone, seller_email, seller_category,
    status, is_featured, is_verified, view_count, published_at
  ) VALUES (
    'c3333333-3333-3333-3333-333333333333',
    'fertile-agricultural-farmland-pune-highway',
    'Fertile Organic Agricultural Farmland on Pune-Nashik Highway',
    'Rich black cotton soil farmland with perennial water canal access and dedicated 3-phase electricity. Fully fenced perimeter with mature mango, guava, and teak plantations. Includes small caretaker farmhouse structure.',
    'sell', 'agricultural_land', 'farm_land',
    8500000, true, 2833333, 3, 'acre',
    v_maharashtra_state_id, v_pune_city_id, 'Near Chakan, Pune-Nashik Highway', '410501', 30, 'both',
    'northeast', 'freehold', true, true,
    ARRAY['Chakan MIDC (12km)', 'Indrayani River (1.2km)'],
    ARRAY['Perennial Water Source', 'Fencing Done', 'Electricity 3-Phase', 'Farmhouse Shed'],
    'Suresh Patil', '+91 98220 55667', 'suresh.patil@example.com', 'owner',
    'approved', true, true, 289, NOW()
  ) ON CONFLICT (slug) DO NOTHING;

  INSERT INTO public.property_images (property_id, url, storage_path, is_cover, sort_order) VALUES
  ('c3333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=1200&q=80', 'seed/pune-1.jpg', true, 0)
  ON CONFLICT DO NOTHING;

  -- 4. Delhi Corner Residential Plot
  INSERT INTO public.properties (
    id, slug, title, description, listing_intent, category, property_type,
    price, price_negotiable, price_per_unit, area, area_unit,
    state_id, city_id, address, pin_code, road_width, road_access,
    facing_direction, ownership_type, is_corner_plot, is_on_main_road,
    nearby_landmarks, amenities, seller_name, seller_phone, seller_email, seller_category,
    status, is_featured, is_verified, view_count, published_at
  ) VALUES (
    'd4444444-4444-4444-4444-444444444444',
    'corner-residential-plot-rohini-delhi',
    'DDA Approved Corner Residential Plot in Sector 24 Rohini',
    'Clear title freehold DDA approved residential corner plot located in Sector 24 Rohini. Both front and side roads are 18m wide. Ready for immediate G+3 construction. Immediate possession with water, electricity, and sewer lines already activated.',
    'sell', 'residential_plot', 'plot',
    19500000, true, 130000, 150, 'sqyd',
    v_delhi_state_id, v_delhi_city_id, 'Pocket 16, Sector 24 Rohini', '110085', 18, 'pucca',
    'northeast', 'freehold', true, false,
    ARRAY['Rithala Metro Station (3km)', 'City Centre Mall (2km)', 'Max Hospital (4km)'],
    ARRAY['DDA Approved', 'Corner Plot', 'Wide Frontage', 'Piped Gas Available', 'Park Facing'],
    'Anil Gupta', '+91 98100 44556', 'anil.gupta@example.com', 'builder',
    'approved', true, true, 678, NOW()
  ) ON CONFLICT (slug) DO NOTHING;

  INSERT INTO public.property_images (property_id, url, storage_path, is_cover, sort_order) VALUES
  ('d4444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80', 'seed/delhi-1.jpg', true, 0)
  ON CONFLICT DO NOTHING;

END $$;
