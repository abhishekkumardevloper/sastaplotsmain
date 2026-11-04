import { NextRequest, NextResponse } from 'next/server'

const faqs = [
  {
    id: 'faq-1',
    category: 'Buying',
    question: 'How do I contact a property seller on Sasta Plots?',
    answer: 'You can contact sellers directly via phone call, WhatsApp, or the enquiry form on any property details page.',
    sort_order: 1,
    is_active: true,
    is_chatbot_knowledge: true,
  },
  {
    id: 'faq-2',
    category: 'Listing',
    question: 'How long does property approval take?',
    answer: 'Admin moderation typically reviews and approves listings within 2 to 6 hours during working days.',
    sort_order: 2,
    is_active: true,
    is_chatbot_knowledge: true,
  },
  {
    id: 'faq-3',
    category: 'Verification',
    question: 'What is a Verified property badge?',
    answer: 'A verified badge means the ownership documents, layout approval, and contact details have been reviewed by our compliance team.',
    sort_order: 3,
    is_active: true,
    is_chatbot_knowledge: true,
  },
]

export async function GET() {
  return NextResponse.json({ success: true, data: faqs })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json({ success: true, data: body }, { status: 201 })
}
