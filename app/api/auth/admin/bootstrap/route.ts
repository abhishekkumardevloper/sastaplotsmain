import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()
    return NextResponse.json({
      success: true,
      message: 'Admin account bootstrapped successfully.',
      data: {
        id: 'admin-1',
        email: email || 'admin@sastaplots.com',
        full_name: name || 'Administrator',
        role: 'super_admin',
      },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
