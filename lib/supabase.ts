import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  ''

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  ''

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  supabaseAnonKey ||
  ''

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('mock-sastaplots') &&
  !supabaseUrl.includes('placeholder') &&
  supabaseUrl.startsWith('http')
)

// Fallback dummy to prevent crash on module load if unset
const safeUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co'
const safeAnonKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key'
const safeServiceKey = isSupabaseConfigured ? supabaseServiceKey : 'placeholder-service-key'

export const supabase: SupabaseClient = createClient(safeUrl, safeAnonKey, {
  auth: {
    persistSession: typeof window !== 'undefined',
    autoRefreshToken: typeof window !== 'undefined',
    detectSessionInUrl: typeof window !== 'undefined',
  },
})

export const supabaseAdmin: SupabaseClient = createClient(safeUrl, safeServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

export default supabase
