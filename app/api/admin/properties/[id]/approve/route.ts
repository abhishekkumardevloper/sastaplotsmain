import { NextRequest, NextResponse } from 'next/server'
import { updateProperty } from '@/lib/serverStore'

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updated = await updateProperty(id, {
      status: 'approved',
      published_at: new Date().toISOString(),
      rejection_reason: undefined,
    })

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Property approved and published live.',
      data: updated,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
