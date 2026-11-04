import { Router, Response } from 'express';
import { supabaseAdmin } from '../../lib/supabase';
import { requireAuth } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/admin';
import { AuthenticatedRequest } from '../../types';

const router = Router();

// Protect all admin dashboard routes
router.use(requireAuth, requireAdmin);

/**
 * GET /api/admin/dashboard/stats
 * Aggregate dashboard statistics and recent activity
 */
router.get('/stats', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // 1. Total Properties and Counts by Status
    const [
      { count: totalProperties },
      { count: pendingProperties },
      { count: needsChangesProperties },
      { count: approvedProperties },
      { count: rejectedProperties },
      { count: suspendedProperties },
      { count: soldProperties },
    ] = await Promise.all([
      supabaseAdmin.from('properties').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
      supabaseAdmin.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'needs_changes'),
      supabaseAdmin.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      supabaseAdmin.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
      supabaseAdmin.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'suspended'),
      supabaseAdmin.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'sold'),
    ]);

    // 2. Total Users and Breakdown by Role
    const [
      { count: totalUsers },
      { count: buyerUsers },
      { count: ownerUsers },
      { count: agentUsers },
      { count: adminUsers },
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'buyer'),
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'owner'),
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'agent'),
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).in('role', ['admin', 'super_admin']),
    ]);

    // 3. Enquiries stats
    const [
      { count: totalEnquiries },
      { count: newEnquiries },
      { count: respondedEnquiries },
    ] = await Promise.all([
      supabaseAdmin.from('enquiries').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('enquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      supabaseAdmin.from('enquiries').select('id', { count: 'exact', head: true }).eq('status', 'responded'),
    ]);

    // 4. Total views aggregate
    const { data: viewsData } = await supabaseAdmin
      .from('properties')
      .select('view_count');

    const totalViews = (viewsData || []).reduce((sum, item) => sum + (item.view_count || 0), 0);

    // 5. Recent pending submissions (last 5)
    const { data: recentSubmissions } = await supabaseAdmin
      .from('properties')
      .select('id, title, slug, price, category, status, created_at, owner:profiles(full_name, email)')
      .in('status', ['pending_review', 'needs_changes'])
      .order('created_at', { ascending: false })
      .limit(5);

    // 6. Recent enquiries (last 5)
    const { data: recentEnquiries } = await supabaseAdmin
      .from('enquiries')
      .select('id, buyer_name, buyer_email, buyer_phone, message, status, created_at, property:properties(id, title, slug)')
      .order('created_at', { ascending: false })
      .limit(5);

    // 7. Recent audit logs (last 10)
    const { data: recentAuditLogs } = await supabaseAdmin
      .from('audit_logs')
      .select('*, actor:profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(10);

    // 8. Properties by category
    const { data: categoriesData } = await supabaseAdmin
      .from('properties')
      .select('category');

    const categoryBreakdown: Record<string, number> = {};
    if (categoriesData) {
      for (const item of categoriesData) {
        categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
      }
    }

    res.json({
      success: true,
      data: {
        properties: {
          total: totalProperties || 0,
          pending: pendingProperties || 0,
          needs_changes: needsChangesProperties || 0,
          approved: approvedProperties || 0,
          rejected: rejectedProperties || 0,
          suspended: suspendedProperties || 0,
          sold: soldProperties || 0,
          total_views: totalViews,
          by_category: categoryBreakdown,
        },
        users: {
          total: totalUsers || 0,
          buyers: buyerUsers || 0,
          owners: ownerUsers || 0,
          agents: agentUsers || 0,
          admins: adminUsers || 0,
        },
        enquiries: {
          total: totalEnquiries || 0,
          new: newEnquiries || 0,
          responded: respondedEnquiries || 0,
        },
        recent_submissions: recentSubmissions || [],
        recent_enquiries: recentEnquiries || [],
        recent_audit_logs: recentAuditLogs || [],
      },
    });
  } catch (error: any) {
    console.error('Admin dashboard stats exception:', error);
    res.status(500).json({ success: false, error: 'Failed to compile dashboard statistics.' });
  }
});

export default router;
