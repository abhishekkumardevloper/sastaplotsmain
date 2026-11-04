import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin, supabaseClient, logAudit } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';
import { validateBody } from '../middleware/validate';
import { AuthenticatedRequest, UserRole } from '../types';

const router = Router();

// Validation Schemas
const registerSchema = z.object({
  email: z.string().email('Valid email address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters long'),
  phone: z.string().optional(),
  role: z.enum(['buyer', 'owner', 'agent']).optional().default('buyer'),
  seller_category: z.enum(['owner', 'agent', 'builder', 'developer']).optional(),
  company_name: z.string().optional(),
  rera_number: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Valid email address is required'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Valid email address is required'),
});

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'New password must be at least 6 characters long'),
  token: z.string().optional(),
});

const updateProfileSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional().nullable(),
  about: z.string().max(1000).optional().nullable(),
  website: z.string().url().optional().nullable(),
  company_name: z.string().optional().nullable(),
  rera_number: z.string().optional().nullable(),
  seller_category: z.enum(['owner', 'agent', 'builder', 'developer']).optional().nullable(),
});

const bootstrapSchema = z.object({
  secret: z.string().min(1, 'Bootstrap secret is required'),
  email: z.string().email('Valid email address is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().min(2, 'Name is required'),
  phone: z.string().optional(),
});

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  authLimiter,
  validateBody(registerSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, full_name, phone, role, seller_category, company_name, rera_number } =
        req.body;

      // 1. Create user in Supabase Auth via Admin Client
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // auto-confirm for immediate login
        user_metadata: {
          full_name,
        },
      });

      if (authError || !authData.user) {
        res.status(400).json({
          success: false,
          error: authError?.message || 'Failed to create user account.',
        });
        return;
      }

      const userId = authData.user.id;

      // 2. Ensure profile exists and has the requested role and details
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert(
          {
            id: userId,
            email,
            full_name,
            phone: phone || null,
            role: role as UserRole,
            seller_category: seller_category || (role === 'owner' ? 'owner' : role === 'agent' ? 'agent' : null),
            company_name: company_name || null,
            rera_number: rera_number || null,
            is_active: true,
            is_email_verified: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
        .select('*')
        .single();

      if (profileError) {
        console.error('Error creating profile record:', profileError);
      }

      // 3. Automatically sign in or generate session
      const { data: sessionData, error: sessionError } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        data: {
          user: profile || { id: userId, email, full_name, role },
          session: sessionData?.session || null,
        },
      });
    } catch (error: any) {
      console.error('Registration exception:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'An unexpected error occurred during registration.',
      });
    }
  }
);

/**
 * POST /api/auth/login
 * User login
 */
router.post(
  '/login',
  authLimiter,
  validateBody(loginSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Authenticate with Supabase
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user || !data.session) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password.',
        });
        return;
      }

      // Fetch user profile from DB
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        res.status(404).json({
          success: false,
          error: 'User profile not found.',
        });
        return;
      }

      if (!profile.is_active) {
        res.status(403).json({
          success: false,
          error: 'Your account is deactivated. Please contact support.',
        });
        return;
      }

      // Update last_login_at
      await supabaseAdmin
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', profile.id);

      res.json({
        success: true,
        message: 'Login successful.',
        data: {
          user: profile,
          session: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
          },
        },
      });
    } catch (error: any) {
      console.error('Login exception:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error during login.',
      });
    }
  }
);

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
router.post(
  '/forgot-password',
  authLimiter,
  validateBody(forgotPasswordSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${frontendUrl}/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error.message);
      }

      // Always return 200 to prevent user enumeration
      res.json({
        success: true,
        message: 'If an account with that email exists, password reset instructions have been sent.',
      });
    } catch (error: any) {
      console.error('Forgot password exception:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process password reset request.',
      });
    }
  }
);

/**
 * POST /api/auth/reset-password
 * Reset user password (with session or token)
 */
