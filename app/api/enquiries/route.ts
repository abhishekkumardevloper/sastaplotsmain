import { NextRequest, NextResponse } from 'next/server'
import { getEnquiries, createEnquiry } from '@/lib/serverStore'

export async function GET() {
  const enquiries = await getEnquiries()
  return NextResponse.json({ success: true, data: enquiries })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.buyer_name || !body.buyer_phone) {
      return NextResponse.json(
        { success: false, error: 'Name and phone number are required.' },
        { status: 400 }
      )
    }

    const enquiry = await createEnquiry(body)
    return NextResponse.json({
      success: true,
      message: 'Inquiry submitted successfully. The seller will contact you shortly.',
      data: enquiry,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
