'use client'

import React, { useCallback, useState, useRef } from 'react'
import { UploadCloud, X, Star, ArrowLeft, ArrowRight, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface UploadImageItem {
  id: string
  url: string
  file?: File
  is_cover?: boolean
  storage_path?: string
}

export interface ImageUploadProps {
  images: UploadImageItem[]
  onChange: (images: UploadImageItem[]) => void
  maxImages?: number
  maxSizeMB?: number
  disabled?: boolean
  className?: string
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onChange,
  maxImages = 15,
  maxSizeMB = 5,
  disabled = false,
  className,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (files: File[]) => {
      setErrorMessage(null)

      const availableSlots = maxImages - images.length
      if (availableSlots <= 0) {
        setErrorMessage(`You have reached the maximum limit of ${maxImages} images.`)
        return
      }

      const validFiles: File[] = []
      for (const file of files) {
        if (file.size > maxSizeMB * 1024 * 1024) {
          setErrorMessage(`File exceeds the maximum size limit of ${maxSizeMB}MB.`)
          continue
        }
        if (!file.type.startsWith('image/')) {
          setErrorMessage('Only image files are allowed.')
          continue
        }
        validFiles.push(file)
      }

      const filesToAdd = validFiles.slice(0, availableSlots)
      const newImages: UploadImageItem[] = filesToAdd.map((file, idx) => ({
        id: `local-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
        url: URL.createObjectURL(file),
        file,
        is_cover: images.length === 0 && idx === 0,
      }))

      onChange([...images, ...newImages])
    },
    [images, maxImages, maxSizeMB, onChange]
  )

  const handleRemove = (id: string) => {
    const updated = images.filter((img) => img.id !== id)
    if (updated.length > 0 && !updated.some((img) => img.is_cover)) {
      updated[0].is_cover = true
    }
    onChange(updated)
  }

  const handleSetCover = (id: string) => {
    const updated = images.map((img) => ({
      ...img,
      is_cover: img.id === id,
    }))
    onChange(updated)
  }

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= images.length) return

    const updated = [...images]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    onChange(updated)
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone Area */}
      <div
        onClick={() => !disabled && images.length < maxImages && fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setIsDragActive(true)
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragActive(false)
          if (!disabled && e.dataTransfer.files) {
            handleFiles(Array.from(e.dataTransfer.files))
          }
        }}
        className={cn(
          'relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-all cursor-pointer',
          isDragActive
            ? 'border-[#F47B20] bg-orange-50/50 scale-[0.99]'
            : 'border-gray-200 hover:border-[#F47B20] bg-gray-50/50 hover:bg-orange-50/20',
          (disabled || images.length >= maxImages) && 'opacity-60 cursor-not-allowed hover:border-gray-200 hover:bg-gray-50/50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled || images.length >= maxImages}
          onChange={(e) => {
            if (e.target.files) {
              handleFiles(Array.from(e.target.files))
            }
          }}
          className="hidden"
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-[#F47B20] mb-3">
          <UploadCloud className="h-6 w-6" />
        </div>

        <p className="text-sm font-semibold text-gray-900">
          {images.length >= maxImages
            ? `Maximum ${maxImages} images reached`
            : isDragActive
            ? 'Drop images here'
            : 'Click to upload or drag & drop'}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          PNG, JPG, or WebP up to {maxSizeMB}MB each ({images.length}/{maxImages} uploaded)
        </p>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Uploaded Images Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {images.map((img, index) => (
            <div
              key={img.id}
              className={cn(
                'relative group aspect-square rounded-xl overflow-hidden border-2 bg-gray-100 transition-all',
                img.is_cover ? 'border-[#F47B20] ring-2 ring-orange-200' : 'border-gray-200'
              )}
            >
              <img
                src={img.url}
                alt={`Uploaded ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {img.is_cover && (
                <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider bg-[#F47B20] text-white px-1.5 py-0.5 rounded shadow-xs">
                  Cover
                </span>
              )}

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleSetCover(img.id)}
                    className={cn(
                      'p-1.5 rounded-lg transition',
                      img.is_cover ? 'bg-[#F47B20] text-white' : 'bg-white/80 text-gray-700 hover:bg-white'
                    )}
                    title="Set cover photo"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(img.id)}
                    className="p-1.5 rounded-lg bg-red-600/90 text-white hover:bg-red-600 transition"
                    title="Delete photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex justify-between">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMove(index, 'left')}
                      className="p-1 rounded bg-black/40 text-white hover:bg-black/60"
                      title="Move left"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMove(index, 'right')}
                      className="p-1 rounded bg-black/40 text-white hover:bg-black/60 ml-auto"
                      title="Move right"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageUpload
