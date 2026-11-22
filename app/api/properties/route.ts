import { NextRequest, NextResponse } from 'next/server'
import { getProperties, createProperty } from '@/lib/serverStore'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const intent = searchParams.get('intent') || undefined
    const category = searchParams.get('category') || undefined
    const property_type = searchParams.get('property_type') || undefined
    const seller_category = searchParams.get('seller_category') || undefined
    const owner_id = searchParams.get('owner_id') || undefined
    const status = searchParams.get('status') || undefined
    const q = searchParams.get('q') || undefined
    const sort = searchParams.get('sort') || undefined
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20
    const min_price = searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined
    const max_price = searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined
    const min_area = searchParams.get('min_area') ? parseFloat(searchParams.get('min_area')!) : undefined
    const max_area = searchParams.get('max_area') ? parseFloat(searchParams.get('max_area')!) : undefined
    const is_featured = searchParams.get('is_featured') === 'true' ? true : undefined
    const is_verified = searchParams.get('is_verified') === 'true' ? true : undefined

    const { data, total } = await getProperties({
      intent,
      category,
      property_type,
      seller_category,
      owner_id,
      status,
      q,
      sort,
      page,
      limit,
      min_price,
      max_price,
      min_area,
      max_area,
      is_featured,
      is_verified,
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
    console.error('Error in GET /api/properties:', err)
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

    const newProperty = await createProperty(body, body.owner_id, false)

    return NextResponse.json(
      {
        success: true,
        message: 'Property submitted successfully and is pending review.',
        data: newProperty,
      },
      { status: 201 }
    )
  } catch (err: any) {
    console.error('Error in POST /api/properties:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
