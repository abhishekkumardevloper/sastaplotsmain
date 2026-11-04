import { Router, Request, Response } from 'express';
import { z } from 'zod';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../lib/supabase';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import { notifyPropertyStatusChange } from '../services/notifications';
import {
  AuthenticatedRequest,
  Property,
  ListingIntent,
  PropertyCategory,
  PropertyType,
  AreaUnit,
  PropertyStatus,
} from '../types';

const router = Router();

// Validation Schemas
const searchPropertiesSchema = z.object({
  intent: z.enum(['sell', 'rent']).optional(),
  category: z
    .enum(['residential_plot', 'agricultural_land', 'commercial', 'residential', 'industrial', 'institutional'])
    .optional(),
  property_type: z.string().optional(),
  state_id: z.coerce.number().optional(),
  city_id: z.coerce.number().optional(),
  locality_id: z.coerce.number().optional(),
  min_price: z.coerce.number().optional(),
  max_price: z.coerce.number().optional(),
  min_area: z.coerce.number().optional(),
  max_area: z.coerce.number().optional(),
  area_unit: z
    .enum(['sqft', 'sqyd', 'sqm', 'acre', 'hectare', 'bigha', 'marla', 'kanal', 'guntha', 'ground'])
    .optional(),
  is_verified: z.coerce.boolean().optional(),
  is_featured: z.coerce.boolean().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'created_at_desc', 'created_at_asc', 'popular']).optional(),
  q: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
});

const imageInputSchema = z.object({
  url: z.string().url(),
  storage_path: z.string(),
  is_cover: z.boolean().default(false),
  sort_order: z.number().default(0),
  alt_text: z.string().optional().nullable(),
  size_bytes: z.number().optional().nullable(),
  width: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
});

const createPropertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  description: z.string().min(20, 'Description must be at least 20 characters long'),
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
  price: z.coerce.number().positive('Price must be greater than 0'),
  price_negotiable: z.boolean().default(false),
  price_per_unit: z.coerce.number().optional().nullable(),
  area: z.coerce.number().positive('Area must be greater than 0'),
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
  status: z.enum(['draft', 'pending_review']).default('pending_review'),
  images: z.array(imageInputSchema).optional(),
});

const updatePropertySchema = createPropertySchema.partial();

/**
 * Helper to generate a unique URL-friendly slug
 */
function createUniqueSlug(title: string): string {
  const base = slugify(title, { lower: true, strict: true, trim: true }) || 'property';
  const shortCode = uuidv4().substring(0, 8);
  return `${base}-${shortCode}`;
}

/**
 * GET /api/properties
 * Public search for approved properties with filters and pagination
 */
router.get(
  '/',
  validateQuery(searchPropertiesSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        intent,
        category,
        property_type,
        state_id,
        city_id,
        locality_id,
        min_price,
        max_price,
        min_area,
        max_area,
        area_unit,
        is_verified,
        is_featured,
        sort = 'created_at_desc',
        q,
        page = 1,
        limit = 12,
      } = req.query as any;

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      // Base query strictly enforces approved status for public search
      let query = supabaseAdmin
        .from('properties')
        .select(
          `
          *,
          state:states(id, name, code),
          city:cities(id, name, is_popular),
          locality:localities(id, name, pin_code),
          images:property_images(id, url, storage_path, is_cover, sort_order, alt_text)
        `,
          { count: 'exact' }
        )
        .eq('status', 'approved');

      // Filters
      if (intent) query = query.eq('listing_intent', intent);
      if (category) query = query.eq('category', category);
      if (property_type) query = query.eq('property_type', property_type);
      if (state_id) query = query.eq('state_id', state_id);
      if (city_id) query = query.eq('city_id', city_id);
      if (locality_id) query = query.eq('locality_id', locality_id);
      if (min_price !== undefined) query = query.gte('price', min_price);
      if (max_price !== undefined) query = query.lte('price', max_price);
      if (min_area !== undefined) query = query.gte('area', min_area);
      if (max_area !== undefined) query = query.lte('area', max_area);
      if (area_unit) query = query.eq('area_unit', area_unit);
      if (is_verified !== undefined) query = query.eq('is_verified', is_verified);
      if (is_featured !== undefined) query = query.eq('is_featured', is_featured);

      // Full text search
      if (q && q.trim()) {
        const searchTerm = q.trim();
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`);
      }

      // Sorting
      switch (sort) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'created_at_asc':
          query = query.order('created_at', { ascending: true });
          break;
        case 'popular':
          query = query.order('view_count', { ascending: false });
          break;
        case 'created_at_desc':
        default:
          // Featured properties appear first, then newest
          query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
          break;
      }

      // Range pagination
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) {
        console.error('Property search error:', error);
        res.status(500).json({ success: false, error: error.message });
        return;
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: data || [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages,
          hasMore: page < totalPages,
        },
      });
    } catch (error: any) {
      console.error('Search properties exception:', error);
      res.status(500).json({ success: false, error: 'Internal server error while searching properties.' });
    }
  }
);

/**
 * GET /api/properties/my
 * List current authenticated user's properties (all statuses)
 */
router.get('/my', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const status = req.query.status as string;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from('properties')
      .select(
        `
        *,
        state:states(id, name, code),
        city:cities(id, name),
        locality:localities(id, name),
        images:property_images(id, url, storage_path, is_cover, sort_order)
      `,
        { count: 'exact' }
      )
      .eq('owner_id', userId);

    if (status) {
      query = query.eq('status', status);
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
    console.error('Fetch my properties exception:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch your properties.' });
  }
});

/**
 * GET /api/properties/:slug
 * Fetch single property details by slug or ID
 */
router.get('/:slug', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const slugParam = req.params.slug;
    const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

    // Check if slug is UUID or string slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

    let query = supabaseAdmin
      .from('properties')
      .select(
        `
        *,
        state:states(id, name, code),
        city:cities(id, name),
        locality:localities(id, name, pin_code),
        images:property_images(id, url, storage_path, is_cover, sort_order, alt_text, width, height),
        owner:profiles(id, full_name, email, phone, avatar_url, seller_category, company_name, rera_number, verification_status)
      `
      );

    if (isUuid) {
      query = query.eq('id', slug);
    } else {
      query = query.eq('slug', slug);
    }

    const { data: property, error } = await query.single();

    if (error || !property) {
      res.status(404).json({ success: false, error: 'Property not found.' });
      return;
    }

    // Access control: If not approved, must be owner or admin
    if (property.status !== 'approved') {
      const user = req.user;
      const isOwner = user && user.id === property.owner_id;
      const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');

      if (!isOwner && !isAdmin) {
        res.status(404).json({ success: false, error: 'Property not found or is currently not published.' });
        return;
      }
    }

    // Increment view count asynchronously
    supabaseAdmin
      .from('properties')
      .update({ view_count: (property.view_count || 0) + 1 })
      .eq('id', property.id)
      .then();

    // Sort images: cover first, then sort_order
    if (property.images && Array.isArray(property.images)) {
      property.images.sort((a: any, b: any) => {
        if (a.is_cover && !b.is_cover) return -1;
        if (!a.is_cover && b.is_cover) return 1;
        return (a.sort_order || 0) - (b.sort_order || 0);
      });
    }

    res.json({
      success: true,
      data: property,
    });
  } catch (error: any) {
    console.error('Get property exception:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve property.' });
  }
});

/**
 * POST /api/properties
 * Create a new property listing
 */
router.post(
  '/',
  requireAuth,
  validateBody(createPropertySchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const user = req.user!;
      const { images, ...propertyData } = req.body;

      // Generate unique slug
      const slug = createUniqueSlug(propertyData.title);

      // Compute price_per_unit if not explicitly supplied
      let pricePerUnit = propertyData.price_per_unit;
      if (!pricePerUnit && propertyData.price && propertyData.area) {
        pricePerUnit = Math.round((propertyData.price / propertyData.area) * 100) / 100;
      }

      // Default status is pending_review unless specified as draft
      const status: PropertyStatus = propertyData.status === 'draft' ? 'draft' : 'pending_review';

      // Insert property
      const { data: newProperty, error: insertError } = await supabaseAdmin
        .from('properties')
        .insert({
          ...propertyData,
          slug,
          owner_id: user.id,
          status,
          price_per_unit: pricePerUnit,
          seller_name: propertyData.seller_name || user.full_name,
          seller_phone: propertyData.seller_phone || user.phone,
          seller_email: propertyData.seller_email || user.email,
          seller_category: propertyData.seller_category || user.seller_category || 'owner',
        })
        .select('*')
        .single();

      if (insertError || !newProperty) {
        res.status(400).json({ success: false, error: insertError?.message || 'Failed to create property.' });
        return;
      }

      // Record initial status history
      await supabaseAdmin.from('property_status_history').insert({
        property_id: newProperty.id,
        old_status: null,
        new_status: status,
        changed_by: user.id,
        reason: 'Initial creation',
      });

      // Insert images if provided
      if (images && images.length > 0) {
        const imageRecords = images.map((img: any, idx: number) => ({
          property_id: newProperty.id,
          url: img.url,
          storage_path: img.storage_path,
          is_cover: img.is_cover || idx === 0,
          sort_order: img.sort_order ?? idx,
          alt_text: img.alt_text || null,
          size_bytes: img.size_bytes || null,
          width: img.width || null,
          height: img.height || null,
          uploaded_by: user.id,
        }));

        await supabaseAdmin.from('property_images').insert(imageRecords);
      }

      // Trigger notification if submitted for review
      if (status === 'pending_review') {
        await notifyPropertyStatusChange(newProperty as Property, null, 'pending_review');
      }

      // Fetch complete newly created property with images
      const { data: fullProperty } = await supabaseAdmin
        .from('properties')
        .select(`*, images:property_images(*)`)
        .eq('id', newProperty.id)
        .single();

      res.status(201).json({
        success: true,
        message: status === 'draft' ? 'Draft saved successfully.' : 'Property submitted for review.',
        data: fullProperty || newProperty,
      });
    } catch (error: any) {
      console.error('Create property exception:', error);
      res.status(500).json({ success: false, error: 'Failed to create property listing.' });
    }
  }
);

/**
 * PUT /api/properties/:id
 * Update own property listing
 */
router.put(
  '/:id',
  requireAuth,
  validateBody(updatePropertySchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { images, ...updateData } = req.body;

      // 1. Verify property exists and belongs to the user
      const { data: existing, error: fetchError } = await supabaseAdmin
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !existing) {
        res.status(404).json({ success: false, error: 'Property not found.' });
        return;
      }

      if (existing.owner_id !== userId) {
        res.status(403).json({ success: false, error: 'You do not have permission to edit this property.' });
        return;
      }

      // 2. Status handling:
      // If property was already approved, updating major details moves it back to pending_review
      let newStatus: PropertyStatus = existing.status;
      if (updateData.status && ['draft', 'pending_review'].includes(updateData.status)) {
        newStatus = updateData.status;
      } else if (existing.status === 'approved' || existing.status === 'needs_changes') {
        newStatus = 'pending_review';
      }

      // Calculate price_per_unit
      const price = updateData.price !== undefined ? updateData.price : existing.price;
      const area = updateData.area !== undefined ? updateData.area : existing.area;
      const pricePerUnit = price && area ? Math.round((price / area) * 100) / 100 : existing.price_per_unit;

      // 3. Update property
      const { data: updated, error: updateError } = await supabaseAdmin
        .from('properties')
        .update({
          ...updateData,
          price_per_unit: pricePerUnit,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (updateError) {
        res.status(400).json({ success: false, error: updateError.message });
        return;
      }

      // 4. Record status change if status changed
      if (newStatus !== existing.status) {
        await supabaseAdmin.from('property_status_history').insert({
          property_id: id,
          old_status: existing.status,
          new_status: newStatus,
          changed_by: userId,
          reason: 'Owner updated listing details',
        });

        await notifyPropertyStatusChange(updated as Property, existing.status, newStatus);
      }

      // 5. Update images if supplied
      if (images && Array.isArray(images)) {
        // Delete existing images for this property and re-insert
        await supabaseAdmin.from('property_images').delete().eq('property_id', id);

        if (images.length > 0) {
          const imageRecords = images.map((img: any, idx: number) => ({
            property_id: id,
            url: img.url,
            storage_path: img.storage_path,
            is_cover: img.is_cover || idx === 0,
            sort_order: img.sort_order ?? idx,
            alt_text: img.alt_text || null,
            size_bytes: img.size_bytes || null,
            width: img.width || null,
            height: img.height || null,
            uploaded_by: userId,
          }));

          await supabaseAdmin.from('property_images').insert(imageRecords);
        }
      }

      res.json({
        success: true,
        message: 'Property updated successfully.',
        data: updated,
      });
    } catch (error: any) {
      console.error('Update property exception:', error);
      res.status(500).json({ success: false, error: 'Failed to update property.' });
    }
  }
);

/**
 * DELETE /api/properties/:id
 * Delete own draft or rejected property
 */
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('properties')
      .select('id, owner_id, status, title')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({ success: false, error: 'Property not found.' });
      return;
    }

    if (existing.owner_id !== userId) {
      res.status(403).json({ success: false, error: 'You do not have permission to delete this property.' });
      return;
    }

    // Regular users can only delete drafts or rejected listings
    if (!['draft', 'rejected'].includes(existing.status)) {
      res.status(400).json({
        success: false,
        error: `Cannot delete property with status '${existing.status}'. You may archive or request removal.`,
      });
      return;
    }

    // Delete property (cascades to images, documents, status history via DB foreign key)
    const { error: deleteError } = await supabaseAdmin.from('properties').delete().eq('id', id);

    if (deleteError) {
      res.status(400).json({ success: false, error: deleteError.message });
      return;
    }

    res.json({
      success: true,
      message: `Property "${existing.title}" deleted successfully.`,
    });
  } catch (error: any) {
    console.error('Delete property exception:', error);
    res.status(500).json({ success: false, error: 'Failed to delete property.' });
  }
});

export default router;
