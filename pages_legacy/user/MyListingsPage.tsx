'use client'
import React, { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Building2,
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Eye,
  RefreshCw,
  Filter,
  ArrowRight
} from 'lucide-react'
import { UserDashboardLayout } from '@/components/user/UserDashboardLayout'
import { useAuthStore } from '@/store/auth'
import { formatPrice, formatArea, formatDate, STATUS_CONFIG } from '@/lib/utils'
import type { Property, PropertyStatus } from '@/types'
import { supabase } from '@/lib/supabase'
import api from '@/lib/api'

type StatusFilterTab = 'all' | 'approved' | 'pending_review' | 'draft' | 'needs_changes' | 'rejected'

export const MyListingsPage: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<StatusFilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const fetchProperties = async () => {
    try {
      setLoading(true)

      // Try API first
      try {
        const res = await api.get('/user/properties')
        if (res.data?.data) {
          setProperties(res.data.data)
          setLoading(false)
          return
        }
      } catch {
        // Fall back to Supabase
      }

      if (user?.id) {
        const { data, error } = await supabase
          .from('properties')
          .select('*, images(*)')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })

        if (!error && data) {
          setProperties(data as Property[])
        }
      }
    } catch (err) {
      console.error('Failed to fetch user listings:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [user?.id])

  const handleDeleteDraft = async (id: string) => {
    try {
      setDeletingId(id)
      const { error } = await supabase.from('properties').delete().eq('id', id)
      if (!error) {
        setProperties((prev) => prev.filter((p) => p.id !== id))
      }
    } catch (err) {
      console.error('Failed to delete property draft:', err)
    } finally {
      setDeletingId(null)
      setDeleteConfirmId(null)
    }
  }

  // Calculate tab counts
  const counts = useMemo(() => {
    const c = {
      all: properties.length,
      approved: 0,
      pending_review: 0,
      draft: 0,
      needs_changes: 0,
      rejected: 0,
    }
    properties.forEach((p) => {
      if (p.status in c) {
        c[p.status as keyof typeof c]++
      }
    })
    return c
  }, [properties])

  // Filter listings by active tab and search query
  const filteredProperties = useMemo(() => {
    return properties.filter((item) => {
      const matchesTab = activeTab === 'all' || item.status === activeTab
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.pin_code?.includes(searchQuery)
      return matchesTab && matchesSearch
    })
  }, [properties, activeTab, searchQuery])

  const tabs: Array<{ id: StatusFilterTab; label: string; count: number; color?: string }> = [
    { id: 'all', label: 'All Listings', count: counts.all },
    { id: 'approved', label: 'Approved', count: counts.approved, color: 'text-green-600' },
    { id: 'pending_review', label: 'Pending', count: counts.pending_review, color: 'text-amber-600' },
    { id: 'draft', label: 'Drafts', count: counts.draft, color: 'text-gray-600' },
    { id: 'needs_changes', label: 'Needs Changes', count: counts.needs_changes, color: 'text-orange-600' },
    { id: 'rejected', label: 'Rejected', count: counts.rejected, color: 'text-red-600' },
  ]

  return (
    <UserDashboardLayout
      title="My Property Listings"
      subtitle="View status, manage edits, and track engagement across your property portfolio."
      action={
        <Link
          to="/post-property"
          className="btn-primary py-2 px-3 sm:px-4 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add New Listing</span>
          <span className="sm:hidden">Add</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Search Bar & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-[#EAEAEA] shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, location, or pincode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFF8F2]/50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm focus:outline-none focus:border-[#F47B20]"
            />
          </div>

          <button
            type="button"
            onClick={fetchProperties}
            disabled={loading}
            className="btn-secondary py-2 px-3 text-xs flex items-center justify-center gap-1.5"
            title="Refresh listings"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#F47B20] text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:bg-[#FFF8F2] hover:text-[#F47B20] border border-[#EAEAEA]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : tab.color || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Listings List/Table Container */}
        <div className="bg-white rounded-2xl border border-[#EAEAEA] shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 skeleton rounded-xl" />
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            /* Empty State */
            <div className="py-16 px-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#FFF8F2] text-[#F47B20] flex items-center justify-center mx-auto mb-4 border border-orange-100">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#202124] font-['Poppins']">
                {searchQuery
                  ? 'No matching properties found'
                  : activeTab === 'all'
                  ? 'You haven’t posted any properties yet'
                  : `No listings with "${tabs.find((t) => t.id === activeTab)?.label}" status`}
              </h3>
              <p className="text-xs sm:text-sm text-[#727272] max-w-md mx-auto mt-1 mb-6">
                {searchQuery
                  ? 'Try adjusting your search terms or clearing the filter.'
                  : 'Start publishing your residential plots, agricultural land, or commercial plots to reach active buyers.'}
              </p>
              {activeTab === 'all' && !searchQuery ? (
                <Link
                  to="/post-property"
                  className="btn-primary py-2.5 px-6 text-xs sm:text-sm inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Your First Property</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('all')
                    setSearchQuery('')
                  }}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            /* Listings Content */
            <div className="divide-y divide-[#EAEAEA]">
              {filteredProperties.map((property) => {
                const status = STATUS_CONFIG[property.status] || {
                  label: property.status,
                  color: 'text-gray-700',
                  bg: 'bg-gray-100',
                }
                const coverImg =
                  property.images?.[0]?.url ||
                  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&auto=format&fit=crop&q=80'

                return (
                  <div
                    key={property.id}
                    className="p-4 sm:p-5 hover:bg-[#FFF8F2]/30 transition-colors flex flex-col gap-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                        <div className="relative flex-shrink-0">
                          <img
                            src={coverImg}
                            alt={property.title}
                            className="w-20 h-20 sm:w-24 sm:h-20 rounded-xl object-cover border border-gray-200"
                          />
                          {property.is_featured && (
                            <span className="absolute top-1 left-1 badge-featured scale-75 origin-top-left">
                              Featured
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span
                              className={`status-badge text-[10px] font-bold ${status.bg} ${status.color}`}
                            >
                              {status.label}
                            </span>
                            <span className="text-[11px] text-gray-500 font-medium capitalize">
                              {property.category.replace(/_/g, ' ')} &bull; {property.property_type.replace(/_/g, ' ')}
                            </span>
                          </div>

                          <h3 className="text-sm sm:text-base font-bold text-[#202124] hover:text-[#F47B20] transition-colors truncate">
                            <Link to={`/property/${property.slug || property.id}`}>
                              {property.title}
                            </Link>
                          </h3>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#727272] mt-1">
                            <span className="font-bold text-[#202124]">
                              {formatPrice(property.price)}
                            </span>
                            <span>&bull;</span>
                            <span>{formatArea(property.area, property.area_unit)}</span>
                            {property.address && (
                              <>
                                <span>&bull;</span>
                                <span className="truncate max-w-[200px]">{property.address}</span>
                              </>
                            )}
                          </div>

                          <div className="text-[11px] text-gray-400 mt-1">
                            Added on {formatDate(property.created_at)}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Link
                          to={`/property/${property.slug || property.id}`}
                          className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
                          title="View on site"
                        >
                          <Eye className="w-3.5 h-3.5 text-gray-500" />
                          <span>View</span>
                        </Link>

                        <Link
                          to={`/post-property?edit=${property.id}`}
                          className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Link>

                        {/* Delete draft / delete confirm button */}
                        {property.status === 'draft' && (
                          <>
                            {deleteConfirmId === property.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDraft(property.id)}
                                  disabled={deletingId === property.id}
                                  className="px-2.5 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
                                >
                                  {deletingId === property.id ? 'Deleting...' : 'Confirm'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-2 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(property.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete draft"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status Action Hints / Explanations */}
                    {property.status === 'needs_changes' && (
                      <div className="bg-orange-50/80 border border-orange-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-orange-900 mt-1">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Changes required by moderator: </span>
                            <span>{property.moderation_feedback || 'Please update the property details or attach clearer plot ownership documents.'}</span>
                          </div>
                        </div>
                        <Link
                          to={`/post-property?edit=${property.id}`}
                          className="btn-primary text-xs py-1.5 px-3 self-start sm:self-auto whitespace-nowrap"
                        >
                          Edit & Resubmit
                        </Link>
                      </div>
                    )}

                    {property.status === 'rejected' && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-xs text-red-900 mt-1">
                        <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Rejection Reason: </span>
                          <span>{property.rejection_reason || 'This listing does not satisfy our verification guidelines or contains unverifiable land records.'}</span>
                        </div>
                      </div>
                    )}

                    {property.status === 'pending_review' && (
                      <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-2.5 flex items-center gap-2 text-xs text-amber-900 mt-1">
                        <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>Our moderation team is actively reviewing your plot details. Verification usually completes within 24 hours.</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </UserDashboardLayout>
  )
}

export default MyListingsPage
