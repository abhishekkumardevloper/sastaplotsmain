import { NextRequest, NextResponse } from 'next/server'
import { updateEnquiry } from '@/lib/serverStore'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { response } = body

    const updated = await updateEnquiry(id, {
      status: 'contacted',
      admin_response: response,
      responded_at: new Date().toISOString(),
    } as any)

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Enquiry not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Response recorded', data: updated })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
