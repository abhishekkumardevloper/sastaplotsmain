'use client'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  CheckCircle2,
  Clock,
  MessageSquare,
  Heart,
  Plus,
  Eye,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  User,
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react'
import { UserDashboardLayout } from '@/components/user/UserDashboardLayout'
import { useAuthStore } from '@/store/auth'
import { formatPrice, formatDate, formatRelativeTime, STATUS_CONFIG } from '@/lib/utils'
import type { Property, Enquiry } from '@/types'
import api from '@/lib/api'
import { supabase } from '@/lib/supabase'

interface DashboardStats {
  totalListings: number
  approvedListings: number
  pendingListings: number
  enquiriesReceived: number
  savedProperties: number
}

export const DashboardOverviewPage: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    approvedListings: 0,
    pendingListings: 0,
    enquiriesReceived: 0,
    savedProperties: 0,
  })
  const [recentListings, setRecentListings] = useState<Property[]>([])
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Try to fetch real user properties from API or Supabase
        let userProps: Property[] = []
        let enquiries: Enquiry[] = []
        let favsCount = 0

        try {
          const res = await api.get('/user/dashboard')
          if (res.data?.stats) {
            setStats(res.data.stats)
            setRecentListings(res.data.recentListings || [])
            setRecentEnquiries(res.data.recentEnquiries || [])
            setLoading(false)
            return
          }
        } catch {
          // If direct endpoint isn't available, query Supabase directly
        }

        if (user?.id) {
          // Fetch properties for current user
          const { data: propsData } = await supabase
            .from('properties')
            .select('*, images(*)')
            .eq('owner_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5)

          if (propsData && propsData.length > 0) {
            userProps = propsData as Property[]
          }

          // Fetch enquiries
          const { data: enqData } = await supabase
            .from('enquiries')
            .select('*, property:properties(title)')
            .order('created_at', { ascending: false })
            .limit(5)

          if (enqData && enqData.length > 0) {
            enquiries = enqData as Enquiry[]
          }

          // Fetch favorites count
          const { count: savedCount } = await supabase
            .from('favourites')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

          favsCount = savedCount || 0
        }

        // Calculate counts
        const approved = userProps.filter((p) => p.status === 'approved').length
        const pending = userProps.filter((p) => p.status === 'pending_review').length

        setStats({
          totalListings: userProps.length,
          approvedListings: approved,
          pendingListings: pending,
          enquiriesReceived: enquiries.length,
          savedProperties: favsCount,
        })
        setRecentListings(userProps)
        setRecentEnquiries(enquiries)
      } catch (err) {
        console.error('Error loading dashboard overview:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user?.id])

  return (
    <UserDashboardLayout
      title={`Hello, ${user?.full_name?.split(' ')[0] || 'Partner'} 👋`}
      subtitle="Here is what is happening with your property listings and buyer leads today."
    >
      <div className="space-y-8">
        {/* Verification Alert Banner if unverified */}
        {user?.verification_status !== 'verified' && (
          <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-white border border-orange-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#F47B20] flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#202124]">
                  Boost buyer trust with Verified Seller badge
                </h3>
                <p className="text-xs sm:text-sm text-[#727272] mt-0.5">
                  Verified sellers receive up to 3x more direct buyer phone calls and priority review for new listings.
                </p>
              </div>
            </div>
            <Link
              to="/dashboard/profile"
              className="btn-primary text-xs py-2 px-4 whitespace-nowrap self-stretch sm:self-auto text-center"
            >
              Verify Profile Now
            </Link>
          </div>
        )}

        {/* 5 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-5">
          {/* Card 1: Total Listings */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EAEAEA] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#727272]">
                Total Listings
              </span>
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#F47B20] flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-bold font-['Poppins'] text-[#202124]">
                {loading ? '—' : stats.totalListings}
              </span>
              <p className="text-[11px] text-[#727272] mt-1">Properties listed</p>
            </div>
          </div>

          {/* Card 2: Approved */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EAEAEA] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#727272]">
                Approved
              </span>
              <div className="w-8 h-8 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-bold font-['Poppins'] text-[#168653]">
                {loading ? '—' : stats.approvedListings}
              </span>
              <p className="text-[11px] text-[#727272] mt-1">Live & visible to buyers</p>
            </div>
          </div>

          {/* Card 3: Pending */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EAEAEA] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#727272]">
                Pending Review
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-bold font-['Poppins'] text-amber-600">
                {loading ? '—' : stats.pendingListings}
              </span>
              <p className="text-[11px] text-[#727272] mt-1">Under moderation</p>
            </div>
          </div>

          {/* Card 4: Enquiries Received */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EAEAEA] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#727272]">
                Enquiries
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-bold font-['Poppins'] text-blue-600">
                {loading ? '—' : stats.enquiriesReceived}
              </span>
              <p className="text-[11px] text-[#727272] mt-1">Buyer leads</p>
            </div>
          </div>

          {/* Card 5: Saved Properties */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EAEAEA] shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-gray-500 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#727272]">
                Saved Plots
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-bold font-['Poppins'] text-rose-500">
                {loading ? '—' : stats.savedProperties}
              </span>
              <p className="text-[11px] text-[#727272] mt-1">In your watchlist</p>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Link
            to="/post-property"
            className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Property</span>
          </Link>

          <Link
            to="/dashboard/listings"
            className="btn-secondary py-2.5 px-5 text-sm flex items-center gap-2"
          >
            <Building2 className="w-4 h-4 text-[#F47B20]" />
            <span>View All Listings</span>
          </Link>

          <Link
            to="/dashboard/enquiries"
            className="btn-secondary py-2.5 px-5 text-sm flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>Manage Buyer Enquiries</span>
          </Link>
        </div>

        {/* Two Column Grid: Recent Listings & Recent Enquiries */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Listings (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EAEAEA] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-[#202124] font-['Poppins']">
                  Recent Listings
                </h3>
                <p className="text-xs text-[#727272]">Latest properties added to your account</p>
              </div>
              <Link
                to="/dashboard/listings"
                className="text-xs font-semibold text-[#F47B20] hover:text-[#E96512] flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 skeleton rounded-xl" />
                ))}
              </div>
            ) : recentListings.length === 0 ? (
              <div className="text-center py-10 px-4 border border-dashed border-[#EAEAEA] rounded-xl bg-[#FFF8F2]/40">
                <div className="w-12 h-12 rounded-full bg-orange-100 text-[#F47B20] flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-sm text-[#202124]">No properties listed yet</h4>
                <p className="text-xs text-[#727272] max-w-xs mx-auto mt-1 mb-4">
                  List your residential plot, agricultural land, or commercial site to reach genuine verified buyers.
                </p>
                <Link
                  to="/post-property"
                  className="btn-primary py-2 px-4 text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>List Your First Property</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-2">
                      <th className="pb-3 font-medium">Property</th>
                      <th className="pb-3 font-medium">Price</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {recentListings.map((prop) => {
                      const status = STATUS_CONFIG[prop.status] || {
                        label: prop.status,
                        color: 'text-gray-700',
                        bg: 'bg-gray-100',
                      }
                      const coverImg = prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&auto=format&fit=crop&q=80'

                      return (
                        <tr key={prop.id} className="hover:bg-[#FFF8F2]/30 transition-colors">
                          <td className="py-3 pr-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={coverImg}
                                alt={prop.title}
                                className="w-12 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                              />
                              <div className="min-w-0 max-w-[200px] sm:max-w-[240px]">
                                <h4 className="font-semibold text-xs sm:text-sm text-[#202124] truncate">
                                  {prop.title}
                                </h4>
                                <p className="text-[11px] text-[#727272] truncate">
                                  {prop.address || 'Location not specified'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 font-semibold text-xs text-[#202124] whitespace-nowrap">
                            {formatPrice(prop.price)}
                          </td>
                          <td className="py-3 px-2 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${status.bg} ${status.color}`}
                            >
                              {status.label}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-[11px] text-[#727272] whitespace-nowrap">
                            {formatDate(prop.created_at)}
                          </td>
                          <td className="py-3 pl-2 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                to={`/property/${prop.slug || prop.id}`}
                                className="p-1.5 text-gray-500 hover:text-[#F47B20] hover:bg-orange-50 rounded-lg transition-colors"
                                title="View live listing"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                              <Link
                                to={`/post-property?edit=${prop.id}`}
                                className="px-2 py-1 bg-gray-100 hover:bg-[#FFF8F2] hover:text-[#F47B20] rounded-md text-[11px] font-medium transition-colors"
                              >
                                Edit
                              </Link>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Enquiries Received (1 col) */}
          <div className="bg-white rounded-2xl border border-[#EAEAEA] p-5 sm:p-6 shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-[#202124] font-['Poppins']">
                  Recent Enquiries
                </h3>
                <p className="text-xs text-[#727272]">Direct leads from buyers</p>
              </div>
              <Link
                to="/dashboard/enquiries"
                className="text-xs font-semibold text-[#F47B20] hover:text-[#E96512] flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3 flex-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 skeleton rounded-xl" />
                ))}
              </div>
            ) : recentEnquiries.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-4 border border-dashed border-[#EAEAEA] rounded-xl bg-gray-50/50">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-2">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-xs text-[#202124]">No enquiries yet</h4>
                <p className="text-[11px] text-[#727272] mt-1 max-w-[200px]">
                  When buyers ask questions or request site visits, they will show up here.
                </p>
              </div>
            ) : (
              <div className="space-y-3 divide-y divide-gray-100">
                {recentEnquiries.map((enq) => (
                  <div key={enq.id} className="pt-3 first:pt-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-xs text-[#202124] truncate">
                          {enq.buyer_name}
                        </h4>
                        <p className="text-[11px] text-gray-500 truncate">
                          Re: {enq.property?.title || 'Property enquiry'}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {formatRelativeTime(enq.created_at)}
                      </span>
                    </div>
                    {enq.message && (
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1 bg-gray-50 p-2 rounded-lg italic">
                        &quot;{enq.message}&quot;
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-[#727272] font-mono">
                        {enq.buyer_phone}
                      </span>
                      <Link
                        to="/dashboard/enquiries"
                        className="text-[#F47B20] hover:underline font-medium text-[11px]"
                      >
                        Respond &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  )
}

export default DashboardOverviewPage
