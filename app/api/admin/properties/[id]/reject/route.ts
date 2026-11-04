import { NextRequest, NextResponse } from 'next/server'
import { updateProperty } from '@/lib/serverStore'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const updated = await updateProperty(id, {
      status: 'rejected',
      rejection_reason: body.reason || 'Does not meet listing guidelines.',
    })

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Property listing rejected.',
      data: updated,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
