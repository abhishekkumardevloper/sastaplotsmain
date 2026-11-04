'use client'
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Bot,
  Check,
  X,
  Search,
  RefreshCw,
  FolderOpen,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { AdminLayout } from '@/components/admin/AdminLayout'
import type { FAQ } from '@/types'

export const AdminFAQsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Modal state (Add / Edit)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [formData, setFormData] = useState<{
    category: string
    question: string
    answer: string
    is_active: boolean
    is_chatbot_knowledge: boolean
  }>({
    category: 'listing',
    question: '',
    answer: '',
    is_active: true,
    is_chatbot_knowledge: true,
  })

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Query FAQs
  const { data: faqs = [], isLoading, isRefetching, refetch } = useQuery<FAQ[]>({
    queryKey: ['admin', 'faqs'],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/faqs')
        return res.data
      } catch (err) {
        console.warn('Fallback admin FAQs mock:', err)
        const mockFaqs: FAQ[] = [
          {
            id: 'faq-1',
            category: 'listing',
            question: 'How do I post a property on Sasta Plots?',
            answer:
              'Click "Post Property" in the navigation, fill in your property details across the 7 steps, upload photos, and submit. Your listing will be reviewed by our admin team within 24-48 hours.',
            sort_order: 1,
            is_active: true,
            is_chatbot_knowledge: true,
          },
          {
            id: 'faq-2',
            category: 'listing',
            question: 'How long does property approval take?',
            answer:
              'Our verification team verifies title documents and coordinates within 24-48 hours on business days. You will receive an SMS and email notification once live.',
            sort_order: 2,
            is_active: true,
            is_chatbot_knowledge: true,
          },
          {
            id: 'faq-3',
            category: 'listing',
            question: 'Why was my listing rejected or marked for changes?',
            answer:
              'Listings can be rejected for low-resolution photos, boundary disputes, missing seller contact numbers, or incomplete land registration details. Feedback is always provided in the admin notification.',
            sort_order: 3,
            is_active: true,
            is_chatbot_knowledge: true,
          },
          {
            id: 'faq-4',
            category: 'buying',
            question: 'How do I contact a seller directly?',
            answer:
              'Open the plot listing page and click "Send Enquiry" or call the seller number directly. You must verify your mobile number to unlock verified owner contacts.',
            sort_order: 1,
            is_active: true,
            is_chatbot_knowledge: true,
          },
          {
            id: 'faq-5',
            category: 'buying',
            question: 'Are all plots verified by authority?',
            answer:
              'Listings with the green "Admin Verified" badge have had their ownership deeds and survey boundaries reviewed by our moderation team. Always carry out personal due diligence.',
            sort_order: 2,
            is_active: true,
            is_chatbot_knowledge: true,
          },
          {
            id: 'faq-6',
            category: 'account',
            question: 'How do I update my seller profile and RERA number?',
            answer:
              'Go to Account Settings > Profile, enter your registered business name and RERA registration ID, and click Save Changes.',
            sort_order: 1,
            is_active: true,
            is_chatbot_knowledge: false,
          },
          {
            id: 'faq-7',
            category: 'general',
            question: 'Is listing on Sasta Plots free?',
            answer:
              'Basic listing of up to 5 properties is free. Premium plans with spotlight badges and homepage visibility are also available.',
            sort_order: 1,
            is_active: true,
            is_chatbot_knowledge: true,
          },
        ]
        return mockFaqs
      }
    },
  })

  // Create / Update Mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: typeof formData & { id?: string }) => {
      if (payload.id) {
        const res = await api.put(`/admin/faqs/${payload.id}`, payload)
        return res.data
      }
      const res = await api.post('/admin/faqs', payload)
      return res.data
    },
    onSuccess: (_, variables) => {
      toast.success(variables.id ? 'FAQ updated successfully' : 'New FAQ created successfully')
      setModalOpen(false)
      setEditingFaq(null)
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save FAQ')
    },
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/faqs/${id}`)
      return res.data
    },
    onSuccess: () => {
      toast.success('FAQ deleted successfully')
      setDeleteId(null)
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete FAQ')
    },
  })

  // Reorder Mutation
  const reorderMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: 'up' | 'down' }) => {
      const res = await api.put(`/admin/faqs/${id}/reorder`, { direction })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] })
    },
  })

  const openAddModal = () => {
    setEditingFaq(null)
    setFormData({
      category: 'listing',
      question: '',
      answer: '',
      is_active: true,
      is_chatbot_knowledge: true,
    })
    setModalOpen(true)
  }

  const openEditModal = (faq: FAQ) => {
    setEditingFaq(faq)
    setFormData({
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      is_active: faq.is_active,
      is_chatbot_knowledge: faq.is_chatbot_knowledge,
    })
    setModalOpen(true)
  }

  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Question and answer are required')
      return
    }
    saveMutation.mutate({
      ...formData,
      id: editingFaq ? editingFaq.id : undefined,
    })
  }

  // Filter FAQs
  const categories = Array.from(new Set(faqs.map((f) => f.category)))

  const filteredFaqs = faqs.filter((f) => {
    const matchesCat = selectedCategory === 'all' || f.category === selectedCategory
    const matchesSearch =
      searchQuery === '' ||
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

  // Group by category
  const groupedFaqs: Record<string, FAQ[]> = {}
  filteredFaqs.forEach((f) => {
    if (!groupedFaqs[f.category]) groupedFaqs[f.category] = []
    groupedFaqs[f.category].push(f)
  })

  return (
    <AdminLayout
      title="FAQ & Knowledge Management"
      subtitle="Organize frequently asked questions and feed Google Gemini AI Chatbot knowledge base"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="btn-secondary btn-sm flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={openAddModal}
            className="btn-primary btn-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add FAQ</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="card p-4 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search question or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 text-xs"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-[#FFF0E0] text-[#F47B20]'
                  : 'text-[#727272] hover:bg-gray-100'
              }`}
            >
              All ({faqs.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-[#FFF0E0] text-[#F47B20]'
                    : 'text-[#727272] hover:bg-gray-100'
                }`}
              >
                {cat} ({faqs.filter((f) => f.category === cat).length})
              </button>
            ))}
          </div>
        </div>

        {/* Grouped Accordions / Lists */}
        {Object.keys(groupedFaqs).length === 0 ? (
          <div className="card p-12 text-center bg-white border border-[#EAEAEA] rounded-2xl">
            <HelpCircle className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <h4 className="font-semibold text-sm text-[#202124]">No FAQs found</h4>
            <p className="text-xs text-[#727272] mt-1 mb-4">
              Try a different keyword or create your first question entry.
            </p>
            <button onClick={openAddModal} className="btn-primary btn-sm">
              Add FAQ Now
            </button>
          </div>
        ) : (
          Object.entries(groupedFaqs).map(([cat, items]) => (
            <div
              key={cat}
              className="card bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Category Header */}
              <div className="bg-[#FFF8F2] px-5 py-3 border-b border-[#FFE4CC] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-[#F47B20]" />
                  <h3 className="font-poppins font-bold text-sm text-[#202124] capitalize">
                    {cat} Category
                  </h3>
                  <span className="text-[11px] text-[#727272]">({items.length} questions)</span>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-[#EAEAEA]">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-gray-50/50 transition"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-sm text-[#202124]">{item.question}</h4>
                        {item.is_chatbot_knowledge && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                            <Bot className="w-3 h-3" /> AI Knowledge
                          </span>
                        )}
                        {!item.is_active && (
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#727272] leading-relaxed">{item.answer}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0 self-end sm:self-start">
                      <button
                        onClick={() => reorderMutation.mutate({ id: item.id, direction: 'up' })}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#202124] hover:bg-gray-100 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => reorderMutation.mutate({ id: item.id, direction: 'down' })}
                        disabled={idx === items.length - 1}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#202124] hover:bg-gray-100 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
                        title="Edit FAQ"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form
            onSubmit={handleSubmitModal}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#EAEAEA] animate-in fade-in zoom-in-95 duration-150 space-y-4"
          >
            <div className="flex items-start justify-between pb-3 border-b border-[#F0F0F0]">
              <h3 className="font-poppins font-bold text-base text-[#202124]">
                {editingFaq ? 'Edit FAQ Entry' : 'Create New FAQ'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label text-xs">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field text-xs"
                >
                  <option value="listing">Listing Properties</option>
                  <option value="buying">Buying & Visiting</option>
                  <option value="account">Account & Verification</option>
                  <option value="general">General Marketplace</option>
                  <option value="legal">Legal & RERA</option>
                </select>
              </div>

              <div>
                <label className="form-label text-xs">Or New Category</label>
                <input
                  type="text"
                  placeholder="Custom category name..."
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      setFormData({ ...formData, category: e.target.value.trim().toLowerCase() })
                    }
                  }}
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div>
              <label className="form-label text-xs">Question *</label>
              <input
                type="text"
                placeholder="e.g. Can I list a property without RERA number?"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="input-field text-xs"
                required
              />
            </div>

            <div>
              <label className="form-label text-xs">Answer *</label>
              <textarea
                rows={4}
                placeholder="Provide accurate, concise answer for buyers/sellers..."
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                className="input-field text-xs resize-none"
                required
              />
            </div>

            <div className="space-y-2 pt-1 border-t border-[#F0F0F0]">
              <label className="flex items-center justify-between cursor-pointer text-xs">
                <div>
                  <span className="font-semibold text-[#202124] block">Include in AI Chatbot Knowledge Base</span>
                  <span className="text-[11px] text-[#727272]">Gemini assistant will use this FAQ when answering user queries</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.is_chatbot_knowledge}
                  onChange={(e) =>
                    setFormData({ ...formData, is_chatbot_knowledge: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[#F47B20] focus:ring-[#F47B20]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer text-xs">
                <div>
                  <span className="font-semibold text-[#202124] block">Published / Active</span>
                  <span className="text-[11px] text-[#727272]">Visible to users on public /faqs page</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-[#F47B20] focus:ring-[#F47B20]"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="btn-primary btn-sm"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save FAQ'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#EAEAEA] animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-poppins font-bold text-base text-[#202124]">
              Delete FAQ Entry?
            </h3>
            <p className="text-xs text-[#727272] mt-2 mb-5">
              This action cannot be undone and will remove this question from both the public site and AI knowledge base.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="btn-primary btn-sm !bg-rose-600 hover:!bg-rose-700 text-white"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminFAQsPage
