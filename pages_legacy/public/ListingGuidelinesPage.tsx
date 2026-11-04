'use client'
import React from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertOctagon,
  FileCheck,
  Camera,
  Compass,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react'

export const ListingGuidelinesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FFFDFB]">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#FFF0E0] via-[#FFF8F2] to-[#FFFDFB] py-14 md:py-20 border-b border-[#EAEAEA]">
        <div className="container-custom text-center max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F47B20]/15 text-[#F47B20] mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Quality & Safety Standards
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#202124] tracking-tight mb-4">
            Property Listing Guidelines
          </h1>
          <p className="text-base text-[#727272] max-w-2xl mx-auto leading-relaxed">
            To preserve trust across Sasta Plots, all listings undergo review. Learn what is permitted, the documentation required, and how to get approved quickly.
          </p>

          <div className="mt-8 flex justify-center gap-3">
            <Link to="/post-property" className="btn-primary">
              Post Your Property
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/faqs" className="btn-secondary">
              Browse FAQs
            </Link>
          </div>
        </div>
      </section>

      <div className="container-custom py-12 md:py-16 max-w-5xl space-y-16">
        {/* Allowed vs Prohibited Grid */}
        <section>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124]">
              What's Allowed & What's Prohibited
            </h2>
            <p className="text-xs sm:text-sm text-[#727272] mt-1.5">
              Strict rules to guarantee authenticity for prospective property buyers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Allowed Card */}
            <div className="bg-white border-2 border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-emerald-950">
                    Allowed & Encouraged
                  </h3>
                  <p className="text-xs text-emerald-700">Acceptable listing criteria</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-gray-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Clear Freehold / Leasehold Titles:</strong> Residential plots, agricultural parcels, and commercial lands with demonstrable owner title.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Authentic Site Photographs:</strong> Real ground-level photos showing boundary demarcations, access roads, and surroundings.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Approved Layouts:</strong> Plots carrying DTCP, HMDA, BDA, CMDA, PUDA, or RERA approval reference numbers.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Accurate Pricing & Dimensions:</strong> Genuine prices reflecting market rates and actual measured area (sq.ft / sq.yd / acre).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Direct Contact Details:</strong> Active phone numbers and email of the actual plot owner or authorized broker.</span>
                </li>
              </ul>
            </div>

            {/* Prohibited Card */}
            <div className="bg-white border-2 border-red-200 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-red-950">
                    Strictly Prohibited
                  </h3>
                  <p className="text-xs text-red-700">Violations leading to immediate removal</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-gray-700">
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span><strong>Disputed or Encroached Lands:</strong> Properties involved in ongoing civil court litigation, stay orders, or revenue disputes.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span><strong>Stock / Fake Imagery:</strong> 3D renders from unrelated projects, stock agency images, or photos belonging to other properties.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span><strong>Duplicate Postings:</strong> Multiple listings for the same land parcel by the same or different accounts to flood results.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span><strong>Bait Pricing:</strong> Unrealistic low token prices entered merely to top search rankings or mislead buyers.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span><strong>Prohibited Forest / Eco-Sensitive Zones:</strong> Unapproved green belt, forest lands, water body catchment buffers, or tribal lands.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Approval Workflow */}
        <section className="bg-white border border-[#EAEAEA] rounded-3xl p-6 sm:p-10 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#F47B20] uppercase tracking-wider block mb-1">
              Inspection Lifecycle
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124]">
              The 4-Step Listing Approval Process
            </h2>
            <p className="text-xs sm:text-sm text-[#727272] mt-1.5">
              How your property moves from draft submission to public discovery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Submission',
                desc: 'User completes the 7-step submission form with photos, coordinates, and price breakdown.',
                time: 'Instant',
              },
              {
                step: '02',
                title: 'Automated Checks',
                desc: 'Algorithms screen for duplicate images, unrealistic pricing anomalies, and contact number validity.',
                time: '< 10 minutes',
              },
              {
                step: '03',
                title: 'Manual Review',
                desc: 'Our real estate moderation officers verify layout approvals, road width, and locality tagging.',
                time: '24 - 48 Hours',
              },
              {
                step: '04',
                title: 'Publication & Alerts',
                desc: 'Listing goes live with SEO indexing, featured badges (if applicable), and buyer notifications.',
                time: 'Live',
              },
            ].map((st, i) => (
              <div key={i} className="p-5 rounded-2xl bg-[#FFFDFB] border border-[#EAEAEA] relative">
                <span className="text-3xl font-black text-orange-200 block mb-2">{st.step}</span>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-[#202124]">{st.title}</h3>
                  <span className="text-[10px] font-semibold text-[#F47B20] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                    {st.time}
                  </span>
                </div>
                <p className="text-xs text-[#727272] leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Verification Badges Explained */}
        <section>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124]">
              Document Verification Process
            </h2>
            <p className="text-xs sm:text-sm text-[#727272] mt-1.5">
              How sellers can earn the verified badge on Sasta Plots.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#F47B20] flex items-center justify-center mb-4">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#202124] mb-2">1. Revenue Document Submission</h3>
              <p className="text-xs text-[#727272] leading-relaxed">
                Sellers upload scanned revenue records (e.g. 7/12 extract in Maharashtra, Khata certificate in Karnataka, Jamabandi in Haryana/Punjab, or Registry Sale Deed).
              </p>
            </div>

            <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#202124] mb-2">2. Title & Identity Match</h3>
              <p className="text-xs text-[#727272] leading-relaxed">
                Our verification team crosses the Aadhaar/PAN/RERA registration of the seller against government revenue database records to verify rightful ownership.
              </p>
            </div>

            <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#202124] mb-2">3. Green "Verified" Badge</h3>
              <p className="text-xs text-[#727272] leading-relaxed">
                Once confirmed, the listing receives the green "Verified" badge, boosting buyer trust, enquiry volume by 3x, and priority ranking in search queries.
              </p>
            </div>
          </div>
        </section>

        {/* Consequences of Violations */}
        <section className="bg-gradient-to-br from-red-50/50 to-orange-50/30 border border-red-100 rounded-3xl p-6 sm:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#202124]">
                Consequences of Violations
              </h2>
              <p className="text-xs text-[#727272]">Graduated enforcement policy for non-compliance</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
              <span className="font-bold text-orange-600 block mb-1">Tier 1: Needs Changes</span>
              <p className="text-gray-600">Minor issues such as blurry photos or missing road width. Moderator requests revision with instructions.</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
              <span className="font-bold text-amber-600 block mb-1">Tier 2: Rejection</span>
              <p className="text-gray-600">Incorrect pricing, duplicate listings, or unverified seller details. Listing is rejected with a formal reason.</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
              <span className="font-bold text-red-600 block mb-1">Tier 3: Account Suspension</span>
              <p className="text-gray-600">Repeated violations, fraudulent listings, or abusive behavior. Account is suspended and all active listings archived.</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
              <span className="font-bold text-red-900 block mb-1">Tier 4: Legal Reporting</span>
              <p className="text-gray-600">Forged government title deeds, cyber scams, or financial extortion are reported directly to the Cyber Crime Cell.</p>
            </div>
          </div>
        </section>

        {/* Tips for Fast Approval */}
        <section className="bg-white border border-[#EAEAEA] rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#F47B20] flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#202124] mb-2">Pro-Tip for 12-Hour Approval:</h3>
              <p className="text-xs sm:text-sm text-[#727272] leading-relaxed mb-4">
                To have your property approved in the fastest possible timeframe:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-700">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <strong>1. Clear Photos:</strong> Upload at least 3 high-res photos taken in daylight showing road frontage.
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <strong>2. Exact Coordinates:</strong> Drop the pin precisely on the plot location in Google Maps.
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <strong>3. Specify Authority:</strong> Mention layout sanction authority (DTCP / HMDA / RERA number) in the description.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default ListingGuidelinesPage
