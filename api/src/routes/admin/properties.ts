import { Router, Response } from 'express';
import { z } from 'zod';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin, logAudit } from '../../lib/supabase';
import { requireAuth } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/admin';
import { validateBody, validateQuery } from '../../middleware/validate';
import { notifyPropertyStatusChange } from '../../services/notifications';
import { sendPropertyStatusEmail } from '../../services/email';
import { AuthenticatedRequest, Property, PropertyStatus } from '../../types';

const router = Router();

// Protect all admin property routes
router.use(requireAuth, requireAdmin);

// Validation Schemas
const adminListQuerySchema = z.object({
  status: z.string().optional(),
  category: z.string().optional(),
  property_type: z.string().optional(),
  is_verified: z.coerce.boolean().optional(),
  is_featured: z.coerce.boolean().optional(),
  q: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

const rejectSchema = z.object({
  reason: z.string().min(3, 'Rejection reason is required'),
});

const requestChangesSchema = z.object({
  feedback: z.string().min(5, 'Moderation feedback is required'),
});

const suspendSchema = z.object({
  reason: z.string().optional(),
});

const adminPropertySchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  listing_intent: z.enum(['sell', 'rent']),
  category: z.enum([
    'residential_plot',
    'agricultural_land',
    'commercial',
    'residential',
    'industrial',
    'institutional',
  ]),
  property_type: z.string(),
  price: z.coerce.number().positive(),
  price_negotiable: z.boolean().default(false),
  price_per_unit: z.coerce.number().optional().nullable(),
  area: z.coerce.number().positive(),
  area_unit: z.enum(['sqft', 'sqyd', 'sqm', 'acre', 'hectare', 'bigha', 'marla', 'kanal', 'guntha', 'ground']),
  length: z.coerce.number().optional().nullable(),
  breadth: z.coerce.number().optional().nullable(),
  state_id: z.coerce.number().optional().nullable(),
  city_id: z.coerce.number().optional().nullable(),
  locality_id: z.coerce.number().optional().nullable(),
  address: z.string().optional().nullable(),
  pin_code: z.string().optional().nullable(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  road_width: z.coerce.number().optional().nullable(),
  road_access: z.enum(['pucca', 'kachha', 'both', 'none']).optional().nullable(),
  facing_direction: z
    .enum(['north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest'])
    .optional()
    .nullable(),
  ownership_type: z.enum(['freehold', 'leasehold', 'cooperative', 'power_of_attorney', 'other']).optional().nullable(),
  is_corner_plot: z.boolean().default(false),
  is_on_main_road: z.boolean().default(false),
  nearby_landmarks: z.array(z.string()).optional().nullable(),
  amenities: z.array(z.string()).optional().nullable(),
  seller_name: z.string().optional().nullable(),
  seller_phone: z.string().optional().nullable(),
  seller_email: z.string().email().optional().nullable(),
  seller_category: z.enum(['owner', 'agent', 'builder', 'developer']).optional().nullable(),
  status: z
    .enum(['draft', 'pending_review', 'needs_changes', 'approved', 'rejected', 'suspended', 'archived', 'sold', 'rented'])
    .default('approved'),
  is_verified: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_admin_managed: z.boolean().default(true),
  admin_notes: z.string().optional().nullable(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        storage_path: z.string(),
        is_cover: z.boolean().default(false),
        sort_order: z.number().default(0),
      })
    )
    .optional(),
});

/**
 * GET /api/admin/properties/pending
 * List properties awaiting moderation
 */
router.get('/pending', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await supabaseAdmin
      .from('properties')
      .select(
        `
        *,
        owner:profiles(id, full_name, email, phone, role, seller_category),
        state:states(id, name),
        city:cities(id, name),
        locality:localities(id, name),
        images:property_images(id, url, storage_path, is_cover, sort_order)
      `,
        { count: 'exact' }
      )
      .in('status', ['pending_review', 'needs_changes'])
      .order('created_at', { ascending: true }) // Oldest submissions first for review queue
      .range(from, to);

    if (error) {
      res.status(500).json({ success: false, error: error.message });
      return;
    }

    const total = count || 0;
    res.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Admin pending properties exception:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch pending properties.' });
  }
});

/**
 * GET /api/admin/properties
 * List all properties with admin filter controls
 */
