'use client'
import React from 'react'
import { Link } from 'react-router-dom'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  secondaryActionLabel?: string
  secondaryActionHref?: string
  onSecondaryAction?: () => void
  children?: React.ReactNode
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryActionLabel,
  secondaryActionHref,
  onSecondaryAction,
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-white border border-gray-100 shadow-xs',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#FFF8F2] border border-[#FFE4CC] flex items-center justify-center text-[#F47B20] mb-4 shadow-xs">
        {icon || <Inbox className="w-7 h-7 stroke-[1.75]" />}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 font-sans tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="mt-1.5 text-sm text-gray-500 max-w-md leading-relaxed">
          {description}
        </p>
      )}

      {children && <div className="mt-4">{children}</div>}

      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && (
            actionHref ? (
              <Link to={actionHref} className="btn-primary text-sm">
                {actionLabel}
              </Link>
            ) : (
              <button
                type="button"
                onClick={onAction}
                className="btn-primary text-sm"
              >
                {actionLabel}
              </button>
            )
          )}

          {secondaryActionLabel && (
            secondaryActionHref ? (
              <Link to={secondaryActionHref} className="btn-secondary text-sm">
                {secondaryActionLabel}
              </Link>
            ) : (
              <button
                type="button"
                onClick={onSecondaryAction}
                className="btn-secondary text-sm"
              >
                {secondaryActionLabel}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}

export default EmptyState
