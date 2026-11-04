import { Router, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin, logAudit } from '../../lib/supabase';
import { requireAuth } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/admin';
import { validateBody, validateQuery } from '../../middleware/validate';
import { AuthenticatedRequest, UserRole, VerificationStatus } from '../../types';

const router = Router();

// Protect all admin user routes
router.use(requireAuth, requireAdmin);

// Validation Schemas
const listUsersQuerySchema = z.object({
  role: z.enum(['guest', 'buyer', 'owner', 'agent', 'admin', 'super_admin']).optional(),
  is_active: z.coerce.boolean().optional(),
  verification_status: z.enum(['unverified', 'pending', 'verified', 'rejected']).optional(),
  q: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

const updateRoleSchema = z.object({
  role: z.enum(['buyer', 'owner', 'agent', 'admin', 'super_admin']),
});

const updateStatusSchema = z.object({
  is_active: z.boolean(),
  reason: z.string().optional(),
});

const updateVerificationSchema = z.object({
  verification_status: z.enum(['unverified', 'pending', 'verified', 'rejected']),
  verification_notes: z.string().optional(),
});

/**
 * GET /api/admin/users
 * List all users with pagination and search
 */
router.get('/', validateQuery(listUsersQuerySchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { role, is_active, verification_status, q, page = 1, limit = 20 } = req.query as any;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin.from('profiles').select('*', { count: 'exact' });

    if (role) query = query.eq('role', role);
    if (is_active !== undefined) query = query.eq('is_active', is_active);
    if (verification_status) query = query.eq('verification_status', verification_status);

    if (q && q.trim()) {
      const term = q.trim();
      query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`);
    }

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error) {
      res.status(500).json({ success: false, error: error.message });
      return;
    }

    const total = count || 0;
    res.json({
      success: true,
      data: data || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Admin list users exception:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve users.' });
  }
});

/**
 * GET /api/admin/users/:id
 * Single user details with related properties and enquiries count
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    // Get counts
    const { count: propertyCount } = await supabaseAdmin
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', id);

    const { count: enquiryCount } = await supabaseAdmin
      .from('enquiries')
      .select('id', { count: 'exact', head: true })
      .eq('property_owner_id', id);

    res.json({
      success: true,
      data: {
        ...user,
        stats: {
          properties_count: propertyCount || 0,
          enquiries_received_count: enquiryCount || 0,
        },
      },
    });
  } catch (error: any) {
    console.error('Admin get user exception:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user details.' });
  }
});

/**
 * PUT /api/admin/users/:id/role
 * Change user role (super_admin required to grant/revoke admin rights)
 */
router.put(
  '/:id/role',
  validateBody(updateRoleSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { role: newRole } = req.body;
      const adminUser = req.user!;

      // Guard: Only super_admin can promote someone to admin or super_admin, or demote an admin
      if (newRole === 'admin' || newRole === 'super_admin') {
        if (adminUser.role !== 'super_admin') {
          res.status(403).json({
            success: false,
            error: 'Only super administrators can promote users to administrative roles.',
          });
          return;
        }
      }

      // Check target user's current role
      const { data: targetUser } = await supabaseAdmin
        .from('profiles')
        .select('role, email')
        .eq('id', id)
        .single();

      if (!targetUser) {
        res.status(404).json({ success: false, error: 'User not found.' });
        return;
      }

      if ((targetUser.role === 'admin' || targetUser.role === 'super_admin') && adminUser.role !== 'super_admin') {
        res.status(403).json({
          success: false,
          error: 'Only super administrators can change another administrator’s role.',
        });
        return;
      }

      const { data: updated, error } = await supabaseAdmin
        .from('profiles')
        .update({
          role: newRole as UserRole,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        res.status(400).json({ success: false, error: error.message });
        return;
      }

      await logAudit({
        actorId: adminUser.id,
        action: 'user_role_change',
        targetType: 'user',
        targetId: id,
        details: { old_role: targetUser.role, new_role: newRole },
        ipAddress: req.ip || undefined,
      });

      res.json({
        success: true,
        message: `User role changed to ${newRole}.`,
        data: updated,
      });
    } catch (error: any) {
      console.error('Update user role exception:', error);
      res.status(500).json({ success: false, error: 'Failed to update user role.' });
    }
  }
);

/**
 * PUT /api/admin/users/:id/status
 * Activate or suspend a user account
 */
router.put(
  '/:id/status',
  validateBody(updateStatusSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { is_active, reason } = req.body;
      const adminUser = req.user!;

      // Prevent suspending oneself
      if (id === adminUser.id) {
        res.status(400).json({ success: false, error: 'You cannot suspend your own account.' });
        return;
      }

      const { data: updated, error } = await supabaseAdmin
        .from('profiles')
        .update({
          is_active,
          deactivated_at: !is_active ? new Date().toISOString() : null,
          deactivation_reason: !is_active ? reason || 'Deactivated by administrator' : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        res.status(400).json({ success: false, error: error.message });
        return;
      }

      await logAudit({
        actorId: adminUser.id,
        action: is_active ? 'user_activate' : 'user_suspend',
        targetType: 'user',
        targetId: id,
        details: { is_active, reason },
        ipAddress: req.ip || undefined,
      });

      res.json({
        success: true,
        message: `User account has been ${is_active ? 'activated' : 'suspended'}.`,
        data: updated,
      });
    } catch (error: any) {
      console.error('Update user status exception:', error);
      res.status(500).json({ success: false, error: 'Failed to update user status.' });
    }
  }
);

/**
 * PUT /api/admin/users/:id/verify
 * Update verification status of a seller/agent
 */
router.put(
  '/:id/verify',
  validateBody(updateVerificationSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { verification_status, verification_notes } = req.body;
      const adminUser = req.user!;

      const { data: updated, error } = await supabaseAdmin
        .from('profiles')
        .update({
          verification_status: verification_status as VerificationStatus,
          verification_notes: verification_notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        res.status(400).json({ success: false, error: error.message });
        return;
      }

      await logAudit({
        actorId: adminUser.id,
        action: 'user_role_change',
        targetType: 'user_verification',
        targetId: id,
        details: { verification_status, verification_notes },
        ipAddress: req.ip || undefined,
      });

      res.json({
        success: true,
        message: `User verification updated to '${verification_status}'.`,
        data: updated,
      });
    } catch (error: any) {
      console.error('Update verification exception:', error);
      res.status(500).json({ success: false, error: 'Failed to update verification status.' });
    }
  }
);

export default router;
