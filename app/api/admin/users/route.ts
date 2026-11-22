import { NextRequest, NextResponse } from 'next/server'
import { getUsers } from '@/lib/serverStore'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.toLowerCase()
  const role = searchParams.get('role')
  const isActiveParam = searchParams.get('is_active')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)

  let users = await getUsers()

  if (q) {
    users = users.filter(
      (u) =>
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q)
    )
  }

  if (role && role !== 'all') {
    users = users.filter((u) => u.role === role)
  }

  if (isActiveParam !== null && isActiveParam !== undefined) {
    const isActive = isActiveParam === 'true'
    users = users.filter((u) => u.is_active === isActive)
  }

  const total = users.length
  const startIndex = (page - 1) * limit
  const paginated = users.slice(startIndex, startIndex + limit)

  return NextResponse.json({
    success: true,
    data: paginated,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  })
}
