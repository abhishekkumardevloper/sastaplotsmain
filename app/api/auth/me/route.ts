import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      id: 'admin-1',
      email: 'admin@sastaplots.com',
      full_name: 'Administrator',
      role: 'super_admin',
      is_active: true,
      phone_verified: true,
      is_email_verified: true,
      verification_status: 'verified',
    },
  })
}
