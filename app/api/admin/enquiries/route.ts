import { NextRequest, NextResponse } from 'next/server'
import { getEnquiries } from '@/lib/serverStore'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const q = searchParams.get('q')?.toLowerCase()
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)

  let enquiries = await getEnquiries()

  if (status && status !== 'all') {
    enquiries = enquiries.filter((e) => e.status === status)
  }

  if (q) {
    enquiries = enquiries.filter(
      (e) =>
        e.buyer_name?.toLowerCase().includes(q) ||
        e.buyer_email?.toLowerCase().includes(q) ||
        e.buyer_phone?.includes(q) ||
        e.message?.toLowerCase().includes(q)
    )
  }

  const total = enquiries.length
  const startIndex = (page - 1) * limit
  const paginated = enquiries.slice(startIndex, startIndex + limit)

  return NextResponse.json({
    success: true,
    data: paginated,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  })
}
