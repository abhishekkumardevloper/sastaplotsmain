import { NextRequest, NextResponse } from 'next/server'

let favourites: string[] = []

export async function GET() {
  return NextResponse.json({ success: true, data: favourites })
}

export async function POST(request: NextRequest) {
  const { property_id } = await request.json()
  if (property_id && !favourites.includes(property_id)) {
    favourites.push(property_id)
  }
  return NextResponse.json({ success: true, data: favourites })
}

export async function DELETE(request: NextRequest) {
  const { property_id } = await request.json()
  favourites = favourites.filter((id) => id !== property_id)
  return NextResponse.json({ success: true, data: favourites })
}
