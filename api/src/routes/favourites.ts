import { Router, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = Router();

// Protect all favourite routes
router.use(requireAuth);

/**
 * GET /api/favourites
 * List user's favourite properties
 */
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await supabaseAdmin
      .from('favourites')
      .select(
        `
        id,
        created_at,
        property:properties(
          id,
          title,
          slug,
          price,
          area,
          area_unit,
          category,
          property_type,
          status,
          city:cities(name),
          state:states(name),
          images:property_images(url, is_cover)
        )
      `,
        { count: 'exact' }
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
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
    console.error('List favourites exception:', error);
    res.status(500).json({ success: false, error: 'Failed to list favourites.' });
  }
});

/**
 * GET /api/favourites/check/:propertyId
 * Check if a property is in current user's favourites
 */
router.get('/check/:propertyId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { propertyId } = req.params;

    const { data } = await supabaseAdmin
      .from('favourites')
      .select('id')
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .maybeSingle();

    res.json({
      success: true,
      is_favourited: !!data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to check favourite status.' });
  }
});

/**
 * POST /api/favourites/:propertyId
 * Add a property to user's favourites
 */
router.post('/:propertyId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { propertyId } = req.params;

    // Verify property exists
    const { data: property, error: propError } = await supabaseAdmin
      .from('properties')
      .select('id, favourite_count')
      .eq('id', propertyId)
      .single();

    if (propError || !property) {
      res.status(404).json({ success: false, error: 'Property not found.' });
      return;
    }

    // Insert favourite
    const { error: insertError } = await supabaseAdmin
      .from('favourites')
      .upsert({ user_id: userId, property_id: propertyId }, { onConflict: 'user_id,property_id' });

    if (insertError) {
      res.status(400).json({ success: false, error: insertError.message });
      return;
    }

    // Increment count
    supabaseAdmin
      .from('properties')
      .update({ favourite_count: (property.favourite_count || 0) + 1 })
      .eq('id', propertyId)
      .then();

    res.json({
      success: true,
      message: 'Property added to favourites.',
    });
  } catch (error: any) {
    console.error('Add favourite exception:', error);
    res.status(500).json({ success: false, error: 'Failed to add favourite.' });
  }
});

/**
 * DELETE /api/favourites/:propertyId
 * Remove a property from user's favourites
 */
router.delete('/:propertyId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { propertyId } = req.params;

    const { error: deleteError } = await supabaseAdmin
      .from('favourites')
      .delete()
      .eq('user_id', userId)
      .eq('property_id', propertyId);

    if (deleteError) {
      res.status(400).json({ success: false, error: deleteError.message });
      return;
    }

    // Decrement count
    const { data: property } = await supabaseAdmin
      .from('properties')
      .select('favourite_count')
      .eq('id', propertyId)
      .single();

    if (property && property.favourite_count > 0) {
      supabaseAdmin
        .from('properties')
        .update({ favourite_count: Math.max(0, property.favourite_count - 1) })
        .eq('id', propertyId)
        .then();
    }

    res.json({
      success: true,
      message: 'Property removed from favourites.',
    });
  } catch (error: any) {
    console.error('Remove favourite exception:', error);
    res.status(500).json({ success: false, error: 'Failed to remove favourite.' });
  }
});

export default router;