router.post(
  '/reset-password',
  authLimiter,
  validateBody(resetPasswordSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { password } = req.body;
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          error: 'Bearer token required to reset password.',
        });
        return;
      }

      const token = authHeader.split(' ')[1];
      const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);

      if (authError || !authData.user) {
        res.status(401).json({
          success: false,
          error: 'Invalid or expired reset token.',
        });
        return;
      }

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authData.user.id, {
        password,
      });

      if (updateError) {
        res.status(400).json({
          success: false,
          error: updateError.message,
        });
        return;
      }

      res.json({
        success: true,
        message: 'Password has been reset successfully.',
      });
    } catch (error: any) {
      console.error('Reset password exception:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reset password.',
      });
    }
  }
);

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 */
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.json({
    success: true,
    data: req.user,
  });
});

/**
 * PUT /api/auth/profile
 * Update current authenticated user profile
 */
router.put(
  '/profile',
  requireAuth,
  validateBody(updateProfileSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const updateData = req.body;

      const { data: updatedProfile, error } = await supabaseAdmin
        .from('profiles')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select('*')
        .single();

      if (error) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.json({
        success: true,
        message: 'Profile updated successfully.',
        data: updatedProfile,
      });
    } catch (error: any) {
      console.error('Update profile exception:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile.',
      });
    }
  }
);

/**
 * POST /api/auth/admin/bootstrap
 * Secure one-time creation of the initial super_admin account
 * Only works if:
 * 1. ADMIN_BOOTSTRAP_SECRET matches environment variable
 * 2. No admin or super_admin exists in profiles
 */
router.post(
  '/admin/bootstrap',
  authLimiter,
  validateBody(bootstrapSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { secret, email, password, name, phone } = req.body;
      const envSecret = process.env.ADMIN_BOOTSTRAP_SECRET;

      if (!envSecret || envSecret.trim() === '') {
        res.status(500).json({
          success: false,
          error: 'ADMIN_BOOTSTRAP_SECRET is not configured on the server.',
        });
        return;
      }

      if (secret !== envSecret) {
        res.status(403).json({
          success: false,
          error: 'Invalid bootstrap secret.',
        });
        return;
      }

      // Check if an admin or super_admin already exists
      const { data: existingAdmins, error: checkError } = await supabaseAdmin
        .from('profiles')
        .select('id, email, role')
        .in('role', ['admin', 'super_admin'])
        .limit(1);

      if (checkError) {
        res.status(500).json({
          success: false,
          error: `Database check failed: ${checkError.message}`,
        });
        return;
      }

      if (existingAdmins && existingAdmins.length > 0) {
        res.status(403).json({
          success: false,
          error: 'An administrator account already exists. Bootstrap endpoint is disabled.',
        });
        return;
      }

      // Create super_admin user in Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: name,
        },
      });

      if (authError || !authData.user) {
        res.status(400).json({
          success: false,
          error: authError?.message || 'Failed to create admin auth user.',
        });
        return;
      }

      const adminUserId = authData.user.id;

      // Upsert profile as super_admin
      const { data: adminProfile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert(
          {
            id: adminUserId,
            email,
            full_name: name,
            phone: phone || null,
            role: 'super_admin' as UserRole,
            is_active: true,
            is_email_verified: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
        .select('*')
        .single();

      if (profileError) {
        res.status(500).json({
          success: false,
          error: `Failed to set super_admin profile: ${profileError.message}`,
        });
        return;
      }

      // Record audit log
      await logAudit({
        actorId: adminUserId,
        action: 'admin_login',
        targetType: 'bootstrap',
        targetId: adminUserId,
        details: { email, role: 'super_admin' },
        ipAddress: req.ip || undefined,
      });

      res.status(201).json({
        success: true,
        message: 'Initial super_admin account created successfully.',
        data: adminProfile,
      });
    } catch (error: any) {
      console.error('Bootstrap admin exception:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to bootstrap admin.',
      });
    }
  }
);

export default router;
