import React from 'react'

interface PropertyCardSkeletonProps {
  className?: string
}

export const PropertyCardSkeleton: React.FC<PropertyCardSkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`card overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ${className}`}
      aria-hidden="true"
    >
      {/* 4:3 Aspect Ratio Image Skeleton */}
      <div className="relative aspect-[4/3] w-full bg-gray-200 skeleton">
        {/* Badges skeleton */}
        <div className="absolute top-3 left-3 flex gap-2">
          <div className="h-5 w-20 rounded-full bg-gray-300/80 skeleton" />
          <div className="h-5 w-16 rounded-full bg-gray-300/80 skeleton" />
        </div>
        {/* Heart icon skeleton */}
        <div className="absolute top-3 right-3 h-9 w-9 rounded-full bg-gray-300/80 skeleton" />
      </div>

      {/* Content Skeleton */}
      <div className="p-4 sm:p-5 flex flex-col gap-3">
        {/* Price & Area skeleton */}
        <div className="flex items-baseline justify-between gap-2">
          <div className="h-7 w-32 rounded-md bg-gray-200 skeleton" />
          <div className="h-5 w-20 rounded-md bg-gray-200 skeleton" />
        </div>

        {/* Title skeleton (2 lines) */}
        <div className="space-y-1.5">
          <div className="h-4 w-full rounded bg-gray-200 skeleton" />
          <div className="h-4 w-3/4 rounded bg-gray-200 skeleton" />
        </div>

        {/* Location skeleton */}
        <div className="flex items-center gap-1.5 pt-1">
          <div className="h-4 w-4 rounded-full bg-gray-200 skeleton shrink-0" />
          <div className="h-3.5 w-44 rounded bg-gray-200 skeleton" />
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gray-100 my-1" />

        {/* Bottom row skeleton */}
        <div className="flex items-center justify-between pt-1">
          <div className="h-6 w-20 rounded-full bg-gray-200 skeleton" />
          <div className="h-9 w-28 rounded-xl bg-gray-200 skeleton" />
        </div>
      </div>
    </div>
  )
}

export default PropertyCardSkeleton