router.get('/', validateQuery(adminListQuerySchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, category, property_type, is_verified, is_featured, q, page = 1, limit = 20 } = req.query as any;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from('properties')
      .select(
        `
        *,
        owner:profiles(id, full_name, email, phone),
        city:cities(id, name),
        state:states(id, name),
        images:property_images(id, url, is_cover)
      `,
        { count: 'exact' }
      );

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);
    if (property_type) query = query.eq('property_type', property_type);
    if (is_verified !== undefined) query = query.eq('is_verified', is_verified);
    if (is_featured !== undefined) query = query.eq('is_featured', is_featured);

    if (q && q.trim()) {
      const term = q.trim();
      query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%,slug.ilike.%${term}%`);
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
    console.error('Admin list properties exception:', error);
    res.status(500).json({ success: false, error: 'Failed to list properties.' });
  }
});

/**
 * PUT /api/admin/properties/:id/approve
 * Approve property listing
 */
router.put('/:id/approve', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const adminUser = req.user!;

    // 1. Get current property
    const { data: property, error: fetchError } = await supabaseAdmin
      .from('properties')
      .select('*, owner:profiles(id, email, full_name)')
      .eq('id', id)
      .single();

    if (fetchError || !property) {
      res.status(404).json({ success: false, error: 'Property not found.' });
      return;
    }

    const oldStatus = property.status;

    // 2. Update status to approved
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('properties')
      .update({
        status: 'approved',
        reviewed_by: adminUser.id,
        reviewed_at: new Date().toISOString(),
        published_at: property.published_at || new Date().toISOString(),
        rejection_reason: null,
        moderation_feedback: null,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      res.status(400).json({ success: false, error: updateError.message });
      return;
    }

    // 3. Record status history
    await supabaseAdmin.from('property_status_history').insert({
      property_id: id,
      old_status: oldStatus,
      new_status: 'approved',
      changed_by: adminUser.id,
      reason: 'Approved by administrator',
    });

    // 4. Audit log
    await logAudit({
      actorId: adminUser.id,
      action: 'property_approve',
      targetType: 'property',
      targetId: id,
      details: { title: property.title, previous_status: oldStatus },
      ipAddress: req.ip || undefined,
    });

    // 5. In-app notification
    await notifyPropertyStatusChange(updated as Property, oldStatus, 'approved');

    // 6. Send email if owner email exists
    if (property.owner?.email) {
      await sendPropertyStatusEmail(
        property.owner.email,
        property.owner.full_name || 'Seller',
        property.title,
        'approved'
      );
    }

    res.json({
      success: true,
      message: `Property "${property.title}" has been approved and published.`,
      data: updated,
    });
  } catch (error: any) {
    console.error('Approve property exception:', error);
    res.status(500).json({ success: false, error: 'Failed to approve property.' });
  }
});

/**
 * PUT /api/admin/properties/:id/reject
 * Reject property listing with reason
 */
router.put(
  '/:id/reject',
  validateBody(rejectSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminUser = req.user!;

      const { data: property, error: fetchError } = await supabaseAdmin
        .from('properties')
        .select('*, owner:profiles(id, email, full_name)')
        .eq('id', id)
        .single();

      if (fetchError || !property) {
        res.status(404).json({ success: false, error: 'Property not found.' });
        return;
      }

      const oldStatus = property.status;

      const { data: updated, error: updateError } = await supabaseAdmin
        .from('properties')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          reviewed_by: adminUser.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (updateError) {
        res.status(400).json({ success: false, error: updateError.message });
        return;
      }

      // Record history
      await supabaseAdmin.from('property_status_history').insert({
        property_id: id,
        old_status: oldStatus,
        new_status: 'rejected',
        changed_by: adminUser.id,
        reason,
      });

      // Audit log
      await logAudit({
        actorId: adminUser.id,
        action: 'property_reject',
        targetType: 'property',
        targetId: id,
        details: { title: property.title, reason },
        ipAddress: req.ip || undefined,
      });

      // Notification
      await notifyPropertyStatusChange(updated as Property, oldStatus, 'rejected', reason);

      // Email
      if (property.owner?.email) {
        await sendPropertyStatusEmail(
          property.owner.email,
          property.owner.full_name || 'Seller',
          property.title,
          'rejected',
          reason
        );
      }

      res.json({
        success: true,
        message: 'Property has been rejected.',
        data: updated,
      });
    } catch (error: any) {
      console.error('Reject property exception:', error);
      res.status(500).json({ success: false, error: 'Failed to reject property.' });
    }
  }
);

/**
 * PUT /api/admin/properties/:id/request-changes
 * Request changes from property owner
 */
router.put(
  '/:id/request-changes',
  validateBody(requestChangesSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { feedback } = req.body;
      const adminUser = req.user!;

      const { data: property, error: fetchError } = await supabaseAdmin
        .from('properties')
        .select('*, owner:profiles(id, email, full_name)')
        .eq('id', id)
        .single();

      if (fetchError || !property) {
        res.status(404).json({ success: false, error: 'Property not found.' });
        return;
      }

      const oldStatus = property.status;

      const { data: updated, error: updateError } = await supabaseAdmin
        .from('properties')
        .update({
          status: 'needs_changes',
          moderation_feedback: feedback,
          reviewed_by: adminUser.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (updateError) {
        res.status(400).json({ success: false, error: updateError.message });
        return;
      }

      await supabaseAdmin.from('property_status_history').insert({
        property_id: id,
        old_status: oldStatus,
        new_status: 'needs_changes',
        changed_by: adminUser.id,
        feedback,
      });

      await notifyPropertyStatusChange(updated as Property, oldStatus, 'needs_changes', feedback);

      if (property.owner?.email) {
        await sendPropertyStatusEmail(
          property.owner.email,
          property.owner.full_name || 'Seller',
          property.title,
          'needs_changes',
          feedback
        );
      }

      res.json({
        success: true,
        message: 'Change request feedback sent to property owner.',
        data: updated,
      });
    } catch (error: any) {
      console.error('Request changes exception:', error);
      res.status(500).json({ success: false, error: 'Failed to request changes.' });
    }
  }
);

/**
 * PUT /api/admin/properties/:id/suspend
 * Suspend property listing
 */
router.put(
  '/:id/suspend',
  validateBody(suspendSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminUser = req.user!;

      const { data: property, error: fetchError } = await supabaseAdmin
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !property) {
        res.status(404).json({ success: false, error: 'Property not found.' });
        return;
      }

      const oldStatus = property.status;

      const { data: updated, error: updateError } = await supabaseAdmin
        .from('properties')
        .update({
          status: 'suspended',
          admin_notes: reason ? `Suspended: ${reason}` : property.admin_notes,
        })
        .eq('id', id)
        .select('*')
        .single();

      if (updateError) {
        res.status(400).json({ success: false, error: updateError.message });
        return;
      }

      await supabaseAdmin.from('property_status_history').insert({
        property_id: id,
        old_status: oldStatus,
        new_status: 'suspended',
        changed_by: adminUser.id,
        reason: reason || 'Suspended by admin',
      });

      await logAudit({
        actorId: adminUser.id,
        action: 'property_suspend',
        targetType: 'property',
        targetId: id,
        details: { reason },
        ipAddress: req.ip || undefined,
      });

      await notifyPropertyStatusChange(updated as Property, oldStatus, 'suspended', reason);

      res.json({
        success: true,
        message: 'Property listing suspended.',
        data: updated,
      });
    } catch (error: any) {
      console.error('Suspend property exception:', error);
      res.status(500).json({ success: false, error: 'Failed to suspend property.' });
    }
  }
);

/**
 * PUT /api/admin/properties/:id/restore
 * Restore suspended property to approved
 */
router.put('/:id/restore', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const adminUser = req.user!;

    const { data: property, error: fetchError } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !property) {
      res.status(404).json({ success: false, error: 'Property not found.' });
      return;
    }

    const oldStatus = property.status;

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('properties')
      .update({
        status: 'approved',
        reviewed_by: adminUser.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      res.status(400).json({ success: false, error: updateError.message });
      return;
    }

    await supabaseAdmin.from('property_status_history').insert({
      property_id: id,
      old_status: oldStatus,
      new_status: 'approved',
      changed_by: adminUser.id,
      reason: 'Restored to approved by admin',
    });

    await logAudit({
      actorId: adminUser.id,
      action: 'property_restore',
      targetType: 'property',
      targetId: id,
      details: { title: property.title },
      ipAddress: req.ip || undefined,
    });

    await notifyPropertyStatusChange(updated as Property, oldStatus, 'approved');

    res.json({
      success: true,
      message: 'Property has been restored to active/approved.',
      data: updated,
    });
  } catch (error: any) {
    console.error('Restore property exception:', error);
    res.status(500).json({ success: false, error: 'Failed to restore property.' });
  }
});

/**
 * POST /api/admin/properties
 * Admin direct creation of property
 */
router.post(
  '/',
  validateBody(adminPropertySchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const adminUser = req.user!;
      const { images, ...propertyData } = req.body;

      const slug = `${slugify(propertyData.title, { lower: true, strict: true })}-${uuidv4().substring(0, 8)}`;
      let pricePerUnit = propertyData.price_per_unit;
      if (!pricePerUnit && propertyData.price && propertyData.area) {
        pricePerUnit = Math.round((propertyData.price / propertyData.area) * 100) / 100;
      }

      const { data: newProperty, error: insertError } = await supabaseAdmin
        .from('properties')
        .insert({
          ...propertyData,
          slug,
          owner_id: adminUser.id,
          price_per_unit: pricePerUnit,
          published_at: propertyData.status === 'approved' ? new Date().toISOString() : null,
          reviewed_by: adminUser.id,
          reviewed_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (insertError || !newProperty) {
        res.status(400).json({ success: false, error: insertError?.message || 'Failed to create property.' });
        return;
      }

      if (images && images.length > 0) {
        const imageRecords = images.map((img: any, idx: number) => ({
          property_id: newProperty.id,
          url: img.url,
          storage_path: img.storage_path,
          is_cover: img.is_cover || idx === 0,
          sort_order: img.sort_order ?? idx,
          uploaded_by: adminUser.id,
        }));
        await supabaseAdmin.from('property_images').insert(imageRecords);
      }

      await supabaseAdmin.from('property_status_history').insert({
        property_id: newProperty.id,
        old_status: null,
        new_status: propertyData.status,
        changed_by: adminUser.id,
        reason: 'Directly created by administrator',
      });

      res.status(201).json({
        success: true,
        message: 'Admin property created successfully.',
        data: newProperty,
      });
    } catch (error: any) {
      console.error('Admin create property exception:', error);
      res.status(500).json({ success: false, error: 'Failed to create property.' });
    }
  }
);

/**
 * PUT /api/admin/properties/:id
 * Admin update any property listing
 */
router.put(
  '/:id',
  validateBody(adminPropertySchema.partial()),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const adminUser = req.user!;
      const { images, ...updateData } = req.body;

      const { data: existing, error: fetchError } = await supabaseAdmin
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !existing) {
        res.status(404).json({ success: false, error: 'Property not found.' });
        return;
      }

      const { data: updated, error: updateError } = await supabaseAdmin
        .from('properties')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (updateError) {
        res.status(400).json({ success: false, error: updateError.message });
        return;
      }

      if (images && Array.isArray(images)) {
        await supabaseAdmin.from('property_images').delete().eq('property_id', id);
        if (images.length > 0) {
          const imageRecords = images.map((img: any, idx: number) => ({
            property_id: id,
            url: img.url,
            storage_path: img.storage_path,
            is_cover: img.is_cover || idx === 0,
            sort_order: img.sort_order ?? idx,
            uploaded_by: adminUser.id,
          }));
          await supabaseAdmin.from('property_images').insert(imageRecords);
        }
      }

      res.json({
        success: true,
        message: 'Property updated by administrator.',
        data: updated,
      });
    } catch (error: any) {
      console.error('Admin update property exception:', error);
      res.status(500).json({ success: false, error: 'Failed to update property.' });
    }
  }
);

/**
 * DELETE /api/admin/properties/:id
 * Admin delete any property
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const adminUser = req.user!;

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('properties')
      .select('id, title')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({ success: false, error: 'Property not found.' });
      return;
    }

    const { error: deleteError } = await supabaseAdmin.from('properties').delete().eq('id', id);

    if (deleteError) {
      res.status(400).json({ success: false, error: deleteError.message });
      return;
    }

    await logAudit({
      actorId: adminUser.id,
      action: 'property_delete',
      targetType: 'property',
      targetId: id,
      details: { title: existing.title },
      ipAddress: req.ip || undefined,
    });

    res.json({
      success: true,
      message: `Property "${existing.title}" deleted by administrator.`,
    });
  } catch (error: any) {
    console.error('Admin delete property exception:', error);
    res.status(500).json({ success: false, error: 'Failed to delete property.' });
  }
});

export default router;
