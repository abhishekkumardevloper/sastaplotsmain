import { NextRequest, NextResponse } from 'next/server'
import { getPropertyBySlug, updateProperty } from '@/lib/serverStore'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const existing = await getPropertyBySlug(id)

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 })
    }

    const is_featured = body.is_featured !== undefined ? Boolean(body.is_featured) : !existing.is_featured
    const updated = await updateProperty(id, { is_featured })

    return NextResponse.json({
      success: true,
      message: is_featured ? 'Property featured on homepage.' : 'Property unfeatured.',
      data: updated,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
