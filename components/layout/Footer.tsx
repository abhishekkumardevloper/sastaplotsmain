'use client'

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Send,
  Building2,
  ArrowRight,
  Award,
} from 'lucide-react'
import toast from 'react-hot-toast'

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    toast.success('Subscribed to plot market price alerts!')
    setEmail('')
  }

  return (
    <footer className="bg-[#0B1120] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="container-custom">
        {/* Top Trust Ribbon */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 mb-12 border border-slate-700/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-[#F47B20] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                100% Admin-Reviewed & Verified Land Marketplace
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Every residential, commercial, and agricultural plot goes through manual admin approval before publishing.
              </p>
            </div>
          </div>
          <Link
            to="/post-property"
            className="btn-primary text-xs sm:text-sm py-2.5 px-5 shrink-0 shadow-md flex items-center gap-2"
          >
            <span>List Plot as Owner / Broker</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block py-1.5 px-3 bg-white rounded-xl shadow-xs max-w-[200px]">
              <img
                src="/logo.png"
                alt="SastaPlots - Plots Made Simple"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              India's premier dedicated real estate marketplace for verified residential plots, agricultural farm lands, and commercial spaces. Connect directly with genuine landowners and licensed brokers.
            </p>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F47B20]" />
                <a href="mailto:support@sastaplots.com" className="hover:text-white transition-colors">
                  support@sastaplots.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#F47B20]" />
                <a href="tel:+919876543210" className="hover:text-white transition-colors">
                  +91 98765 43210 (Mon - Sat, 9 AM - 7 PM)
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#F47B20] shrink-0 mt-0.5" />
                <span>Sector 62 Noida, Shaheed Path Lucknow & Connaught Place New Delhi, India</span>
              </div>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-l-2 border-[#F47B20] pl-2.5">
              Explore Land
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/buy" className="hover:text-[#F47B20] transition-colors">
                  Plots for Sale
                </Link>
              </li>
              <li>
                <Link to="/plots" className="hover:text-[#F47B20] transition-colors">
                  Residential Plots
                </Link>
              </li>
              <li>
                <Link to="/agricultural-land" className="hover:text-[#F47B20] transition-colors">
                  Agricultural Farmland
                </Link>
              </li>
              <li>
                <Link to="/commercial" className="hover:text-[#F47B20] transition-colors">
                  Commercial SCO & Plots
                </Link>
              </li>
              <li>
                <Link to="/search?is_verified=true" className="hover:text-[#F47B20] transition-colors">
                  Admin Verified Plots
                </Link>
              </li>
              <li>
                <Link to="/locations" className="hover:text-[#F47B20] transition-colors">
                  All 48+ Cities Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Corridors */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-l-2 border-[#F47B20] pl-2.5">
              Top Corridors
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/search?q=Noida" className="hover:text-[#F47B20] transition-colors">
                  Plots in Noida & Yamuna Exp
                </Link>
              </li>
              <li>
                <Link to="/search?q=Lucknow" className="hover:text-[#F47B20] transition-colors">
                  Plots in Lucknow (Kisan Path)
                </Link>
              </li>
              <li>
                <Link to="/search?q=Jaipur" className="hover:text-[#F47B20] transition-colors">
                  Plots in Jaipur (Ajmer Road)
                </Link>
              </li>
              <li>
                <Link to="/search?q=Pune" className="hover:text-[#F47B20] transition-colors">
                  Farmland in Pune & Hinjewadi
                </Link>
              </li>
              <li>
                <Link to="/search?q=Bangalore" className="hover:text-[#F47B20] transition-colors">
                  Plots in Bangalore (Sarjapur)
                </Link>
              </li>
              <li>
                <Link to="/search?q=Hyderabad" className="hover:text-[#F47B20] transition-colors">
                  Plots in Hyderabad (ORR)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter & Legal */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-l-2 border-[#F47B20] pl-2.5">
              Price Alerts
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Get notified of new admin-approved plots & verified corridor discounts.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs px-3 py-2 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#F47B20]"
              />
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl bg-[#F47B20] hover:bg-[#E96512] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>Subscribe Free</span>
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar & Legal Disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} SastaPlots Marketplace India Pvt Ltd. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <Link to="/about" className="hover:text-[#F47B20]">About Us</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-[#F47B20]">Contact</Link>
            <span>•</span>
            <Link to="/faqs" className="hover:text-[#F47B20]">FAQs</Link>
            <span>•</span>
            <Link to="/listing-guidelines" className="hover:text-[#F47B20]">Listing Guidelines</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-[#F47B20]">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-[#F47B20]">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
