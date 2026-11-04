import React from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Heart,
  ExternalLink,
} from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#202124] text-gray-300 pt-16 pb-12 border-t border-gray-800">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block py-1.5 px-3 bg-white rounded-xl shadow-xs max-w-[200px]">
              <img
                src="/logo.png"
                alt="Sasta Plots - Plots Made Simple"
                className="h-11 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              India's dedicated real estate marketplace for verified residential plots, agricultural farm lands, and commercial spaces. Discover affordable property with zero brokerage.
            </p>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F47B20]" />
                <a href="mailto:contact@sastaplots.com" className="hover:text-white transition-colors">
                  contact@sastaplots.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#F47B20]" />
                <a href="tel:+919876543210" className="hover:text-white transition-colors">
                  +91 98765 43210
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#F47B20] shrink-0 mt-0.5" />
                <span>DLF Cyber City, Gurugram & Connaught Place, New Delhi, India</span>
              </div>
            </div>
          </div>

          {/* Quick Browse Col */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Explore Properties
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/buy" className="hover:text-[#F47B20] transition-colors">
                  Plots for Sale
                </Link>
              </li>
              <li>
                <Link to="/rent" className="hover:text-[#F47B20] transition-colors">
                  Properties for Rent
                </Link>
              </li>
              <li>
                <Link to="/plots" className="hover:text-[#F47B20] transition-colors">
                  Residential Plots
                </Link>
              </li>
              <li>
                <Link to="/agricultural-land" className="hover:text-[#F47B20] transition-colors">
                  Agricultural Land
                </Link>
              </li>
              <li>
                <Link to="/commercial" className="hover:text-[#F47B20] transition-colors">
                  Commercial Properties
                </Link>
              </li>
              <li>
                <Link to="/locations" className="hover:text-[#F47B20] transition-colors">
                  All Locations & Cities
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Cities Col */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Popular Cities
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/buy?city=Noida" className="hover:text-[#F47B20] transition-colors">
                  Plots in Noida
                </Link>
              </li>
              <li>
                <Link to="/buy?city=Lucknow" className="hover:text-[#F47B20] transition-colors">
                  Plots in Lucknow
                </Link>
              </li>
              <li>
                <Link to="/buy?city=Pune" className="hover:text-[#F47B20] transition-colors">
                  Farmland in Pune
                </Link>
              </li>
              <li>
                <Link to="/buy?city=Jaipur" className="hover:text-[#F47B20] transition-colors">
                  Plots in Jaipur
                </Link>
              </li>
              <li>
                <Link to="/buy?city=Bengaluru" className="hover:text-[#F47B20] transition-colors">
                  Plots in Bengaluru
                </Link>
              </li>
              <li>
                <Link to="/buy?city=Delhi" className="hover:text-[#F47B20] transition-colors">
                  Commercial in Delhi
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support Col */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Support & Legal
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/about" className="hover:text-[#F47B20] transition-colors">
                  About Sasta Plots
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#F47B20] transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="hover:text-[#F47B20] transition-colors">
                  FAQs & Knowledge Base
                </Link>
              </li>
              <li>
                <Link to="/listing-guidelines" className="hover:text-[#F47B20] transition-colors">
                  Listing Guidelines
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[#F47B20] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#F47B20] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} Sasta Plots Marketplace India Pvt Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-gray-300">Privacy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-gray-300">Terms</Link>
            <span>•</span>
            <Link to="/listing-guidelines" className="hover:text-gray-300">Guidelines</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
