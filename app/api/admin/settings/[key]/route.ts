import { NextRequest, NextResponse } from 'next/server'
import { updateSetting } from '@/lib/serverStore'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params
    const body = await request.json()
    const { value } = body

    const allSettings = await updateSetting(key, value)
    return NextResponse.json({ success: true, message: 'Setting updated', data: allSettings })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
