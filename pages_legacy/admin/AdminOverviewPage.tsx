'use client'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertOctagon,
  Users,
  UserCheck,
  MessageSquare,
  Calendar,
  Eye,
  Check,
  X,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  PieChart as PieChartIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { StatCard } from '@/components/admin/StatCard'
import { AdminDataTable, Column } from '@/components/admin/AdminDataTable'
import type { Property, AdminStats, RecentActivity, AdminDashboardData } from '@/types'

// Format INR currency
const formatPrice = (price: number) => {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`
  }
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} Lac`
  }
  return `₹${price.toLocaleString('en-IN')}`
}

export const AdminOverviewPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Fetch Dashboard Data
  const { data, isLoading, isRefetching, refetch } = useQuery<AdminDashboardData>({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/dashboard')
        return res.data
      } catch (err) { console.error("Admin overview error:", err); return { stats: { total_listings: 0, published_listings: 0, pending_approvals: 0, rejected_listings: 0, suspended_listings: 0, total_users: 1, owners_agents: 0, new_enquiries: 0, listings_today: 0, recent_activity: [] }, recent_activity: [], pending_listings: [], pending_properties: [] }; }
    },
    staleTime: 60 * 1000,
  })

  // Quick Approve Mutation
  const approveMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const res = await api.put(`/admin/properties/${propertyId}/status`, {
        status: 'approved',
      })
      return res.data
    },
    onSuccess: () => {
      toast.success('Listing approved successfully!')
      queryClient.invalidateQueries({ queryKey: ['admin'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to approve listing')
    },
  })

  // Quick Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: async ({
      propertyId,
      reason,
    }: {
      propertyId: string
      reason: string
    }) => {
      const res = await api.put(`/admin/properties/${propertyId}/status`, {
        status: 'rejected',
        reason,
      })
      return res.data
    },
    onSuccess: () => {
      toast.success('Listing rejected with feedback')
      setRejectModalOpen(false)
      setSelectedPropertyId(null)
      setRejectionReason('')
      queryClient.invalidateQueries({ queryKey: ['admin'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to reject listing')
    },
  })

  const handleOpenRejectModal = (propertyId: string) => {
    setSelectedPropertyId(propertyId)
    setRejectionReason('')
    setRejectModalOpen(true)
  }

  const handleConfirmReject = () => {
    if (!selectedPropertyId) return
    if (!rejectionReason.trim()) {
      toast.error('Please specify a rejection reason for the owner')
      return
    }
    rejectMutation.mutate({
      propertyId: selectedPropertyId,
      reason: rejectionReason,
    })
  }

  const stats = data?.stats
  const pendingListings = data?.pending_listings || []
  const recentActivities = data?.recent_activity || []
  const growthChart = data?.growth_chart || []
  const categoryDist = data?.category_distribution || []
  const approvalMetrics = data?.approval_metrics

  const maxGrowthCount = Math.max(...growthChart.map((d) => d.count), 1)
  const totalCategoryCount = categoryDist.reduce((acc, c) => acc + c.count, 0) || 1

  // Pending table columns
  const pendingColumns: Column<Property>[] = [
    {
      key: 'cover',
      header: 'Property',
      width: '320px',
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-14 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-[#EAEAEA]">
            <img
              src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&q=80'}
              alt={p.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <Link
              to={`/admin/properties/${p.id}/review`}
              className="font-medium text-[#202124] hover:text-[#F47B20] line-clamp-1 text-sm transition"
            >
              {p.title}
            </Link>
            <p className="text-xs text-[#727272] truncate">{p.address || 'Location on file'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category & Area',
      render: (p) => (
        <div>
          <span className="capitalize text-xs font-semibold text-[#202124]">
            {p.category?.replace('_', ' ')}
          </span>
          <p className="text-xs text-[#727272]">
            {p.area} {p.area_unit}
          </p>
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Seller',
      render: (p) => (
        <div>
          <p className="font-medium text-xs text-[#202124]">{p.seller_name || 'Anonymous'}</p>
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-[#727272] capitalize">
            {p.seller_category || 'Owner'}
          </span>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (p) => (
        <div>
          <span className="font-semibold text-sm text-[#F47B20]">{formatPrice(p.price)}</span>
          {p.price_negotiable && (
            <span className="block text-[10px] text-emerald-600">Negotiable</span>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Submitted',
      render: (p) => {
        const date = new Date(p.created_at)
        return (
          <span className="text-xs text-[#727272]">
            {date.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )
      },
    },
    {
      key: 'actions',
      header: 'Quick Action',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => approveMutation.mutate(p.id)}
            disabled={approveMutation.isPending}
            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition"
            title="Quick Approve"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenRejectModal(p.id)}
            disabled={rejectMutation.isPending}
            className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 transition"
            title="Reject"
          >
            <X className="w-4 h-4" />
          </button>
          <Link
            to={`/admin/properties/${p.id}/review`}
            className="p-1.5 rounded-lg bg-gray-100 text-[#202124] hover:bg-[#F47B20] hover:text-white transition"
            title="Full Review"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
  ]

  return (
    <AdminLayout
      title="Admin Dashboard"
      subtitle="Real-time marketplace overview, listing verification queue, and activity"
      actions={
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="btn-secondary btn-sm flex items-center gap-1.5"
          title="Refresh dashboard metrics"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      }
    >
      <div className="space-y-8">
        {/* Top 9 Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4">
          <StatCard
            label="Total Listings"
            value={stats?.total_listings ?? 0}
            icon={Building2}
            color="orange"
            change="+14%"
            trend="up"
            trendText="this month"
            onClick={() => navigate('/admin/properties')}
            isLoading={isLoading}
          />
          <StatCard
            label="Published"
            value={stats?.published_listings ?? 0}
            icon={CheckCircle2}
            color="green"
            change="+8%"
            trend="up"
            trendText="active live"
            onClick={() => navigate('/admin/properties?status=approved')}
            isLoading={isLoading}
          />
          <StatCard
            label="Pending Approvals"
            value={stats?.pending_approvals ?? 0}
            icon={Clock}
            color="amber"
            change={stats?.pending_approvals ? `${stats.pending_approvals} action needed` : '0 pending'}
            trend="neutral"
            onClick={() => navigate('/admin/properties?status=pending_review')}
            isLoading={isLoading}
          />
          <StatCard
            label="Rejected"
            value={stats?.rejected_listings ?? 0}
            icon={XCircle}
            color="red"
            trend="down"
            trendText="violations"
            onClick={() => navigate('/admin/properties?status=rejected')}
            isLoading={isLoading}
          />
          <StatCard
            label="Suspended"
            value={stats?.suspended_listings ?? 0}
            icon={AlertOctagon}
            color="purple"
            trend="neutral"
            trendText="paused"
            onClick={() => navigate('/admin/properties?status=suspended')}
            isLoading={isLoading}
          />
          <StatCard
            label="Total Users"
            value={stats?.total_users ?? 0}
            icon={Users}
            color="blue"
            change="+24"
            trend="up"
            trendText="new this week"
            onClick={() => navigate('/admin/users')}
            isLoading={isLoading}
          />
          <StatCard
            label="Owners / Agents"
            value={stats?.owners_agents ?? 0}
            icon={UserCheck}
            color="green"
            change="27%"
            trend="up"
            trendText="of userbase"
            onClick={() => navigate('/admin/users?role=owner')}
            isLoading={isLoading}
          />
          <StatCard
            label="New Enquiries"
            value={stats?.new_enquiries ?? 0}
            icon={MessageSquare}
            color="orange"
            change="+12"
            trend="up"
            trendText="awaiting follow-up"
            onClick={() => navigate('/admin/enquiries')}
            isLoading={isLoading}
          />
          <StatCard
            label="Listings Today"
            value={stats?.listings_today ?? 0}
            icon={Calendar}
            color="amber"
            change="+3"
            trend="up"
            trendText="vs yesterday"
            isLoading={isLoading}
          />
        </div>

        {/* Visual Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: 7-Day Listing Growth Bar Chart */}
          <div className="card p-5 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-poppins font-bold text-sm text-[#202124]">
                  Listing Inflow (Last 7 Days)
                </h3>
                <p className="text-xs text-[#727272]">New plot submissions per day</p>
              </div>
              <span className="p-2 rounded-xl bg-orange-50 text-[#F47B20] border border-orange-100">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>

            {/* CSS Bar Chart */}
            <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2">
              {growthChart.map((item, idx) => {
                const heightPercent = Math.max(12, Math.round((item.count / maxGrowthCount) * 100))
                const isHighest = item.count === maxGrowthCount
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-[#202124] text-white text-[10px] font-medium px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10">
                      {item.count} listings ({item.date})
                    </div>
                    {/* Bar */}
                    <div className="w-full max-w-[28px] h-32 flex items-end justify-center">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          isHighest
                            ? 'bg-gradient-to-t from-[#E96512] to-[#F47B20] shadow-sm shadow-[#F47B20]/40'
                            : 'bg-[#FFE4CC] hover:bg-[#F47B20]/70'
                        }`}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-[#727272]">{item.day}</span>
                  </div>
                )
              })}
            </div>

            <div className="pt-3 border-t border-[#F5F5F5] flex items-center justify-between text-xs text-[#727272]">
              <span>7-day total: <strong>{growthChart.reduce((a, b) => a + b.count, 0)}</strong></span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> +18.4%
              </span>
            </div>
          </div>

          {/* Chart 2: Category Breakdown (Horizontal Bars) */}
          <div className="card p-5 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-poppins font-bold text-sm text-[#202124]">
                  Listings by Category
                </h3>
                <p className="text-xs text-[#727272]">Inventory distribution by plot type</p>
              </div>
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <PieChartIcon className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-3 my-auto">
              {categoryDist.map((cat, idx) => {
                const percent = Math.round((cat.count / totalCategoryCount) * 100)
                const colors = [
                  'bg-[#F47B20]',
                  'bg-emerald-500',
                  'bg-blue-500',
                  'bg-purple-500',
                  'bg-amber-500',
                ]
                const barColor = colors[idx % colors.length]
                return (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-[#202124]">{cat.label}</span>
                      <span className="text-[#727272]">
                        {cat.count} <span className="text-[11px] text-gray-400">({percent}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="pt-3 border-t border-[#F5F5F5] flex items-center justify-between text-xs text-[#727272]">
              <span>Active Categories: <strong>{categoryDist.length}</strong></span>
              <Link to="/admin/properties" className="text-[#F47B20] font-semibold hover:underline">
                View all &rarr;
              </Link>
            </div>
          </div>

          {/* Chart 3: Approval Rate & Turnaround */}
          <div className="card p-5 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-poppins font-bold text-sm text-[#202124]">
                  Moderation Efficiency
                </h3>
                <p className="text-xs text-[#727272]">Quality control & turnaround SLA</p>
              </div>
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>

            {/* Circular Gauge / Percentage visual */}
            <div className="my-auto py-2 flex flex-col items-center justify-center">
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* Outer ring */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500 transition-all duration-1000 ease-out"
                    strokeDasharray={`${approvalMetrics?.approval_rate ?? 90}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xl font-bold font-poppins text-[#202124]">
                    {approvalMetrics?.approval_rate ?? 90}%
                  </span>
                  <span className="text-[10px] text-[#727272]">Approved</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full mt-4 text-center">
                <div className="p-2.5 rounded-xl bg-[#FFF8F2] border border-[#FFE4CC]">
                  <span className="text-[11px] text-[#727272] block">Avg Response</span>
                  <span className="text-sm font-bold text-[#F47B20]">
                    {approvalMetrics?.avg_approval_hours ?? 4.8} hrs
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[11px] text-[#727272] block">Rejection Rate</span>
                  <span className="text-sm font-bold text-rose-600">
                    {(100 - (approvalMetrics?.approval_rate ?? 90)).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F5F5F5] flex items-center justify-between text-xs text-[#727272]">
              <span>Approved: <strong className="text-emerald-700">{approvalMetrics?.approved_count ?? 112}</strong></span>
              <span>Rejected: <strong className="text-rose-700">{approvalMetrics?.rejected_count ?? 12}</strong></span>
            </div>
          </div>
        </div>

        {/* Pending Listings Quick Action Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-poppins font-bold text-base text-[#202124]">
                  Pending Verification Queue
                </h3>
                {pendingListings.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                    {pendingListings.length} awaiting review
                  </span>
                )}
              </div>
              <p className="text-xs text-[#727272]">
                New listings submitted by owners & agents requiring approval before going live
              </p>
            </div>
            <Link
              to="/admin/properties?status=pending_review"
              className="text-xs font-semibold text-[#F47B20] hover:underline flex items-center gap-1"
            >
              View all pending ({stats?.pending_approvals ?? 0}) &rarr;
            </Link>
          </div>

          <AdminDataTable
            columns={pendingColumns}
            data={pendingListings}
            isLoading={isLoading}
            emptyTitle="Queue is clear!"
            emptyDescription="All submitted properties have been reviewed. Good job!"
            emptyIcon={CheckCircle2}
          />
        </div>

        {/* Recent Moderation Activity Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-poppins font-bold text-base text-[#202124]">
                Recent Moderation & System Activity
              </h3>
              <p className="text-xs text-[#727272]">Audit record of recent actions performed across the platform</p>
            </div>
            <Link
              to="/admin/audit-logs"
              className="text-xs font-semibold text-[#F47B20] hover:underline flex items-center gap-1"
            >
              Full audit trail &rarr;
            </Link>
          </div>

          <div className="card bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden shadow-sm">
            <div className="divide-y divide-[#EAEAEA]">
              {recentActivities.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#727272]">
                  No recent moderation activity logged yet.
                </div>
              ) : (
                recentActivities.slice(0, 10).map((act) => {
                  let badge = 'bg-gray-100 text-gray-700'
                  let icon = <Clock className="w-3.5 h-3.5" />
                  if (act.type.includes('approve')) {
                    badge = 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    icon = <Check className="w-3.5 h-3.5" />
                  } else if (act.type.includes('reject') || act.type.includes('suspend')) {
                    badge = 'bg-rose-50 text-rose-700 border border-rose-100'
                    icon = <X className="w-3.5 h-3.5" />
                  } else if (act.type.includes('settings')) {
                    badge = 'bg-blue-50 text-blue-700 border border-blue-100'
                    icon = <Sparkles className="w-3.5 h-3.5" />
                  }

                  const date = new Date(act.created_at)
                  return (
                    <div
                      key={act.id}
                      className="p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-gray-50/70 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg shrink-0 ${badge}`}>
                          {icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#202124]">
                            {act.description}
                          </p>
                          <span className="text-xs text-[#727272]">
                            By <strong className="text-[#202124]">{act.actor || 'Administrator'}</strong>
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-[#727272] shrink-0 sm:text-right">
                        {date.toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        •{' '}
                        {date.toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Reason Confirmation Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EAEAEA] animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <XCircle className="w-6 h-6" />
            </div>
            <h3 className="font-poppins font-bold text-lg text-[#202124]">
              Reject Listing
            </h3>
            <p className="text-xs text-[#727272] mt-1 mb-4">
              Please provide clear constructive feedback for the seller explaining why this property cannot be approved at this time.
            </p>

            <div className="space-y-3">
              <div>
                <label className="form-label text-xs">Reason for rejection *</label>
                <textarea
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Incomplete survey details, unclear property boundary photo, unverified contact number..."
                  className="input-field text-xs resize-none"
                />
              </div>

              <div className="flex gap-2">
                {[
                  'Incomplete title documents',
                  'Blurry/low-res photos',
                  'Incorrect category selected',
                ].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setRejectionReason(quick)}
                    className="text-[10px] bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-[#202124] transition"
                  >
                    {quick}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={rejectMutation.isPending}
                className="btn-primary btn-sm !bg-rose-600 hover:!bg-rose-700 text-white"
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminOverviewPage
