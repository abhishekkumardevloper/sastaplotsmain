import { Router, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { enquiryLimiter } from '../middleware/rateLimit';
import { validateBody } from '../middleware/validate';
import { notifyNewEnquiry, notifyEnquiryResponse } from '../services/notifications';
import { sendEnquiryNotificationEmail, sendEnquiryResponseEmail } from '../services/email';
import { AuthenticatedRequest, Enquiry, Property } from '../types';

const router = Router();

// Validation Schemas
const createEnquirySchema = z.object({
  property_id: z.string().uuid('Valid property ID is required'),
  buyer_name: z.string().min(2, 'Name is required'),
  buyer_email: z.string().email('Valid email is required'),
  buyer_phone: z.string().min(10, 'Valid phone number is required'),
  message: z.string().max(1000).optional(),
});

const respondEnquirySchema = z.object({
  response: z.string().min(5, 'Response message must be at least 5 characters long'),
});

/**
 * POST /api/enquiries
 * Submit a property enquiry (rate limited, open to guest and registered users)
 */
router.post(
  '/',
  enquiryLimiter,
  optionalAuth,
  validateBody(createEnquirySchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { property_id, buyer_name, buyer_email, buyer_phone, message } = req.body;
      const buyerId = req.user?.id || null;

      // 1. Fetch property and owner info
      const { data: property, error: propError } = await supabaseAdmin
        .from('properties')
        .select('*, owner:profiles(id, full_name, email)')
        .eq('id', property_id)
        .single();

      if (propError || !property) {
        res.status(404).json({ success: false, error: 'Property not found.' });
        return;
      }

      // Prevent owner inquiring about their own property
      if (buyerId && property.owner_id === buyerId) {
        res.status(400).json({ success: false, error: 'You cannot submit an enquiry on your own property.' });
        return;
      }

      // 2. Insert enquiry
      const { data: enquiry, error: insertError } = await supabaseAdmin
        .from('enquiries')
        .insert({
          property_id,
          property_owner_id: property.owner_id,
          buyer_id: buyerId,
          buyer_name,
          buyer_email,
          buyer_phone,
          message: message || null,
          status: 'new',
          ip_address: (Array.isArray(req.ip) ? req.ip[0] : req.ip) || null,
          user_agent: req.get('user-agent') || null,
        })
        .select('*')
        .single();

      if (insertError || !enquiry) {
        res.status(400).json({ success: false, error: insertError?.message || 'Failed to submit enquiry.' });
        return;
      }

      // 3. Increment enquiry count on property
      supabaseAdmin
        .from('properties')
        .update({ enquiry_count: (property.enquiry_count || 0) + 1 })
        .eq('id', property_id)
        .then();

      // 4. In-app notification to property owner
      await notifyNewEnquiry(property as Property, enquiry as Enquiry);

      // 5. Email notification to owner
      if (property.owner?.email) {
        await sendEnquiryNotificationEmail(
          property.owner.email,
          property.owner.full_name || 'Property Owner',
          property.title,
          {
            buyer_name,
            buyer_email,
            buyer_phone,
            message,
          }
        );
      }

      res.status(201).json({
        success: true,
        message: 'Your enquiry has been sent to the property owner.',
        data: enquiry,
      });
    } catch (error: any) {
      console.error('Create enquiry exception:', error);
      res.status(500).json({ success: false, error: 'Failed to process your enquiry.' });
    }
  }
);

/**
 * GET /api/enquiries
 * List enquiries for authenticated user (sent or received)
 */
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const type = (req.query.type as string) || 'all'; // 'received' | 'sent' | 'all'
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from('enquiries')
      .select(
        `
        *,
        property:properties(id, title, slug, price, category, status, images:property_images(url, is_cover))
      `,
        { count: 'exact' }
      );

    if (type === 'received') {
      query = query.eq('property_owner_id', userId);
    } else if (type === 'sent') {
      query = query.eq('buyer_id', userId);
    } else {
      query = query.or(`property_owner_id.eq.${userId},buyer_id.eq.${userId}`);
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
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('List enquiries exception:', error);
    res.status(500).json({ success: false, error: 'Failed to list enquiries.' });
  }
});

/**
 * GET /api/enquiries/:id
 * Get single enquiry details
 */
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const { data: enquiry, error } = await supabaseAdmin
      .from('enquiries')
      .select(
        `
        *,
        property:properties(id, title, slug, price, status)
      `
      )
      .eq('id', id)
      .single();

    if (error || !enquiry) {
      res.status(404).json({ success: false, error: 'Enquiry not found.' });
      return;
    }

    // Access check: must be owner, buyer, or admin
    const isOwner = enquiry.property_owner_id === user.id;
    const isBuyer = enquiry.buyer_id === user.id;
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';

    if (!isOwner && !isBuyer && !isAdmin) {
      res.status(403).json({ success: false, error: 'You do not have permission to view this enquiry.' });
      return;
    }

    // If owner opened a 'new' enquiry, mark it as 'read'
    if (isOwner && enquiry.status === 'new') {
      await supabaseAdmin.from('enquiries').update({ status: 'read' }).eq('id', id);
      enquiry.status = 'read';
    }

    res.json({
      success: true,
      data: enquiry,
    });
  } catch (error: any) {
    console.error('Get enquiry exception:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve enquiry.' });
  }
});

/**
 * PUT /api/enquiries/:id/respond
 * Respond to an enquiry
 */
router.put(
  '/:id/respond',
  requireAuth,
  validateBody(respondEnquirySchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { response: responseText } = req.body;
      const user = req.user!;

      const { data: enquiry, error: fetchError } = await supabaseAdmin
        .from('enquiries')
        .select('*, property:properties(id, title, slug)')
        .eq('id', id)
        .single();

      if (fetchError || !enquiry) {
        res.status(404).json({ success: false, error: 'Enquiry not found.' });
        return;
      }

      const isOwner = enquiry.property_owner_id === user.id;
      const isAdmin = user.role === 'admin' || user.role === 'super_admin';

      if (!isOwner && !isAdmin) {
        res.status(403).json({ success: false, error: 'Only the property owner or administrator can respond.' });
        return;
      }

      const { data: updated, error: updateError } = await supabaseAdmin
        .from('enquiries')
        .update({
          response: responseText,
          status: 'responded',
          responded_by: user.id,
          responded_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (updateError) {
        res.status(400).json({ success: false, error: updateError.message });
        return;
      }

      // Notify buyer in-app
      await notifyEnquiryResponse(updated as Enquiry, responseText);

      // Email buyer
      if (enquiry.buyer_email) {
        await sendEnquiryResponseEmail(
          enquiry.buyer_email,
          enquiry.buyer_name,
          enquiry.property?.title || 'Property',
          responseText
        );
      }

      res.json({
        success: true,
        message: 'Response sent successfully.',
        data: updated,
      });
    } catch (error: any) {
      console.error('Respond enquiry exception:', error);
      res.status(500).json({ success: false, error: 'Failed to respond to enquiry.' });
    }
  }
);

export default router;
