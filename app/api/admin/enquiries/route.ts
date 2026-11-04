import { NextRequest, NextResponse } from 'next/server'
import { getEnquiries } from '@/lib/serverStore'

export async function GET() {
  const enquiries = await getEnquiries()
  return NextResponse.json({
    success: true,
    data: enquiries,
    total: enquiries.length,
  })
}
