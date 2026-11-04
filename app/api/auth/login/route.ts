import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 401 })
      }
      return NextResponse.json({
        success: true,
        data: {
          user: data.user,
          session: data.session,
        },
      })
    }

    // Default admin / local login
    const isAdmin = email.toLowerCase().includes('admin')
    const user = {
      id: isAdmin ? 'admin-1' : 'user-1',
      email,
      full_name: isAdmin ? 'Administrator' : email.split('@')[0],
      role: isAdmin ? 'super_admin' : 'buyer',
      is_active: true,
      phone_verified: true,
      is_email_verified: true,
      verification_status: 'verified',
    }

    return NextResponse.json({
      success: true,
      data: {
        user,
        token: 'local-session-token',
      },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
