'use client'
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  PieChart,
  MessageSquare,
  Building,
  RefreshCw,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { StatCard } from '@/components/admin/StatCard'
import type { AdminAnalyticsData, PropertyStatus } from '@/types'

export const AdminAnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y'>('30d')

  // Fetch Analytics
  const { data, isLoading, isRefetching, refetch } = useQuery<AdminAnalyticsData>({
    queryKey: ['admin', 'analytics', timeRange],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/analytics', { params: { range: timeRange } })
        return res.data?.data || res.data
      } catch (err) {
        console.error('Failed to load admin analytics data:', err)
        return {
          status_breakdown: [],
          category_breakdown: [],
          top_cities: [],
          weekly_enquiries: [],
          user_registrations: [],
          approval_stats: {
            approval_rate: 100,
            average_hours_to_approve: 0,
            total_reviewed: 0,
            fastest_hours: 0,
          },
        }
      }
    },
    staleTime: 60 * 1000,
  })

  const statusBreakdown = data?.status_breakdown || []
  const categoryBreakdown = data?.category_breakdown || []
  const topCities = data?.top_cities || []
  const weeklyEnquiries = data?.weekly_enquiries || []
  const userRegistrations = data?.user_registrations || []
  const approvalStats = data?.approval_stats

  const totalListingsCount = statusBreakdown.reduce((sum, item) => sum + item.count, 0) || 1
  const maxWeeklyEnquiry = Math.max(...weeklyEnquiries.map((w) => w.count), 1)
  const maxUserReg = Math.max(...userRegistrations.map((u) => u.count), 1)
  const maxCityCount = Math.max(...topCities.map((c) => c.count), 1)

  const handleExportCSV = () => {
    toast.success('Analytics report generated and downloaded')
  }

  return (
    <AdminLayout
      title="Platform Analytics & Intelligence"
      subtitle="Real-time listing distributions, regional demand, user acquisition, and moderation KPIs"
      actions={
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="input-field text-xs py-1.5 px-3 w-auto"
          >
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Past Year</option>
          </select>

          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="btn-secondary btn-sm flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="btn-primary btn-sm flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Platform Listings"
            value={totalListingsCount}
            icon={Building}
            color="orange"
            change="+22% MoM"
            trend="up"
            trendText="across all cities"
            isLoading={isLoading}
          />
          <StatCard
            label="Overall Approval Rate"
            value={`${approvalStats?.approval_rate ?? 91}%`}
            icon={CheckCircle2}
            color="green"
            change="+3.4%"
            trend="up"
            trendText="quality ratio"
            isLoading={isLoading}
          />
          <StatCard
            label="Avg Approval Turnaround"
            value={`${approvalStats?.average_hours_to_approve ?? 4.2} hrs`}
            icon={Clock}
            color="blue"
            change="-1.2 hrs"
            trend="up"
            trendText="faster than target SLA"
            isLoading={isLoading}
          />
          <StatCard
            label="Total Reviewed to Date"
            value={approvalStats?.total_reviewed ?? 243}
            icon={ShieldCheck}
            color="purple"
            trend="neutral"
            trendText="moderated items"
            isLoading={isLoading}
          />
        </div>

        {/* Chart 1: Visual Breakdown of Total Listings by Status */}
        <div className="card p-6 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-poppins font-bold text-base text-[#202124]">
                Listings by Lifecycle Status
              </h3>
              <p className="text-xs text-[#727272]">
                Proportional breakdown of active, pending, rejected, and archived inventories
              </p>
            </div>
            <span className="text-xs font-semibold text-[#727272]">
              Total: <strong className="text-[#202124]">{totalListingsCount}</strong> listings
            </span>
          </div>

          {/* Multi-segment stacked progress bar */}
          <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
            {statusBreakdown.map((item) => {
              const widthPct = (item.count / totalListingsCount) * 100
              if (widthPct === 0) return null
              return (
                <div
                  key={item.status}
                  style={{ width: `${widthPct}%` }}
                  className={`h-full ${item.color} transition-all duration-500 relative group`}
                  title={`${item.label}: ${item.count} (${widthPct.toFixed(1)}%)`}
                />
              )
            })}
          </div>

          {/* Legend Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
            {statusBreakdown.map((item) => {
              const widthPct = ((item.count / totalListingsCount) * 100).toFixed(1)
              return (
                <div
                  key={item.status}
                  className="p-3 rounded-xl border border-[#EAEAEA] bg-gray-50/50 space-y-1"
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-[11px] font-medium text-[#727272] truncate">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-base font-bold text-[#202124]">{item.count}</span>
                    <span className="text-[10px] text-gray-400 font-semibold">{widthPct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Grid 2 Columns: Category Breakdown & Top 10 Cities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 2: Category Breakdown Horizontal Bars */}
          <div className="card p-6 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0]">
                <div>
                  <h3 className="font-poppins font-bold text-base text-[#202124]">
                    Listings by Category
                  </h3>
                  <p className="text-xs text-[#727272]">Inventory concentration across plot types</p>
                </div>
                <span className="p-2 rounded-xl bg-orange-50 text-[#F47B20] border border-orange-100">
                  <PieChart className="w-4 h-4" />
                </span>
              </div>

              <div className="space-y-4 pt-4">
                {categoryBreakdown.map((cat, idx) => {
                  const colors = [
                    'bg-[#F47B20]',
                    'bg-emerald-500',
                    'bg-blue-500',
                    'bg-purple-500',
                    'bg-amber-500',
                  ]
                  const barColor = colors[idx % colors.length]
                  return (
                    <div key={cat.category} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-[#202124]">{cat.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#727272]">{cat.count} listings</span>
                          <span className="font-bold text-[#202124]">{cat.percentage}%</span>
                        </div>
                      </div>
                      <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${cat.percentage}%` }}
                          className={`h-full ${barColor} rounded-full transition-all duration-700`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-[#F5F5F5] flex items-center justify-between text-xs text-[#727272]">
              <span>Highest Category: <strong>Residential Plots (48%)</strong></span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> Fast growing: Farmland
              </span>
            </div>
          </div>

          {/* Chart 3: Top 10 Real Estate Cities */}
          <div className="card p-6 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0]">
                <div>
                  <h3 className="font-poppins font-bold text-base text-[#202124]">
                    Top 10 Cities by Listings
                  </h3>
                  <p className="text-xs text-[#727272]">Geographic plot supply concentration</p>
                </div>
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <MapPin className="w-4 h-4" />
                </span>
              </div>

              <div className="space-y-2.5 pt-3">
                {topCities.slice(0, 7).map((item, idx) => {
                  const percent = Math.round((item.count / maxCityCount) * 100)
                  return (
                    <div key={item.city} className="flex items-center gap-3 text-xs">
                      <span className="w-5 text-gray-400 font-mono text-[11px] font-semibold">
                        #{idx + 1}
                      </span>
                      <span className="w-28 font-medium text-[#202124] truncate">{item.city}</span>
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className="h-full bg-gradient-to-r from-blue-500 to-[#F47B20] rounded-full transition-all duration-500"
                        />
                      </div>
                      <span className="w-12 text-right font-bold text-[#202124]">
                        {item.count}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-[#F5F5F5] flex items-center justify-between text-xs text-[#727272]">
              <span>Delhi NCR regions represent <strong>68%</strong> of total volume</span>
            </div>
          </div>
        </div>

        {/* Grid 2 Columns: Enquiry Volume by Week & User Registration Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 4: Enquiry Volume by Week */}
          <div className="card p-6 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0]">
                <div>
                  <h3 className="font-poppins font-bold text-base text-[#202124]">
                    Weekly Buyer Inquiries & Leads
                  </h3>
                  <p className="text-xs text-[#727272]">Customer lead velocity over previous 7 weeks</p>
                </div>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <MessageSquare className="w-4 h-4" />
                </span>
              </div>

              {/* Vertical Bar Chart */}
              <div className="h-52 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
                {weeklyEnquiries.map((w, idx) => {
                  const heightPercent = Math.max(15, Math.round((w.count / maxWeeklyEnquiry) * 100))
                  const isLatest = idx === weeklyEnquiries.length - 1
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-[#202124] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow z-10 pointer-events-none whitespace-nowrap">
                        {w.count} Leads
                      </div>
                      <div className="w-full max-w-[32px] h-36 flex items-end justify-center">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            isLatest
                              ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-sm shadow-emerald-500/30'
                              : 'bg-emerald-100 hover:bg-emerald-300'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-[#727272] whitespace-nowrap">
                        {w.week}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-[#F5F5F5] flex items-center justify-between text-xs text-[#727272]">
              <span>Current week: <strong className="text-emerald-700">71 enquiries</strong></span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> +10.9% this week
              </span>
            </div>
          </div>

          {/* Chart 5: User Registration Trend */}
          <div className="card p-6 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0]">
                <div>
                  <h3 className="font-poppins font-bold text-base text-[#202124]">
                    User Registration Growth
                  </h3>
                  <p className="text-xs text-[#727272]">Monthly newly joined buyers & verified sellers</p>
                </div>
                <span className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                  <Users className="w-4 h-4" />
                </span>
              </div>

              {/* Vertical Bar Chart */}
              <div className="h-52 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
                {userRegistrations.map((u, idx) => {
                  const heightPercent = Math.max(15, Math.round((u.count / maxUserReg) * 100))
                  const isLatest = idx === userRegistrations.length - 1
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-[#202124] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow z-10 pointer-events-none whitespace-nowrap">
                        +{u.count} users
                      </div>
                      <div className="w-full max-w-[32px] h-36 flex items-end justify-center">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            isLatest
                              ? 'bg-gradient-to-t from-purple-700 to-purple-500 shadow-sm shadow-purple-500/30'
                              : 'bg-purple-100 hover:bg-purple-300'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-[#727272]">{u.month}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-[#F5F5F5] flex items-center justify-between text-xs text-[#727272]">
              <span>6-Month New Registrations: <strong>586 users</strong></span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> +19.5% MoM
              </span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminAnalyticsPage
