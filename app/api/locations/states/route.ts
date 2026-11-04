import { NextResponse } from 'next/server'

const STATES = [
  { id: 1, name: 'Uttar Pradesh', code: 'UP', sort_order: 1 },
  { id: 2, name: 'Delhi NCR', code: 'DL', sort_order: 2 },
  { id: 3, name: 'Haryana', code: 'HR', sort_order: 3 },
  { id: 4, name: 'Rajasthan', code: 'RJ', sort_order: 4 },
  { id: 5, name: 'Maharashtra', code: 'MH', sort_order: 5 },
  { id: 6, name: 'Karnataka', code: 'KA', sort_order: 6 },
  { id: 7, name: 'Telangana', code: 'TG', sort_order: 7 },
  { id: 8, name: 'Gujarat', code: 'GJ', sort_order: 8 },
  { id: 9, name: 'Madhya Pradesh', code: 'MP', sort_order: 9 },
  { id: 10, name: 'Punjab', code: 'PB', sort_order: 10 },
  { id: 11, name: 'Uttarakhand', code: 'UK', sort_order: 11 },
  { id: 12, name: 'Bihar', code: 'BR', sort_order: 12 },
]

export async function GET() {
  return NextResponse.json({ success: true, data: STATES })
}
