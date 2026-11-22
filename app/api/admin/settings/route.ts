import { NextRequest, NextResponse } from 'next/server'
import { getSettings, updateSetting } from '@/lib/serverStore'

export async function GET() {
  try {
    const settings = await getSettings()
    return NextResponse.json({ success: true, data: settings })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    for (const [key, value] of Object.entries(body)) {
      await updateSetting(key, value)
    }
    const updated = await getSettings()
    return NextResponse.json({ success: true, message: 'Settings updated', data: updated })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
