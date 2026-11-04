import { NextRequest, NextResponse } from 'next/server'

let settings = {
  brand: {
    name: 'Sasta Plots',
    tagline: 'Buy & Sell Verified Land & Plots in India',
    contact_email: 'support@sastaplots.com',
    contact_phone: '+91 98765 43210',
    address: 'DLF Cyber City, Gurugram, India',
  },
  social: {
    whatsapp: '+919876543210',
  },
  listings: {
    default_duration_days: 90,
    max_images: 20,
    max_image_size_mb: 10,
    require_phone_verification: false,
    auto_expire: false,
  },
}

export async function GET() {
  return NextResponse.json({ success: true, data: settings })
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    settings = { ...settings, ...body }
    return NextResponse.json({ success: true, message: 'Settings updated', data: settings })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
