import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  UserCheck,
  Server,
  Mail,
  Printer,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'

const SECTIONS = [
  { id: 'introduction', label: '1. Introduction & Overview' },
  { id: 'collection', label: '2. Information We Collect' },
  { id: 'usage', label: '3. How We Use Your Data' },
  { id: 'cookies', label: '4. Cookies & Tracking' },
  { id: 'third-parties', label: '5. Third-Party Disclosures' },
  { id: 'security', label: '6. Storage & Security' },
  { id: 'rights', label: '7. Your Statutory Rights' },
  { id: 'grievance', label: '8. Grievance Officer & Contact' },
]

export const PrivacyPolicyPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('introduction')

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
            <ShieldCheck className="w-3.5 h-3.5" /> Legal & Compliance
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#202124] tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#727272]">
            Last Updated: October 14, 2026 • Compliant with Indian IT Act 2000 & DPDPA 2023
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => window.print()}
              className="btn-secondary btn-sm text-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print Policy
            </button>
            <Link to="/terms" className="btn-ghost btn-sm text-xs flex items-center gap-1">
              Terms of Service <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <div className="container-custom py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sticky Table of Contents Sidebar */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="bg-white border border-[#EAEAEA] rounded-2xl p-5 sticky top-24 shadow-xs">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#727272] mb-3">
                Contents
              </h3>
              <nav className="space-y-1">
                {SECTIONS.map((sec) => (
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
                <p className="font-semibold text-[#202124]">Need privacy clarification?</p>
                <p>Email our designated Data Protection Officer at privacy@sastaplots.com.</p>
              </div>
            </div>
          </aside>

          {/* Policy Body */}
          <main className="lg:col-span-8 bg-white border border-[#EAEAEA] rounded-3xl p-6 sm:p-10 shadow-xs space-y-10 text-sm text-[#202124] leading-relaxed">
            {/* 1. Introduction */}
            <section id="introduction" className="space-y-4">
              <div className="flex items-center gap-2 text-[#F47B20]">
                <FileText className="w-5 h-5" />
                <h2 className="text-xl font-bold text-[#202124]">1. Introduction & Overview</h2>
              </div>
              <p>
                Welcome to <strong>Sasta Plots</strong> ("we," "our," or "us"). We are committed to protecting your personal data and respecting your privacy rights. This Privacy Policy details how we collect, process, store, and safeguard your personal information when you visit our website, utilize our mobile applications, post property listings, or contact property sellers.
              </p>
              <p>
                By accessing or using Sasta Plots, you acknowledge that you have read and understood this Privacy Policy and consent to the data practices described herein, pursuant to the Indian Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and the Digital Personal Data Protection Act (DPDPA), 2023.
              </p>
            </section>

            {/* 2. Information We Collect */}
            <section id="collection" className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#F47B20]">
                <UserCheck className="w-5 h-5" />
                <h2 className="text-xl font-bold text-[#202124]">2. Information We Collect</h2>
              </div>
              <p>We collect several categories of information to provide seamless real estate marketplace services:</p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>
                  <strong>Account & Profile Information:</strong> Name, email address, mobile phone number, profile photo, and password when you register. For sellers and agents, we may collect business name, RERA registration numbers, and identity verification credentials.
                </li>
                <li>
                  <strong>Property Listing Data:</strong> Title deeds, plot location coordinates (GPS), dimensions, road width, asking price, layout approval details (e.g., DTCP, HMDA, BDA, RERA), and property photographs uploaded by sellers.
                </li>
                <li>
                  <strong>Enquiry & Communication Logs:</strong> Messages, feedback, and phone enquiry logs exchanged between prospective buyers and sellers via our platform.
                </li>
                <li>
                  <strong>Technical & Device Data:</strong> IP address, browser type, operating system version, device identifiers, referral URLs, and session logs gathered automatically for security and audit purposes.
                </li>
              </ul>
            </section>

            {/* 3. How We Use Your Data */}
            <section id="usage" className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#F47B20]">
                <Eye className="w-5 h-5" />
                <h2 className="text-xl font-bold text-[#202124]">3. How We Use Your Data</h2>
              </div>
              <p>We process your personal information strictly for legitimate business and transactional purposes:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-1">Listing Verification</h4>
                  <p className="text-gray-600">To inspect ownership authenticity, boundary accuracy, and eliminate deceptive or unauthorized listings.</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-1">Connecting Buyers & Sellers</h4>
                  <p className="text-gray-600">To transmit buyer contact information and purchase enquiries directly to property owners.</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-1">Fraud Detection & Security</h4>
                  <p className="text-gray-600">To detect rate-limit abuse, prevent robotic scrapers, and maintain append-only audit trail logs.</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-1">Customer Support & AI Help</h4>
                  <p className="text-gray-600">To power the Sasta Plots Assistant chatbot and address grievance tickets effectively.</p>
                </div>
              </div>
            </section>

            {/* 4. Cookies & Tracking */}
            <section id="cookies" className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#F47B20]">
                <Server className="w-5 h-5" />
                <h2 className="text-xl font-bold text-[#202124]">4. Cookies & Web Tracking</h2>
              </div>
              <p>
                We use strictly necessary cookies to keep you logged in, persist your saved favorite plots, and remember search filters. We also employ secure session tokens for our AI Chatbot sessions. You can configure your browser to decline non-essential cookies; however, certain portal functions may not operate as intended without session storage.
              </p>
            </section>

            {/* 5. Third-Party Disclosures */}
            <section id="third-parties" className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#F47B20]">
                <Lock className="w-5 h-5" />
                <h2 className="text-xl font-bold text-[#202124]">5. Third-Party Disclosures</h2>
              </div>
              <p>
                We do not sell, rent, or trade your personal information to third-party telemarketers. We share information solely with:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>
                  <strong>Verified Sellers:</strong> When you submit an enquiry form or click to contact a seller, your name and phone number are shared with that specific listing owner.
                </li>
                <li>
                  <strong>Infrastructure & Service Providers:</strong> Secure database cloud providers (Supabase), AI language model APIs for customer support, and SMS/email delivery gateways operating under strict non-disclosure obligations.
                </li>
                <li>
                  <strong>Legal Authorities:</strong> Where mandated by court orders, lawful requests from law enforcement agencies, or to prevent financial fraud and property extortion.
                </li>
              </ul>
            </section>

            {/* 6. Storage & Security */}
            <section id="security" className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#F47B20]">
                <ShieldCheck className="w-5 h-5" />
                <h2 className="text-xl font-bold text-[#202124]">6. Storage & Security Measures</h2>
              </div>
              <p>
                Your data is stored on encrypted database clusters hosted within Indian data centers. We enforce industry-standard security protocols including HTTPS/TLS 1.3 encryption in transit, bcrypt password hashing, JWT authentication tokens, and strict PostgreSQL Row Level Security (RLS) policies.
              </p>
            </section>

            {/* 7. Your Statutory Rights */}
            <section id="rights" className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#F47B20]">
                <UserCheck className="w-5 h-5" />
                <h2 className="text-xl font-bold text-[#202124]">7. Your Statutory Rights</h2>
              </div>
              <p>Under the Digital Personal Data Protection Act (DPDPA), 2023, you enjoy the right to:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
                <li>Access a summary of your personal data processed by Sasta Plots.</li>
                <li>Request correction, completion, or updating of inaccurate personal data.</li>
                <li>Request deletion or erasure of your account and associated listings.</li>
                <li>Withdraw consent previously granted for promotional communications.</li>
              </ul>
              <p className="text-xs text-gray-500 mt-2">
                To exercise any of these rights, submit a formal request to our grievance officer listed below.
              </p>
            </section>

            {/* 8. Grievance Officer */}
            <section id="grievance" className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#F47B20]">
                <Mail className="w-5 h-5" />
                <h2 className="text-xl font-bold text-[#202124]">8. Grievance Officer & Contact</h2>
              </div>
              <p>
                In compliance with the Information Technology Act 2000 and the Rules made thereunder, the designated Grievance Officer for Sasta Plots is:
              </p>

              <div className="bg-[#FFF8F2] border border-[#FFE4CC] rounded-2xl p-5 text-xs text-[#202124] space-y-1.5">
                <p className="font-bold text-sm">Grievance Redressal Officer: Mr. Rajeshwar Rao</p>
                <p>Company: Sasta Plots Marketplace India Private Limited</p>
                <p>Email: <a href="mailto:grievance@sastaplots.com" className="text-[#F47B20] font-semibold underline">grievance@sastaplots.com</a></p>
                <p>Address: Level 4, DLF Cyber City, Sector 24, Gurugram, Haryana - 122002, India</p>
                <p>Response Timeline: We acknowledge grievances within 48 hours and resolve them within 30 days as prescribed by law.</p>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage
