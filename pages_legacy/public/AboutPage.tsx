'use client'
import React from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Zap,
  Users,
  Compass,
  Award,
  CheckCircle2,
  TrendingUp,
  HeartHandshake,
  ArrowRight,
  PhoneCall,
  Sparkles,
  Building,
} from 'lucide-react'

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FFFDFB]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#FFF0E0] via-[#FFF8F2] to-white py-16 md:py-24 border-b border-[#EAEAEA] overflow-hidden">
        <div className="container-custom relative z-10 text-center max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F47B20]/15 text-[#F47B20] mb-4">
            <Sparkles className="w-3.5 h-3.5" /> India's Most Trusted Land Marketplace
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#202124] tracking-tight mb-6 leading-tight">
            Democratizing Land & Plot Ownership Across India
          </h1>
          <p className="text-base sm:text-lg text-[#727272] max-w-2xl mx-auto leading-relaxed">
            Sasta Plots was founded with a single mission: to eliminate real estate opacity, unearth affordable verified plots, and connect genuine buyers directly with property owners without intermediaries.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/buy" className="btn-primary">
              Explore Properties
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/contact" className="btn-secondary">
              Talk to Our Team
            </Link>
          </div>
        </div>

        {/* Decorative background blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-orange-200/30 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Key Numbers / Stats */}
      <section className="border-b border-[#EAEAEA] bg-white py-12">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#F47B20]">15,000+</p>
              <p className="text-xs sm:text-sm font-semibold text-[#202124] mt-1">Verified Listings</p>
              <p className="text-xs text-[#727272] mt-0.5">Across urban & rural India</p>
            </div>
            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#202124]">100+</p>
              <p className="text-xs sm:text-sm font-semibold text-[#202124] mt-1">Cities Covered</p>
              <p className="text-xs text-[#727272] mt-0.5">30+ states & union territories</p>
            </div>
            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#168653]">₹0</p>
              <p className="text-xs sm:text-sm font-semibold text-[#202124] mt-1">Hidden Brokerage</p>
              <p className="text-xs text-[#727272] mt-0.5">Direct buyer-seller connects</p>
            </div>
            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#F47B20]">98%</p>
              <p className="text-xs sm:text-sm font-semibold text-[#202124] mt-1">Satisfied Buyers</p>
              <p className="text-xs text-[#727272] mt-0.5">Based on independent reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission & Values */}
      <section className="py-16 md:py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-[#F47B20] uppercase tracking-wider block mb-2">
                Our Purpose
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] mb-4">
                Making land ownership transparent, safe, and accessible to everyone.
              </h2>
              <p className="text-sm sm:text-base text-[#727272] leading-relaxed mb-4">
                In India, investing in land or residential plots has historically been plagued by misleading property descriptions, inflated middleman commissions, and ambiguity around legal title records.
              </p>
              <p className="text-sm sm:text-base text-[#727272] leading-relaxed mb-6">
                Sasta Plots combines smart technological verification with localized real estate compliance. Every listing undergoes mandatory verification of title ownership, layout approvals (DTCP, HMDA, BDA, RERA), and road access before being published.
              </p>

              <div className="space-y-3">
                {[
                  'Rigorous 24-48 hour manual & digital listing moderation',
                  'Clear unit measurements in sq.ft, sq.yd, bighas, and acres',
                  'Direct contact with property owners via phone or WhatsApp',
                  'AI Chatbot to help you discover parcels within your exact budget',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-[#168653] shrink-0 mt-0.5" />
                    <span className="text-sm text-[#202124] font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80"
                  alt="Modern real estate development"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white border border-[#EAEAEA] p-5 rounded-2xl shadow-xl max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#F47B20] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#202124]">100% Genuine Listings</h4>
                    <p className="text-[11px] text-[#727272]">Zero unauthorized duplicate postings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How the Platform Works */}
      <section className="bg-gradient-to-b from-[#FFF8F2] to-white py-16 md:py-20 border-y border-[#EAEAEA]">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-[#F47B20] uppercase tracking-wider block mb-2">
              Simple 4-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124]">
              How Sasta Plots Works
            </h2>
            <p className="text-sm text-[#727272] mt-2">
              Whether you are buying your first investment plot or listing prime land, our process is fast and transparent.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Search & Filter',
                desc: 'Filter by budget, layout approval, city, facing direction, and road access with accurate price per unit.',
                icon: Compass,
              },
              {
                step: '02',
                title: 'Review Verification',
                desc: 'Inspect high-resolution photographs, GPS coordinates, plot dimensions, and verification badges.',
                icon: ShieldCheck,
              },
              {
                step: '03',
                title: 'Direct Connect',
                desc: 'Connect with verified property owners or authorised builders via WhatsApp or phone call instantly.',
                icon: PhoneCall,
              },
              {
                step: '04',
                title: 'Close with Confidence',
                desc: 'Schedule on-site visits, conduct legal title deed due diligence, and seal your transaction transparently.',
                icon: HeartHandshake,
              },
            ].map((card, i) => {
              const Icon = card.icon
              return (
                <div
                  key={i}
                  className="card bg-white p-6 rounded-2xl relative border border-[#EAEAEA] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black text-orange-200">
                        {card.step}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-[#FFF8F2] text-[#F47B20] flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="font-bold text-base text-[#202124] mb-2">{card.title}</h3>
                    <p className="text-xs sm:text-sm text-[#727272] leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-20">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-[#F47B20] uppercase tracking-wider block mb-2">
              Our Advantages
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124]">
              Why Choose Sasta Plots?
            </h2>
            <p className="text-sm text-[#727272] mt-2">
              Built specifically for Indian land buyers and sellers who value truth and simplicity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-6 rounded-2xl border border-[#EAEAEA]">
              <div className="w-12 h-12 rounded-xl bg-green-50 text-[#168653] flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#202124] mb-2">Zero Spam & Fake Leads</h3>
              <p className="text-xs sm:text-sm text-[#727272] leading-relaxed">
                All submissions undergo our admin approval filter. We reject duplicate listings, inaccurate boundaries, and non-verifiable sellers.
              </p>
            </div>

            <div className="card p-6 rounded-2xl border border-[#EAEAEA]">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#F47B20] flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#202124] mb-2">Honest Price Discovery</h3>
              <p className="text-xs sm:text-sm text-[#727272] leading-relaxed">
                Clear price per sq.ft, sq.yd, or acre based on prevailing circle rates and market value, preventing overpaying.
              </p>
            </div>

            <div className="card p-6 rounded-2xl border border-[#EAEAEA]">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#202124] mb-2">AI-Powered Search Assistant</h3>
              <p className="text-xs sm:text-sm text-[#727272] leading-relaxed">
                Ask our Sasta Plots Assistant any question in plain English or Hindi. Find plots under ₹15 Lakh in minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section Placeholder */}
      <section className="bg-white py-16 md:py-20 border-t border-[#EAEAEA]">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-[#F47B20] uppercase tracking-wider block mb-2">
              The People Behind
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124]">
              Leadership & Advisory Team
            </h2>
            <p className="text-sm text-[#727272] mt-2">
              A passionate team of real estate veterans, property lawyers, and software engineers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Anand Verma',
                role: 'Founder & CEO',
                desc: '15+ years in Indian land acquisitions and civil planning.',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
              },
              {
                name: 'Pooja Kulkarni',
                role: 'Head of Legal & Title Verification',
                desc: 'Former High Court advocate specializing in property revenue laws.',
                avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
              },
              {
                name: 'Rohit Deshmukh',
                role: 'Chief Technology Officer',
                desc: 'Building high-scale marketplace technology and AI tools.',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
              },
              {
                name: 'Meera Nambiar',
                role: 'Head of Customer Experience',
                desc: 'Ensuring seamless connections between plot buyers and owners.',
                avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
              },
            ].map((member, i) => (
              <div
                key={i}
                className="card bg-white p-5 rounded-2xl border border-[#EAEAEA] text-center"
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto object-cover mb-4 border-2 border-orange-200"
                />
                <h3 className="font-bold text-base text-[#202124]">{member.name}</h3>
                <p className="text-xs font-semibold text-[#F47B20] mb-2">{member.role}</p>
                <p className="text-xs text-[#727272] leading-relaxed">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bg-gradient-to-r from-[#F47B20] to-[#E96512] text-white py-14">
        <div className="container-custom text-center max-w-3xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3">
            Looking to list a plot or find your ideal investment?
          </h2>
          <p className="text-sm sm:text-base text-white/90 mb-8 max-w-xl mx-auto">
            Our team of plot specialists is ready to guide you through approval guidelines, market trends, and verification procedures.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/contact"
              className="bg-white text-[#F47B20] hover:bg-orange-50 font-semibold px-6 py-3 rounded-xl text-sm shadow-md transition-all"
            >
              Contact Our Advisors
            </Link>
            <Link
              to="/buy"
              className="bg-black/25 hover:bg-black/35 text-white font-semibold px-6 py-3 rounded-xl text-sm border border-white/20 transition-all"
            >
              Browse All Listings
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
