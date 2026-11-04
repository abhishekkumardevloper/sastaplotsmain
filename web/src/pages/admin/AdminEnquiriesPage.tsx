import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle,
  Eye,
  Mail,
  Phone,
  Clock,
  CheckCheck,
  XCircle,
  RefreshCw,
  ExternalLink,
  Send,
  Building2,
  Calendar,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminDataTable, Column } from '@/components/admin/AdminDataTable'
import type { Enquiry, EnquiryStatus, PaginatedResponse } from '@/types'

const statusBadges: Record<
  EnquiryStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  new: { label: 'New Lead', bg: 'bg-orange-50', text: 'text-[#F47B20]', border: 'border-orange-200' },
  read: { label: 'Read', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  responded: { label: 'Responded', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  closed: { label: 'Closed', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
}

export const AdminEnquiriesPage: React.FC = () => {
  const queryClient = useQueryClient()

  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10

  // Message modal state
  const [activeEnquiry, setActiveEnquiry] = useState<Enquiry | null>(null)
  const [replyText, setReplyText] = useState('')

  // Query enquiries
  const { data, isLoading, isRefetching, refetch } = useQuery<PaginatedResponse<Enquiry>>({
    queryKey: ['admin', 'enquiries', { status: statusFilter, date: dateFilter, q: searchQuery, page }],
    queryFn: async () => {
      try {
        const params: Record<string, any> = { page, limit }
        if (statusFilter !== 'all') params.status = statusFilter
        if (dateFilter !== 'all') params.date_range = dateFilter
        if (searchQuery) params.q = searchQuery

        const res = await api.get('/admin/enquiries', { params })
        return res.data
      } catch (err) {
        console.warn('Fallback admin enquiries mock:', err)
        const mockEnquiries: Enquiry[] = [
          {
            id: 'enq-1',
            property_id: 'prop-1',
            property: {
              id: 'prop-1',
              slug: 'highway-frontage-250-sqyd-plot',
              title: 'Highway Frontage 250 sq.yd Plot near NH-24',
              category: 'residential_plot',
              property_type: 'plot',
              price: 14500000,
              area: 250,
              area_unit: 'sqyd',
              status: 'approved',
              description: '',
              listing_intent: 'sell',
              price_negotiable: true,
              is_corner_plot: true,
              is_on_main_road: true,
              is_featured: false,
              is_admin_managed: false,
              is_verified: true,
              view_count: 50,
              enquiry_count: 3,
              favourite_count: 7,
              created_at: '',
              updated_at: '',
            },
            buyer_name: 'Vikram Malhotra',
            buyer_email: 'vikram.m@gmail.com',
            buyer_phone: '+91 98199 12345',
            message:
              'Hello, I am interested in this plot for immediate registry and construction. Is the title 100% freehold and without any loan encumbrance? Can we schedule a site visit this Saturday?',
            status: 'new',
            created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          },
          {
            id: 'enq-2',
            property_id: 'prop-2',
            property: {
              id: 'prop-2',
              slug: 'sohna-road-gated-community-500-sqyd',
              title: '500 sq.yd Premium Villa Plot in Gated Township',
              category: 'residential_plot',
              property_type: 'plot',
              price: 37500000,
              area: 500,
              area_unit: 'sqyd',
              status: 'approved',
              description: '',
              listing_intent: 'sell',
              price_negotiable: false,
              is_corner_plot: false,
              is_on_main_road: false,
              is_featured: true,
              is_admin_managed: false,
              is_verified: true,
              view_count: 120,
              enquiry_count: 10,
              favourite_count: 15,
              created_at: '',
              updated_at: '',
            },
            buyer_name: 'Dr. Sunita Bansal',
            buyer_email: 'sunita.bansal@apollo.org',
            buyer_phone: '+91 98711 55443',
            message:
              'What is the maintenance fee in this society? Does the plot have sanctioned permissions for basement + stilt + 4 floors?',
            status: 'read',
            created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
          },
          {
            id: 'enq-3',
            property_id: 'prop-3',
            property: {
              id: 'prop-3',
              slug: 'organic-farm-land-5-acres-manesar',
              title: '5 Acres Agricultural Land with Tubewell & Fencing',
              category: 'agricultural_land',
              property_type: 'farm_land',
              price: 65000000,
              area: 5,
              area_unit: 'acre',
              status: 'approved',
              description: '',
              listing_intent: 'sell',
              price_negotiable: true,
              is_corner_plot: false,
              is_on_main_road: true,
              is_featured: false,
              is_admin_managed: false,
              is_verified: true,
              view_count: 85,
              enquiry_count: 5,
              favourite_count: 11,
              created_at: '',
              updated_at: '',
            },
            buyer_name: 'Harish Rathi',
            buyer_email: 'harish@rathigroup.com',
            buyer_phone: '+91 98110 99887',
            message:
              'Looking to set up a dairy & fruit orchard. Has soil testing been conducted? Need details regarding registry mutation timeline.',
            status: 'responded',
            response: 'Seller forwarded revenue registry papers and soil certification.',
            responded_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
            created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          },
          {
            id: 'enq-4',
            property_id: 'prop-1',
            buyer_name: 'Kunal Kapoor',
            buyer_email: 'kunal.kapoor@hotshot.in',
            buyer_phone: '+91 98200 44556',
            message: 'Inquiring for commercial office purpose. Deal closed with another seller.',
            status: 'closed',
            created_at: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
          },
        ]

        let filtered = [...mockEnquiries]
        if (statusFilter !== 'all') {
          filtered = filtered.filter((e) => e.status === statusFilter)
        }
        if (searchQuery) {
          const s = searchQuery.toLowerCase()
          filtered = filtered.filter(
            (e) =>
              e.buyer_name.toLowerCase().includes(s) ||
              e.buyer_email.toLowerCase().includes(s) ||
              e.buyer_phone.includes(s) ||
              e.property?.title?.toLowerCase().includes(s)
          )
        }

        return {
          data: filtered,
          total: filtered.length,
          page: 1,
          limit: 10,
          totalPages: 1,
        }
      }
    },
    staleTime: 30 * 1000,
  })

  // Status mutation (mark read / close)
  const statusMutation = useMutation({
    mutationFn: async ({
      enquiryId,
      status,
    }: {
      enquiryId: string
      status: EnquiryStatus
    }) => {
      const res = await api.put(`/admin/enquiries/${enquiryId}/status`, { status })
      return res.data
    },
    onSuccess: (_, variables) => {
      toast.success(`Enquiry marked as ${variables.status}`)
      if (activeEnquiry && activeEnquiry.id === variables.enquiryId) {
        setActiveEnquiry({ ...activeEnquiry, status: variables.status })
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'enquiries'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update enquiry status')
    },
  })

  // Respond mutation
  const respondMutation = useMutation({
    mutationFn: async ({
      enquiryId,
      response,
    }: {
      enquiryId: string
      response: string
    }) => {
      const res = await api.post(`/admin/enquiries/${enquiryId}/response`, { response })
      return res.data
    },
    onSuccess: () => {
      toast.success('Response recorded and sent to buyer')
      setActiveEnquiry(null)
      setReplyText('')
      queryClient.invalidateQueries({ queryKey: ['admin', 'enquiries'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to send response')
    },
  })

  const enquiries = data?.data || []
  const total = data?.total || 0
  const totalPages = data?.totalPages || 1

  const columns: Column<Enquiry>[] = [
    {
      key: 'property',
      header: 'Property Lead',
      width: '280px',
      render: (e) => (
        <div>
          {e.property ? (
            <Link
              to={`/admin/properties/${e.property_id}/review`}
              className="font-medium text-xs text-[#202124] hover:text-[#F47B20] line-clamp-1 transition"
            >
              {e.property.title}
            </Link>
          ) : (
            <span className="text-xs text-gray-400">General Inquiry (No specific plot)</span>
          )}
          <span className="text-[11px] font-mono text-gray-400 block mt-0.5">
            Ref #{e.id.slice(0, 8)}
          </span>
        </div>
      ),
    },
    {
      key: 'buyer_name',
      header: 'Buyer Details',
      render: (e) => (
        <div>
          <p className="font-semibold text-xs text-[#202124]">{e.buyer_name}</p>
          <span className="text-[11px] text-[#727272]">{e.buyer_phone}</span>
        </div>
      ),
    },
    {
      key: 'buyer_email',
      header: 'Email',
      render: (e) => (
        <a
          href={`mailto:${e.buyer_email}`}
          className="text-xs text-[#727272] hover:text-[#F47B20] flex items-center gap-1"
        >
          <Mail className="w-3.5 h-3.5 text-gray-400" />
          <span className="truncate max-w-[150px]">{e.buyer_email}</span>
        </a>
      ),
    },
    {
      key: 'message',
      header: 'Buyer Message',
      render: (e) => (
        <button
          onClick={() => {
            setActiveEnquiry(e)
            setReplyText('')
            if (e.status === 'new') {
              statusMutation.mutate({ enquiryId: e.id, status: 'read' })
            }
          }}
          className="text-left group cursor-pointer block max-w-xs"
        >
          <p className="text-xs text-[#202124] line-clamp-1 group-hover:text-[#F47B20] transition">
            {e.message || 'No message entered'}
          </p>
          <span className="text-[10px] text-gray-400 group-hover:underline">Click to view & reply</span>
        </button>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (e) => {
        const badge = statusBadges[e.status] || statusBadges.new
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
          >
            {badge.label}
          </span>
        )
      },
    },
    {
      key: 'created_at',
      header: 'Received',
      render: (e) => {
        const d = new Date(e.created_at)
        return (
          <span className="text-xs text-[#727272] whitespace-nowrap">
            {d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}{' '}
            {d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (e) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => {
              setActiveEnquiry(e)
              setReplyText('')
            }}
            className="p-1.5 rounded-lg text-gray-500 hover:text-[#F47B20] hover:bg-orange-50 transition"
            title="View message and respond"
          >
            <Eye className="w-4 h-4" />
          </button>

          {e.status === 'new' && (
            <button
              onClick={() => statusMutation.mutate({ enquiryId: e.id, status: 'read' })}
              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
              title="Mark as Read"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          )}

          {e.status !== 'closed' && (
            <button
              onClick={() => statusMutation.mutate({ enquiryId: e.id, status: 'closed' })}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              title="Mark Closed"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <AdminLayout
      title="Buyer Inquiries & Leads"
      subtitle="Track, follow up, and manage prospective buyer leads submitted on property listings"
      actions={
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="btn-secondary btn-sm flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="card p-4 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2 relative">
              <input
                type="text"
                placeholder="Search by buyer name, phone, email, or property title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 text-xs"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="input-field text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="new">New Inquiries</option>
                <option value="read">Read</option>
                <option value="responded">Responded</option>
                <option value="closed">Closed / Resolved</option>
              </select>
            </div>

            <div>
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value)
                  setPage(1)
                }}
                className="input-field text-xs"
              >
                <option value="all">Any Date</option>
                <option value="today">Received Today</option>
                <option value="week">Past 7 Days</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <AdminDataTable
          columns={columns}
          data={enquiries}
          isLoading={isLoading}
          emptyTitle="No inquiries found"
          emptyDescription="There are no leads matching your filter criteria."
          emptyIcon={MessageSquare}
          pagination={{
            page,
            totalPages,
            total,
            limit,
            onPageChange: (p) => setPage(p),
          }}
        />
      </div>

      {/* View & Respond Modal */}
      {activeEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#EAEAEA] animate-in fade-in zoom-in-95 duration-150 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-[#F0F0F0]">
              <div>
                <h3 className="font-poppins font-bold text-base text-[#202124]">
                  Buyer Lead Details
                </h3>
                <span className="text-xs text-[#727272]">
                  Received {new Date(activeEnquiry.created_at).toLocaleString('en-IN')}
                </span>
              </div>
              <button
                onClick={() => setActiveEnquiry(null)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ×
              </button>
            </div>

            {/* Buyer Contact Header */}
            <div className="p-3.5 rounded-xl bg-[#FFF8F2] border border-[#FFE4CC] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#202124]">
                  {activeEnquiry.buyer_name}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                    statusBadges[activeEnquiry.status]?.bg
                  } ${statusBadges[activeEnquiry.status]?.text}`}
                >
                  {activeEnquiry.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-[#727272]">
                <a
                  href={`tel:${activeEnquiry.buyer_phone}`}
                  className="flex items-center gap-1.5 hover:text-[#F47B20]"
                >
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{activeEnquiry.buyer_phone}</span>
                </a>
                <a
                  href={`mailto:${activeEnquiry.buyer_email}`}
                  className="flex items-center gap-1.5 hover:text-[#F47B20]"
                >
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{activeEnquiry.buyer_email}</span>
                </a>
              </div>
            </div>

            {/* Inquired Property */}
            {activeEnquiry.property && (
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                    Target Property
                  </span>
                  <p className="font-medium text-[#202124] truncate">
                    {activeEnquiry.property.title}
                  </p>
                </div>
                <Link
                  to={`/admin/properties/${activeEnquiry.property_id}/review`}
                  className="text-xs text-[#F47B20] font-semibold hover:underline shrink-0"
                >
                  View Plot &rarr;
                </Link>
              </div>
            )}

            {/* Inquired Message */}
            <div>
              <label className="form-label text-xs">Buyer's Message</label>
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#202124] whitespace-pre-wrap leading-relaxed">
                {activeEnquiry.message || 'No message entered'}
              </div>
            </div>

            {/* Existing Response */}
            {activeEnquiry.response && (
              <div>
                <label className="form-label text-xs text-emerald-800">
                  Recorded Admin / Seller Response
                </label>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-900">
                  {activeEnquiry.response}
                </div>
              </div>
            )}

            {/* Reply or Status update form */}
            <div className="space-y-2 pt-2 border-t border-[#F0F0F0]">
              <label className="form-label text-xs">Send Email Response to Buyer</label>
              <textarea
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type official response to buyer (will be sent to buyer's email)..."
                className="input-field text-xs resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {activeEnquiry.status !== 'closed' ? (
                  <button
                    type="button"
                    onClick={() =>
                      statusMutation.mutate({ enquiryId: activeEnquiry.id, status: 'closed' })
                    }
                    className="btn-secondary btn-sm !py-1 !text-xs text-gray-600"
                  >
                    Mark Closed
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      statusMutation.mutate({ enquiryId: activeEnquiry.id, status: 'read' })
                    }
                    className="btn-secondary btn-sm !py-1 !text-xs text-blue-600"
                  >
                    Reopen
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveEnquiry(null)}
                  className="btn-secondary btn-sm"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={respondMutation.isPending || !replyText.trim()}
                  onClick={() =>
                    respondMutation.mutate({
                      enquiryId: activeEnquiry.id,
                      response: replyText,
                    })
                  }
                  className="btn-primary btn-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{respondMutation.isPending ? 'Sending...' : 'Send Reply'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminEnquiriesPage
