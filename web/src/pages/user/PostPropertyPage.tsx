import React, { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import {
  Building2,
  CheckCircle2,
  Save,
  ArrowLeft,
  Info,
  Clock,
  Sparkles,
  Layers,
  MapPin,
  IndianRupee,
  SlidersHorizontal,
  Image as ImageIcon,
  User,
  Eye,
  AlertCircle
} from 'lucide-react'
import { UserDashboardLayout } from '@/components/user/UserDashboardLayout'
import { Step1BasicDetails, type Step1FormData } from '@/components/property/steps/Step1BasicDetails'
import { Step2PriceArea, type Step2FormData } from '@/components/property/steps/Step2PriceArea'
import { Step3Location, type Step3FormData } from '@/components/property/steps/Step3Location'
import { Step4Features, type Step4FormData } from '@/components/property/steps/Step4Features'
import { Step5Media, type UploadedMediaItem, type UploadedDocItem } from '@/components/property/steps/Step5Media'
import { Step6SellerDetails, type Step6FormData } from '@/components/property/steps/Step6SellerDetails'
import { Step7Review, type CompletePropertyData } from '@/components/property/steps/Step7Review'
import api from '@/lib/api'
import { supabase } from '@/lib/supabase'

const WIZARD_STEPS = [
  { step: 1, title: 'Basic Details', shortTitle: 'Details', icon: Building2 },
  { step: 2, title: 'Price & Area', shortTitle: 'Price', icon: IndianRupee },
  { step: 3, title: 'Location', shortTitle: 'Location', icon: MapPin },
  { step: 4, title: 'Features & Amenities', shortTitle: 'Features', icon: SlidersHorizontal },
  { step: 5, title: 'Photos & Media', shortTitle: 'Photos', icon: ImageIcon },
  { step: 6, title: 'Seller Info', shortTitle: 'Seller', icon: User },
  { step: 7, title: 'Review & Submit', shortTitle: 'Review', icon: Eye },
]

const DRAFT_STORAGE_KEY = 'sastaplots_property_draft'

export const PostPropertyPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null)
  const [draftAlert, setDraftAlert] = useState<string | null>(null)
  const [isSavingDraft, setIsSavingDraft] = useState(false)

  // Full form state
  const [propertyData, setPropertyData] = useState<CompletePropertyData>({
    listing_intent: 'sell',
    category: 'residential_plot',
    property_type: 'plot',
    title: '',
    description: '',
    price: 0,
    price_negotiable: true,
    area: 0,
    area_unit: 'sqft',
    length: null,
    breadth: null,
    state_id: 1,
    city_id: 101,
    locality_name: '',
    address: '',
    pin_code: '',
    latitude: 12.9716,
    longitude: 77.5946,
    road_width: 30,
    road_access: 'pucca',
    facing_direction: 'east',
    ownership_type: 'freehold',
    is_corner_plot: false,
    is_on_main_road: false,
    amenities: ['Electricity', 'Water Connection', 'Compound Wall'],
    nearby_landmarks: [],
    images: [],
    documents: [],
    seller_name: '',
    seller_phone: '',
    seller_email: '',
    seller_category: 'owner',
    allow_whatsapp: true,
  })

  // Load existing draft from localStorage or if edit mode, from DB
  useEffect(() => {
    if (editId) {
      // Edit mode: fetch property from DB
      const loadPropertyForEdit = async () => {
        try {
          const { data, error } = await supabase
            .from('properties')
            .select('*, images(*)')
            .eq('id', editId)
            .single()

          if (!error && data) {
            setPropertyData({
              listing_intent: data.listing_intent || 'sell',
              category: data.category || 'residential_plot',
              property_type: data.property_type || 'plot',
              title: data.title || '',
              description: data.description || '',
              price: data.price || 0,
              price_negotiable: data.price_negotiable ?? true,
              area: data.area || 0,
              area_unit: data.area_unit || 'sqft',
              length: data.length || null,
              breadth: data.breadth || null,
              state_id: data.state_id || 1,
              city_id: data.city_id || 101,
              locality_name: data.locality?.name || '',
              address: data.address || '',
              pin_code: data.pin_code || '',
              latitude: data.latitude || 12.9716,
              longitude: data.longitude || 77.5946,
              road_width: data.road_width || 30,
              road_access: data.road_access || 'pucca',
              facing_direction: data.facing_direction || 'east',
              ownership_type: data.ownership_type || 'freehold',
              is_corner_plot: data.is_corner_plot || false,
              is_on_main_road: data.is_on_main_road || false,
              amenities: data.amenities || [],
              nearby_landmarks: data.nearby_landmarks || [],
              images: (data.images || []).map((img: any) => ({
                id: img.id,
                url: img.url,
                is_cover: img.is_cover,
              })),
              documents: [],
              seller_name: data.seller_name || '',
              seller_phone: data.seller_phone || '',
              seller_email: data.seller_email || '',
              seller_category: data.seller_category || 'owner',
            })
          }
        } catch (err) {
          console.error('Failed to load property for edit:', err)
        }
      }
      loadPropertyForEdit()
    } else {
      // Create mode: Check for saved draft in localStorage
      const localDraft = localStorage.getItem(DRAFT_STORAGE_KEY)
      if (localDraft) {
        try {
          const parsed = JSON.parse(localDraft)
          if (parsed && (parsed.title || parsed.price || parsed.area)) {
            setPropertyData((prev) => ({ ...prev, ...parsed }))
            setDraftAlert('Resumed your previously saved plot draft.')
            setTimeout(() => setDraftAlert(null), 5000)
          }
        } catch {
          // ignore corrupted draft
        }
      }
    }
  }, [editId])

  // Save draft helper (localStorage AND /api/drafts)
  const saveDraft = async (updatedData?: Partial<CompletePropertyData>) => {
    const dataToSave = { ...propertyData, ...(updatedData || {}) }
    try {
      setIsSavingDraft(true)
      // Save locally
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(dataToSave))
      setDraftSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))

      // Background sync to /api/drafts
      try {
        await api.post('/drafts', dataToSave)
      } catch {
        // Silently continue if API endpoint not configured
      }
    } catch (err) {
      console.warn('Draft save notice:', err)
    } finally {
      setIsSavingDraft(false)
    }
  }

  // Step 1 Completed
  const handleStep1Complete = (data: Step1FormData) => {
    setPropertyData((prev) => ({ ...prev, ...data }))
    setCompletedSteps((prev) => Array.from(new Set([...prev, 1])))
    saveDraft(data)
    setCurrentStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Step 2 Completed
  const handleStep2Complete = (data: Step2FormData) => {
    setPropertyData((prev) => ({ ...prev, ...data }))
    setCompletedSteps((prev) => Array.from(new Set([...prev, 2])))
    saveDraft(data)
    setCurrentStep(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Step 3 Completed
  const handleStep3Complete = (data: Step3FormData) => {
    setPropertyData((prev) => ({ ...prev, ...data }))
    setCompletedSteps((prev) => Array.from(new Set([...prev, 3])))
    saveDraft(data)
    setCurrentStep(4)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Step 4 Completed
  const handleStep4Complete = (data: Step4FormData) => {
    setPropertyData((prev) => ({ ...prev, ...data }))
    setCompletedSteps((prev) => Array.from(new Set([...prev, 4])))
    saveDraft(data)
    setCurrentStep(5)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Step 5 Completed
  const handleStep5Complete = (data: { images: UploadedMediaItem[]; documents: UploadedDocItem[] }) => {
    setPropertyData((prev) => ({ ...prev, images: data.images, documents: data.documents }))
    setCompletedSteps((prev) => Array.from(new Set([...prev, 5])))
    saveDraft({ images: data.images })
    setCurrentStep(6)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Step 6 Completed
  const handleStep6Complete = (data: Step6FormData) => {
    setPropertyData((prev) => ({ ...prev, ...data }))
    setCompletedSteps((prev) => Array.from(new Set([...prev, 6])))
    saveDraft(data)
    setCurrentStep(7)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Final Success callback
  const handleFinalSuccess = (id: string) => {
    setCompletedSteps([1, 2, 3, 4, 5, 6, 7])
  }

  return (
    <UserDashboardLayout
      title={editId ? 'Edit Property Listing' : 'Post New Property'}
      subtitle={
        editId
          ? `Updating listing details for ID: ${editId}`
          : 'List your plot or land in 7 simple steps. Reach thousands of verified buyers.'
      }
      action={
        <button
          type="button"
          onClick={() => saveDraft()}
          disabled={isSavingDraft}
          className="btn-secondary py-2 px-3 sm:px-4 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          title="Save draft"
        >
          <Save className="w-3.5 h-3.5 text-[#F47B20]" />
          <span>{isSavingDraft ? 'Saving...' : draftSavedAt ? `Saved at ${draftSavedAt}` : 'Save Draft'}</span>
        </button>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {draftAlert && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 text-xs text-blue-800 font-medium animate-fadeIn">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>{draftAlert}</span>
          </div>
        )}

        {/* 7-Step Progress Wizard Bar */}
        <div className="bg-white rounded-2xl border border-[#EAEAEA] p-3 sm:p-4 shadow-xs">
          {/* Mobile Stepper (compact) */}
          <div className="sm:hidden flex items-center justify-between px-2">
            <span className="text-xs font-bold text-[#F47B20]">
              Step {currentStep} of 7:
            </span>
            <span className="text-xs font-semibold text-[#202124]">
              {WIZARD_STEPS.find((s) => s.step === currentStep)?.title}
            </span>
            <span className="text-[11px] font-mono text-gray-400">
              {Math.round((currentStep / 7) * 100)}%
            </span>
          </div>
          <div className="sm:hidden mt-2 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#F47B20] h-full transition-all duration-300"
              style={{ width: `${(currentStep / 7) * 100}%` }}
            />
          </div>

          {/* Desktop / Tablet Stepper */}
          <div className="hidden sm:grid grid-cols-7 gap-1">
            {WIZARD_STEPS.map((s) => {
              const Icon = s.icon
              const isCurrent = currentStep === s.step
              const isCompleted = completedSteps.includes(s.step) || currentStep > s.step

              return (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => {
                    if (isCompleted || s.step < currentStep) {
                      setCurrentStep(s.step)
                    }
                  }}
                  disabled={!isCompleted && s.step > currentStep}
                  className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all text-center group cursor-pointer disabled:cursor-not-allowed ${
                    isCurrent
                      ? 'bg-orange-50 text-[#F47B20] font-bold shadow-2xs ring-1 ring-[#F47B20]/40'
                      : isCompleted
                      ? 'text-gray-700 hover:bg-[#FFF8F2]'
                      : 'text-gray-400 opacity-60'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all ${
                      isCurrent
                        ? 'bg-[#F47B20] text-white shadow-xs'
                        : isCompleted
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {isCompleted && !isCurrent ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span>{s.step}</span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium truncate max-w-full">
                    {s.shortTitle}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Step Component View */}
        <div className="transition-all duration-200">
          {currentStep === 1 && (
            <Step1BasicDetails
              initialData={propertyData}
              onNext={handleStep1Complete}
            />
          )}

          {currentStep === 2 && (
            <Step2PriceArea
              initialData={propertyData}
              listingIntent={propertyData.listing_intent}
              onNext={handleStep2Complete}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <Step3Location
              initialData={propertyData}
              onNext={handleStep3Complete}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && (
            <Step4Features
              initialData={propertyData}
              onNext={handleStep4Complete}
              onBack={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 5 && (
            <Step5Media
              initialImages={propertyData.images}
              initialDocs={propertyData.documents}
              onNext={handleStep5Complete}
              onBack={() => setCurrentStep(4)}
            />
          )}

          {currentStep === 6 && (
            <Step6SellerDetails
              initialData={propertyData}
              onNext={handleStep6Complete}
              onBack={() => setCurrentStep(5)}
            />
          )}

          {currentStep === 7 && (
            <Step7Review
              formData={propertyData}
              onJumpToStep={(step) => setCurrentStep(step)}
              onBack={() => setCurrentStep(6)}
              onSuccess={handleFinalSuccess}
            />
          )}
        </div>
      </div>
    </UserDashboardLayout>
  )
}

export default PostPropertyPage
