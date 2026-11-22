import { NextRequest, NextResponse } from 'next/server'
import { getAuditLogs } from '@/lib/serverStore'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const q = searchParams.get('q')?.toLowerCase()

    let logs = await getAuditLogs()

    if (action && action !== 'all') {
      logs = logs.filter((l) => l.action === action)
    }

    if (q) {
      logs = logs.filter(
        (l) =>
          l.actor?.full_name?.toLowerCase().includes(q) ||
          l.actor?.email?.toLowerCase().includes(q) ||
          l.target_id?.toLowerCase().includes(q) ||
          JSON.stringify(l.details || {}).toLowerCase().includes(q)
      )
    }

    return NextResponse.json({
      success: true,
      data: logs,
      total: logs.length,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
