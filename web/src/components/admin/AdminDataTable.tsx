import React from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Inbox,
  LucideIcon,
} from 'lucide-react'

export interface Column<T> {
  key: string
  header: React.ReactNode
  render?: (item: T, index: number) => React.ReactNode
  sortable?: boolean
  className?: string
  headerClassName?: string
  width?: string
}

export interface PaginationConfig {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

export interface AdminDataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  skeletonRows?: number
  getRowId?: (item: T) => string | number
  selectable?: boolean
  selectedIds?: (string | number)[]
  onSelectChange?: (selectedIds: (string | number)[]) => void
  pagination?: PaginationConfig
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: LucideIcon
  emptyAction?: React.ReactNode
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (columnKey: string) => void
  className?: string
  onRowClick?: (item: T) => void
}

export function AdminDataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  skeletonRows = 5,
  getRowId = (item: T) => (item.id !== undefined ? item.id : JSON.stringify(item)),
  selectable = false,
  selectedIds = [],
  onSelectChange,
  pagination,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records to display at this time.',
  emptyIcon: EmptyIcon = Inbox,
  emptyAction,
  sortColumn,
  sortDirection,
  onSort,
  className = '',
  onRowClick,
}: AdminDataTableProps<T>) {
  const allCurrentRowIds = data.map(getRowId)
  const isAllSelected =
    data.length > 0 &&
    allCurrentRowIds.every((id) => selectedIds.includes(id))
  const isSomeSelected =
    data.length > 0 &&
    allCurrentRowIds.some((id) => selectedIds.includes(id)) &&
    !isAllSelected

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectChange) return
    if (e.target.checked) {
      // Add all current IDs not already selected
      const uniqueIds = Array.from(new Set([...selectedIds, ...allCurrentRowIds]))
      onSelectChange(uniqueIds)
    } else {
      // Remove current row IDs from selection
      const remainingIds = selectedIds.filter((id) => !allCurrentRowIds.includes(id))
      onSelectChange(remainingIds)
    }
  }

  const handleSelectRow = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!onSelectChange) return
    if (selectedIds.includes(id)) {
      onSelectChange(selectedIds.filter((item) => item !== id))
    } else {
      onSelectChange([...selectedIds, id])
    }
  }

  return (
    <div className={`card overflow-hidden bg-white border border-[#EAEAEA] rounded-2xl shadow-sm ${className}`}>
      {/* Table responsive container */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#FFF8F2]/60 border-b border-[#EAEAEA] text-[#727272] uppercase text-[11px] font-semibold tracking-wider">
              {selectable && (
                <th className="py-3.5 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-[#F47B20] focus:ring-[#F47B20] cursor-pointer"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected
                    }}
                    onChange={handleSelectAll}
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((col) => {
                const isSorted = sortColumn === col.key
                return (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={`py-3.5 px-4 font-semibold ${
                      col.sortable ? 'cursor-pointer select-none hover:text-[#202124]' : ''
                    } ${col.headerClassName || ''}`}
                    onClick={() => {
                      if (col.sortable && onSort) {
                        onSort(col.key)
                      }
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-gray-400">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-[#F47B20]" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-[#F47B20]" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-gray-300 hover:text-gray-500" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAEAEA]/70 text-[#202124]">
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`} className="animate-pulse">
                  {selectable && (
                    <td className="py-4 px-4 text-center">
                      <div className="w-4 h-4 bg-gray-200 rounded mx-auto" />
                    </td>
                  )}
                  {columns.map((col, cIdx) => (
                    <td key={`skeleton-col-${cIdx}`} className="py-4 px-4">
                      <div
                        className="h-4 bg-gray-200 rounded"
                        style={{
                          width: `${Math.max(40, (cIdx * 25 + 50) % 90)}%`,
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-12 px-4 text-center"
                >
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#FFF8F2] flex items-center justify-center text-[#F47B20] border border-[#FFE4CC]">
                      <EmptyIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#202124]">{emptyTitle}</h4>
                      <p className="text-xs text-[#727272] mt-0.5">{emptyDescription}</p>
                    </div>
                    {emptyAction && <div className="pt-1">{emptyAction}</div>}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const rowId = getRowId(item)
                const isSelected = selectedIds.includes(rowId)
                return (
                  <tr
                    key={rowId}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={`transition-colors duration-150 ${
                      isSelected
                        ? 'bg-[#FFF8F2]/60 hover:bg-[#FFF0E0]'
                        : 'hover:bg-gray-50/80'
                    } ${onRowClick ? 'cursor-pointer' : ''}`}
                  >
                    {selectable && (
                      <td
                        className="py-3.5 px-4 text-center"
                        onClick={(e) => handleSelectRow(rowId, e)}
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-[#F47B20] focus:ring-[#F47B20] cursor-pointer"
                          checked={isSelected}
                          onChange={() => {}}
                          aria-label={`Select row ${rowId}`}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`py-3.5 px-4 text-sm ${col.className || ''}`}
                      >
                        {col.render ? col.render(item, index) : item[col.key]}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 bg-white border-t border-[#EAEAEA] text-xs text-[#727272]">
          <div className="flex items-center gap-1.5">
            <span>
              Showing{' '}
              <strong className="text-[#202124] font-medium">
                {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-[#202124] font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </strong>{' '}
              of <strong className="text-[#202124] font-medium">{pagination.total}</strong> results
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-[#EAEAEA] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-[#EAEAEA] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-medium text-[#202124]">
              Page {pagination.page} of {Math.max(1, pagination.totalPages)}
            </span>

            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-[#EAEAEA] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.totalPages)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-[#EAEAEA] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDataTable
