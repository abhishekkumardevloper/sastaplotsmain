import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, phone, role } = await request.json()

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, and password are required' },
        { status: 400 }
      )
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name, phone, role: role || 'buyer' },
        },
      })

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        message: 'Registration successful.',
        data,
      })
    }

    const user = {
      id: `user-${Date.now()}`,
      email,
      full_name,
      phone,
      role: role || 'buyer',
      is_active: true,
      phone_verified: false,
      is_email_verified: true,
      verification_status: 'unverified',
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully.',
      data: { user },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
