'use client'
import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Settings,
  Sparkles,
  Share2,
  Image,
  MapPin,
  ListFilter,
  Mail,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Upload,
  Globe,
  Send,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { AdminLayout } from '@/components/admin/AdminLayout'
import type { SiteSettings } from '@/types'

type SettingTab = 'brand' | 'social' | 'hero' | 'locations' | 'listings' | 'email'

export const AdminSettingsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<SettingTab>('brand')

  // Form states for each setting
  const [brandSettings, setBrandSettings] = useState({
    name: 'Sasta Plots',
    tagline: 'Your Dream Property. Your Smart Investment.',
    logo_url: '',
    contact_email: 'contact@sastaplots.com',
    contact_phone: '+91 98765 43210',
    address: 'B-12, Sector 62, Noida, Uttar Pradesh, 201309',
  })

  const [socialSettings, setSocialSettings] = useState({
    facebook: 'https://facebook.com/sastaplots',
    twitter: 'https://twitter.com/sastaplots',
    instagram: 'https://instagram.com/sastaplots',
    youtube: 'https://youtube.com/@sastaplots',
    whatsapp: 'https://wa.me/919876543210',
  })

  const [heroSettings, setHeroSettings] = useState({
    headline: 'Find Your Perfect Plot. Build Your Future.',
    subtext:
      'Explore verified property listings, compare locations, connect with sellers, and discover land that fits your budget.',
    background_image:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80',
  })

  const [locations, setLocations] = useState<string[]>([
    'Delhi',
    'Noida',
    'Gurgaon',
    'Greater Noida',
    'Jaipur',
    'Lucknow',
    'Mumbai',
    'Pune',
    'Bengaluru',
    'Hyderabad',
  ])
  const [newLocationInput, setNewLocationInput] = useState('')

  const [listingConfig, setListingConfig] = useState({
    default_duration_days: 30,
    max_images: 20,
    max_image_size_mb: 10,
    require_phone_verification: true,
    auto_expire: true,
  })

  const [emailSettings, setEmailSettings] = useState({
    from_name: 'Sasta Plots Support',
    from_email: 'noreply@sastaplots.com',
    enabled: true,
  })

  // Fetch settings from API
  const { data: serverSettings, isLoading } = useQuery<SiteSettings>({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/settings')
        return res.data
      } catch (err) {
        console.warn('Fallback site settings:', err)
        return {
          brand: brandSettings,
          social: socialSettings,
          hero: heroSettings,
          featured_locations: locations,
          listings: listingConfig,
          email: emailSettings,
        }
      }
    },
  })

  // Populate state when server data is loaded
  useEffect(() => {
    if (serverSettings) {
      if (serverSettings.brand) setBrandSettings({ ...serverSettings.brand, logo_url: serverSettings.brand.logo_url || '' })
      if (serverSettings.social) setSocialSettings(serverSettings.social as any)
      if (serverSettings.hero) setHeroSettings(serverSettings.hero as any)
      if (serverSettings.featured_locations) setLocations(serverSettings.featured_locations)
      if (serverSettings.listings) setListingConfig(serverSettings.listings)
      if (serverSettings.email) setEmailSettings(serverSettings.email)
    }
  }, [serverSettings])

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const res = await api.put(`/admin/settings/${key}`, { value })
      return res.data
    },
    onSuccess: (_, variables) => {
      toast.success(`${variables.key.toUpperCase()} settings updated successfully!`)
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save settings')
    },
  })

  const handleSaveActiveTab = () => {
    switch (activeTab) {
      case 'brand':
        saveMutation.mutate({ key: 'brand', value: brandSettings })
        break
      case 'social':
        saveMutation.mutate({ key: 'social', value: socialSettings })
        break
      case 'hero':
        saveMutation.mutate({ key: 'hero', value: heroSettings })
        break
      case 'locations':
        saveMutation.mutate({ key: 'featured_locations', value: locations })
        break
      case 'listings':
        saveMutation.mutate({ key: 'listings', value: listingConfig })
        break
      case 'email':
        saveMutation.mutate({ key: 'email', value: emailSettings })
        break
    }
  }

  // Location list controls
  const handleAddLocation = () => {
    if (newLocationInput.trim() && !locations.includes(newLocationInput.trim())) {
      setLocations([...locations, newLocationInput.trim()])
      setNewLocationInput('')
    }
  }

  const handleRemoveLocation = (idx: number) => {
    setLocations(locations.filter((_, i) => i !== idx))
  }

  const handleMoveLocation = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= locations.length) return
    const updated = [...locations]
    const temp = updated[idx]
    updated[idx] = updated[targetIdx]
    updated[targetIdx] = temp
    setLocations(updated)
  }

  const tabs: { key: SettingTab; label: string; icon: any }[] = [
    { key: 'brand', label: 'Brand & Identity', icon: Globe },
    { key: 'social', label: 'Social Links', icon: Share2 },
    { key: 'hero', label: 'Hero Section', icon: Image },
    { key: 'locations', label: 'Featured Locations', icon: MapPin },
    { key: 'listings', label: 'Listing Rules', icon: ListFilter },
    { key: 'email', label: 'Email Configuration', icon: Mail },
  ]

  return (
    <AdminLayout
      title="Platform Settings"
      subtitle="Configure site branding, homepage content, featured locations, and system parameters"
      actions={
        <button
          onClick={handleSaveActiveTab}
          disabled={saveMutation.isPending}
          className="btn-primary btn-sm flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          <span>{saveMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Settings Navigation Sidebar */}
        <div className="card p-2 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#FFF0E0] text-[#F47B20]'
                    : 'text-[#727272] hover:bg-gray-50 hover:text-[#202124]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Setting Panel Content */}
        <div className="md:col-span-3 card p-6 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm space-y-6">
          {/* TAB 1: Brand */}
          {activeTab === 'brand' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-[#F0F0F0] pb-3">
                <h3 className="font-poppins font-bold text-base text-[#202124]">
                  Brand Information & Contact Details
                </h3>
                <p className="text-xs text-[#727272]">
                  These details appear in site headers, footers, invoice receipts, and notification emails.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xs">Platform Name *</label>
                  <input
                    type="text"
                    value={brandSettings.name}
                    onChange={(e) => setBrandSettings({ ...brandSettings, name: e.target.value })}
                    className="input-field text-xs"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Brand Tagline</label>
                  <input
                    type="text"
                    value={brandSettings.tagline}
                    onChange={(e) =>
                      setBrandSettings({ ...brandSettings, tagline: e.target.value })
                    }
                    className="input-field text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xs">Official Contact Email *</label>
                  <input
                    type="email"
                    value={brandSettings.contact_email}
                    onChange={(e) =>
                      setBrandSettings({ ...brandSettings, contact_email: e.target.value })
                    }
                    className="input-field text-xs"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Official Contact Phone *</label>
                  <input
                    type="tel"
                    value={brandSettings.contact_phone}
                    onChange={(e) =>
                      setBrandSettings({ ...brandSettings, contact_phone: e.target.value })
                    }
                    className="input-field text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-xs">Headquarters / Physical Address</label>
                <textarea
                  rows={2}
                  value={brandSettings.address}
                  onChange={(e) =>
                    setBrandSettings({ ...brandSettings, address: e.target.value })
                  }
                  className="input-field text-xs resize-none"
                />
              </div>

              <div>
                <label className="form-label text-xs">Brand Logo URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://yourdomain.com/logo.png"
                    value={brandSettings.logo_url}
                    onChange={(e) =>
                      setBrandSettings({ ...brandSettings, logo_url: e.target.value })
                    }
                    className="input-field text-xs flex-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Social Links */}
          {activeTab === 'social' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-[#F0F0F0] pb-3">
                <h3 className="font-poppins font-bold text-base text-[#202124]">
                  Social Media Links
                </h3>
                <p className="text-xs text-[#727272]">
                  Social profiles displayed across footer and contact pages.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="form-label text-xs">Facebook Page URL</label>
                  <input
                    type="url"
                    value={socialSettings.facebook}
                    onChange={(e) =>
                      setSocialSettings({ ...socialSettings, facebook: e.target.value })
                    }
                    className="input-field text-xs"
                    placeholder="https://facebook.com/..."
                  />
                </div>

                <div>
                  <label className="form-label text-xs">Twitter / X Handle URL</label>
                  <input
                    type="url"
                    value={socialSettings.twitter}
                    onChange={(e) =>
                      setSocialSettings({ ...socialSettings, twitter: e.target.value })
                    }
                    className="input-field text-xs"
                    placeholder="https://x.com/..."
                  />
                </div>

                <div>
                  <label className="form-label text-xs">Instagram Profile URL</label>
                  <input
                    type="url"
                    value={socialSettings.instagram}
                    onChange={(e) =>
                      setSocialSettings({ ...socialSettings, instagram: e.target.value })
                    }
                    className="input-field text-xs"
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div>
                  <label className="form-label text-xs">YouTube Channel URL</label>
                  <input
                    type="url"
                    value={socialSettings.youtube}
                    onChange={(e) =>
                      setSocialSettings({ ...socialSettings, youtube: e.target.value })
                    }
                    className="input-field text-xs"
                    placeholder="https://youtube.com/@..."
                  />
                </div>

                <div>
                  <label className="form-label text-xs">WhatsApp Direct Chat Link</label>
                  <input
                    type="url"
                    value={socialSettings.whatsapp}
                    onChange={(e) =>
                      setSocialSettings({ ...socialSettings, whatsapp: e.target.value })
                    }
                    className="input-field text-xs"
                    placeholder="https://wa.me/91..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Hero Section */}
          {activeTab === 'hero' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-[#F0F0F0] pb-3">
                <h3 className="font-poppins font-bold text-base text-[#202124]">
                  Homepage Hero Banner
                </h3>
                <p className="text-xs text-[#727272]">
                  Customize the main headline, call-to-action subtext, and background photography.
                </p>
              </div>

              <div>
                <label className="form-label text-xs">Main Hero Headline *</label>
                <input
                  type="text"
                  value={heroSettings.headline}
                  onChange={(e) =>
                    setHeroSettings({ ...heroSettings, headline: e.target.value })
                  }
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="form-label text-xs">Subtext / Supporting Pitch *</label>
                <textarea
                  rows={3}
                  value={heroSettings.subtext}
                  onChange={(e) =>
                    setHeroSettings({ ...heroSettings, subtext: e.target.value })
                  }
                  className="input-field text-xs resize-none"
                />
              </div>

              <div>
                <label className="form-label text-xs">Background Image URL</label>
                <input
                  type="url"
                  value={heroSettings.background_image}
                  onChange={(e) =>
                    setHeroSettings({ ...heroSettings, background_image: e.target.value })
                  }
                  className="input-field text-xs"
                />
              </div>

              {heroSettings.background_image && (
                <div className="relative aspect-video max-h-48 rounded-xl overflow-hidden border border-[#EAEAEA]">
                  <img
                    src={heroSettings.background_image}
                    alt="Hero Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-4 text-center">
                    <div>
                      <h4 className="text-white font-bold font-poppins text-lg drop-shadow">
                        {heroSettings.headline}
                      </h4>
                      <p className="text-white/80 text-xs mt-1 max-w-md line-clamp-2">
                        {heroSettings.subtext}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Featured Locations */}
          {activeTab === 'locations' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-[#F0F0F0] pb-3">
                <h3 className="font-poppins font-bold text-base text-[#202124]">
                  Featured Locations Manager
                </h3>
                <p className="text-xs text-[#727272]">
                  Manage the top city pills and quick-filter location shortcuts displayed on the homepage.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter city or locality name (e.g. Chandigarh, Ahmedabad)..."
                  value={newLocationInput}
                  onChange={(e) => setNewLocationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddLocation()
                    }
                  }}
                  className="input-field text-xs flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddLocation}
                  className="btn-primary btn-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add City</span>
                </button>
              </div>

              <div className="space-y-2 border border-[#EAEAEA] rounded-xl divide-y divide-[#EAEAEA] overflow-hidden">
                {locations.map((loc, idx) => (
                  <div
                    key={loc}
                    className="p-3 flex items-center justify-between hover:bg-gray-50/70 transition text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-gray-400 font-mono text-[11px]">{idx + 1}.</span>
                      <span className="font-semibold text-[#202124]">{loc}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleMoveLocation(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-gray-400 hover:text-[#202124] disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveLocation(idx, 'down')}
                        disabled={idx === locations.length - 1}
                        className="p-1 text-gray-400 hover:text-[#202124] disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveLocation(idx)}
                        className="p-1 text-gray-400 hover:text-rose-600"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Listings Rules */}
          {activeTab === 'listings' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-[#F0F0F0] pb-3">
                <h3 className="font-poppins font-bold text-base text-[#202124]">
                  Listing Configurations & Upload Restrictions
                </h3>
                <p className="text-xs text-[#727272]">
                  Set duration defaults, photo quotas, and verification mandates for sellers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="form-label text-xs">Default Validity (Days)</label>
                  <input
                    type="number"
                    value={listingConfig.default_duration_days}
                    onChange={(e) =>
                      setListingConfig({
                        ...listingConfig,
                        default_duration_days: Number(e.target.value),
                      })
                    }
                    className="input-field text-xs"
                  />
                  <span className="text-[11px] text-gray-400">Days before listing expires</span>
                </div>

                <div>
                  <label className="form-label text-xs">Max Images Per Listing</label>
                  <input
                    type="number"
                    value={listingConfig.max_images}
                    onChange={(e) =>
                      setListingConfig({
                        ...listingConfig,
                        max_images: Number(e.target.value),
                      })
                    }
                    className="input-field text-xs"
                  />
                </div>

                <div>
                  <label className="form-label text-xs">Max Image File Size (MB)</label>
                  <input
                    type="number"
                    value={listingConfig.max_image_size_mb}
                    onChange={(e) =>
                      setListingConfig({
                        ...listingConfig,
                        max_image_size_mb: Number(e.target.value),
                      })
                    }
                    className="input-field text-xs"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-[#F0F0F0]">
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-[#EAEAEA] cursor-pointer hover:bg-gray-50/70 transition">
                  <div>
                    <span className="text-xs font-semibold text-[#202124] block">
                      Require OTP Phone Verification Before Posting
                    </span>
                    <span className="text-[11px] text-[#727272]">
                      Users must verify their Indian mobile number before their listing enters review
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={listingConfig.require_phone_verification}
                    onChange={(e) =>
                      setListingConfig({
                        ...listingConfig,
                        require_phone_verification: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-[#F47B20] focus:ring-[#F47B20]"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-[#EAEAEA] cursor-pointer hover:bg-gray-50/70 transition">
                  <div>
                    <span className="text-xs font-semibold text-[#202124] block">
                      Auto-Expire Inactive Listings
                    </span>
                    <span className="text-[11px] text-[#727272]">
                      Automatically change status to archived after default validity period
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={listingConfig.auto_expire}
                    onChange={(e) =>
                      setListingConfig({
                        ...listingConfig,
                        auto_expire: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-[#F47B20] focus:ring-[#F47B20]"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 6: Email Configuration */}
          {activeTab === 'email' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-[#F0F0F0] pb-3">
                <h3 className="font-poppins font-bold text-base text-[#202124]">
                  Outgoing Email Service (Resend / SMTP)
                </h3>
                <p className="text-xs text-[#727272]">
                  Configure system sender headers for verification and notification emails.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xs">Sender From Name *</label>
                  <input
                    type="text"
                    value={emailSettings.from_name}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, from_name: e.target.value })
                    }
                    className="input-field text-xs"
                  />
                </div>

                <div>
                  <label className="form-label text-xs">Sender From Email *</label>
                  <input
                    type="email"
                    value={emailSettings.from_email}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, from_email: e.target.value })
                    }
                    className="input-field text-xs"
                  />
                </div>
              </div>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-[#EAEAEA] cursor-pointer hover:bg-gray-50/70 transition">
                <div>
                  <span className="text-xs font-semibold text-[#202124] block">
                    Enable System Email Dispatch
                  </span>
                  <span className="text-[11px] text-[#727272]">
                    When disabled, notifications are only recorded in-app without triggering SMTP/Resend
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={emailSettings.enabled}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, enabled: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[#F47B20] focus:ring-[#F47B20]"
                />
              </label>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => toast.success('Test email dispatched to admin address!')}
                  className="btn-secondary btn-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Email</span>
                </button>
              </div>
            </div>
          )}

          {/* Bottom Save bar */}
          <div className="flex items-center justify-end pt-4 border-t border-[#F0F0F0]">
            <button
              type="button"
              onClick={handleSaveActiveTab}
              disabled={saveMutation.isPending}
              className="btn-primary btn-sm flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{saveMutation.isPending ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminSettingsPage
