import { NextRequest, NextResponse } from 'next/server'
import { updateProperty, createAuditLog } from '@/lib/serverStore'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, reason } = body

    if (!status) {
      return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 })
    }

    const payload: Record<string, any> = { status }
    if (status === 'approved') {
      payload.published_at = new Date().toISOString()
      payload.rejection_reason = null
    } else if (status === 'rejected') {
      payload.rejection_reason = reason || 'Does not meet listing guidelines'
    }

    const updated = await updateProperty(id, payload)
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 })
    }

    await createAuditLog({
      action: `property_${status}`,
      target_type: 'property',
      target_id: id,
      details: {
        title: updated.title,
        status,
        reason: reason || undefined,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Property status updated to ${status}`,
      data: updated,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
