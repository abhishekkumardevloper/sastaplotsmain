'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HelpCircle,
  Search,
  ChevronDown,
  MessageSquare,
  FileText,
  ShoppingBag,
  UserCheck,
  ShieldAlert,
  X,
  Sparkles,
  PhoneCall,
} from 'lucide-react'
import api from '@/lib/api'
import type { FAQ } from '@/types'

// Default fallback FAQs seeded from schema.sql + expanded real estate FAQs
const DEFAULT_FAQS: FAQ[] = [
  // Listing FAQs
  {
    id: 'faq-1',
    category: 'listing',
    question: 'How do I post a property on Sasta Plots?',
    answer:
      'Click "Post Property" in the top navigation bar. Complete the step-by-step submission form: enter property title, category (residential plot, agricultural land, or commercial), plot area, asking price, exact locality, road access width, and upload high-quality photographs. Once submitted, our team will review the details within 24-48 hours.',
    sort_order: 1,
    is_active: true,
    is_chatbot_knowledge: true,
  },
  {
    id: 'faq-2',
    category: 'listing',
    question: 'How long does the approval process take?',
    answer:
      'Our moderation team reviews listings within 24 to 48 hours on business days. You will receive an instant notification in your account and via email once your listing is approved or if moderation feedback is required.',
    sort_order: 2,
    is_active: true,
    is_chatbot_knowledge: true,
  },
  {
    id: 'faq-3',
    category: 'listing',
    question: 'Why was my property listing rejected?',
    answer:
      'Listings are commonly rejected for incomplete location details, duplicate postings, blurry or stock photos, unrealistic pricing, or unverified ownership documents. When a listing is rejected, our moderators provide specific actionable feedback in your Notifications tab. You can revise and resubmit your listing anytime.',
    sort_order: 3,
    is_active: true,
    is_chatbot_knowledge: true,
  },
  {
    id: 'faq-4',
    category: 'listing',
    question: 'Is listing a plot on Sasta Plots free?',
    answer:
      'Yes! Standard plot and property listings on Sasta Plots are 100% free with no mandatory fees. We do not charge commissions on successfully closed transactions between buyers and sellers.',
    sort_order: 4,
    is_active: true,
    is_chatbot_knowledge: true,
  },
  // Buying FAQs
  {
    id: 'faq-5',
    category: 'buying',
    question: 'How do I contact a property seller or plot owner?',
    answer:
      'Open the property details page. You will find direct "Call Seller" and "WhatsApp" buttons, as well as an enquiry form to send your questions and contact details directly to the verified seller.',
    sort_order: 1,
    is_active: true,
    is_chatbot_knowledge: true,
  },
  {
    id: 'faq-6',
    category: 'buying',
    question: 'What does "Admin Verified" and "Verified Title" mean?',
    answer:
      '"Admin Approved" means our moderation team has verified that the listing contains real photographs, realistic pricing, and authentic location markers. "Verified Title" indicates that revenue records or RERA/DTCP approvals have been examined. We always strongly recommend that buyers conduct independent legal due diligence before making advance payments.',
    sort_order: 2,
    is_active: true,
    is_chatbot_knowledge: true,
  },
  {
    id: 'faq-7',
    category: 'buying',
    question: 'Can I visit the property before making any commitment?',
    answer:
      'Yes, absolutely. We encourage buyers to coordinate site inspections directly with the property owner or representative. Never pay any booking token or token advance before inspecting the physical site and reviewing registry documents.',
    sort_order: 3,
    is_active: true,
    is_chatbot_knowledge: true,
  },
  // Account FAQs
  {
    id: 'faq-8',
    category: 'account',
    question: 'How do I create and verify my account?',
    answer:
      'Click "Login / Register" in the top navigation and select "Create Account". Provide your name, mobile number, and email. You will receive a verification email or OTP to activate your account.',
    sort_order: 1,
    is_active: true,
    is_chatbot_knowledge: true,
  },
  {
    id: 'faq-9',
    category: 'account',
    question: 'Can I switch my account between Buyer and Seller?',
    answer:
      'Yes. Every user on Sasta Plots can save favorite plots and search listings as a buyer, as well as post properties as an owner or agent through their profile dashboard.',
    sort_order: 2,
    is_active: true,
    is_chatbot_knowledge: true,
  },
  // General & Safety FAQs
  {
    id: 'faq-10',
    category: 'general',
    question: 'How do I report a suspicious or fraudulent listing?',
    answer:
      'On any property detail page, click "Report Listing" near the bottom. Select the violation category (e.g., incorrect price, fake photos, already sold, disputed land) and submit your observations. Our moderation team reviews reports within 12 hours.',
    sort_order: 1,
    is_active: true,
    is_chatbot_knowledge: true,
  },
  {
    id: 'faq-11',
    category: 'general',
    question: 'What land measurement units are supported?',
    answer:
      'We support all major Indian land units including Square Feet (sq.ft), Square Yards (sq.yd/gaj), Square Meters (sq.m), Acres, Hectares, Bighas, Marlas, Kanals, Gunthas, and Grounds.',
    sort_order: 2,
    is_active: true,
    is_chatbot_knowledge: true,
  },
]

