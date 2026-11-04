import React, { useCallback, useState } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
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

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setErrorMessage(null)

      if (fileRejections.length > 0) {
        const firstError = fileRejections[0].errors[0]
        if (firstError.code === 'file-too-large') {
          setErrorMessage(`File exceeds the maximum size limit of ${maxSizeMB}MB.`)
        } else if (firstError.code === 'file-invalid-type') {
          setErrorMessage('Only JPG, PNG, and WebP images are allowed.')
        } else {
          setErrorMessage(firstError.message)
        }
        return
      }

      const availableSlots = maxImages - images.length
      if (availableSlots <= 0) {
        setErrorMessage(`You have reached the maximum limit of ${maxImages} images.`)
        return
      }

      const filesToAdd = acceptedFiles.slice(0, availableSlots)
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: maxSizeMB * 1024 * 1024,
    disabled: disabled || images.length >= maxImages,
    multiple: true,
  })

  const handleRemove = (id: string) => {
    const updated = images.filter((img) => img.id !== id)
    // If we removed the cover image, make the first image the cover
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
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3',
          isDragActive
            ? 'border-[#F47B20] bg-[#FFF8F2]'
            : 'border-gray-200 hover:border-[#F47B20]/60 hover:bg-[#FFF8F2]/40 bg-gray-50/50',
          (disabled || images.length >= maxImages) &&
            'opacity-60 cursor-not-allowed hover:border-gray-200 hover:bg-gray-50/50'
        )}
      >
        <input {...getInputProps()} />

        <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-gray-100 flex items-center justify-center text-[#F47B20]">
          <UploadCloud className="w-6 h-6 stroke-[1.75]" />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-800">
            {isDragActive ? (
              <span className="text-[#F47B20]">Drop images here...</span>
            ) : (
              <>
                <span className="text-[#F47B20] underline">Click to upload</span> or drag and drop photos
              </>
            )}
          </p>
          <p className="text-xs text-gray-500">
            JPG, PNG, or WebP up to {maxSizeMB}MB each ({images.length}/{maxImages} uploaded)
          </p>
        </div>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Uploaded Photos ({images.length})</span>
            <span>First photo or starred photo will be the cover image</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((item, index) => {
              const isCover = item.is_cover || (index === 0 && !images.some((i) => i.is_cover))

              return (
                <div
                  key={item.id}
                  className={cn(
                    'group relative rounded-xl overflow-hidden border bg-white aspect-4/3 flex flex-col justify-between shadow-xs transition-all',
                    isCover
                      ? 'border-[#F47B20] ring-2 ring-[#F47B20]/20'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  {/* Image element */}
                  <img
                    src={item.url}
                    alt={`Property photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Cover Badge */}
                  {isCover && (
                    <div className="absolute top-2 left-2 z-10 bg-[#F47B20] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-white" />
                      Cover
                    </div>
                  )}

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    {/* Top right remove */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemove(item.id)
                        }}
                        className="w-7 h-7 rounded-lg bg-black/60 text-white hover:bg-rose-600 flex items-center justify-center transition-colors"
                        title="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Bottom controls */}
                    <div className="flex items-center justify-between gap-1 pt-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMove(index, 'left')
                          }}
                          disabled={index === 0}
                          className="w-6 h-6 rounded-md bg-black/60 text-white hover:bg-black/90 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors"
                          title="Move left"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMove(index, 'right')
                          }}
                          disabled={index === images.length - 1}
                          className="w-6 h-6 rounded-md bg-black/60 text-white hover:bg-black/90 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors"
                          title="Move right"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      {!isCover && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSetCover(item.id)
                          }}
                          className="text-[11px] font-semibold bg-white/90 text-gray-800 hover:bg-[#F47B20] hover:text-white px-2 py-1 rounded-md transition-colors"
                        >
                          Make Cover
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUpload
