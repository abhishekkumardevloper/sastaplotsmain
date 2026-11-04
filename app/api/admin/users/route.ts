import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const users = [
    {
      id: 'admin-1',
      email: 'admin@sastaplots.com',
      full_name: 'Administrator',
      role: 'super_admin',
      is_active: true,
      phone_verified: true,
      is_email_verified: true,
      verification_status: 'verified',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]

  return NextResponse.json({
    success: true,
    data: users,
    total: users.length,
    page: 1,
    limit: 20,
    totalPages: 1,
  })
}
