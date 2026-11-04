'use client'

import React, { useState, useCallback, useRef } from 'react'
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Star,
  ArrowRight,
  ArrowLeft,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Plus
} from 'lucide-react'
import api from '@/lib/api'

export interface UploadedMediaItem {
  id: string
  url: string
  is_cover: boolean
  name?: string
  size?: number
}

export interface UploadedDocItem {
  id: string
  name: string
  url: string
  size?: number
}

interface Step5Props {
  initialImages?: UploadedMediaItem[]
  initialDocs?: UploadedDocItem[]
  onNext: (data: { images: UploadedMediaItem[]; documents: UploadedDocItem[] }) => void
  onBack: () => void
}

export const Step5Media: React.FC<Step5Props> = ({
  initialImages = [],
  initialDocs = [],
  onNext,
  onBack,
}) => {
  const [images, setImages] = useState<UploadedMediaItem[]>(initialImages)
  const [documents, setDocuments] = useState<UploadedDocItem[]>(initialDocs)
  const [uploadingCount, setUploadingCount] = useState<number>(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [manualUrl, setManualUrl] = useState('')
  const [isImageDragActive, setIsImageDragActive] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data?.data?.url || res.data?.url
  }

  const onDropImages = useCallback(
    async (acceptedFiles: File[]) => {
      setUploadError(null)
      setUploadingCount((prev) => prev + acceptedFiles.length)

      for (const file of acceptedFiles) {
        try {
          let publicUrl = ''
          try {
            publicUrl = await uploadFile(file)
          } catch {
            publicUrl = URL.createObjectURL(file)
          }

          setImages((prev) => [
            ...prev,
            {
              id: `img-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              url: publicUrl,
              is_cover: prev.length === 0,
              name: file.name,
              size: file.size,
            },
          ])
        } catch (err) {
          console.error('Image upload failed:', err)
          setUploadError('One or more images failed to upload. Please try again.')
        } finally {
          setUploadingCount((prev) => Math.max(0, prev - 1))
        }
      }
    },
    []
  )

  const onDropDocs = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const docItem: UploadedDocItem = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
      }
      setDocuments((prev) => [...prev, docItem])
    }
  }, [])

  const handleSetCover = (id: string) => {
    setImages((prev) =>
      prev.map((item) => ({
        ...item,
        is_cover: item.id === id,
      }))
    )
  }

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((item) => item.id !== id)
      if (filtered.length > 0 && !filtered.some((img) => img.is_cover)) {
        filtered[0].is_cover = true
      }
      return filtered
    })
  }

  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return
    setImages((prev) => [
      ...prev,
      {
        id: `img-${Date.now()}`,
        url: manualUrl.trim(),
        is_cover: prev.length === 0,
        name: 'Web Image',
      },
    ])
    setManualUrl('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext({ images, documents })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Upload Photos Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#202124] flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#F47B20]" />
            Upload Property Photos
          </h3>
          <p className="text-xs text-[#727272] mt-0.5">
            Clear, high-quality images drastically increase buyer trust and response rate.
          </p>
        </div>

        {uploadError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Dropzone Box */}
        <div
          onClick={() => imageInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setIsImageDragActive(true)
          }}
          onDragLeave={() => setIsImageDragActive(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsImageDragActive(false)
            if (e.dataTransfer.files) {
              onDropImages(Array.from(e.dataTransfer.files))
            }
          }}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            isImageDragActive
              ? 'border-[#F47B20] bg-orange-50/70 scale-[0.99]'
              : 'border-gray-300 hover:border-[#F47B20] bg-[#FFF8F2]/30'
          }`}
        >
          <input
            ref={imageInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                onDropImages(Array.from(e.target.files))
              }
            }}
          />
          <div className="w-12 h-12 rounded-full bg-orange-100 text-[#F47B20] flex items-center justify-center mx-auto mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-[#202124]">
            {isImageDragActive ? 'Drop your images here' : 'Drag & drop photos here, or click to browse'}
          </h4>
          <p className="text-xs text-[#727272] mt-1 max-w-sm mx-auto">
            Add up to 20 photos. Listings with real photos receive up to 5x more buyer contacts.
          </p>

          {uploadingCount > 0 && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-[#F47B20]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading {uploadingCount} image{uploadingCount > 1 ? 's' : ''}...</span>
            </div>
          )}
        </div>

        {/* Manual URL input fallback */}
        <div className="flex gap-2">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="Or enter direct image URL (https://...)"
            className="flex-1 input-custom text-xs"
          />
          <button
            type="button"
            onClick={handleAddManualUrl}
            className="btn-secondary text-xs px-3"
          >
            Add URL
          </button>
        </div>

        {/* Uploaded Images Preview Grid */}
        {images.length > 0 && (
          <div className="pt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Uploaded Photos (Click star to set Cover Image)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {images.map((img, index) => (
                <div
                  key={img.id}
                  className={`relative rounded-xl overflow-hidden group aspect-square border-2 bg-gray-100 transition-all ${
                    img.is_cover
                      ? 'border-[#F47B20] ring-2 ring-orange-200 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.name || `Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {img.is_cover && (
                    <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider bg-[#F47B20] text-white px-1.5 py-0.5 rounded shadow-xs">
                      Cover Photo
                    </span>
                  )}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleSetCover(img.id)}
                        className={`p-1.5 rounded-lg transition ${
                          img.is_cover
                            ? 'bg-[#F47B20] text-white'
                            : 'bg-white/80 text-gray-700 hover:bg-white'
                        }`}
                        title="Set as cover image"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img.id)}
                        className="p-1.5 rounded-lg bg-red-600/90 text-white hover:bg-red-600 transition"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-[#EAEAEA]">
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          disabled={uploadingCount > 0}
          className="btn-primary flex items-center gap-2"
        >
          <span>Continue to Seller Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}

export default Step5Media
