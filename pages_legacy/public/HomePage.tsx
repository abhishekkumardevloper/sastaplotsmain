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
  Zap,
  Globe,
  Clock,
  IndianRupee,
  BarChart3,
  Calculator,
  Compass,
  UserCheck,
} from 'lucide-react'
import api from '@/lib/api'
import type { Property, ListingIntent, PropertyType, PropertyCategory } from '@/types'
import { PropertyGrid } from '@/components/property/PropertyGrid'
import {
  INDIAN_STATES,
  INDIAN_CITIES,
  POPULAR_LOCATIONS,
  CATEGORIES_CONFIG,
} from '@/lib/constants'

// ─── Animated Counter ────────────────────────────────────────────────────────
const AnimatedCounter: React.FC<{
  target: number
  suffix?: string
  prefix?: string
  duration?: number
}> = ({ target, suffix = '', prefix = '', duration = 1800 }) => {
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
  const inView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Hero Rotating Typewriter ───────────────────────────────────────────────
const HERO_PHRASES = [
  'Verified Residential Plots',
  'Fertile Agricultural Land',
  'Commercial SCO & Road Land',
  'Zero Brokerage Owner Plots',
  'High-Growth Expressway Land',
]

const HeroTypewriter: React.FC = () => {
  const [index, setIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const phrase = HERO_PHRASES[index]
    let timeout: ReturnType<typeof setTimeout>

    if (!deleting && displayed.length < phrase.length) {
      timeout = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length + 1)), 50)
    } else if (!deleting && displayed.length === phrase.length) {
      timeout = setTimeout(() => setDeleting(true), 2200)
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length - 1)), 30)
    } else if (deleting && displayed.length === 0) {
      setDeleting(false)
      setIndex((i) => (i + 1) % HERO_PHRASES.length)
    }

    return () => clearTimeout(timeout)
  }, [displayed, deleting, index])

  return (
    <span className="text-gradient-orange inline-block">
      {displayed}
      <span className="animate-pulse text-[#F47B20]">|</span>
    </span>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const HomePage: React.FC = () => {
  const navigate = useNavigate()

  // Search state
  const [activeTab, setActiveTab] = useState<'buy' | 'rent' | 'commercial' | 'agricultural'>('buy')
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedBudget, setSelectedBudget] = useState<string>('')
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'residential_plot' | 'agricultural_land' | 'commercial'>('all')

  // Land converter widget state
  const [converterValue, setConverterValue] = useState<number>(1000)
  const [fromUnit, setFromUnit] = useState<'sqft' | 'sqyd' | 'acre' | 'bigha'>('sqft')

  // Calculate converted units
  const calculateUnits = (val: number, unit: string) => {
    let inSqft = val
    if (unit === 'sqyd') inSqft = val * 9
    else if (unit === 'acre') inSqft = val * 43560
    else if (unit === 'bigha') inSqft = val * 27000

    return {
      sqft: Math.round(inSqft),
      sqyd: Math.round((inSqft / 9) * 10) / 10,
      acre: Math.round((inSqft / 43560) * 1000) / 1000,
      bigha: Math.round((inSqft / 27000) * 100) / 100,
    }
  }

  const convertedValues = calculateUnits(converterValue || 0, fromUnit)

  // Fetch approved featured properties
  const { data: featuredProperties, isLoading: isFeaturedLoading } = useQuery<Property[]>({
    queryKey: ['properties', 'featured', featuredFilter],
    queryFn: async () => {
      try {
        const params: any = { is_featured: true, status: 'approved', limit: 6 }
        if (featuredFilter !== 'all') {
          params.category = featuredFilter
        }
        const response = await api.get('/properties', { params })
        const data = response.data?.data || response.data
        return Array.isArray(data) ? data : []
      } catch {
        return []
      }
    },
  })

  // Fetch approved latest properties
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
    else if (activeTab === 'agricultural') params.set('category', 'agricultural_land')
    else if (activeTab === 'rent') params.set('intent', 'rent')
    else params.set('intent', 'sell')

    if (selectedType) params.set('property_type', selectedType)
    if (selectedCity) params.set('q', selectedCity)

    if (selectedBudget === 'under_25l') {
      params.set('max_price', '2500000')
    } else if (selectedBudget === '25l_50l') {
      params.set('min_price', '2500000')
      params.set('max_price', '5000000')
    } else if (selectedBudget === '50l_1cr') {
      params.set('min_price', '5000000')
      params.set('max_price', '10000000')
    } else if (selectedBudget === 'above_1cr') {
      params.set('min_price', '10000000')
    }

    navigate(`/search?${params.toString()}`)
  }

  const getCategoryIcon = (iconName: string) => {
    const cls = 'h-6 w-6'
    switch (iconName) {
      case 'Home': return <Home className={cls} />
      case 'Sprout': return <Sprout className={cls} />
      case 'Building2': return <Building2 className={cls} />
      case 'Trees': return <Trees className={cls} />
      case 'Factory': return <Factory className={cls} />
      default: return <MapPin className={cls} />
    }
  }

  // Live Stats Ticker
  const stats = [
    { value: 3450, suffix: '+', label: 'Verified Plots Listed', icon: Award },
    { value: 48, suffix: '+', label: 'Major Indian Cities', icon: Globe },
    { value: 100, suffix: '%', label: 'Admin-Reviewed Paperwork', icon: ShieldCheck },
    { value: 0, suffix: '%', label: 'Hidden Brokerage', icon: Zap },
  ]

  // Approval Process Steps (User's specific requirement)
  const approvalSteps = [
    {
      step: '01',
      title: 'List by Owner or Broker',
      desc: 'Landowners or licensed brokers register and post plot details, boundary dimensions, survey numbers & asking price in under 3 minutes.',
      icon: UploadCloud,
    },
    {
      step: '02',
      title: 'Admin Verification & Approval',
      desc: 'Our administrative compliance team verifies the title ownership, location coordinates, and price sanity within 24 hours before publishing.',
      icon: ShieldCheck,
      highlight: true,
    },
    {
      step: '03',
      title: 'Live Published & Direct Connect',
      desc: 'Approved plots go live on the marketplace. Buyers connect directly with verified owners or brokers via phone and WhatsApp with zero hidden commission.',
      icon: CheckCircle2,
    },
  ]

  // Investment Corridors
  const corridors = [
    { name: 'Noida (Yamuna Expressway)', tag: 'Jewar Airport Corridor', growth: '+38% YoY ROI', img: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80', query: 'q=Noida' },
    { name: 'Lucknow (Shaheed & Kisan Path)', tag: 'Outer Ring Road Development', growth: '+29% YoY ROI', img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80', query: 'q=Lucknow' },
    { name: 'Jaipur (Ajmer Road & Sitapura)', tag: 'SEZ & Industrial Belt', growth: '+24% YoY ROI', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80', query: 'q=Jaipur' },
    { name: 'Pune (Hinjewadi & Talegaon)', tag: 'IT Belt & Expressway', growth: '+31% YoY ROI', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80', query: 'q=Pune' },
    { name: 'Bangalore (Devanahalli)', tag: 'North Bangalore Tech Zone', growth: '+42% YoY ROI', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&auto=format&fit=crop&q=80', query: 'q=Bangalore' },
    { name: 'Hyderabad (ORR & Shamshabad)', tag: 'Pharma City & Airport Zone', growth: '+35% YoY ROI', img: 'https://images.unsplash.com/photo-1605007493699-ce65834f8a00?w=800&auto=format&fit=crop&q=80', query: 'q=Hyderabad' },
  ]

  const popularTags = [
    { label: 'Plots in Noida', query: 'q=Noida' },
    { label: 'Farmland in Lucknow', query: 'q=Lucknow&category=agricultural_land' },
    { label: 'Plots in Jaipur', query: 'q=Jaipur' },
    { label: 'Plots in Bangalore', query: 'q=Bangalore' },
    { label: '100% Verified Only', query: 'is_verified=true' },
    { label: 'Direct Owner Plots', query: 'seller_category=owner' },
  ]

  const testimonials = [
    {
      name: 'Rajesh Sharma',
      role: 'Landowner, Lucknow',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      comment: 'I posted my 2,400 sq.ft residential plot on Kisan Path. The admin team verified my listing within 12 hours. Within 4 days, I received genuine buyers and closed the sale with zero broker cut!',
      rating: 5,
      city: 'Lucknow',
    },
    {
      name: 'Ananya Deshmukh',
      role: 'Certified Real Estate Broker',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      comment: 'As a verified broker in Pune, SastaPlots gives my listings instant credibility because every plot is verified before going live. The client enquiry volume is 3x higher than other portals.',
      rating: 5,
      city: 'Pune',
    },
    {
      name: 'Virendra Singh',
      role: 'Agro Investor, Jaipur',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      comment: 'Finding genuine farmland without middleman scams was always difficult. On SastaPlots, every property had clear boundary dimensions and verified seller contact. Outstanding experience.',
      rating: 5,
      city: 'Jaipur',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden">
      {/* ═══════════════════════════════════════════════════════════════════════
          MAGICBRICKS-STYLE HERO BANNER WITH SEARCH CONSOLE
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] lg:min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#0A0F1D] py-16 lg:py-24">
        {/* Cinematic Backdrop Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&auto=format&fit=crop&q=85"
            alt="Scenic agricultural and residential land"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1D] via-[#0A0F1D]/75 to-[#0A0F1D]/60" />
          <div className="absolute inset-0 bg-[radial-gradient(#F47B20_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        </div>

        {/* Floating Glowing Orbs */}
        <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-[#F47B20]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="container-custom relative z-10 w-full">
          <div className="max-w-4xl mx-auto text-center">
            {/* Top Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 backdrop-blur-md px-4 py-1.5 mb-6 shadow-glow"
            >
              <ShieldCheck className="h-4 w-4 text-[#F47B20]" />
              <span className="text-xs font-bold text-orange-200 tracking-wide">
                India's #1 Land & Plot Portal • 100% Admin Verified
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]"
            >
              Discover & Buy
              <br />
              <HeroTypewriter />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-4 text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed"
            >
              Explore verified residential plots, fertile farmland & commercial SCO land.
              Direct connect with genuine landowners & licensed brokers with zero hidden brokerage.
            </motion.p>

            {/* ──────────────── MagicBricks Search Box ──────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-8 rounded-3xl bg-white/95 p-3 sm:p-5 shadow-2xl backdrop-blur-xl border border-white/20 text-left"
            >
              {/* Category Search Tabs */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                {[
                  { key: 'buy', label: 'Buy Plots' },
                  { key: 'commercial', label: 'Commercial Land' },
                  { key: 'agricultural', label: 'Agricultural Farmland' },
                  { key: 'rent', label: 'Rent / Lease' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      activeTab === tab.key
                        ? 'bg-[#F47B20] text-white shadow-md shadow-orange-500/25'
                        : 'text-slate-600 hover:text-[#F47B20] hover:bg-orange-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Multi-field Search Form */}
              <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Field 1: City / State Selection */}
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#F47B20]" />
                    <span>City / Location</span>
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="input-field py-2.5 text-xs sm:text-sm font-semibold text-slate-800"
                  >
                    <option value="">All Indian Cities</option>
                    {INDIAN_CITIES.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field 2: Plot Category / Type */}
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Home className="w-3.5 h-3.5 text-[#F47B20]" />
                    <span>Plot Type</span>
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="input-field py-2.5 text-xs sm:text-sm font-semibold text-slate-800"
                  >
                    <option value="">All Plot Types</option>
                    <option value="plot">Residential Plot</option>
                    <option value="farm_land">Agricultural Farm Land</option>
                    <option value="orchard">Orchard / Plantation</option>
                    <option value="office">Commercial SCO Plot</option>
                    <option value="showroom">Showroom Commercial Land</option>
                    <option value="industrial_land">Industrial Land</option>
                  </select>
                </div>

                {/* Field 3: Budget Bracket */}
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5 text-[#F47B20]" />
                    <span>Budget Range</span>
                  </label>
                  <select
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(e.target.value)}
                    className="input-field py-2.5 text-xs sm:text-sm font-semibold text-slate-800"
                  >
                    <option value="">Any Budget</option>
                    <option value="under_25l">Under ₹25 Lakhs</option>
                    <option value="25l_50l">₹25 Lakhs – ₹50 Lakhs</option>
                    <option value="50l_1cr">₹50 Lakhs – ₹1 Crore</option>
                    <option value="above_1cr">Above ₹1 Crore</option>
                  </select>
                </div>

                {/* Field 4: Submit Button */}
                <div className="flex flex-col justify-end">
                  <button
                    type="submit"
                    className="btn-primary w-full py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Verified Plots</span>
                  </button>
                </div>
              </form>

              {/* Popular Trending Tags Strip */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400">Trending Searches:</span>
                {popularTags.map((tag) => (
                  <Link
                    key={tag.label}
                    to={`/search?${tag.query}`}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-orange-50 hover:text-[#F47B20] transition-colors"
                  >
                    {tag.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          STATS TICKER STRIP
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-r from-[#F47B20] to-[#E96512] text-white py-6 shadow-md">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-white/20">
            {stats.map((st, i) => {
              const Icon = st.icon
              return (
                <div key={i} className="flex items-center justify-center gap-3.5 pt-4 sm:pt-0">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold leading-none">
                      <AnimatedCounter target={st.value} suffix={st.suffix} />
                    </div>
                    <p className="text-xs text-orange-100 font-medium mt-1">{st.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          ADMIN APPROVAL WORKFLOW BANNER (User requirement highlight)
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="container-custom">
          <FadeIn className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#F47B20] mb-2">
              <ShieldCheck className="h-4 w-4" />
              Quality & Trust Protocol
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Every Plot Requires Admin Approval
            </h2>
            <p className="mt-3 text-slate-500 text-sm sm:text-base leading-relaxed">
              No fake listings or misleading ads. All plots submitted by genuine landowners or licensed brokers must pass rigorous admin review before appearing live.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {approvalSteps.map((step, idx) => {
              const Icon = step.icon
              return (
                <FadeIn key={step.step} delay={idx * 0.15}>
                  <div
                    className={`relative rounded-3xl p-7 h-full flex flex-col justify-between transition-all duration-300 ${
                      step.highlight
                        ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-xl shadow-orange-500/20'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 hover:shadow-lg'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <span
                          className={`text-3xl font-black ${
                            step.highlight ? 'text-white/40' : 'text-slate-300'
                          }`}
                        >
                          {step.step}
                        </span>
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            step.highlight
                              ? 'bg-white/20 text-white'
                              : 'bg-orange-100 text-[#F47B20]'
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                      </div>

                      <h3
                        className={`text-lg font-bold mb-2 ${
                          step.highlight ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p
                        className={`text-xs sm:text-sm leading-relaxed ${
                          step.highlight ? 'text-orange-100' : 'text-slate-600'
                        }`}
                      >
                        {step.desc}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-black/10 flex items-center justify-between text-xs font-bold">
                      <span>{step.highlight ? 'Admin Quality Check' : 'Step Complete'}</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          CATEGORIES BENTO GRID
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="container-custom">
          <FadeIn className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#F47B20] mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              Land Categories
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Explore Land by Category
            </h2>
            <p className="mt-2 text-slate-500 text-sm sm:text-base">
              Find verified plots designed for investment, agricultural yield, or commercial developments.
            </p>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {CATEGORIES_CONFIG.map((cat, i) => (
              <FadeIn key={cat.category} delay={i * 0.08}>
                <Link
                  to={`/search?category=${cat.category}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-xl hover:border-orange-300 hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                    <div className="absolute bottom-2.5 left-3">
                      <span className="rounded-lg bg-white/20 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white">
                        {cat.count}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center gap-1.5 text-[#F47B20] mb-1">
                        {getCategoryIcon(cat.iconName)}
                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#F47B20] transition-colors leading-snug">
                          {cat.title}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{cat.subtitle}</p>
                    </div>
                    <div className="mt-3 flex items-center text-xs font-bold text-[#F47B20] group-hover:translate-x-1 transition-transform">
                      <span>Explore</span>
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
          FEATURED ADMIN-APPROVED PROPERTIES (Live API Data)
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-white border-y border-slate-200">
        <div className="container-custom">
          <FadeIn className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#F47B20] mb-2">
                <Award className="h-4 w-4" />
                Curated Listings
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Featured Verified Plots
              </h2>
              <p className="mt-1 text-slate-500 text-sm">
                100% admin-moderated land with authentic paperwork in prime development zones.
              </p>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'residential_plot', label: 'Residential' },
                { key: 'agricultural_land', label: 'Agricultural' },
                { key: 'commercial', label: 'Commercial' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFeaturedFilter(f.key as any)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    featuredFilter === f.key
                      ? 'bg-[#F47B20] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-[#F47B20]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
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
          TOP INVESTMENT CORRIDORS (ROI & Location focus)
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#F47B20_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

        <div className="container-custom relative z-10">
          <FadeIn className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#F47B20] mb-2">
              <TrendingUp className="h-4 w-4" />
              High Appreciation Zones
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Hot Real Estate Corridors
            </h2>
            <p className="mt-2 text-slate-400 text-sm sm:text-base">
              India's fastest developing expressways, airport zones, and infrastructure projects.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {corridors.map((loc, i) => (
              <FadeIn key={loc.name} delay={i * 0.08}>
                <Link
                  to={`/search?${loc.query}`}
                  className="group relative flex flex-col overflow-hidden rounded-3xl bg-slate-800 border border-slate-700 shadow-xl hover:border-orange-500/50 hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-1.5"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={loc.img}
                      alt={loc.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-75"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    <div className="absolute top-3.5 right-3.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/95 backdrop-blur-md px-3 py-1 text-xs font-bold text-white shadow-md">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {loc.growth}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-[#F47B20] transition-colors">
                        {loc.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#F47B20]" />
                        {loc.tag}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/15 text-[#F47B20] flex items-center justify-center group-hover:bg-[#F47B20] group-hover:text-white transition-all">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          INTERACTIVE LAND AREA CONVERTER WIDGET (MagicBricks specialty)
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-orange-50 via-amber-50/50 to-orange-100/40 border border-orange-200/60 p-6 sm:p-10 shadow-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-orange-200/60">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F47B20] text-white flex items-center justify-center shadow-md shadow-orange-500/25 shrink-0">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    Indian Land Area Unit Converter
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Easily convert between Square Feet, Gaj (Sq. Yards), Acres, and Bigha.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {/* Input unit */}
              <div className="bg-white rounded-2xl p-4 border border-orange-200 shadow-xs">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Enter Land Size
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={converterValue}
                    onChange={(e) => setConverterValue(Number(e.target.value))}
                    className="w-full text-lg font-extrabold text-slate-900 outline-none"
                  />
                  <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value as any)}
                    className="text-xs font-bold text-[#F47B20] bg-orange-50 rounded-lg p-1.5 outline-none border border-orange-200"
                  >
                    <option value="sqft">Sq.Ft</option>
                    <option value="sqyd">Sq.Yd (Gaj)</option>
                    <option value="acre">Acres</option>
                    <option value="bigha">Bigha</option>
                  </select>
                </div>
              </div>

              {/* Result 1: Sqft */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Square Feet
                </span>
                <span className="text-xl font-black text-slate-900">
                  {convertedValues.sqft.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400 ml-1">sq.ft</span>
              </div>

              {/* Result 2: Sqyd (Gaj) */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Square Yards (Gaj)
                </span>
                <span className="text-xl font-black text-[#F47B20]">
                  {convertedValues.sqyd.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400 ml-1">gaj</span>
              </div>

              {/* Result 3: Acres */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Acres & Bigha
                </span>
                <span className="text-lg font-black text-emerald-700">
                  {convertedValues.acre} Ac
                </span>
                <span className="text-xs text-slate-500 ml-1">
                  ({convertedValues.bigha} Bigha)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          LATEST APPROVED ARRIVALS (Live API Data)
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="container-custom">
          <FadeIn className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#F47B20] mb-2">
                <Clock className="h-4 w-4" />
                Fresh Arrivals
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Latest Approved Plots
              </h2>
              <p className="mt-1 text-slate-500 text-sm">
                Newly verified plots published this week across India.
              </p>
            </div>
            <Link
              to="/search?sort=newest"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#F47B20] hover:text-[#E96512] transition-colors shrink-0"
            >
              <span>View All New Listings</span>
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
          TESTIMONIALS & TRUST REVIEWS
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-white border-t border-slate-200">
        <div className="container-custom">
          <FadeIn className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#F47B20] mb-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              Verified Stories
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Trusted by 12,000+ Land Buyers & Sellers
            </h2>
            <p className="mt-2 text-slate-500 text-sm sm:text-base">
              Real experiences from owners, verified brokers, and land investors.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <FadeIn key={t.name} delay={idx * 0.1}>
                <div className="rounded-3xl border border-slate-200 p-6 bg-slate-50 flex flex-col justify-between h-full shadow-xs hover:shadow-lg transition-shadow">
                  <div>
                    <div className="flex items-center gap-1 text-amber-400 mb-4">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                      "{t.comment}"
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-orange-200"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                      <p className="text-[11px] text-slate-500">{t.role} • {t.city}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          CALL TO ACTION FOR BROKERS & OWNERS
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-orange-500 to-amber-600 p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-left">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-3">
                List for Free
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Are You a Landowner or Broker?
              </h2>
              <p className="mt-2 text-sm sm:text-base text-orange-100 max-w-lg">
                List your residential, commercial, or agricultural plot in under 3 minutes.
                Get verified by admin and receive genuine buyer leads with zero brokerage.
              </p>
            </div>

            <Link
              to="/post-property"
              className="bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm sm:text-base py-3.5 px-8 rounded-2xl shadow-xl transition-all hover:scale-105 shrink-0 flex items-center gap-2"
            >
              <UploadCloud className="w-5 h-5 text-[#F47B20]" />
              <span>Post Your Plot FREE</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
