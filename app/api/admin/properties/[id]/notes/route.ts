import { NextRequest, NextResponse } from 'next/server'
import { getPropertyBySlug, updateProperty } from '@/lib/serverStore'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { note } = body

    if (!note) {
      return NextResponse.json({ success: false, error: 'Note text is required' }, { status: 400 })
    }

    const property = await getPropertyBySlug(id)
    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 })
    }

    const existingNotes = (property as any).admin_notes || []
    const updatedNotes = [
      ...existingNotes,
      {
        id: `note-${Date.now()}`,
        text: note,
        created_at: new Date().toISOString(),
        author: 'Admin',
      },
    ]

    const updated = await updateProperty(id, { admin_notes: updatedNotes } as any)

    return NextResponse.json({
      success: true,
      message: 'Note added successfully',
      data: updated,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
