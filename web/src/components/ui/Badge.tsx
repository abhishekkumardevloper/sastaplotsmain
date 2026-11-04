import React from 'react'
import { cn } from '@/lib/utils'
import type { PropertyStatus } from '@/types'

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'featured'
  | 'verified'
  | PropertyStatus

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
  icon?: React.ReactNode
}

const variantStyles: Record<string, string> = {
  // Generic variants
  default: 'bg-gray-100 text-gray-700 border-gray-200',
  primary: 'bg-[#FFF8F2] text-[#F47B20] border-[#FFE4CC]',
  secondary: 'bg-stone-100 text-stone-700 border-stone-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',

  // Special marketing badges
  featured: 'bg-gradient-to-r from-[#F47B20] to-[#E96512] text-white font-bold tracking-wider uppercase shadow-xs border-transparent',
  verified: 'bg-emerald-50 text-[#168653] border-emerald-200 font-semibold',

  // Property status variants
  draft: 'bg-gray-100 text-gray-700 border-gray-200',
  pending_review: 'bg-amber-50 text-amber-800 border-amber-200',
  needs_changes: 'bg-orange-50 text-orange-800 border-orange-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  suspended: 'bg-red-100 text-red-900 border-red-300',
  archived: 'bg-gray-100 text-gray-500 border-gray-200',
  sold: 'bg-blue-50 text-blue-700 border-blue-200',
  rented: 'bg-purple-50 text-purple-700 border-purple-200',
}

const dotStyles: Record<string, string> = {
  default: 'bg-gray-400',
  primary: 'bg-[#F47B20]',
  secondary: 'bg-stone-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
  featured: 'bg-white',
  verified: 'bg-emerald-500',
  draft: 'bg-gray-400',
  pending_review: 'bg-amber-500 animate-pulse',
  needs_changes: 'bg-orange-500',
  approved: 'bg-emerald-500',
  rejected: 'bg-rose-500',
  suspended: 'bg-red-600',
  archived: 'bg-gray-400',
  sold: 'bg-blue-500',
  rented: 'bg-purple-500',
}

const sizeStyles = {
  sm: 'text-[11px] px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
  lg: 'text-sm px-3.5 py-1.5 gap-2',
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  dot = false,
  icon,
  className,
  children,
  ...props
}) => {
  const currentVariant = variantStyles[variant] ? variant : 'default'

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-full border transition-colors select-none',
        variantStyles[currentVariant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'rounded-full',
            size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
            dotStyles[currentVariant] || 'bg-current'
          )}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  )
}

export default Badge