const CATEGORY_TABS = [
  { id: 'all', label: 'All FAQs', icon: HelpCircle },
  { id: 'listing', label: 'Posting & Listing', icon: FileText },
  { id: 'buying', label: 'Buying & Enquiries', icon: ShoppingBag },
  { id: 'account', label: 'Account & Verification', icon: UserCheck },
  { id: 'general', label: 'Safety & General', icon: ShieldAlert },
]

export const FAQsPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>(DEFAULT_FAQS)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    'faq-1': true,
    'faq-5': true,
  })

  // Fetch live FAQs from API if available
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await api.get('/faqs')
        const data = res.data?.data || res.data
        if (Array.isArray(data) && data.length > 0) {
          setFaqs(data)
        }
      } catch {
        // Fallback default FAQs are already active
      }
    }
    fetchFaqs()
  }, [])

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const expandAll = () => {
    const next: Record<string, boolean> = {}
    faqs.forEach((f) => {
      next[f.id] = true
    })
    setOpenIds(next)
  }

  const collapseAll = () => {
    setOpenIds({})
  }

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return faqs.filter((faq) => {
      if (activeCategory !== 'all' && faq.category.toLowerCase() !== activeCategory.toLowerCase()) {
        return false
      }
      if (!query) return true
      return (
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      )
    })
  }, [faqs, activeCategory, searchQuery])

  return (
    <div className="min-h-screen bg-[#FFFDFB]">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#FFF0E0] via-[#FFF8F2] to-[#FFFDFB] py-14 md:py-20 border-b border-[#EAEAEA]">
        <div className="container-custom text-center max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F47B20]/15 text-[#F47B20] mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Help & Knowledge Base
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#202124] tracking-tight mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-base text-[#727272] max-w-xl mx-auto leading-relaxed">
            Everything you need to know about browsing plots, posting properties, title approvals, and account security on Sasta Plots.
          </p>

          {/* Search Box */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords (e.g. approval, post plot, RERA, refund)..."
              className="w-full bg-white border border-[#EAEAEA] rounded-2xl pl-12 pr-10 py-3.5 text-sm text-[#202124] placeholder-gray-400 shadow-md focus:outline-none focus:border-[#F47B20] focus:ring-4 focus:ring-orange-100 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="container-custom py-10 md:py-16 max-w-4xl">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 pb-3 overflow-x-auto no-scrollbar border-b border-[#EAEAEA] mb-8">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeCategory === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#F47B20] text-white shadow-xs'
                    : 'bg-white border border-[#EAEAEA] text-[#727272] hover:border-[#F47B20] hover:text-[#202124]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Header Controls: Count & Expand All */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs sm:text-sm text-[#727272]">
            Showing <span className="font-bold text-[#202124]">{filteredFaqs.length}</span> questions
          </p>
          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={expandAll}
              className="text-[#F47B20] hover:underline font-medium"
            >
              Expand All
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={collapseAll}
              className="text-[#727272] hover:text-[#202124] font-medium"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* FAQs Accordion List */}
        {filteredFaqs.length > 0 ? (
          <div className="space-y-4">
            {filteredFaqs.map((faq) => {
              const isOpen = !!openIds[faq.id]
              return (
                <div
                  key={faq.id}
                  className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden shadow-2xs transition-all hover:border-[#FCD2B2]"
                >
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="font-semibold text-base sm:text-lg text-[#202124] leading-snug">
                      {faq.question}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full bg-[#FFF8F2] text-[#F47B20] flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 bg-[#F47B20] text-white' : ''
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base text-[#727272] leading-relaxed border-t border-gray-50">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white border border-[#EAEAEA] rounded-2xl p-12 text-center">
            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-base text-[#202124]">No questions found</h3>
            <p className="text-xs text-[#727272] mt-1 mb-4">
              We couldn't find any FAQs matching "{searchQuery}".
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setActiveCategory('all')
              }}
              className="btn-primary btn-sm mx-auto"
            >
              Reset Search & Filter
            </button>
          </div>
        )}

        {/* Still Have Questions CTA */}
        <div className="mt-14 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-8 border border-orange-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-bold text-lg text-[#202124]">
              Still have unanswered questions?
            </h3>
            <p className="text-xs sm:text-sm text-[#727272] mt-1 max-w-md">
              Our real estate support desk and interactive Sasta Plots Assistant are available 24/7 to help you.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/contact" className="btn-primary btn-sm whitespace-nowrap">
              <PhoneCall className="w-4 h-4" />
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQsPage
