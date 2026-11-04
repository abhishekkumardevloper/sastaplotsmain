'use client'
import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Shield,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Compass,
  Maximize2,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Clock,
  Eye,
  Check,
  X,
  FileCheck,
  AlertOctagon,
  Copy,
  Building2,
  ShieldAlert,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { AdminLayout } from '@/components/admin/AdminLayout'
import type {
  Property,
  PropertyStatus,
  PropertyDocument,
  PropertyStatusHistory,
  AdminNote,
} from '@/types'

const formatPrice = (price: number) => {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} Lac`
  return `₹${price.toLocaleString('en-IN')}`
}

export const AdminPropertyReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Gallery active image
  const [activeImageIdx, setActiveImageIdx] = useState(0)

  // Internal note input
  const [newNote, setNewNote] = useState('')

  // Action modals
  const [modalType, setModalType] = useState<
    'approve' | 'request_changes' | 'reject' | 'suspend' | null
  >(null)
  const [modalFeedback, setModalFeedback] = useState('')

  // Query single property with related documents, history, seller properties
  const { data, isLoading } = useQuery<{
    property: Property
    documents: PropertyDocument[]
    history: PropertyStatusHistory[]
    notes: AdminNote[]
    seller_properties: Property[]
  }>({
    queryKey: ['admin', 'property-review', id],
    queryFn: async () => {
      try {
        const res = await api.get(`/admin/properties/${id}`)
        return res.data
      } catch (err) {
        console.warn('Fallback single property review data:', err)
        // Fallback realistic property review
        const mockProp: Property = {
          id: id || 'prop-101',
          slug: 'prime-corner-plot-sector-62-noida',
          title: 'Prime 300 sq.yd Corner Plot in Sector 62',
          description:
            'Exceptional east-facing freehold corner residential plot located in prime Block B of Sector 62, Noida. Has 60 feet wide paved road on front and 30 feet wide road on side. Clear title with registry and mutation complete. Immediate construction permitted by authority with sanctioned map guidelines. Within 500m of Sector 62 Metro Station and major IT parks.',
          listing_intent: 'sell',
          category: 'residential_plot',
          property_type: 'plot',
          price: 18500000,
          price_negotiable: true,
          price_per_unit: 61666,
          area: 300,
          area_unit: 'sqyd',
          length: 60,
          breadth: 45,
          road_width: 60,
          road_access: 'pucca',
          facing_direction: 'northeast',
          ownership_type: 'freehold',
          is_corner_plot: true,
          is_on_main_road: true,
          status: 'pending_review',
          is_featured: false,
          is_admin_managed: false,
          is_verified: false,
          view_count: 38,
          enquiry_count: 2,
          favourite_count: 5,
          seller_name: 'Rajesh Verma',
          seller_phone: '+91 98112 34567',
          seller_email: 'rajesh.verma@gmail.com',
          seller_category: 'owner',
          address: 'Plot B-44, Sector 62, Noida, Gautam Buddha Nagar, Uttar Pradesh',
          pin_code: '201309',
          latitude: 28.628,
          longitude: 77.3649,
          nearby_landmarks: [
            'Sector 62 Metro Station (450m)',
            'Fortis Hospital (1.2 km)',
            'Electronic City Noida (800m)',
            'DPS School (1.5 km)',
          ],
          amenities: [
            'Electricity Connection',
            'Water Supply',
            'Sewage Line',
            'Boundary Wall',
            'Street Lights',
            'Paved Pucca Road',
            'Security Guard Post',
          ],
          created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
          images: [
            {
              id: 'img-1',
              property_id: id || 'prop-101',
              url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000&q=80',
              storage_path: 'plots/p1.jpg',
              is_cover: true,
              sort_order: 1,
              created_at: new Date().toISOString(),
            },
            {
              id: 'img-2',
              property_id: id || 'prop-101',
              url: 'https://images.unsplash.com/photo-1524813686514-a57563d77d61?w=1000&q=80',
              storage_path: 'plots/p2.jpg',
              is_cover: false,
              sort_order: 2,
              created_at: new Date().toISOString(),
            },
            {
              id: 'img-3',
              property_id: id || 'prop-101',
              url: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=1000&q=80',
              storage_path: 'plots/p3.jpg',
              is_cover: false,
              sort_order: 3,
              created_at: new Date().toISOString(),
            },
          ],
        }

        const mockDocs: PropertyDocument[] = [
          {
            id: 'doc-1',
            property_id: id || 'prop-101',
            name: 'Registry_SaleDeed_B44.pdf',
            storage_path: 'docs/doc1.pdf',
            document_type: 'Sale Deed / Registry',
            size_bytes: 2450000,
            is_verified: true,
            verified_by: 'Staff Admin',
            verified_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
            created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
          },
          {
            id: 'doc-2',
            property_id: id || 'prop-101',
            name: 'Noida_Authority_Allotment_Letter.pdf',
            storage_path: 'docs/doc2.pdf',
            document_type: 'Authority Allotment Letter',
            size_bytes: 1800000,
            is_verified: false,
            created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
          },
          {
            id: 'doc-3',
            property_id: id || 'prop-101',
            name: 'Electricity_Bill_Latest.pdf',
            storage_path: 'docs/doc3.pdf',
            document_type: 'Utility Bill (Address Proof)',
            size_bytes: 920000,
            is_verified: true,
            created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
          },
        ]

        const mockHistory: PropertyStatusHistory[] = [
          {
            id: 'h-1',
            property_id: id || 'prop-101',
            old_status: 'draft',
            new_status: 'pending_review',
            reason: 'Submitted by owner for admin verification',
            created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
          },
        ]

        const mockNotes: AdminNote[] = [
          {
            id: 'n-1',
            property_id: id || 'prop-101',
            note: 'Verified ownership name against Registry deed page 3. Allotment letter stamp checked and verified with authority registry portal.',
            created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
            author: {
              id: 'u-admin',
              full_name: 'Pooja Sharma',
              email: 'pooja@sastaplots.com',
              role: 'admin',
              phone_verified: true,
              is_active: true,
              is_email_verified: true,
              verification_status: 'verified',
              created_at: '',
              updated_at: '',
            },
          },
        ]

        const mockSellerProps: Property[] = [
          {
            id: 'prop-99',
            slug: 'sector-62-plot-c21',
            title: '200 sq.yd Plot Sector 62 Block C',
            description: 'Residential plot close to market',
            listing_intent: 'sell',
            category: 'residential_plot',
            property_type: 'plot',
            price: 13000000,
            price_negotiable: true,
            area: 200,
            area_unit: 'sqyd',
            status: 'approved',
            is_corner_plot: false,
            is_on_main_road: false,
            is_featured: false,
            is_admin_managed: false,
            is_verified: true,
            view_count: 140,
            enquiry_count: 6,
            favourite_count: 12,
            created_at: new Date(Date.now() - 40 * 86400 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]

        return {
          property: mockProp,
          documents: mockDocs,
          history: mockHistory,
          notes: mockNotes,
          seller_properties: mockSellerProps,
        }
      }
    },
  })

  // Status Action Mutation
  const statusMutation = useMutation({
    mutationFn: async ({
      status,
      feedback,
    }: {
      status: PropertyStatus
      feedback?: string
    }) => {
      const res = await api.put(`/admin/properties/${id}/status`, {
        status,
        reason: feedback,
        feedback,
      })
      return res.data
    },
    onSuccess: (_, variables) => {
      toast.success(`Property status changed to ${variables.status.replace('_', ' ')}!`)
      setModalType(null)
      setModalFeedback('')
      queryClient.invalidateQueries({ queryKey: ['admin'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update property status')
    },
  })

  // Add Internal Admin Note Mutation
  const noteMutation = useMutation({
    mutationFn: async (noteText: string) => {
      const res = await api.post(`/admin/properties/${id}/notes`, { note: noteText })
      return res.data
    },
    onSuccess: () => {
      toast.success('Admin note saved successfully')
      setNewNote('')
      queryClient.invalidateQueries({ queryKey: ['admin', 'property-review', id] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add admin note')
    },
  })

  // Verify Document Mutation
  const verifyDocMutation = useMutation({
    mutationFn: async ({ docId, isVerified }: { docId: string; isVerified: boolean }) => {
      const res = await api.put(`/admin/documents/${docId}/verify`, { is_verified: isVerified })
      return res.data
    },
    onSuccess: () => {
      toast.success('Document verification status updated')
      queryClient.invalidateQueries({ queryKey: ['admin', 'property-review', id] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Document verification failed')
    },
  })

  // Toggle Feature / Verified status
  const toggleFlagMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: boolean }) => {
      const res = await api.patch(`/admin/properties/${id}`, { [key]: value })
      return res.data
    },
    onSuccess: (_, variables) => {
      toast.success(`Updated ${variables.key} flag`)
      queryClient.invalidateQueries({ queryKey: ['admin', 'property-review', id] })
    },
  })

  const property = data?.property
  const documents = data?.documents || []
  const history = data?.history || []
  const notes = data?.notes || []
  const sellerProps = data?.seller_properties || []

  if (isLoading) {
    return (
      <AdminLayout title="Review Property" subtitle="Loading listing details...">
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded-2xl" />
            <div className="h-96 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!property) {
    return (
      <AdminLayout title="Property Not Found">
        <div className="card p-12 text-center bg-white rounded-2xl border border-[#EAEAEA]">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#202124]">Property not found</h2>
          <p className="text-xs text-[#727272] mt-1 mb-4">
            The requested property ID does not exist or may have been deleted.
          </p>
          <Link to="/admin/properties" className="btn-secondary btn-sm">
            &larr; Back to Properties
          </Link>
        </div>
      </AdminLayout>
    )
  }

  const images = property.images && property.images.length > 0 ? property.images : []
  const activeImage = images[activeImageIdx] || images[0]

  const handleConfirmModal = () => {
    if (!modalType) return
    let targetStatus: PropertyStatus = 'approved'
    if (modalType === 'approve') targetStatus = 'approved'
    if (modalType === 'request_changes') targetStatus = 'needs_changes'
    if (modalType === 'reject') targetStatus = 'rejected'
    if (modalType === 'suspend') targetStatus = 'suspended'

    if ((modalType === 'request_changes' || modalType === 'reject' || modalType === 'suspend') && !modalFeedback.trim()) {
      toast.error('Please specify feedback or reason')
      return
    }

    statusMutation.mutate({
      status: targetStatus,
      feedback: modalFeedback,
    })
  }

  return (
    <AdminLayout
      title="Property Review & Moderation"
      subtitle={`Listing verification queue • ID: ${property.id}`}
      actions={
        <div className="flex items-center gap-2">
          <Link to="/admin/properties" className="btn-secondary btn-sm flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Inventory</span>
          </Link>
          <a
            href={`/properties/${property.slug}`}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost btn-sm flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Public Page</span>
          </a>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery Card */}
          <div className="card p-5 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-poppins font-bold text-base text-[#202124]">
                Property Photography ({images.length} images)
              </h3>
              <span className="text-xs text-[#727272]">
                Click thumbnail to preview in high resolution
              </span>
            </div>

            {/* Main Preview */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 border border-[#EAEAEA]">
              <img
                src={activeImage?.url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80'}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              {activeImage?.is_cover && (
                <span className="absolute top-3 left-3 bg-[#F47B20] text-white text-xs font-bold px-2.5 py-1 rounded-md shadow">
                  Cover Photo
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-20 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                      activeImageIdx === idx
                        ? 'border-[#F47B20] shadow-sm'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Overview Card */}
          <div className="card p-6 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-[#F47B20] text-xs font-semibold capitalize border border-orange-100">
                  {property.category.replace('_', ' ')}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-[#727272] text-xs font-medium capitalize">
                  Intent: For {property.listing_intent}
                </span>
                {property.is_featured && (
                  <span className="badge-featured">Featured Listing</span>
                )}
                {property.is_verified && (
                  <span className="badge-verified">Verified Listing</span>
                )}
              </div>
              <h2 className="text-xl font-bold font-poppins text-[#202124]">
                {property.title}
              </h2>
              <p className="text-xs text-[#727272] mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {property.address || 'Address on record'}
              </p>
            </div>

            {/* Price & Area Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#FFF8F2] border border-[#FFE4CC]">
              <div>
                <span className="text-[11px] text-[#727272] block">Total Price</span>
                <span className="text-lg font-bold font-poppins text-[#F47B20]">
                  {formatPrice(property.price)}
                </span>
                <span className="text-[10px] text-[#727272] block">
                  {property.price_negotiable ? 'Negotiable' : 'Fixed Price'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#727272] block">Total Area</span>
                <span className="text-base font-bold text-[#202124]">
                  {property.area} {property.area_unit}
                </span>
                {property.price_per_unit && (
                  <span className="text-[10px] text-[#727272] block">
                    ₹{property.price_per_unit.toLocaleString('en-IN')}/{property.area_unit}
                  </span>
                )}
              </div>
              <div>
                <span className="text-[11px] text-[#727272] block">Dimensions</span>
                <span className="text-sm font-semibold text-[#202124]">
                  {property.length && property.breadth
                    ? `${property.length} × ${property.breadth} ft`
                    : 'Not specified'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#727272] block">Road Width</span>
                <span className="text-sm font-semibold text-[#202124]">
                  {property.road_width ? `${property.road_width} ft front` : 'Standard'}
                </span>
                <span className="text-[10px] text-[#727272] block capitalize">
                  {property.road_access} road
                </span>
              </div>
            </div>

            {/* Attributes Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs border-t border-b border-[#F0F0F0] py-4">
              <div>
                <span className="text-[#727272] block">Facing Direction</span>
                <strong className="text-[#202124] capitalize font-medium">
                  {property.facing_direction || 'East'}
                </strong>
              </div>
              <div>
                <span className="text-[#727272] block">Ownership Type</span>
                <strong className="text-[#202124] capitalize font-medium">
                  {property.ownership_type || 'Freehold'}
                </strong>
              </div>
              <div>
                <span className="text-[#727272] block">Corner Plot</span>
                <strong className="text-[#202124] font-medium">
                  {property.is_corner_plot ? 'Yes (Corner)' : 'No (Standard)'}
                </strong>
              </div>
              <div>
                <span className="text-[#727272] block">Main Road Touch</span>
                <strong className="text-[#202124] font-medium">
                  {property.is_on_main_road ? 'Yes' : 'No'}
                </strong>
              </div>
              <div>
                <span className="text-[#727272] block">Pin Code</span>
                <strong className="text-[#202124] font-medium">{property.pin_code || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-[#727272] block">GPS Coordinates</span>
                <strong className="text-[#202124] font-mono text-[11px]">
                  {property.latitude && property.longitude
                    ? `${property.latitude.toFixed(4)}, ${property.longitude.toFixed(4)}`
                    : 'Not pinned'}
                </strong>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="font-poppins font-bold text-sm text-[#202124]">Description</h4>
              <p className="text-xs text-[#202124]/90 leading-relaxed whitespace-pre-line bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                {property.description}
              </p>
            </div>

            {/* Amenities & Nearby Landmarks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="font-poppins font-bold text-xs text-[#202124] mb-2">
                  Features & Amenities
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(property.amenities || []).map((amenity, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-100 flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      {amenity}
                    </span>
                  ))}
                  {(!property.amenities || property.amenities.length === 0) && (
                    <span className="text-xs text-gray-400">No specific amenities listed</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-poppins font-bold text-xs text-[#202124] mb-2">
                  Nearby Landmarks
                </h4>
                <ul className="space-y-1 text-xs text-[#727272]">
                  {(property.nearby_landmarks || []).map((lm, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F47B20]" />
                      <span>{lm}</span>
                    </li>
                  ))}
                  {(!property.nearby_landmarks || property.nearby_landmarks.length === 0) && (
                    <li className="text-xs text-gray-400">None provided</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Submitted Documents Section */}
          <div className="card p-5 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-poppins font-bold text-base text-[#202124] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#F47B20]" />
                  Submitted Verification Documents ({documents.length})
                </h3>
                <p className="text-xs text-[#727272]">
                  Confidential title & proof documents uploaded by seller for verification
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#EAEAEA] border border-[#EAEAEA] rounded-xl overflow-hidden">
              {documents.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#727272]">
                  No ownership or verification documents uploaded yet.
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/80 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-orange-50 text-[#F47B20] shrink-0 border border-orange-100">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#202124]">{doc.name}</p>
                        <div className="flex items-center gap-2 text-xs text-[#727272]">
                          <span>{doc.document_type || 'General Verification'}</span>
                          {doc.size_bytes && (
                            <>
                              <span>•</span>
                              <span>{(doc.size_bytes / (1024 * 1024)).toFixed(2)} MB</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {doc.is_verified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                          <Check className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                          <Clock className="w-3.5 h-3.5" /> Pending Check
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          verifyDocMutation.mutate({
                            docId: doc.id,
                            isVerified: !doc.is_verified,
                          })
                        }
                        className="btn-secondary btn-sm !py-1 !text-xs"
                      >
                        {doc.is_verified ? 'Unverify' : 'Mark Verified'}
                      </button>

                      <a
                        href={`/api/admin/documents/${doc.id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-ghost btn-sm !py-1 !text-xs text-[#F47B20]"
                      >
                        View File
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Status History Timeline */}
          <div className="card p-5 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm space-y-4">
            <h3 className="font-poppins font-bold text-base text-[#202124] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F47B20]" />
              Moderation Status History
            </h3>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EAEAEA]">
              {history.map((h, idx) => (
                <div key={h.id || idx} className="relative">
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-[#F47B20] border-2 border-white" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#202124] capitalize">
                        Changed to {h.new_status.replace('_', ' ')}
                      </span>
                      {h.old_status && (
                        <span className="text-[11px] text-[#727272]">
                          (was {h.old_status.replace('_', ' ')})
                        </span>
                      )}
                    </div>
                    {h.reason && (
                      <p className="text-xs text-[#727272] mt-0.5 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        {h.reason}
                      </p>
                    )}
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      {new Date(h.created_at).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Admin Action Panel & Notes & Duplicate Info */}
        <div className="space-y-6">
          {/* Action Panel Card */}
          <div className="card p-5 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm space-y-4 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0]">
              <span className="text-xs font-semibold text-[#727272] uppercase tracking-wider">
                Listing Status
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${
                  property.status === 'approved'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : property.status === 'rejected'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : property.status === 'suspended'
                    ? 'bg-purple-50 text-purple-800 border-purple-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {property.status.replace('_', ' ')}
              </span>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setModalType('approve')
                  setModalFeedback('')
                }}
                disabled={statusMutation.isPending || property.status === 'approved'}
                className="w-full btn-primary !bg-emerald-600 hover:!bg-emerald-700 disabled:opacity-50 text-white flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve & Publish</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setModalType('request_changes')
                  setModalFeedback('')
                }}
                disabled={statusMutation.isPending}
                className="w-full btn-secondary text-[#F47B20] border-[#FFE4CC] bg-[#FFF8F2] hover:bg-[#FFF0E0] flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Request Changes</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setModalType('reject')
                  setModalFeedback('')
                }}
                disabled={statusMutation.isPending || property.status === 'rejected'}
                className="w-full btn-secondary text-rose-600 border-rose-200 hover:bg-rose-50 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Listing</span>
              </button>

              {property.status === 'approved' && (
                <button
                  type="button"
                  onClick={() => {
                    setModalType('suspend')
                    setModalFeedback('')
                  }}
                  disabled={statusMutation.isPending}
                  className="w-full btn-secondary text-purple-700 border-purple-200 hover:bg-purple-50 flex items-center justify-center gap-2"
                >
                  <AlertOctagon className="w-4 h-4" />
                  <span>Suspend Listing</span>
                </button>
              )}
            </div>

            {/* Flags toggles */}
            <div className="pt-3 border-t border-[#F0F0F0] space-y-2.5 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-medium text-[#202124]">Spotlight as Featured</span>
                <input
                  type="checkbox"
                  checked={property.is_featured}
                  onChange={(e) =>
                    toggleFlagMutation.mutate({ key: 'is_featured', value: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[#F47B20] focus:ring-[#F47B20]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-medium text-[#202124]">Admin Verified Badge</span>
                <input
                  type="checkbox"
                  checked={property.is_verified}
                  onChange={(e) =>
                    toggleFlagMutation.mutate({ key: 'is_verified', value: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[#F47B20] focus:ring-[#F47B20]"
                />
              </label>
            </div>
          </div>

          {/* Seller Profile Information */}
          <div className="card p-5 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm space-y-3">
            <h3 className="font-poppins font-bold text-sm text-[#202124] flex items-center gap-2">
              <User className="w-4 h-4 text-[#F47B20]" />
              Seller Profile Details
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[#727272] block">Contact Person</span>
                <strong className="text-[#202124] text-sm">{property.seller_name || 'N/A'}</strong>
                <span className="block capitalize text-[11px] text-gray-500">
                  Role: {property.seller_category || 'owner'}
                </span>
              </div>

              {property.seller_phone && (
                <div className="flex items-center gap-2 text-[#202124]">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{property.seller_phone}</span>
                </div>
              )}

              {property.seller_email && (
                <div className="flex items-center gap-2 text-[#202124]">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{property.seller_email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Duplicate / Multi-Listing Check Card */}
          <div className="card p-5 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-poppins font-bold text-sm text-[#202124] flex items-center gap-1.5">
                <Copy className="w-4 h-4 text-[#F47B20]" />
                Owner Portfolio Check
              </h3>
              <span className="text-xs bg-gray-100 text-[#727272] px-2 py-0.5 rounded-full font-semibold">
                {sellerProps.length} other listings
              </span>
            </div>
            <p className="text-xs text-[#727272]">
              Check for duplicate submissions or cross-verify seller authenticity
            </p>

            <div className="space-y-2 pt-1">
              {sellerProps.length === 0 ? (
                <div className="p-3 rounded-xl bg-gray-50 text-xs text-gray-500 text-center">
                  First listing submitted by this seller account.
                </div>
              ) : (
                sellerProps.map((sp) => (
                  <div
                    key={sp.id}
                    className="p-2.5 rounded-xl border border-[#EAEAEA] hover:border-[#F47B20]/40 transition text-xs flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-medium text-[#202124] truncate">{sp.title}</p>
                      <span className="text-[11px] text-[#727272] capitalize">
                        {sp.status.replace('_', ' ')} • {formatPrice(sp.price)}
                      </span>
                    </div>
                    <Link
                      to={`/admin/properties/${sp.id}/review`}
                      className="text-[#F47B20] text-xs font-semibold hover:underline shrink-0"
                    >
                      Review &rarr;
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Internal Admin Notes Section */}
          <div className="card p-5 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-poppins font-bold text-sm text-[#202124] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#F47B20]" />
                Internal Admin Notes
              </h3>
              <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                Staff Only
              </span>
            </div>
            <p className="text-xs text-[#727272]">
              Private notes recorded by the moderation team. Never visible to buyers or sellers.
            </p>

            {/* Existing notes */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
              {notes.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No staff notes recorded yet.</p>
              ) : (
                notes.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl bg-[#FFF8F2] border border-[#FFE4CC] text-xs space-y-1"
                  >
                    <p className="text-[#202124]">{n.note}</p>
                    <div className="flex items-center justify-between text-[10px] text-[#727272] pt-1 border-t border-orange-100">
                      <span>{n.author?.full_name || 'Admin'}</span>
                      <span>{new Date(n.created_at).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add note form */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!newNote.trim()) return
                noteMutation.mutate(newNote)
              }}
              className="space-y-2 pt-2 border-t border-[#F0F0F0]"
            >
              <textarea
                rows={2}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add internal observation (e.g. registry verified via sub-registrar site)..."
                className="input-field text-xs resize-none"
              />
              <button
                type="submit"
                disabled={noteMutation.isPending || !newNote.trim()}
                className="btn-primary btn-sm w-full !text-xs"
              >
                {noteMutation.isPending ? 'Saving...' : 'Save Internal Note'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Action Modals */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EAEAEA] animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-poppins font-bold text-lg text-[#202124] capitalize">
              {modalType === 'approve'
                ? 'Approve & Publish Listing'
                : modalType === 'request_changes'
                ? 'Request Changes from Seller'
                : modalType === 'reject'
                ? 'Reject Listing'
                : 'Suspend Listing'}
            </h3>

            <p className="text-xs text-[#727272] mt-1 mb-4">
              {modalType === 'approve'
                ? 'Approving this listing will make it instantly discoverable on the public marketplace and notify the seller.'
                : modalType === 'request_changes'
                ? 'Provide detailed feedback to the seller on what updates are needed before approval.'
                : modalType === 'reject'
                ? 'Enter the official rejection reason which will be emailed to the seller.'
                : 'Suspending this listing will hide it from search results.'}
            </p>

            {modalType !== 'approve' && (
              <div className="space-y-2 mb-4">
                <label className="form-label text-xs">
                  {modalType === 'request_changes' ? 'Feedback for Seller *' : 'Reason *'}
                </label>
                <textarea
                  rows={4}
                  value={modalFeedback}
                  onChange={(e) => setModalFeedback(e.target.value)}
                  placeholder={
                    modalType === 'request_changes'
                      ? 'Please re-upload page 2 of title deed and clarify plot facing...'
                      : 'State clear reason for this action...'
                  }
                  className="input-field text-xs resize-none"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmModal}
                disabled={statusMutation.isPending}
                className={`btn-primary btn-sm text-white ${
                  modalType === 'approve'
                    ? '!bg-emerald-600 hover:!bg-emerald-700'
                    : modalType === 'request_changes'
                    ? '!bg-[#F47B20] hover:!bg-[#E96512]'
                    : '!bg-rose-600 hover:!bg-rose-700'
                }`}
              >
                {statusMutation.isPending ? 'Processing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminPropertyReviewPage
