import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { SearchX, RefreshCw } from 'lucide-react'
import type { Property } from '@/types'
import { PropertyCard } from './PropertyCard'
import { PropertyCardSkeleton } from './PropertyCardSkeleton'

export interface PropertyGridProps {
  properties?: Property[]
  isLoading?: boolean
  emptyState?: React.ReactNode
  columns?: 2 | 3 | 4
  skeletonCount?: number
  className?: string
  onResetFilters?: () => void
}

export const PropertyGrid: React.FC<PropertyGridProps> = ({
  properties = [],
  isLoading = false,
  emptyState,
  columns = 3,
  skeletonCount = 6,
  className = '',
  onResetFilters,
}) => {
  const shouldReduceMotion = useReducedMotion()

  const columnClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[columns]

  // Loading state with skeletons
  if (isLoading) {
    return (
      <div className={`grid gap-6 ${columnClasses} ${className}`}>
        {Array.from({ length: skeletonCount }).map((_, idx) => (
          <PropertyCardSkeleton key={`skeleton-${idx}`} />
        ))}
      </div>
    )
  }

  // Empty state
  if (!properties || properties.length === 0) {
    if (emptyState) {
      return <>{emptyState}</>
    }

    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-xs">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#F47B20] mb-4">
          <SearchX className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">No properties found</h3>
        <p className="mt-2 max-w-md text-sm text-gray-500">
          We couldn't find any properties matching your current criteria. Try expanding your search
          location, adjusting price or area filters.
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="btn-primary mt-6 text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Reset All Filters
          </button>
        )}
      </div>
    )
  }

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.07,
      },
    },
  }

  const itemVariants: any = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: 'easeOut' },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={`grid gap-6 ${columnClasses} ${className}`}
    >
      {properties.map((property) => (
        <motion.div key={property.id} variants={itemVariants}>
          <PropertyCard property={property} />
        </motion.div>
      ))}
    </motion.div>
  )
}

export default PropertyGrid
