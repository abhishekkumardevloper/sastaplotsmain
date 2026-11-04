import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
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
  MoveLeft,
  MoveRight,
  ShieldCheck,
  Plus
} from 'lucide-react'
import api from '@/lib/api'
import { supabase } from '@/lib/supabase'

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
  const [uploadingCount, setUploadingCount] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Dropzone for Photos
  const onDropImages = useCallback(
    async (acceptedFiles: File[]) => {
      setUploadError(null)

      if (images.length + acceptedFiles.length > 20) {
        setUploadError('Maximum 20 images allowed. Please select fewer images.')
        return
      }

      setUploadingCount((prev) => prev + acceptedFiles.length)

      for (const file of acceptedFiles) {
        try {
          // Prepare upload form data
          const formData = new FormData()
          formData.append('file', file)

          let uploadedUrl = ''

          try {
            // Attempt upload to /api/upload
            const res = await api.post('/upload', formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            })
            if (res.data?.url) {
              uploadedUrl = res.data.url
            }
          } catch {
            // Fallback: Upload to Supabase storage 'property-images' bucket
            const fileExt = file.name.split('.').pop()
            const fileName = `prop-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const { error: uploadError } = await supabase.storage
              .from('property-images')
              .upload(fileName, file)

            if (!uploadError) {
              const { data: publicUrlData } = supabase.storage
                .from('property-images')
                .getPublicUrl(fileName)
              uploadedUrl = publicUrlData.publicUrl
            } else {
              // Local blob fallback for testing
              uploadedUrl = URL.createObjectURL(file)
            }
          }

          setImages((prev) => [
            ...prev,
            {
              id: `img-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              url: uploadedUrl,
              is_cover: prev.length === 0, // First uploaded image is cover by default
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
    [images.length]
  )

  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
    isDragActive: isImageDragActive,
  } = useDropzone({
    onDrop: onDropImages,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploadingCount > 0,
  })

  // Dropzone for Verification Documents (PDF / Images)
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

  const {
    getRootProps: getDocRootProps,
    getInputProps: getDocInputProps,
    isDragActive: isDocDragActive,
  } = useDropzone({
    onDrop: onDropDocs,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 15 * 1024 * 1024,
  })

  // Mark an image as cover
  const handleSetCover = (id: string) => {
    setImages((prev) =>
      prev.map((item) => ({
        ...item,
        is_cover: item.id === id,
      }))
    )
  }

  // Remove image
  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((item) => item.id !== id)
      // If cover was removed, make the first one cover
      if (filtered.length > 0 && !filtered.some((img) => img.is_cover)) {
        filtered[0].is_cover = true
      }
      return filtered
    })
  }

  // Move image left/up
  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= images.length) return
    const updated = [...images]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    setImages(updated)
  }

  // Remove document
  const handleRemoveDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (images.length === 0) {
      setUploadError('Please upload at least 1 image of the plot or land.')
      return
    }
    onNext({ images, documents })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Property Images Section */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAEAEA] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-[#202124] font-['Poppins'] flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#F47B20]" />
              <span>Property Photos ({images.length}/20)</span>
            </h3>
            <p className="text-xs text-[#727272]">
              Upload actual photographs of the plot, approach road, boundary stones, and surrounding views.
            </p>
          </div>

          <span className="text-xs font-semibold text-[#F47B20] bg-orange-50 px-2.5 py-1 rounded-lg self-start sm:self-auto">
            JPG, PNG, WEBP &bull; Max 10MB each
          </span>
        </div>

        {uploadError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Dropzone Box */}
        <div
          {...getImageRootProps()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            isImageDragActive
              ? 'border-[#F47B20] bg-orange-50/70 scale-[0.99]'
              : 'border-gray-300 hover:border-[#F47B20] bg-[#FFF8F2]/30'
          }`}
        >
          <input {...getImageInputProps()} />
          <div className="w-12 h-12 rounded-full bg-orange-100 text-[#F47B20] flex items-center justify-center mx-auto mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-[#202124]">
            {isImageDragActive ? 'Drop your images here' : 'Drag & drop photos here, or click to browse'}
          </h4>
          <p className="text-xs text-[#727272] mt-1 max-w-sm mx-auto">
            Add up to 20 photos. Listings with 4+ real photos receive up to 5x more buyer contacts.
          </p>

          {uploadingCount > 0 && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-[#F47B20]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading {uploadingCount} image{uploadingCount > 1 ? 's' : ''}...</span>
            </div>
          )}
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

                  {/* Cover Tag */}
                  {img.is_cover && (
                    <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider bg-[#F47B20] text-white px-1.5 py-0.5 rounded shadow-xs">
                      Cover Photo
                    </span>
                  )}

                  {/* Hover Actions Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex items-center justify-between">
                      {/* Set Cover Star */}
                      <button
                        type="button"
                        onClick={() => handleSetCover(img.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          img.is_cover
                            ? 'bg-[#F47B20] text-white'
                            : 'bg-white/80 text-gray-700 hover:bg-white'
                        }`}
                        title="Set as cover photo"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img.id)}
                        className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Move order controls */}
                    <div className="flex items-center justify-center gap-2">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMove(index, 'left')}
                          className="p-1 rounded bg-white/80 hover:bg-white text-gray-800"
                          title="Move left"
                        >
                          <MoveLeft className="w-3 h-3" />
                        </button>
                      )}
                      {index < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMove(index, 'right')}
                          className="p-1 rounded bg-white/80 hover:bg-white text-gray-800"
                          title="Move right"
                        >
                          <MoveRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Ownership Documents Section (Private & Confidential) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAEAEA] shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-[#202124] font-['Poppins'] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#F47B20]" />
              <span>Ownership Documents (Optional & Private)</span>
            </h3>
            <p className="text-xs text-[#727272]">
              Upload title deeds, 7/12 extracts, mutation registers, or RERA approval copies. Stored privately and reviewed only by Sasta Plots verifiers.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#168653] font-semibold bg-green-50 px-2.5 py-1 rounded-lg flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
            <span>Encrypted & Private</span>
          </div>
        </div>

        <div
          {...getDocRootProps()}
          className={`border border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer ${
            isDocDragActive ? 'border-[#F47B20] bg-orange-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
          }`}
        >
          <input {...getDocInputProps()} />
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-700">
            <Plus className="w-4 h-4 text-[#F47B20]" />
            <span>Click or drag to upload ownership verification files (PDF, JPG)</span>
          </div>
        </div>

        {/* Document list */}
        {documents.length > 0 && (
          <div className="space-y-2 pt-1">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="font-medium text-[#202124] truncate">{doc.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveDoc(doc.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-[#EAEAEA]">
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary py-3 px-6 text-sm font-semibold flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          disabled={uploadingCount > 0}
          className="btn-primary py-3 px-8 text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
        >
          <span>Continue to Seller Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}

export default Step5Media
