'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  Search,
  ShieldCheck,
  PhoneCall,
  FileCheck,
  UploadCloud,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  MapPin,
  ArrowRight,
  TrendingUp,
  Award,
  Users,
  Home,
  Sprout,
  Building2,
  Trees,
  Factory,
  Star,
  MessageCircle,
  Zap,
  Globe,
  Eye,
  Heart,
  BadgeCheck,
  Clock,
  IndianRupee,
  BarChart3,
  ChevronDown,
  Play,
} from 'lucide-react'
import api from '@/lib/api'
import type { Property, ListingIntent, PropertyType } from '@/types'
import { PropertyGrid } from '@/components/property/PropertyGrid'
import {
  MOCK_PROPERTIES,
  MOCK_STATES,
  MOCK_CITIES,
  POPULAR_LOCATIONS,
  CATEGORIES_CONFIG,
} from '@/lib/mockData'

// ─── Animated Counter ────────────────────────────────────────────────────────
const AnimatedCounter: React.FC<{
  target: number
  suffix?: string
  prefix?: string
  duration?: number
}> = ({ target, suffix = '', prefix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target, duration])

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString('en-IN')}{suffix}
    </span>
  )
}

// ─── Fade-in section wrapper ──────────────────────────────────────────────────
const FadeIn: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Hero Typewriter ─────────────────────────────────────────────────────────
const HERO_PHRASES = [
  'Residential Plots',
  'Agricultural Land',
  'Commercial Plots',
  'Villa Plot Deals',
  'Farm Land',
]

