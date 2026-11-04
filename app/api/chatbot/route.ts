import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY || ''
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 })
    }

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: 'You are the official Sasta Plots Real Estate Assistant. Help users find verified plots, land parcels, commercial properties, understand pricing, registration, and RERA guidelines in India. Keep answers concise, helpful, and polite.',
        })

        const result = await model.generateContent(message)
        const responseText = result.response.text()

        return NextResponse.json({
          success: true,
          reply: responseText,
        })
      } catch (geminiErr) {
        console.warn('Gemini API call failed, using intelligent assistant fallback:', geminiErr)
      }
    }

    // Smart assistant fallback
    const msg = message.toLowerCase()
    let reply = "Hello! I am your Sasta Plots property assistant. You can browse verified plots for sale, agricultural land, commercial plots, or list your own property with zero brokerage. How can I help you today?"

    if (msg.includes('plot') || msg.includes('buy') || msg.includes('price')) {
      reply = "We offer verified residential plots, agricultural land, and commercial spaces across India with direct seller contacts. You can visit the 'Buy' or 'Plots' page to filter by city, budget, and size."
    } else if (msg.includes('sell') || msg.includes('list') || msg.includes('post')) {
      reply = "Listing a property on Sasta Plots is fast and free! Click on 'Post Property' in the header to submit your plot details. Admin verified listings get maximum buyer visibility."
    } else if (msg.includes('contact') || msg.includes('phone') || msg.includes('seller')) {
      reply = "On any property details page, you can find the direct owner/agent phone number and a WhatsApp button to connect instantly."
    }

    return NextResponse.json({
      success: true,
      reply,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
