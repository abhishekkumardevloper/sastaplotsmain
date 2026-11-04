import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const mimeType = file.type || 'image/jpeg'

    // If Supabase Storage is configured:
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseAdmin.storage
          .from('property-images')
          .upload(filename, buffer, {
            contentType: mimeType,
            upsert: true,
          })

        if (!error && data) {
          const { data: publicUrlData } = supabaseAdmin.storage
            .from('property-images')
            .getPublicUrl(filename)

          return NextResponse.json({
            success: true,
            data: {
              url: publicUrlData.publicUrl,
              storage_path: filename,
            },
          })
        }
      } catch (storageErr) {
        console.warn('Supabase storage upload error, using data URI fallback:', storageErr)
      }
    }

    // Data URI fallback for development / serverless without external bucket
    const base64 = buffer.toString('base64')
    const dataUri = `data:${mimeType};base64,${base64}`

    return NextResponse.json({
      success: true,
      data: {
        url: dataUri,
        storage_path: filename,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
