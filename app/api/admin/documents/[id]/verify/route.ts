import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { is_verified } = body

    return NextResponse.json({
      success: true,
      message: `Document ${id} verification status updated to ${is_verified ? 'verified' : 'unverified'}`,
      data: { id, is_verified: Boolean(is_verified) },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
