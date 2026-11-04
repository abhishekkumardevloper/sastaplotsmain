import { NextRequest, NextResponse } from 'next/server'

const CITIES = [
  { id: 501, state_id: 1, name: 'Lucknow', is_popular: true },
  { id: 502, state_id: 1, name: 'Noida', is_popular: true },
  { id: 503, state_id: 1, name: 'Greater Noida', is_popular: true },
  { id: 504, state_id: 1, name: 'Varanasi', is_popular: true },
  { id: 505, state_id: 1, name: 'Kanpur', is_popular: false },
  { id: 201, state_id: 2, name: 'New Delhi', is_popular: true },
  { id: 301, state_id: 3, name: 'Gurugram', is_popular: true },
  { id: 302, state_id: 3, name: 'Faridabad', is_popular: false },
  { id: 401, state_id: 4, name: 'Jaipur', is_popular: true },
  { id: 402, state_id: 4, name: 'Jodhpur', is_popular: false },
  { id: 403, state_id: 4, name: 'Udaipur', is_popular: true },
  { id: 601, state_id: 5, name: 'Mumbai', is_popular: true },
  { id: 602, state_id: 5, name: 'Pune', is_popular: true },
  { id: 701, state_id: 6, name: 'Bengaluru', is_popular: true },
  { id: 702, state_id: 6, name: 'Mysuru', is_popular: false },
  { id: 801, state_id: 7, name: 'Hyderabad', is_popular: true },
  { id: 901, state_id: 8, name: 'Ahmedabad', is_popular: true },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const stateId = searchParams.get('state_id') ? parseInt(searchParams.get('state_id')!, 10) : undefined

  let result = CITIES
  if (stateId) {
    result = result.filter((c) => c.state_id === stateId)
  }

  return NextResponse.json({ success: true, data: result })
}
