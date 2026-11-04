import React from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  limit?: number
  showInfo?: boolean
  className?: string
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onPageChange,
  totalItems,
  limit,
  showInfo = true,
  className,
}) => {
  if (totalPages <= 1 && (!totalItems || totalItems <= 0)) {
    return null
  }

  // Calculate items range text
  const startItem = totalItems && limit ? (page - 1) * limit + 1 : undefined
  const endItem =
    totalItems && limit ? Math.min(page * limit, totalItems) : undefined

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)

      if (start > 2) {
        pages.push('ellipsis')
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (end < totalPages - 1) {
        pages.push('ellipsis')
      }

      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2',
        className
      )}
      aria-label="Pagination Navigation"
    >
      {showInfo && totalItems !== undefined && (
        <div className="text-xs sm:text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-900">{startItem}</span> to{' '}
          <span className="font-semibold text-gray-900">{endItem}</span> of{' '}
          <span className="font-semibold text-gray-900">{totalItems}</span> results
        </div>
      )}

      <div className="flex items-center gap-1.5 select-none ml-auto sm:ml-0">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous Page"
          className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-[#F47B20] disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((item, idx) => {
          if (item === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-9 h-9 flex items-center justify-center text-gray-400"
              >
                <MoreHorizontal className="w-4 h-4" />
              </span>
            )
          }

          const isCurrent = item === page
          return (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={isCurrent ? 'page' : undefined}
              className={cn(
                'inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-semibold transition-all',
                isCurrent
                  ? 'bg-[#F47B20] text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-[#F47B20] hover:text-[#F47B20]'
              )}
            >
              {item}
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next Page"
          className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-[#F47B20] disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Pagination
