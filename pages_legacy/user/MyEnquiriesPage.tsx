'use client'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  Clock,
  ExternalLink,
  Search,
  MessageCircle,
  Building2,
  RefreshCw,
  User,
  Inbox,
  SendHorizontal
} from 'lucide-react'
import { UserDashboardLayout } from '@/components/user/UserDashboardLayout'
import { useAuthStore } from '@/store/auth'
import { formatDate, formatRelativeTime, formatWhatsAppUrl } from '@/lib/utils'
import type { Enquiry, EnquiryStatus } from '@/types'
import { supabase } from '@/lib/supabase'
import api from '@/lib/api'

type TabType = 'received' | 'sent'

export const MyEnquiriesPage: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const [activeTab, setActiveTab] = useState<TabType>('received')
  const [loading, setLoading] = useState(true)
  const [receivedEnquiries, setReceivedEnquiries] = useState<Enquiry[]>([])
  const [sentEnquiries, setSentEnquiries] = useState<Enquiry[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Reply dialog state
  const [replyingTo, setReplyingTo] = useState<Enquiry | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  const fetchEnquiries = async () => {
    try {
      setLoading(true)

      // Fetch received enquiries (where owner's properties received enquiries)
      if (user?.id) {
        // Enquiries Received
        const { data: recData } = await supabase
          .from('enquiries')
          .select('*, property:properties(id, title, slug, price, address)')
          .order('created_at', { ascending: false })

        if (recData) {
          setReceivedEnquiries(recData as Enquiry[])
        }

        // Enquiries Sent by this user
        const { data: sentData } = await supabase
          .from('enquiries')
          .select('*, property:properties(id, title, slug, seller_name, seller_phone)')
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false })

        if (sentData) {
          setSentEnquiries(sentData as Enquiry[])
        }
      }
    } catch (err) {
      console.error('Failed to load enquiries:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnquiries()
  }, [user?.id])

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyingTo || !replyMessage.trim()) return

    try {
      setSendingReply(true)
      const now = new Date().toISOString()

      // Update in Supabase
      const { error } = await supabase
        .from('enquiries')
        .update({
          response: replyMessage.trim(),
          status: 'responded',
          responded_at: now,
        })
        .eq('id', replyingTo.id)

      if (!error) {
        setReceivedEnquiries((prev) =>
          prev.map((item) =>
            item.id === replyingTo.id
              ? { ...item, response: replyMessage.trim(), status: 'responded', responded_at: now }
              : item
          )
        )
        setReplyingTo(null)
        setReplyMessage('')
      }
    } catch (err) {
      console.error('Failed to send response:', err)
    } finally {
      setSendingReply(false)
    }
  }

  const markAsRead = async (enquiry: Enquiry) => {
    if (enquiry.status !== 'new') return
    try {
      await supabase.from('enquiries').update({ status: 'read' }).eq('id', enquiry.id)
      setReceivedEnquiries((prev) =>
        prev.map((e) => (e.id === enquiry.id ? { ...e, status: 'read' } : e))
      )
    } catch {
      // ignore
    }
  }

  const currentList = activeTab === 'received' ? receivedEnquiries : sentEnquiries

  const filteredList = currentList.filter((item) => {
    const q = searchQuery.toLowerCase()
    return (
      item.buyer_name?.toLowerCase().includes(q) ||
      item.buyer_phone?.includes(q) ||
      item.property?.title?.toLowerCase().includes(q) ||
      item.message?.toLowerCase().includes(q)
    )
  })

  return (
    <UserDashboardLayout
      title="Property Enquiries & Leads"
      subtitle="Interact with interested buyers and track your sent plot inquiries."
    >
      <div className="space-y-6">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-[#EAEAEA] shadow-xs">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('received')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'received'
                  ? 'bg-[#F47B20] text-white shadow-xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-[#FFF8F2] hover:text-[#F47B20]'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Enquiries Received</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'received' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {receivedEnquiries.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sent')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'sent'
                  ? 'bg-[#F47B20] text-white shadow-xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-[#FFF8F2] hover:text-[#F47B20]'
              }`}
            >
              <SendHorizontal className="w-4 h-4" />
              <span>Enquiries I Sent</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'sent' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {sentEnquiries.length}
              </span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search enquiries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFF8F2]/50 border border-gray-200 rounded-xl pl-9 pr-3 py-1.5 text-xs sm:text-sm focus:outline-none focus:border-[#F47B20]"
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-2xl border border-[#EAEAEA] shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 skeleton rounded-xl" />
              ))}
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#202124] font-['Poppins']">
                {activeTab === 'received'
                  ? 'No buyer enquiries received yet'
                  : 'You haven’t sent any enquiries yet'}
              </h3>
              <p className="text-xs sm:text-sm text-[#727272] max-w-sm mx-auto mt-1 mb-6">
                {activeTab === 'received'
                  ? 'When buyers view your plots and request details or site visits, their messages will appear here.'
                  : 'Found a plot you like? Click "Send Enquiry" on any listing to ask questions or request a callback.'}
              </p>
              {activeTab === 'sent' && (
                <Link to="/search" className="btn-primary py-2 px-5 text-xs inline-flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>Browse Plots</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[#EAEAEA]">
              {filteredList.map((enquiry) => (
                <div
                  key={enquiry.id}
                  className="p-5 hover:bg-[#FFF8F2]/30 transition-colors"
                  onClick={() => activeTab === 'received' && markAsRead(enquiry)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-[#202124]">
                          {activeTab === 'received' ? enquiry.buyer_name : 'Inquiry for Listing'}
                        </span>

                        {/* Status badge */}
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            enquiry.status === 'new'
                              ? 'bg-blue-100 text-blue-700 font-extrabold'
                              : enquiry.status === 'responded'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {enquiry.status}
                        </span>
                      </div>

                      {/* Property reference */}
                      {enquiry.property && (
                        <p className="text-xs text-[#727272] mt-0.5 flex items-center gap-1">
                          <span>Re:</span>
                          <Link
                            to={`/property/${enquiry.property.slug || enquiry.property.id}`}
                            className="font-semibold text-[#F47B20] hover:underline"
                          >
                            {enquiry.property.title}
                          </Link>
                        </p>
                      )}
                    </div>

                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(enquiry.created_at)} ({formatRelativeTime(enquiry.created_at)})
                    </span>
                  </div>

                  {/* Buyer Contact Details (if received tab) */}
                  {activeTab === 'received' && (
                    <div className="flex flex-wrap items-center gap-3 py-2 text-xs font-medium">
                      <a
                        href={`tel:${enquiry.buyer_phone}`}
                        className="flex items-center gap-1 text-gray-700 hover:text-[#F47B20] bg-gray-100 hover:bg-orange-50 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#F47B20]" />
                        <span>{enquiry.buyer_phone}</span>
                      </a>

                      <a
                        href={formatWhatsAppUrl(
                          enquiry.buyer_phone,
                          `Hi ${enquiry.buyer_name}, this is regarding your enquiry on Sasta Plots for ${enquiry.property?.title || 'my plot'}.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                        <span>Chat on WhatsApp</span>
                      </a>

                      {enquiry.buyer_email && (
                        <a
                          href={`mailto:${enquiry.buyer_email}`}
                          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg"
                        >
                          <Mail className="w-3.5 h-3.5 text-gray-500" />
                          <span>{enquiry.buyer_email}</span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Message content */}
                  {enquiry.message && (
                    <div className="bg-[#FFF8F2]/60 border border-orange-100 rounded-xl p-3 my-2 text-xs sm:text-sm text-[#202124]">
                      <p className="font-semibold text-[11px] text-[#727272] mb-1">Buyer Message:</p>
                      <p className="leading-relaxed">&ldquo;{enquiry.message}&rdquo;</p>
                    </div>
                  )}

                  {/* Seller response if present */}
                  {enquiry.response && (
                    <div className="bg-green-50/70 border border-green-200 rounded-xl p-3 my-2 text-xs text-green-950">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold flex items-center gap-1 text-green-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          Owner Response:
                        </span>
                        {enquiry.responded_at && (
                          <span className="text-[10px] text-green-700">
                            {formatDate(enquiry.responded_at)}
                          </span>
                        )}
                      </div>
                      <p className="leading-relaxed">&ldquo;{enquiry.response}&rdquo;</p>
                    </div>
                  )}

                  {/* Quick Reply CTA for Received Enquiries */}
                  {activeTab === 'received' && !enquiry.response && (
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingTo(enquiry)
                          setReplyMessage('')
                        }}
                        className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Quick Reply</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {replyingTo && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#EAEAEA]">
            <h3 className="text-base font-bold text-[#202124] font-['Poppins']">
              Reply to {replyingTo.buyer_name}
            </h3>
            <p className="text-xs text-[#727272] mt-0.5 mb-4">
              Re: {replyingTo.property?.title}
            </p>

            <form onSubmit={handleSendResponse} className="space-y-4">
              <div>
                <label className="form-label text-xs">Your Message / Answer</label>
                <textarea
                  rows={4}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="e.g. Yes, the plot is available for site visit this Saturday. Call me on..."
                  className="input-field text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingReply}
                  className="btn-primary py-2 px-5 text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingReply ? 'Sending...' : 'Send Response'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </UserDashboardLayout>
  )
}

export default MyEnquiriesPage
