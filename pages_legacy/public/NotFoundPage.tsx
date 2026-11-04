'use client'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Home,
  Search,
  MapPin,
  ArrowRight,
  Compass,
  PhoneCall,
} from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/buy?q=${encodeURIComponent(query.trim())}`)
    } else {
      navigate('/buy')
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFDFB] flex flex-col justify-center items-center px-4 py-16">
      <div className="max-w-xl w-full text-center space-y-8">
        {/* Custom SVG Illustration: Land Survey / Lost Pin Theme */}
        <div className="relative w-64 h-56 mx-auto">
          <svg
            viewBox="0 0 240 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-md"
          >
            {/* Ground / Grid Plane */}
            <polygon
              points="120,40 220,90 120,150 20,90"
              fill="#FFF0E0"
              stroke="#FCD2B2"
              strokeWidth="2"
            />
            {/* Plot subdivision lines */}
            <line
              x1="70"
              y1="65"
              x2="170"
              y2="120"
              stroke="#F47B20"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <line
              x1="170"
              y1="65"
              x2="70"
              y2="120"
              stroke="#F47B20"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Corner boundary pegs */}
            <circle cx="120" cy="40" r="4" fill="#E96512" />
            <circle cx="220" cy="90" r="4" fill="#E96512" />
            <circle cx="120" cy="150" r="4" fill="#E96512" />
            <circle cx="20" cy="90" r="4" fill="#E96512" />

            {/* Shadow of Pin */}
            <ellipse cx="120" cy="120" rx="18" ry="6" fill="#F47B20" fillOpacity="0.2" />

            {/* Floating 404 Pin */}
            <g transform="translate(95, 45)">
              <path
                d="M25 0C11.1929 0 0 11.1929 0 25C0 41.5 25 70 25 70C25 70 50 41.5 50 25C50 11.1929 38.8071 0 25 0Z"
                fill="#F47B20"
              />
              <circle cx="25" cy="25" r="14" fill="#FFFFFF" />
              <text
                x="25"
                y="29"
                fontSize="12"
                fontWeight="bold"
                fill="#F47B20"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                ?
              </text>
            </g>

            {/* Decorative Compass Lines */}
            <circle cx="45" cy="35" r="8" stroke="#EAEAEA" strokeWidth="1.5" />
            <line x1="45" y1="23" x2="45" y2="47" stroke="#EAEAEA" strokeWidth="1" />
            <line x1="33" y1="35" x2="57" y2="35" stroke="#EAEAEA" strokeWidth="1" />
          </svg>

          {/* 404 Badge */}
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#202124] text-white text-xs font-black tracking-widest px-3 py-1 rounded-full uppercase shadow-md">
            Error 404
          </span>
        </div>

        {/* Message */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#202124] tracking-tight mb-2">
            Plot Not Found
          </h1>
          <p className="text-sm sm:text-base text-[#727272] max-w-md mx-auto leading-relaxed">
            The property listing, page, or coordinates you are looking for may have been sold, archived, or does not exist.
          </p>
        </div>

        {/* In-page Search Box */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by city, budget, or layout name..."
            className="w-full bg-white border border-[#EAEAEA] rounded-2xl pl-11 pr-24 py-3 text-sm text-[#202124] placeholder-gray-400 shadow-xs focus:outline-none focus:border-[#F47B20] focus:ring-4 focus:ring-orange-100 transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 btn-primary btn-sm py-1.5 px-3 text-xs"
          >
            Find Plots
          </button>
        </form>

        {/* Quick Links */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="btn-primary btn-sm">
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link to="/buy" className="btn-secondary btn-sm">
            <Compass className="w-4 h-4 text-[#F47B20]" />
            Browse Properties
          </Link>
          <Link to="/contact" className="btn-ghost btn-sm">
            <PhoneCall className="w-4 h-4" />
            Help & Support
          </Link>
        </div>

        {/* Popular Locations Links */}
        <div className="pt-6 border-t border-[#EAEAEA] text-xs text-[#727272]">
          <p className="font-medium mb-2 text-gray-800">Popular Searches:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Plots in Noida', 'Farmland Pune', 'Commercial Lucknow', 'Bengaluru Sites', 'Jaipur Plots'].map(
              (term, i) => (
                <Link
                  key={i}
                  to={`/buy?q=${encodeURIComponent(term)}`}
                  className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-[#F47B20] hover:border-[#F47B20] transition-colors"
                >
                  {term}
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
