import { NextResponse } from 'next/server'
import { getProperties, getAdminStats, getEnquiries } from '@/lib/serverStore'

export async function GET() {
  try {
    const stats = await getAdminStats()
    const { data: allProps } = await getProperties({ status: 'all', limit: 100 })
    const pendingProps = allProps.filter((p) => p.status === 'pending_review' || p.status === 'needs_changes')
    const enquiries = await getEnquiries()

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          total_listings: stats.totalProperties,
          published_listings: stats.approvedProperties,
          pending_approvals: stats.pendingProperties,
          rejected_listings: allProps.filter((p) => p.status === 'rejected').length,
          suspended_listings: allProps.filter((p) => p.status === 'suspended').length,
          total_users: stats.totalUsers,
          owners_agents: Math.max(1, Math.floor(stats.totalUsers * 0.4)),
          new_enquiries: stats.totalEnquiries,
          listings_today: allProps.filter(
            (p) => new Date(p.created_at).toDateString() === new Date().toDateString()
          ).length,
          recent_activity: [],
        },
        recent_activity: [],
        pending_listings: pendingProps.slice(0, 10),
        pending_properties: pendingProps.slice(0, 10),
        recent_enquiries: enquiries.slice(0, 5),
      },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
