import { Router, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { AuthenticatedRequest } from '../types';

const router = Router();

// Protect all draft routes
router.use(requireAuth);

const saveDraftSchema = z.object({
  id: z.string().uuid().optional(),
  data: z.record(z.string(), z.any()),
  current_step: z.number().int().min(1).max(10).default(1),
});

/**
 * GET /api/drafts
 * Retrieve the current authenticated user's property draft
 */
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get the most recently updated draft
    const { data: draft, error } = await supabaseAdmin
      .from('property_drafts')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      res.status(500).json({ success: false, error: error.message });
      return;
    }

    res.json({
      success: true,
      data: draft || null,
    });
  } catch (error: any) {
    console.error('Fetch draft exception:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve draft.' });
  }
});

/**
 * POST /api/drafts
 * Save or update property draft
 */
router.post(
  '/',
  validateBody(saveDraftSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { id, data, current_step } = req.body;

      let result;

      if (id) {
        // Update existing draft
        const { data: updated, error } = await supabaseAdmin
          .from('property_drafts')
          .update({
            data,
            current_step,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .eq('user_id', userId)
          .select('*')
          .single();

        if (error) {
          res.status(400).json({ success: false, error: error.message });
          return;
        }
        result = updated;
      } else {
        // Check if user already has a draft, update it or insert new
        const { data: existingDraft } = await supabaseAdmin
          .from('property_drafts')
          .select('id')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingDraft) {
          const { data: updated, error } = await supabaseAdmin
            .from('property_drafts')
            .update({
              data,
              current_step,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingDraft.id)
            .select('*')
            .single();

          if (error) {
            res.status(400).json({ success: false, error: error.message });
            return;
          }
          result = updated;
        } else {
          const { data: inserted, error } = await supabaseAdmin
            .from('property_drafts')
            .insert({
              user_id: userId,
              data,
              current_step,
            })
            .select('*')
            .single();

          if (error) {
            res.status(400).json({ success: false, error: error.message });
            return;
          }
          result = inserted;
        }
      }

      res.json({
        success: true,
        message: 'Draft saved successfully.',
        data: result,
      });
    } catch (error: any) {
      console.error('Save draft exception:', error);
      res.status(500).json({ success: false, error: 'Failed to save draft.' });
    }
  }
);

/**
 * DELETE /api/drafts/:id
 * Delete property draft
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('property_drafts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.json({
      success: true,
      message: 'Draft discarded.',
    });
  } catch (error: any) {
    console.error('Delete draft exception:', error);
    res.status(500).json({ success: false, error: 'Failed to delete draft.' });
  }
});

/**
 * DELETE /api/drafts
 * Discard user's latest draft
 */
router.delete('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const { error } = await supabaseAdmin
      .from('property_drafts')
      .delete()
      .eq('user_id', userId);

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.json({
      success: true,
      message: 'Drafts discarded.',
    });
  } catch (error: any) {
    console.error('Clear drafts exception:', error);
    res.status(500).json({ success: false, error: 'Failed to discard drafts.' });
  }
});

export default router;
