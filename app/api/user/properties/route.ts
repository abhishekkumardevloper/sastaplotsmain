import { NextRequest, NextResponse } from 'next/server'
import { getProperties } from '@/lib/serverStore'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const owner_id = searchParams.get('owner_id') || undefined

    const { data, total } = await getProperties({
      status,
      owner_id,
      limit: 100,
    })

    return NextResponse.json({
      success: true,
      data,
      total,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
