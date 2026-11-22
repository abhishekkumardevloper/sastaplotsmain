import { NextRequest, NextResponse } from 'next/server'
import { getProperties, createProperty } from '@/lib/serverStore'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status') || 'all'
    const category = searchParams.get('category') || undefined
    const seller_category = searchParams.get('seller_category') || undefined
    const q = searchParams.get('q') || undefined
    const sort = searchParams.get('sort') || undefined
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20

    const { data, total } = await getProperties({
      status: status || 'all',
      category: category === 'all' ? undefined : category,
      seller_category: seller_category === 'all' ? undefined : seller_category,
      q,
      sort,
      page,
      limit,
    })

    return NextResponse.json({
      success: true,
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    })
  } catch (err: any) {
    console.error('Error in GET /api/admin/properties:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.title || !body.price || !body.area) {
      return NextResponse.json(
        { success: false, error: 'Title, price, and area are required.' },
        { status: 400 }
      )
    }

    // Admin created properties are approved and verified by default unless status explicitly specified
    const status = body.status || 'approved'
    const payload = {
      ...body,
      status,
      is_verified: true,
      is_admin_managed: true,
    }

    const newProperty = await createProperty(payload, 'admin-1', true)

    return NextResponse.json(
      {
        success: true,
        message: 'Property created and listed successfully.',
        data: newProperty,
      },
      { status: 201 }
    )
  } catch (err: any) {
    console.error('Error in POST /api/admin/properties:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