const HeroTypewriter: React.FC = () => {
  const [index, setIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const phrase = HERO_PHRASES[index]
    let timeout: ReturnType<typeof setTimeout>

    if (!deleting && displayed.length < phrase.length) {
      timeout = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length + 1)), 60)
    } else if (!deleting && displayed.length === phrase.length) {
      timeout = setTimeout(() => setDeleting(true), 2000)
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length - 1)), 35)
    } else if (deleting && displayed.length === 0) {
      setDeleting(false)
      setIndex((i) => (i + 1) % HERO_PHRASES.length)
    }

    return () => clearTimeout(timeout)
  }, [displayed, deleting, index])

  return (
    <span className="inline-block text-[#F47B20]">
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const HomePage: React.FC = () => {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<ListingIntent | 'commercial'>('sell')
  const [selectedType, setSelectedType] = useState<PropertyType | ''>('')
  const [selectedState, setSelectedState] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [worksRole, setWorksRole] = useState<'buyer' | 'seller'>('buyer')

  const availableCities = selectedState
    ? MOCK_CITIES.filter((c) => String(c.state_id) === selectedState)
    : MOCK_CITIES

  const { data: featuredProperties, isLoading: isFeaturedLoading } = useQuery<Property[]>({
    queryKey: ['properties', 'featured'],
    queryFn: async () => {
      try {
        const response = await api.get('/properties', {
          params: { is_featured: true, status: 'approved', limit: 6 },
        })
        const data = response.data?.data || response.data
        return Array.isArray(data) ? data : []
      } catch {
        return []
      }
    },
  })

  const { data: latestProperties, isLoading: isLatestLoading } = useQuery<Property[]>({
    queryKey: ['properties', 'latest'],
    queryFn: async () => {
      try {
        const response = await api.get('/properties', {
          params: { status: 'approved', sort: 'newest', limit: 6 },
        })
        const data = response.data?.data || response.data
        return Array.isArray(data) ? data : []
      } catch {
        return []
      }
    },
  })

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (activeTab === 'commercial') params.set('category', 'commercial')
    else params.set('intent', activeTab)
    if (selectedType) params.set('property_type', selectedType)
    if (selectedState) params.set('state_id', selectedState)
    if (selectedCity) params.set('city_id', selectedCity)
    if (minPrice) params.set('min_price', minPrice)
    if (maxPrice) params.set('max_price', maxPrice)
    navigate(`/search?${params.toString()}`)
  }

  const getCategoryIcon = (iconName: string) => {
    const cls = 'h-5 w-5'
    switch (iconName) {
      case 'Home': return <Home className={cls} />
      case 'Sprout': return <Sprout className={cls} />
      case 'Building2': return <Building2 className={cls} />
      case 'Trees': return <Trees className={cls} />
      case 'Factory': return <Factory className={cls} />
      default: return <MapPin className={cls} />
    }
  }

  // ─── STATS ─────────────────────────────────────────────────────────────────
  const stats = [
    { value: 3200, suffix: '+', label: 'Active Listings' },
    { value: 48, suffix: '+', label: 'Cities Covered' },
    { value: 12400, suffix: '+', label: 'Happy Buyers' },
    { value: 0, suffix: '% Brokerage', label: 'Zero Hidden Fees' },
  ]

  const trustPoints = [
    { icon: ShieldCheck, title: 'Admin-Reviewed Listings', desc: 'Every listing is checked by our moderation team before going live.' },
    { icon: PhoneCall, title: 'Direct Seller Connect', desc: 'Talk directly to genuine landowners — no middlemen, no broker fees.' },
    { icon: FileCheck, title: 'Transparent Details', desc: 'Full property details, boundary dimensions, and price per sq.ft disclosed.' },
    { icon: UploadCloud, title: 'Free Property Listing', desc: 'List your plot in under 3 minutes with zero listing charges.' },
    { icon: Clock, title: '24-Hr Approval', desc: 'Fast admin moderation ensures your listing goes live quickly.' },
    { icon: BarChart3, title: 'Market Price Insights', desc: 'Compare price trends across localities before making a decision.' },
  ]

  const corridors = [
    { name: 'Lucknow', tag: 'Shaheed Path · Kisan Path', growth: '+28% YoY', img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80', query: 'q=Lucknow' },
    { name: 'Ayodhya', tag: 'Airport Zone · Ring Road', growth: '+54% YoY', img: 'https://images.unsplash.com/photo-1580741569354-c4a28b5e11a2?w=800&auto=format&fit=crop&q=80', query: 'q=Ayodhya' },
    { name: 'Noida', tag: 'Jewar · Yamuna Expressway', growth: '+35% YoY', img: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80', query: 'q=Noida' },
    { name: 'Jaipur', tag: 'Ajmer Road · Sitapura', growth: '+22% YoY', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80', query: 'q=Jaipur' },
    { name: 'Hyderabad', tag: 'ORR · Shamshabad', growth: '+31% YoY', img: 'https://images.unsplash.com/photo-1605007493699-ce65834f8a00?w=800&auto=format&fit=crop&q=80', query: 'q=Hyderabad' },
    { name: 'Bangalore', tag: 'Sarjapur · Devanahalli', growth: '+40% YoY', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&auto=format&fit=crop&q=80', query: 'q=Bangalore' },
  ]

  const popularTags = [
    { label: 'Residential Plot in Jaipur', query: 'city_id=101&category=residential_plot' },
    { label: 'Farm Land in Pune', query: 'city_id=201&category=agricultural_land' },
    { label: 'Villa Plots Bangalore', query: 'city_id=301&category=residential_plot' },
    { label: 'Commercial SCO Plots', query: 'category=commercial' },
    { label: 'Verified Corner Plots', query: 'is_verified=true' },
    { label: 'Agricultural Land UP', query: 'state_id=5&category=agricultural_land' },
  ]

  return (
    <div className="min-h-screen bg-white text-[#202124] overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO — Full viewport, split layout with real estate imagery
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0E0E0E]">
        {/* Background imagery */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&auto=format&fit=crop&q=85"
            alt="Beautiful residential landscape"
            className="w-full h-full object-cover opacity-40"
          />
          {/* Gradient overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0E0E0E]/95 via-[#0E0E0E]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E]/60 via-transparent to-transparent" />
        </div>

        {/* Decorative orange glow orbs */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-[#F47B20]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-[#E96512]/8 blur-3xl pointer-events-none" />

        <div className="container-custom relative z-10 py-20 pt-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left: Headlines + Search */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Badge pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#F47B20]/30 bg-[#F47B20]/10 backdrop-blur-sm px-4 py-1.5 mb-6">
                <Zap className="h-3.5 w-3.5 text-[#F47B20]" />
                <span className="text-xs font-semibold text-orange-300">India's Direct Land Marketplace • Zero Brokerage</span>
              </div>

              {/* Main headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
                Discover Perfect
                <br />
                <HeroTypewriter />
                <br />
                <span className="text-gray-300 text-3xl sm:text-4xl lg:text-5xl font-bold">Across India</span>
              </h1>

              <p className="mt-5 text-base sm:text-lg text-gray-400 max-w-lg leading-relaxed">
                Explore verified residential plots, agricultural land, and commercial properties.
                Connect directly with genuine owners — no broker, no commission, no hidden fees.
              </p>

              {/* CTA buttons */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/search"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#F47B20] hover:bg-[#E96512] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#F47B20]/30 transition-all hover:-translate-y-0.5 active:scale-95"
                >
                  <Search className="h-4 w-4" />
                  Explore Properties
                </Link>
                <Link
                  to="/post-property"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-6 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition-all"
                >
                  <UploadCloud className="h-4 w-4" />
                  List Your Plot Free
                </Link>
              </div>

              {/* Quick trust badges */}
              <div className="mt-8 flex flex-wrap gap-4">
                {[
                  { icon: ShieldCheck, text: 'Admin Verified' },
                  { icon: Users, text: '12,000+ Buyers' },
                  { icon: BadgeCheck, text: 'Zero Commission' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Icon className="h-3.5 w-3.5 text-[#F47B20]" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Floating search card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="lg:ml-auto w-full max-w-lg"
            >
              <div className="rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl shadow-black/40 border border-white/20 overflow-hidden">
                {/* Card Header */}
                <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">Search Properties</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Find your perfect plot in seconds</p>
                </div>

                {/* Tabs */}
                <div className="px-6 pt-4 flex gap-1.5">
                  {[
                    { key: 'sell', label: 'Buy' },
                    { key: 'rent', label: 'Rent / Lease' },
                    { key: 'commercial', label: 'Commercial' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                        activeTab === tab.key
                          ? 'bg-[#F47B20] text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-[#F47B20]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search form */}
                <form onSubmit={handleSearchSubmit} className="px-6 pt-4 pb-6 space-y-3">
                  {/* Property type */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Property Type
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value as PropertyType)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:border-[#F47B20] focus:bg-white focus:ring-1 focus:ring-[#F47B20] outline-none transition-all"
                    >
                      <option value="">All Plot Types</option>
                      <option value="plot">Residential Plot</option>
                      <option value="farm_land">Agricultural / Farm Land</option>
                      <option value="orchard">Orchard Land</option>
                      <option value="office">Commercial SCO / Office</option>
                      <option value="showroom">Showroom Plot</option>
                      <option value="industrial_land">Industrial Land</option>
                    </select>
                  </div>

                  {/* State + City */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        State
                      </label>
                      <select
                        value={selectedState}
                        onChange={(e) => { setSelectedState(e.target.value); setSelectedCity('') }}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:border-[#F47B20] focus:bg-white focus:ring-1 focus:ring-[#F47B20] outline-none transition-all"
                      >
                        <option value="">All States</option>
                        {MOCK_STATES.map((st) => (
                          <option key={st.id} value={st.id}>{st.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        City
                      </label>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:border-[#F47B20] focus:bg-white focus:ring-1 focus:ring-[#F47B20] outline-none transition-all"
                      >
                        <option value="">All Cities</option>
                        {availableCities.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Budget (₹)
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <input
                        type="number"
                        placeholder="Min ₹"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#F47B20] focus:bg-white focus:ring-1 focus:ring-[#F47B20] outline-none transition-all"
                      />
                      <input
                        type="number"
                        placeholder="Max ₹"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#F47B20] focus:bg-white focus:ring-1 focus:ring-[#F47B20] outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#F47B20] hover:bg-[#E96512] py-3.5 text-sm font-bold text-white shadow-md shadow-[#F47B20]/25 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                    Search Verified Plots
                  </button>

                  {/* Trust line */}
                  <p className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Free search • No registration required
                  </p>
                </form>
              </div>

              {/* Popular search tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {popularTags.slice(0, 4).map((tag) => (
                  <Link
                    key={tag.label}
                    to={`/search?${tag.query}`}
                    className="rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-1 text-[11px] font-medium text-gray-300 hover:border-[#F47B20]/50 hover:bg-[#F47B20]/10 hover:text-orange-300 transition-all"
                  >
                    {tag.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-500 cursor-pointer"
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <span className="text-[11px] font-medium tracking-widest uppercase">Scroll</span>
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          STATS TICKER STRIP
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#F47B20]">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#E96512]">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center py-6 px-4 text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-white leading-none">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="mt-1 text-xs font-medium text-orange-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          PROPERTY CATEGORIES — Bento-grid style
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container-custom">
          <FadeIn className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#F47B20] mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Browse Categories
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202124] tracking-tight">
              Find the Right Type of Land
            </h2>
            <p className="mt-3 text-gray-500 text-sm sm:text-base leading-relaxed">
              From premium residential plots to fertile farmland and commercial hubs — discover every type.
            </p>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {CATEGORIES_CONFIG.map((cat, i) => (
              <FadeIn key={cat.category} delay={i * 0.08}>
                <Link
                  to={`/search?category=${cat.category}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:shadow-[#F47B20]/10 hover:-translate-y-1.5 hover:border-orange-100 transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-2 left-3">
                      <span className="rounded-md bg-white/20 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-white">
                        {cat.count}
                      </span>
                    </div>
                  </div>
                  <div className="p-3.5">
                    <div className="flex items-center gap-1.5 text-[#F47B20] mb-1">
                      {getCategoryIcon(cat.iconName)}
                      <h3 className="font-bold text-xs text-gray-900 group-hover:text-[#F47B20] transition-colors leading-snug">
                        {cat.title}
                      </h3>
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-2">{cat.subtitle}</p>
                    <div className="mt-2 flex items-center text-[11px] font-semibold text-[#F47B20] group-hover:translate-x-1 transition-transform">
                      <span>View All</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FEATURED PROPERTIES
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-[#FFFDFB]">
        <div className="container-custom">
          <FadeIn className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#F47B20] mb-2">
                <Award className="h-3.5 w-3.5" />
                Handpicked
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202124] tracking-tight">
                Featured Properties
              </h2>
              <p className="mt-2 text-gray-500 text-sm leading-relaxed">
                Admin-verified high-value plots in India's top investment corridors.
              </p>
            </div>
            <Link
              to="/search?is_featured=true"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#F47B20] hover:text-[#E96512] transition-colors shrink-0"
            >
              View All Featured
              <ArrowRight className="h-4 w-4" />
            </Link>
          </FadeIn>

          <PropertyGrid
            properties={featuredProperties}
            isLoading={isFeaturedLoading}
            columns={3}
            skeletonCount={6}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          INVESTMENT CORRIDORS — Image-heavy grid
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container-custom">
          <FadeIn className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#F47B20] mb-3">
              <TrendingUp className="h-3.5 w-3.5" />
              Hot Investment Zones
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202124] tracking-tight">
              Trending Investment Corridors
            </h2>
            <p className="mt-3 text-gray-500 text-sm sm:text-base leading-relaxed">
              India's fastest-growing real estate micro-markets with verified plot listings.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {corridors.map((loc, i) => (
              <FadeIn key={loc.name} delay={i * 0.07}>
                <Link
                  to={`/search?${loc.query}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl bg-gray-900 shadow-md hover:shadow-2xl hover:shadow-black/20 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Background image */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={loc.img}
                      alt={loc.name}
                      className="h-full w-full object-cover opacity-70 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-80"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-900/30 to-transparent" />

                    {/* Growth badge */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-white">
                        <TrendingUp className="h-3 w-3" />
                        {loc.growth}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-[#F47B20] transition-colors">
                          {loc.name}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-[#F47B20]" />
                          {loc.tag}
                        </p>
                      </div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F47B20]/10 text-[#F47B20] group-hover:bg-[#F47B20] group-hover:text-white transition-all">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          LATEST LISTINGS
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-[#FFFDFB]">
        <div className="container-custom">
          <FadeIn className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#F47B20] mb-2">
                <Clock className="h-3.5 w-3.5" />
                Fresh Arrivals
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202124] tracking-tight">
                Latest Listings
              </h2>
              <p className="mt-2 text-gray-500 text-sm">
                Newly approved plots reviewed and published this week.
              </p>
            </div>
            <Link
              to="/search?sort=newest"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#F47B20] hover:text-[#E96512] transition-colors shrink-0"
            >
              View All New Listings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </FadeIn>

          <PropertyGrid
            properties={latestProperties}
            isLoading={isLatestLoading}
            columns={3}
            skeletonCount={6}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          POPULAR LOCATIONS — Horizontal card scroll on mobile
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container-custom">
          <FadeIn className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#F47B20] mb-3">
              <Globe className="h-3.5 w-3.5" />
              Top Cities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202124] tracking-tight">
              Explore Land in Top Cities
            </h2>
            <p className="mt-3 text-gray-500 text-sm sm:text-base leading-relaxed">
              Browse verified plots in tier-1 metros and high-growth tier-2 markets.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {POPULAR_LOCATIONS.map((loc, i) => (
              <FadeIn key={loc.city} delay={i * 0.06}>
                <Link
                  to={`/search?q=${encodeURIComponent(loc.city)}`}
                  className="group flex overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:shadow-[#F47B20]/8 hover:-translate-y-1 hover:border-orange-100 transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className="relative w-32 shrink-0 overflow-hidden bg-gray-100">
                    <img
                      src={loc.image}
                      alt={loc.city}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-base text-gray-900 group-hover:text-[#F47B20] transition-colors">
                          {loc.city}
                        </h3>
                        <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-[#E96512]">
                          {loc.count}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{loc.state}</p>
                      <div className="mt-1.5 text-xs">
                        <span className="text-gray-400">Range: </span>
                        <span className="font-semibold text-gray-700">{loc.priceRange}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {loc.popularLocalities.slice(0, 2).map((l) => (
                        <span key={l} className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          WHY SASTA PLOTS — Trust section
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-[#0E0E0E] relative overflow-hidden">
        {/* Orange glow accents */}
        <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-[#F47B20]/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-[#E96512]/6 blur-3xl pointer-events-none" />

        <div className="container-custom relative z-10">
          <FadeIn className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#F47B20] mb-3">
              <ShieldCheck className="h-3.5 w-3.5" />
              Why Choose Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Built on Trust & Transparency
            </h2>
            <p className="mt-3 text-gray-400 text-sm sm:text-base leading-relaxed">
              Sasta Plots is designed to give you honest, verified, zero-commission land search.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {trustPoints.map((item, i) => {
              const Icon = item.icon
              return (
                <FadeIn key={i} delay={i * 0.07}>
                  <div className="group rounded-2xl border border-white/8 bg-white/4 p-6 hover:bg-white/8 hover:border-[#F47B20]/30 transition-all duration-300">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F47B20]/15 text-[#F47B20] mb-4 group-hover:bg-[#F47B20]/25 transition-all">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1.5">{item.title}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </FadeIn>
              )
            })}
          </div>

          {/* Comparison table */}
          <FadeIn className="mt-14" delay={0.2}>
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <div className="grid grid-cols-3 bg-white/8 text-center text-xs font-bold uppercase tracking-wider">
                <div className="py-3 px-4 text-gray-400 text-left">Feature</div>
                <div className="py-3 px-4 text-[#F47B20] border-x border-white/10">
                  Sasta Plots
                </div>
                <div className="py-3 px-4 text-gray-500">Local Brokers</div>
              </div>
              {[
                ['Direct Seller Connect', true, false],
                ['Zero Brokerage', true, false],
                ['Admin-Verified Listings', true, false],
                ['Free Property Listing', true, false],
                ['24-Hour Approval', true, false],
                ['Transparent Pricing', true, false],
              ].map(([feature, sp, broker], i) => (
                <div
                  key={i}
                  className="grid grid-cols-3 border-t border-white/6 text-center text-sm"
                >
                  <div className="py-3.5 px-4 text-gray-300 text-left text-xs font-medium">
                    {feature as string}
                  </div>
                  <div className="py-3.5 px-4 border-x border-white/6 bg-[#F47B20]/5">
                    {sp ? (
                      <CheckCircle2 className="h-4 w-4 text-[#F47B20] mx-auto" />
                    ) : (
                      <span className="text-gray-600 text-xs">✕</span>
                    )}
                  </div>
                  <div className="py-3.5 px-4">
                    {broker ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                    ) : (
                      <span className="text-gray-600 text-xs">✕</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container-custom">
          <FadeIn className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#F47B20] mb-3">
              <Play className="h-3.5 w-3.5" />
              Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202124] tracking-tight">
              How Sasta Plots Works
            </h2>

            {/* Toggle */}
            <div className="mt-6 inline-flex rounded-xl bg-gray-100 p-1">
              {(['buyer', 'seller'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setWorksRole(role)}
                  className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
                    worksRole === role
                      ? 'bg-white text-[#F47B20] shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {role === 'buyer' ? 'For Buyers' : 'For Sellers'}
                </button>
              ))}
            </div>
          </FadeIn>

          <AnimatePresence mode="wait">
            <motion.div
              key={worksRole}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            >
              {(worksRole === 'buyer'
                ? [
                    { step: '01', title: 'Search & Filter', desc: 'Find verified plots by budget, location, size, road width, and facing direction.', icon: Search },
                    { step: '02', title: 'Review Details', desc: 'Check full property details, documents, images, and price per sq.ft before deciding.', icon: FileCheck },
                    { step: '03', title: 'Connect Directly', desc: 'Call or WhatsApp the genuine plot owner directly. No broker, no commission.', icon: PhoneCall },
                  ]
                : [
                    { step: '01', title: 'List Your Plot', desc: 'Enter dimensions, upload photos, set price, and mention layout approval details.', icon: UploadCloud },
                    { step: '02', title: 'Admin Verification', desc: 'Our team reviews your listing within 24 hours to build buyer trust and boost visibility.', icon: ShieldCheck },
                    { step: '03', title: 'Receive Inquiries', desc: 'Get direct phone calls and WhatsApp messages from serious buyers — zero middlemen.', icon: Users },
                  ]
              ).map((step, i) => {
                const Icon = step.icon
                return (
                  <div
                    key={i}
                    className="relative flex flex-col rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md hover:border-orange-100 transition-all"
                  >
                    {/* Connector line */}
                    {i < 2 && (
                      <div className="hidden md:block absolute top-10 right-0 w-6 h-px bg-gradient-to-r from-gray-200 to-transparent translate-x-full" />
                    )}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#F47B20]">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-3xl font-black text-orange-100">{step.step}</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900">{step.title}</h3>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          TESTIMONIALS / SOCIAL PROOF
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-[#FFF8F2]">
        <div className="container-custom">
          <FadeIn className="text-center max-w-xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#F47B20] mb-3">
              <Star className="h-3.5 w-3.5" />
              Reviews
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202124] tracking-tight">
              Trusted by Thousands
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Ramesh Agarwal',
                location: 'Jaipur, Rajasthan',
                text: 'Found a JDA-approved corner plot in Vaishali Nagar at a price below market rate. The admin verification process gave me confidence that the listing was genuine.',
                rating: 5,
                role: 'Plot Buyer',
                avatar: 'RA',
              },
              {
                name: 'Priya Kulkarni',
                location: 'Pune, Maharashtra',
                text: 'Listed my agricultural land on Sasta Plots and received 3 serious inquiries within the first week. No broker fees, just direct buyer connections.',
                rating: 5,
                role: 'Landowner',
                avatar: 'PK',
              },
              {
                name: 'Suresh Reddy',
                location: 'Hyderabad, Telangana',
                text: 'The search filters are excellent — I could narrow down by road width and facing direction which made my shortlist highly relevant. Closed the deal in 2 weeks.',
                rating: 5,
                role: 'Investor',
                avatar: 'SR',
              },
            ].map((t, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-[#F47B20] text-[#F47B20]" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">"{t.text}"</p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F47B20]/10 text-[#F47B20] font-bold text-xs">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.role} · {t.location}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SELLER CTA — Full-width banner
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container-custom">
          <FadeIn>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#F47B20] via-[#F06E15] to-[#E96512] px-8 py-14 sm:px-16 sm:py-20 text-white shadow-2xl shadow-orange-500/30">
              {/* Background decorations */}
              <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/8 blur-2xl pointer-events-none" />
              <div className="absolute -left-8 -bottom-8 h-48 w-48 rounded-full bg-white/5 blur-xl pointer-events-none" />
              <div className="absolute right-1/3 bottom-0 h-32 w-32 rounded-full bg-white/6 blur-lg pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-semibold backdrop-blur-md mb-5">
                    <Award className="h-3.5 w-3.5" />
                    Zero Listing Fees · Direct Buyer Connections
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
                    Have a Plot to Sell?
                    <br />
                    <span className="text-orange-100">List it on Sasta Plots.</span>
                  </h2>
                  <p className="mt-4 text-sm sm:text-base text-orange-100 max-w-xl leading-relaxed">
                    Connect with thousands of serious property buyers and land investors across India.
                    Get verified inquiries delivered straight to your mobile.
                  </p>

                  {/* Mini trust row */}
                  <div className="mt-6 flex flex-wrap gap-4">
                    {[
                      '100% Free Listing',
                      'Direct Phone Inquiries',
                      '24-Hour Admin Approval',
                    ].map((pt) => (
                      <div key={pt} className="flex items-center gap-1.5 text-xs text-orange-100">
                        <CheckCircle2 className="h-4 w-4 text-white shrink-0" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:shrink-0">
                  <Link
                    to="/post-property"
                    className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-sm font-bold text-[#E96512] shadow-xl transition-all hover:-translate-y-0.5 hover:bg-orange-50 active:scale-95"
                  >
                    List Property For Free
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                  <Link
                    to="/search"
                    className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm px-8 py-4 text-sm font-semibold text-white hover:bg-white/20 transition-all"
                  >
                    Browse Active Listings
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  )
}

export default HomePage
