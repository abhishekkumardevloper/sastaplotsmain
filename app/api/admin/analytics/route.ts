import { NextResponse } from 'next/server'
import { getAdminStats } from '@/lib/serverStore'

export async function GET() {
  const stats = await getAdminStats()
  return NextResponse.json({
    success: true,
    data: {
      total_views: 0,
      total_enquiries: stats.totalEnquiries,
      total_properties: stats.totalProperties,
      views_trend: [],
      category_distribution: [],
      location_distribution: [],
    },
  })
}
