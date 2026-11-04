import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Sasta Plots Fullstack API (Next.js)',
    version: '2.0.0',
  })
}
