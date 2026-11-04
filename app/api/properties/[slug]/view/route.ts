import { NextRequest, NextResponse } from 'next/server'
import { getPropertyBySlug, updateProperty } from '@/lib/serverStore'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const property = await getPropertyBySlug(slug)

    if (property) {
      await updateProperty(property.id, {
        view_count: (property.view_count || 0) + 1,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
