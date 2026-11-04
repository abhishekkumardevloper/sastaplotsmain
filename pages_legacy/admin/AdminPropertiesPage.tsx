'use client'
import React, { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Filter,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Archive,
  MoreVertical,
  ExternalLink,
  Edit,
  Building,
  RefreshCw,
  Trash2,
  Calendar,
  Layers,
  CheckSquare,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminDataTable, Column } from '@/components/admin/AdminDataTable'
import type {
  Property,
  PropertyStatus,
  PropertyCategory,
  SellerCategory,
  PaginatedResponse,
} from '@/types'

const formatPrice = (price: number) => {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} Lac`
  return `₹${price.toLocaleString('en-IN')}`
}

const statusBadgeStyles: Record<
  PropertyStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  draft: { label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  pending_review: {
    label: 'Pending Review',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  needs_changes: {
    label: 'Needs Changes',
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-200',
  },
  approved: {
    label: 'Approved',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
  },
  suspended: {
    label: 'Suspended',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
  },
  archived: {
    label: 'Archived',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
  },
  sold: { label: 'Sold', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  rented: { label: 'Rented', bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
}

export const AdminPropertiesPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  // State from URL query params
  const currentTab = searchParams.get('status') || 'all'
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all')
  const [sellerFilter, setSellerFilter] = useState(searchParams.get('seller') || 'all')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)
  const limit = 10

  // Selection state
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([])

  // Modal states for single action
  const [actionModal, setActionModal] = useState<{
    open: boolean
    type: 'approve' | 'reject' | 'suspend' | 'archive' | null
    propertyId: string | null
    propertyTitle?: string
  }>({ open: false, type: null, propertyId: null })
  const [actionReason, setActionReason] = useState('')

  // Bulk action confirmation modal
  const [bulkModal, setBulkModal] = useState<{
    open: boolean
    type: 'approve' | 'reject' | 'archive' | null
  }>({ open: false, type: null })

  // Query properties
  const { data, isLoading, isRefetching, refetch } = useQuery<PaginatedResponse<Property>>({
    queryKey: [
      'admin',
      'properties',
      { status: currentTab, q: searchTerm, category: categoryFilter, seller: sellerFilter, sort: sortBy, page },
    ],
    queryFn: async () => {
      try {
        const params: Record<string, any> = { page, limit }
        if (currentTab !== 'all') params.status = currentTab
        if (searchTerm) params.q = searchTerm
        if (categoryFilter !== 'all') params.category = categoryFilter
        if (sellerFilter !== 'all') params.seller_category = sellerFilter
        if (sortBy) params.sort = sortBy

        const res = await api.get('/admin/properties', { params })
        return res.data
      } catch (err) { console.error("Admin properties error:", err); return { data: [], total: 0, page: 1, limit: 10, totalPages: 1 }; }
    },
    staleTime: 30 * 1000,
  })

  // Status Change Mutation
  const statusMutation = useMutation({
    mutationFn: async ({
      propertyId,
      status,
      reason,
    }: {
      propertyId: string
      status: PropertyStatus
      reason?: string
    }) => {
      const res = await api.put(`/admin/properties/${propertyId}/status`, {
        status,
        reason,
      })
      return res.data
    },
    onSuccess: (_, variables) => {
      toast.success(`Property status updated to ${variables.status.replace('_', ' ')}`)
      setActionModal({ open: false, type: null, propertyId: null })
      setActionReason('')
      queryClient.invalidateQueries({ queryKey: ['admin'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update property status')
    },
  })

  // Bulk Status Change Mutation
  const bulkMutation = useMutation({
    mutationFn: async ({
      ids,
      status,
    }: {
      ids: (string | number)[]
      status: PropertyStatus
    }) => {
      const res = await api.put('/admin/properties/bulk-status', {
        ids,
        status,
      })
      return res.data
    },
    onSuccess: (_, variables) => {
      toast.success(
        `Bulk operation completed: ${variables.ids.length} properties marked as ${variables.status.replace('_', ' ')}`
      )
      setSelectedIds([])
      setBulkModal({ open: false, type: null })
      queryClient.invalidateQueries({ queryKey: ['admin'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Bulk operation failed')
    },
  })

  const handleTabChange = (status: string) => {
    const params = new URLSearchParams(searchParams)
    if (status === 'all') {
      params.delete('status')
    } else {
      params.set('status', status)
    }
    params.set('page', '1')
    setSearchParams(params)
    setPage(1)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (searchTerm) {
      params.set('q', searchTerm)
    } else {
      params.delete('q')
    }
    params.set('page', '1')
    setSearchParams(params)
    setPage(1)
  }

  const handleOpenAction = (
    type: 'approve' | 'reject' | 'suspend' | 'archive',
    property: Property
  ) => {
    setActionModal({
      open: true,
      type,
      propertyId: property.id,
      propertyTitle: property.title,
    })
    setActionReason('')
  }

  const handleConfirmSingleAction = () => {
    if (!actionModal.propertyId || !actionModal.type) return

    let nextStatus: PropertyStatus = 'approved'
    if (actionModal.type === 'approve') nextStatus = 'approved'
    if (actionModal.type === 'reject') nextStatus = 'rejected'
    if (actionModal.type === 'suspend') nextStatus = 'suspended'
    if (actionModal.type === 'archive') nextStatus = 'archived'

    if ((actionModal.type === 'reject' || actionModal.type === 'suspend') && !actionReason.trim()) {
      toast.error('Please enter a reason')
      return
    }

    statusMutation.mutate({
      propertyId: actionModal.propertyId,
      status: nextStatus,
      reason: actionReason,
    })
  }

  const handleConfirmBulk = () => {
    if (!bulkModal.type || selectedIds.length === 0) return
    let nextStatus: PropertyStatus = 'approved'
    if (bulkModal.type === 'approve') nextStatus = 'approved'
    if (bulkModal.type === 'reject') nextStatus = 'rejected'
    if (bulkModal.type === 'archive') nextStatus = 'archived'

    bulkMutation.mutate({
      ids: selectedIds,
      status: nextStatus,
    })
  }

  // Filter tabs definition
  const tabs = [
    { key: 'all', label: 'All Listings' },
    { key: 'pending_review', label: 'Pending Review' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'suspended', label: 'Suspended' },
    { key: 'archived', label: 'Archived' },
  ]

  // Columns definition
  const columns: Column<Property>[] = [
    {
      key: 'cover',
      header: 'Cover & Title',
      width: '340px',
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-16 h-13 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-[#EAEAEA] relative">
            <img
              src={
                p.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&q=80'
              }
              alt={p.title}
              className="w-full h-full object-cover"
            />
            {p.is_featured && (
              <span className="absolute top-1 left-1 bg-[#F47B20] text-white text-[9px] font-bold px-1 rounded">
                ★
              </span>
            )}
          </div>
          <div className="min-w-0">
            <Link
              to={`/admin/properties/${p.id}/review`}
              className="font-medium text-[#202124] hover:text-[#F47B20] line-clamp-1 text-sm transition"
              title={p.title}
            >
              {p.title}
            </Link>
            <div className="flex items-center gap-2 text-xs text-[#727272] mt-0.5">
              <span className="font-mono text-[11px] text-gray-400">ID: {p.id.slice(0, 8)}</span>
              <span>•</span>
              <span className="capitalize">{p.property_type.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Owner / Seller',
      render: (p) => (
        <div>
          <p className="font-medium text-xs text-[#202124]">{p.seller_name || 'N/A'}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-gray-100 text-[#727272]">
              {p.seller_category || 'owner'}
            </span>
            {p.seller_phone && (
              <span className="text-[11px] text-[#727272] truncate">{p.seller_phone}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => {
        const badge = statusBadgeStyles[p.status] || {
          label: p.status,
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-200',
        }
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
      key: 'category',
      header: 'Category & Area',
      render: (p) => (
        <div>
          <span className="text-xs font-medium text-[#202124] capitalize">
            {p.category.replace('_', ' ')}
          </span>
          <p className="text-xs text-[#727272]">
            {p.area} {p.area_unit}
          </p>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      render: (p) => (
        <div>
          <span className="font-semibold text-sm text-[#F47B20]">{formatPrice(p.price)}</span>
          {p.price_negotiable ? (
            <span className="block text-[10px] text-emerald-600 font-medium">Negotiable</span>
          ) : (
            <span className="block text-[10px] text-gray-400">Fixed</span>
          )}
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (p) => (
        <div className="max-w-[160px]">
          <p className="text-xs text-[#202124] truncate">{p.address || 'Address provided'}</p>
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      sortable: true,
      render: (p) => {
        const d = new Date(p.created_at)
        return (
          <span className="text-xs text-[#727272] whitespace-nowrap">
            {d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          {/* Public View */}
          <a
            href={`/properties/${p.slug}`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg text-gray-500 hover:text-[#F47B20] hover:bg-orange-50 transition"
            title="View live page in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Full Review / Edit */}
          <Link
            to={`/admin/properties/${p.id}/review`}
            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
            title="Review / Edit details"
          >
            <Eye className="w-4 h-4" />
          </Link>

          {/* Context-sensitive approval buttons */}
          {p.status !== 'approved' && (
            <button
              onClick={() => handleOpenAction('approve', p)}
              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
              title="Approve Listing"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}

          {p.status === 'pending_review' && (
            <button
              onClick={() => handleOpenAction('reject', p)}
              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
              title="Reject Listing"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}

          {p.status === 'approved' && (
            <button
              onClick={() => handleOpenAction('suspend', p)}
              className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition"
              title="Suspend Listing"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>
          )}

          {p.status !== 'archived' && (
            <button
              onClick={() => handleOpenAction('archive', p)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              title="Archive Listing"
            >
              <Archive className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ]

  const propertiesList = data?.data || []
  const totalCount = data?.total || 0
  const totalPages = data?.totalPages || 1

  return (
    <AdminLayout
      title="Property Inventory"
      subtitle="Manage, review, moderate, and publish plots and real estate listings"
      actions={
        <Link
          to="/admin/properties/new"
          className="btn-primary btn-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Property</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Filter Tabs */}
        <div className="flex items-center overflow-x-auto scrollbar-thin border-b border-[#EAEAEA] gap-2 pb-px">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`py-2.5 px-4 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#F47B20] text-[#F47B20] bg-orange-50/50 rounded-t-lg'
                    : 'border-transparent text-[#727272] hover:text-[#202124] hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Filter & Search Bar */}
        <div className="card p-4 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="md:col-span-2 relative">
              <input
                type="text"
                placeholder="Search by title, property ID, owner name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 text-xs"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </form>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value)
                  setPage(1)
                }}
                className="input-field text-xs"
              >
                <option value="all">All Categories</option>
                <option value="residential_plot">Residential Plot</option>
                <option value="agricultural_land">Agricultural Land</option>
                <option value="commercial">Commercial Land</option>
                <option value="residential">Residential Built</option>
                <option value="industrial">Industrial Land</option>
                <option value="institutional">Institutional Plot</option>
              </select>
            </div>

            {/* Seller Type Filter */}
            <div>
              <select
                value={sellerFilter}
                onChange={(e) => {
                  setSellerFilter(e.target.value)
                  setPage(1)
                }}
                className="input-field text-xs"
              >
                <option value="all">All Sellers</option>
                <option value="owner">Direct Owners</option>
                <option value="agent">Brokers / Agents</option>
                <option value="builder">Builders</option>
                <option value="developer">Township Developers</option>
              </select>
            </div>
          </div>

          {/* Secondary filter & sorting bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#F5F5F5] text-xs">
            <div className="flex items-center gap-2 text-[#727272]">
              <span>Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-50 border border-[#EAEAEA] rounded-lg px-2.5 py-1 text-xs text-[#202124] focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setCategoryFilter('all')
                  setSellerFilter('all')
                  setSortBy('newest')
                  handleTabChange('all')
                }}
                className="text-xs text-[#727272] hover:text-[#F47B20] transition"
              >
                Reset Filters
              </button>
              <button
                onClick={() => refetch()}
                disabled={isRefetching}
                className="p-1 text-gray-500 hover:text-[#202124]"
                title="Refresh listings"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Action Banner (shows when rows selected) */}
        {selectedIds.length > 0 && (
          <div className="card p-3 px-4 bg-[#FFF8F2] border border-[#FFE4CC] rounded-xl flex items-center justify-between animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#F47B20]" />
              <span className="text-xs font-semibold text-[#202124]">
                {selectedIds.length} properties selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBulkModal({ open: true, type: 'approve' })}
                className="btn-primary btn-sm !py-1 !text-xs !bg-emerald-600 hover:!bg-emerald-700"
              >
                Bulk Approve
              </button>
              <button
                onClick={() => setBulkModal({ open: true, type: 'reject' })}
                className="btn-secondary btn-sm !py-1 !text-xs !text-rose-600 hover:!bg-rose-50 border-rose-200"
              >
                Bulk Reject
              </button>
              <button
                onClick={() => setBulkModal({ open: true, type: 'archive' })}
                className="btn-secondary btn-sm !py-1 !text-xs text-gray-600"
              >
                Archive
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-[#727272] hover:text-[#202124] ml-2"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Properties Data Table */}
        <AdminDataTable
          columns={columns}
          data={propertiesList}
          isLoading={isLoading}
          selectable={true}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          emptyTitle="No properties found"
          emptyDescription="Try adjusting your search criteria, category filters, or status tab."
          emptyIcon={Building}
          pagination={{
            page,
            totalPages,
            total: totalCount,
            limit,
            onPageChange: (p) => setPage(p),
          }}
        />
      </div>

      {/* Single Action Modal */}
      {actionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EAEAEA] animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-poppins font-bold text-lg text-[#202124] capitalize">
              {actionModal.type} Listing
            </h3>
            <p className="text-xs text-[#727272] mt-1 mb-4">
              Are you sure you want to {actionModal.type} listing{' '}
              <strong className="text-[#202124]">"{actionModal.propertyTitle}"</strong>?
            </p>

            {(actionModal.type === 'reject' || actionModal.type === 'suspend') && (
              <div className="space-y-2 mb-4">
                <label className="form-label text-xs">
                  Reason / Notes for seller *
                </label>
                <textarea
                  rows={3}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Explain why this action is being taken..."
                  className="input-field text-xs resize-none"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setActionModal({ open: false, type: null, propertyId: null })}
                className="btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleAction}
                disabled={statusMutation.isPending}
                className={`btn-primary btn-sm text-white ${
                  actionModal.type === 'approve'
                    ? '!bg-emerald-600 hover:!bg-emerald-700'
                    : actionModal.type === 'reject'
                    ? '!bg-rose-600 hover:!bg-rose-700'
                    : '!bg-purple-600 hover:!bg-purple-700'
                }`}
              >
                {statusMutation.isPending ? 'Processing...' : `Confirm ${actionModal.type}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Confirmation Modal */}
      {bulkModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EAEAEA] animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-poppins font-bold text-lg text-[#202124] capitalize">
              Confirm Bulk {bulkModal.type}
            </h3>
            <p className="text-xs text-[#727272] mt-2 mb-6">
              You have selected{' '}
              <strong className="text-[#202124]">{selectedIds.length} properties</strong>. Are you
              sure you want to {bulkModal.type} all selected listings at once?
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setBulkModal({ open: false, type: null })}
                className="btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulk}
                disabled={bulkMutation.isPending}
                className={`btn-primary btn-sm text-white ${
                  bulkModal.type === 'approve'
                    ? '!bg-emerald-600 hover:!bg-emerald-700'
                    : '!bg-rose-600 hover:!bg-rose-700'
                }`}
              >
                {bulkMutation.isPending
                  ? 'Processing...'
                  : `Yes, ${bulkModal.type} ${selectedIds.length} properties`}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminPropertiesPage
