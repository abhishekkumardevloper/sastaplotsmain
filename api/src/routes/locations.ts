import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

const FALLBACK_STATES = [
  { id: 1, name: 'Uttar Pradesh', code: 'UP', sort_order: 1 },
  { id: 2, name: 'Delhi', code: 'DL', sort_order: 2 },
  { id: 3, name: 'Haryana', code: 'HR', sort_order: 3 },
  { id: 4, name: 'Rajasthan', code: 'RJ', sort_order: 4 },
  { id: 5, name: 'Maharashtra', code: 'MH', sort_order: 5 },
  { id: 6, name: 'Karnataka', code: 'KA', sort_order: 6 },
  { id: 7, name: 'Telangana', code: 'TG', sort_order: 7 },
  { id: 8, name: 'Gujarat', code: 'GJ', sort_order: 8 },
  { id: 9, name: 'Madhya Pradesh', code: 'MP', sort_order: 9 },
  { id: 10, name: 'Punjab', code: 'PB', sort_order: 10 },
  { id: 11, name: 'Uttarakhand', code: 'UK', sort_order: 11 },
  { id: 12, name: 'Bihar', code: 'BR', sort_order: 12 },
  { id: 13, name: 'West Bengal', code: 'WB', sort_order: 13 },
  { id: 14, name: 'Tamil Nadu', code: 'TN', sort_order: 14 },
];

const FALLBACK_CITIES = [
  { id: 501, state_id: 1, name: 'Lucknow', is_popular: true, sort_order: 1 },
  { id: 502, state_id: 1, name: 'Noida', is_popular: true, sort_order: 2 },
  { id: 503, state_id: 1, name: 'Greater Noida', is_popular: true, sort_order: 3 },
  { id: 504, state_id: 1, name: 'Varanasi', is_popular: true, sort_order: 4 },
  { id: 505, state_id: 1, name: 'Kanpur', is_popular: false, sort_order: 5 },
  { id: 201, state_id: 2, name: 'Delhi', is_popular: true, sort_order: 1 },
  { id: 301, state_id: 3, name: 'Gurugram', is_popular: true, sort_order: 1 },
  { id: 302, state_id: 3, name: 'Faridabad', is_popular: false, sort_order: 2 },
  { id: 401, state_id: 4, name: 'Jaipur', is_popular: true, sort_order: 1 },
  { id: 402, state_id: 4, name: 'Jodhpur', is_popular: false, sort_order: 2 },
  { id: 403, state_id: 4, name: 'Udaipur', is_popular: true, sort_order: 3 },
  { id: 601, state_id: 5, name: 'Mumbai', is_popular: true, sort_order: 1 },
  { id: 602, state_id: 5, name: 'Pune', is_popular: true, sort_order: 2 },
  { id: 701, state_id: 6, name: 'Bengaluru', is_popular: true, sort_order: 1 },
  { id: 702, state_id: 6, name: 'Mysuru', is_popular: false, sort_order: 2 },
  { id: 801, state_id: 7, name: 'Hyderabad', is_popular: true, sort_order: 1 },
  { id: 901, state_id: 8, name: 'Ahmedabad', is_popular: true, sort_order: 1 },
];

/**
 * GET /api/locations/states
 * List all active states
 */
router.get('/states', async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data: states, error } = await supabaseAdmin
      .from('states')
      .select('id, name, code, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error || !states || states.length === 0) {
      res.json({ success: true, data: FALLBACK_STATES });
      return;
    }

    res.json({
      success: true,
      data: states,
    });
  } catch (error: any) {
    res.json({ success: true, data: FALLBACK_STATES });
  }
});

/**
 * GET /api/locations/cities
 * List cities with optional state_id and popular filter
 */
router.get('/cities', async (req: Request, res: Response): Promise<void> => {
  try {
    const stateId = req.query.state_id ? parseInt(req.query.state_id as string, 10) : undefined;
    const popularOnly = req.query.popular === 'true';

    let query = supabaseAdmin
      .from('cities')
      .select('id, state_id, name, is_popular, sort_order')
      .eq('is_active', true);

    if (stateId) {
      query = query.eq('state_id', stateId);
    }

    if (popularOnly) {
      query = query.eq('is_popular', true);
    }

    query = query.order('sort_order', { ascending: true }).order('name', { ascending: true });

    const { data: cities, error } = await query;

    if (error || !cities || cities.length === 0) {
      let filtered = FALLBACK_CITIES;
      if (stateId) filtered = filtered.filter(c => c.state_id === stateId);
      if (popularOnly) filtered = filtered.filter(c => c.is_popular);
      res.json({ success: true, data: filtered });
      return;
    }

    res.json({
      success: true,
      data: cities,
    });
  } catch (error: any) {
    let filtered = FALLBACK_CITIES;
    const stateId = req.query.state_id ? parseInt(req.query.state_id as string, 10) : undefined;
    const popularOnly = req.query.popular === 'true';
    if (stateId) filtered = filtered.filter(c => c.state_id === stateId);
    if (popularOnly) filtered = filtered.filter(c => c.is_popular);
    res.json({ success: true, data: filtered });
  }
});

/**
 * GET /api/locations/localities
 * List localities for a given city
 */
router.get('/localities', async (req: Request, res: Response): Promise<void> => {
  try {
    const cityId = req.query.city_id ? parseInt(req.query.city_id as string, 10) : undefined;

    let query = supabaseAdmin
      .from('localities')
      .select('id, city_id, name, pin_code')
      .eq('is_active', true);

    if (cityId) {
      query = query.eq('city_id', cityId);
    }

    query = query.order('name', { ascending: true });

    const { data: localities, error } = await query;

    if (error) {
      res.status(500).json({ success: false, error: error.message });
      return;
    }

    res.json({
      success: true,
      data: localities || [],
    });
  } catch (error: any) {
    console.error('Fetch localities exception:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch localities.' });
  }
});

/**
 * GET /api/locations/search
 * Global location search across cities and localities for search auto-completion
 */
router.get('/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const queryTerm = (req.query.q as string)?.trim();

    if (!queryTerm || queryTerm.length < 2) {
      res.json({ success: true, data: [] });
      return;
    }

    const [{ data: cities }, { data: localities }] = await Promise.all([
      supabaseAdmin
        .from('cities')
        .select('id, name, state:states(name)')
        .ilike('name', `%${queryTerm}%`)
        .eq('is_active', true)
        .limit(10),
      supabaseAdmin
        .from('localities')
        .select('id, name, pin_code, city:cities(id, name, state:states(name))')
        .ilike('name', `%${queryTerm}%`)
        .eq('is_active', true)
        .limit(10),
    ]);

    const results = [
      ...(cities || []).map((c: any) => ({
        type: 'city',
        id: c.id,
        name: c.name,
        subtitle: c.state?.name || '',
      })),
      ...(localities || []).map((l: any) => ({
        type: 'locality',
        id: l.id,
        name: l.name,
        subtitle: `${l.city?.name || ''}, ${l.city?.state?.name || ''}${l.pin_code ? ` (${l.pin_code})` : ''}`,
      })),
    ];

    res.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    console.error('Location search exception:', error);
    res.status(500).json({ success: false, error: 'Failed to search locations.' });
  }
});

export default router;
