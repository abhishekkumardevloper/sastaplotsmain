import { NextRequest, NextResponse } from 'next/server'
import { getPropertyBySlug, updateProperty, deleteProperty } from '@/lib/serverStore'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const property = await getPropertyBySlug(id)

    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: property })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const updated = await updateProperty(id, body)

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Property updated', data: updated })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PUT(request, context)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = await deleteProperty(id)

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Property deleted successfully' })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
