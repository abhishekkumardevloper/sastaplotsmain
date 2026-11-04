import { Router, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin, logAudit } from '../../lib/supabase';
import { requireAuth } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/admin';
import { validateBody } from '../../middleware/validate';
import { AuthenticatedRequest } from '../../types';

const router = Router();

// Protect all admin settings routes
router.use(requireAuth, requireAdmin);

const updateSettingSchema = z.object({
  value: z.any(),
  description: z.string().optional(),
});

const bulkUpdateSchema = z.object({
  settings: z.record(z.string(), z.any()),
});

/**
 * GET /api/admin/settings
 * List all site settings
 */
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('site_settings')
      .select('*')
      .order('key', { ascending: true });

    if (error) {
      res.status(500).json({ success: false, error: error.message });
      return;
    }

    // Convert array to a clean key-value dictionary as well as list
    const settingsMap: Record<string, any> = {};
    if (settings) {
      for (const item of settings) {
        settingsMap[item.key] = item.value;
      }
    }

    res.json({
      success: true,
      data: settings || [],
      map: settingsMap,
    });
  } catch (error: any) {
    console.error('Fetch settings exception:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch settings.' });
  }
});

/**
 * GET /api/admin/settings/:key
 * Get specific setting by key
 */
router.get('/:key', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { key } = req.params;

    const { data: setting, error } = await supabaseAdmin
      .from('site_settings')
      .select('*')
      .eq('key', key)
      .single();

    if (error || !setting) {
      res.status(404).json({ success: false, error: `Setting '${key}' not found.` });
      return;
    }

    res.json({
      success: true,
      data: setting,
    });
  } catch (error: any) {
    console.error('Fetch setting exception:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch setting.' });
  }
});

/**
 * PUT /api/admin/settings/:key
 * Update or upsert single setting
 */
router.put(
  '/:key',
  validateBody(updateSettingSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { key } = req.params;
      const { value, description } = req.body;
      const adminUser = req.user!;

      const { data: updated, error } = await supabaseAdmin
        .from('site_settings')
        .upsert(
          {
            key,
            value,
            description: description !== undefined ? description : undefined,
            updated_by: adminUser.id,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        )
        .select('*')
        .single();

      if (error) {
        res.status(400).json({ success: false, error: error.message });
        return;
      }

      await logAudit({
        actorId: adminUser.id,
        action: 'settings_update',
        targetType: 'setting',
        targetId: key,
        details: { key, value },
        ipAddress: req.ip || undefined,
      });

      res.json({
        success: true,
        message: `Setting '${key}' updated successfully.`,
        data: updated,
      });
    } catch (error: any) {
      console.error('Update setting exception:', error);
      res.status(500).json({ success: false, error: 'Failed to update setting.' });
    }
  }
);

/**
 * POST /api/admin/settings/bulk
 * Bulk update multiple settings
 */
router.post(
  '/bulk',
  validateBody(bulkUpdateSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { settings } = req.body;
      const adminUser = req.user!;
      const entries = Object.entries(settings);

      const upsertItems = entries.map(([key, value]) => ({
        key,
        value,
        updated_by: adminUser.id,
        updated_at: new Date().toISOString(),
      }));

      const { data: updated, error } = await supabaseAdmin
        .from('site_settings')
        .upsert(upsertItems, { onConflict: 'key' })
        .select('*');

      if (error) {
        res.status(400).json({ success: false, error: error.message });
        return;
      }

      await logAudit({
        actorId: adminUser.id,
        action: 'settings_update',
        targetType: 'setting_bulk',
        details: { keys: Object.keys(settings) },
        ipAddress: req.ip || undefined,
      });

      res.json({
        success: true,
        message: 'Settings updated successfully.',
        data: updated,
      });
    } catch (error: any) {
      console.error('Bulk update settings exception:', error);
      res.status(500).json({ success: false, error: 'Failed to update settings.' });
    }
  }
);

export default router;
