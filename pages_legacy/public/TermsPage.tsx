'use client'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Scale,
  ShieldAlert,
  AlertTriangle,
  Gavel,
  CheckCircle,
  Printer,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'

const TERMS_SECTIONS = [
  { id: 'acceptance', label: '1. Acceptance & Eligibility' },
  { id: 'intermediary', label: '2. Role as an Intermediary' },
  { id: 'accounts', label: '3. User Accounts & Security' },
  { id: 'listings', label: '4. Listing Guidelines & Seller Duties' },
  { id: 'prohibited', label: '5. Prohibited Conduct & Content' },
  { id: 'liability', label: '6. Limitation of Liability' },
  { id: 'intellectual-property', label: '7. Intellectual Property' },
  { id: 'governing-law', label: '8. Dispute Resolution & Indian Law' },
  { id: 'modifications', label: '9. Amendments & Contact' },
]

export const TermsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('acceptance')

  const scrollTo = (id: string) => {
    setActiveSection(id)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFDFB]">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#FFF0E0] via-[#FFF8F2] to-[#FFFDFB] py-14 border-b border-[#EAEAEA]">
        <div className="container-custom max-w-4xl text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F47B20]/15 text-[#F47B20] mb-3">
            <Scale className="w-3.5 h-3.5" /> User Agreement
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#202124] tracking-tight mb-3">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-[#727272]">
            Effective Date: October 14, 2026 • Governed by the Laws of the Republic of India
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => window.print()}
              className="btn-secondary btn-sm text-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print Terms
            </button>
            <Link to="/listing-guidelines" className="btn-ghost btn-sm text-xs flex items-center gap-1">
              Listing Guidelines <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <div className="container-custom py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sticky Sidebar */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="bg-white border border-[#EAEAEA] rounded-2xl p-5 sticky top-24 shadow-xs">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#727272] mb-3">
                Clauses & Sections
              </h3>
              <nav className="space-y-1">
                {TERMS_SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollTo(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                      activeSection === sec.id
                        ? 'bg-[#FFF8F2] text-[#F47B20] font-semibold'
                        : 'text-gray-600 hover:text-[#202124] hover:bg-gray-50'
                    }`}
                  >
                    <span>{sec.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-4 border-t border-[#EAEAEA] text-xs text-[#727272] space-y-2">
                <p className="font-semibold text-[#202124]">Questions about terms?</p>
                <p>Reach our legal desk at legal@sastaplots.com.</p>
              </div>
            </div>
          </aside>

          {/* Terms Content */}
          <main className="lg:col-span-8 bg-white border border-[#EAEAEA] rounded-3xl p-6 sm:p-10 shadow-xs space-y-10 text-sm text-[#202124] leading-relaxed">
            {/* 1. Acceptance & Eligibility */}
            <section id="acceptance" className="space-y-4">
              <div className="flex items-center gap-2 text-[#F47B20]">
                <CheckCircle className="w-5 h-5" />
                <h2 className="text-xl font-bold text-[#202124]">1. Acceptance & Eligibility</h2>
              </div>
              <p>
                These Terms of Service constitute a legally binding electronic contract between you ("User," "Buyer," "Seller," or "You") and <strong>Sasta Plots</strong> ("Platform," "We," or "Us"). By creating an account, browsing listings, submitting enquiries, or posting property advertisements, you agree to be bound by these Terms.
              </p>
              <p>
                You represent and warrant that you are at least 18 years of age, legally competent to enter into contracts under the Indian Contract Act, 1872, and not barred by any regulatory body from purchasing or selling real estate.
              </p>
            </section>

            {/* 2. Intermediary Role */}
            <section id="intermediary" className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#F47B20]">
                <Scale className="w-5 h-5" />
                <h2 className="text-xl font-bold text-[#202124]">2. Role as an Intermediary</h2>
              </div>
              <p>
                Sasta Plots operates purely as an online real estate marketplace and communications platform classified as an <strong>"Intermediary"</strong> under Section 2(1)(w) of the Information Technology Act, 2000.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Crucial Notice to Buyers & Sellers:
                </p>
                <p>
                  Sasta Plots does not own, manage, inspect boundaries of, or hold title deed custody of properties posted on the portal. We are neither real estate brokers nor escrow holding agents. Users are solely responsible for conducting independent physical surveys, legal searches at the Sub-Registrar Office, encumbrance verification, and revenue record checks before disbursing funds.
                </p>
              </div>
            </section>

            {/* 3. Accounts & Security */}
            <section id="accounts" className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#F47B20]">
                <FileText className="w-5 h-5" />
                <h2 className="text-xl font-bold text-[#202124]">3. User Accounts & Security</h2>
              </div>
              <p>
                When you create an account, you agree to supply authentic, current, and verifiable details. You are responsible for safeguarding your credentials and for all activities conducted under your login. You must notify us immediately at security@sastaplots.com upon discovering unauthorized account access.
              </p>
            </section>

            {/* 4. Listing Guidelines & Seller Duties */}
            <section id="listings" className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#F47B20]">
                <ShieldAlert className="w-5 h-5" />
                <h2 className="text-xl font-bold text-[#202124]">4. Listing Guidelines & Seller Duties</h2>
              </div>
              <p>
                Any user posting a plot, commercial property, or agricultural land confirms and covenants that:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
                <li>They hold lawful title or valid written power of attorney/developer mandate to market the plot.</li>
                <li>The plot dimensions, road width, asking price, and layout approval status (DTCP/HMDA/BDA/RERA) are 100% accurate.</li>
                <li>The photographs uploaded are genuine, unedited site photographs taken at the property location.</li>
                <li>The property is free from undisclosed mortgages, government acquisitions, or litigation proceedings.</li>
              </ul>
              <p className="text-xs text-[#727272]">
                For comprehensive listing criteria, please review our separate{' '}
                <Link to="/listing-guidelines" className="text-[#F47B20] font-semibold underline">
                  Listing Guidelines
                </Link>
                .
              </p>
            </section>

            {/* 5. Prohibited Conduct */}
            <section id="prohibited" className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#F47B20]">
                <AlertTriangle className="w-5 h-5" />
                <h2 className="text-xl font-bold text-[#202124]">5. Prohibited Conduct & Content</h2>
              </div>
              <p>Users must not under any circumstances:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
                <li>Upload fake listings, duplicate listings, or unauthorized contact phone numbers.</li>
                <li>List forest land, eco-sensitive tribal land, or properties under litigation.</li>
                <li>Scrape, crawl, or harvest listings, prices, or user phone numbers using automated robots.</li>
                <li>Send spam enquiries, phishing links, or abusive messages through our chat or forms.</li>
                <li>Attempt to bypass rate limits or compromise server architecture.</li>
              </ul>
            </section>

            {/* 6. Limitation of Liability */}
            <section id="liability" className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#F47B20]">
                <Scale className="w-5 h-5" />
                <h2 className="text-xl font-bold text-[#202124]">6. Limitation of Liability</h2>
              </div>
              <p>
                To the fullest extent permissible under Indian law, Sasta Plots and its directors, employees, and affiliates shall not be liable for any direct, indirect, incidental, punitive, or consequential damages arising out of property sale disputes, title deed fraud committed by third-party sellers, delayed registry execution, loss of financial deposits, or site inaccuracies.
              </p>
            </section>

            {/* 7. Intellectual Property */}
            <section id="intellectual-property" className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#F47B20]">
                <FileText className="w-5 h-5" />
                <h2 className="text-xl font-bold text-[#202124]">7. Intellectual Property</h2>
              </div>
              <p>
                All brand marks, logos, user interface designs, AI assistant prompts, and codebases associated with Sasta Plots are the proprietary property of Sasta Plots Marketplace India. Sellers retain copyright over their personal photographs but grant Sasta Plots a non-exclusive, worldwide, royalty-free license to display, promote, and index such listings.
              </p>
            </section>

            {/* 8. Dispute Resolution & Governing Law */}
            <section id="governing-law" className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#F47B20]">
                <Gavel className="w-5 h-5" />
                <h2 className="text-xl font-bold text-[#202124]">8. Dispute Resolution & Indian Law</h2>
              </div>
              <p>
                These Terms shall be interpreted, construed, and enforced in accordance with the <strong>laws of the Republic of India</strong>. Any dispute, controversy, or claim arising out of these Terms shall first be attempted to be settled amicably within 30 days. If unsettled, it shall be referred to arbitration in New Delhi under the Indian Arbitration and Conciliation Act, 1996. The competent courts in New Delhi shall have exclusive jurisdiction.
              </p>
            </section>

            {/* 9. Amendments & Contact */}
            <section id="modifications" className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#F47B20]">
                <FileText className="w-5 h-5" />
                <h2 className="text-xl font-bold text-[#202124]">9. Amendments & Contact</h2>
              </div>
              <p>
                We reserve the right to modify these Terms at any time. When modifications occur, we will update the "Effective Date" at the top of this page. Continued usage of Sasta Plots following notice of changes constitutes your consent to the revised terms.
              </p>
              <p className="text-xs text-[#727272]">
                For legal notices or clarification, write to{' '}
                <a href="mailto:legal@sastaplots.com" className="text-[#F47B20] font-semibold underline">
                  legal@sastaplots.com
                </a>
                .
              </p>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}

export default TermsPage
