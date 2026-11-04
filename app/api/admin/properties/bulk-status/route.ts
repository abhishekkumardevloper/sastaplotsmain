import { NextRequest, NextResponse } from 'next/server'
import { updateProperty } from '@/lib/serverStore'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { property_ids, status, reason } = body

    if (!Array.isArray(property_ids) || property_ids.length === 0 || !status) {
      return NextResponse.json(
        { success: false, error: 'property_ids array and status are required' },
        { status: 400 }
      )
    }

    const payload: Record<string, any> = { status }
    if (status === 'approved') {
      payload.published_at = new Date().toISOString()
      payload.rejection_reason = null
    } else if (status === 'rejected') {
      payload.rejection_reason = reason || 'Rejected by moderator'
    }

    const results = await Promise.all(
      property_ids.map((id: string) => updateProperty(id, payload))
    )

    return NextResponse.json({
      success: true,
      message: `Updated ${results.filter(Boolean).length} properties to ${status}`,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
