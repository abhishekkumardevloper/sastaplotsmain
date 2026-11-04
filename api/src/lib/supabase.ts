import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { AuditAction } from '../types';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl) {
  console.warn('⚠️ WARNING: SUPABASE_URL (or VITE_SUPABASE_URL) is not set in environment variables.');
}

if (!supabaseAnonKey) {
  console.warn('⚠️ WARNING: SUPABASE_ANON_KEY (or VITE_SUPABASE_ANON_KEY) is not set in environment variables.');
}

if (!supabaseServiceRoleKey) {
  console.warn('⚠️ WARNING: SUPABASE_SERVICE_ROLE_KEY is not set in environment variables. Admin operations will fail.');
}

// Fallback dummy URL to prevent createClient from throwing instantly at module load if env vars are unset
const validUrl = supabaseUrl && supabaseUrl.startsWith('http') ? supabaseUrl : 'https://placeholder.supabase.co';
const validAnonKey = supabaseAnonKey || 'placeholder-anon-key';
const validServiceKey = supabaseServiceRoleKey || 'placeholder-service-key';

/**
 * Public/Anon client for general operations adhering to RLS
 */
export const supabaseClient: SupabaseClient = createClient(validUrl, validAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Service role client with admin privileges, bypassing RLS
 * Used for server-side verification, moderation, notifications, and direct DB operations
 */
export const supabaseAdmin: SupabaseClient = createClient(validUrl, validServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Helper to get a Supabase client authenticated on behalf of a specific user token
 */
export function createAuthenticatedClient(accessToken: string): SupabaseClient {
  return createClient(validUrl, validAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

/**
 * Helper function to record audit logs in the database
 */
export async function logAudit(params: {
  actorId?: string | null;
  action: AuditAction;
  targetType?: string;
  targetId?: string | string[] | null;
  details?: Record<string, any>;
  ipAddress?: string | string[] | null;
}): Promise<void> {
  try {
    const ip = Array.isArray(params.ipAddress)
      ? params.ipAddress[0]
      : params.ipAddress || null;
    const targetId = Array.isArray(params.targetId)
      ? params.targetId[0]
      : params.targetId || null;

    const { error } = await supabaseAdmin.from('audit_logs').insert({
      actor_id: params.actorId || null,
      action: params.action,
      target_type: params.targetType || null,
      target_id: targetId,
      details: params.details || {},
      ip_address: ip,
    });

    if (error) {
      console.error('Failed to write audit log:', error.message);
    }
  } catch (err) {
    console.error('Audit log exception:', err);
  }
}
