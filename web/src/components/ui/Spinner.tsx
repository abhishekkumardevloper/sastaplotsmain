import React from 'react'
import { cn } from '@/lib/utils'

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'white' | 'gray' | 'current'
  center?: boolean
  text?: string
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  center = false,
  text,
  className,
  ...props
}) => {
  const sizeMap = {
    xs: 'w-3.5 h-3.5 border-2',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-[2.5px]',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  }

  const colorMap = {
    primary: 'border-[#F47B20]/25 border-t-[#F47B20]',
    white: 'border-white/30 border-t-white',
    gray: 'border-gray-200 border-t-gray-600',
    current: 'border-current/25 border-t-current',
  }

  const spinnerContent = (
    <div
      className={cn('inline-flex flex-col items-center justify-center gap-2', className)}
      role="status"
      aria-label={text || 'Loading'}
      {...props}
    >
      <div
        className={cn(
          'rounded-full animate-spin',
          sizeMap[size],
          colorMap[color]
        )}
      />
      {text && (
        <span className="text-xs font-medium text-gray-500 animate-pulse">
          {text}
        </span>
      )}
    </div>
  )

  if (center) {
    return (
      <div className="flex items-center justify-center w-full min-h-[160px] p-6">
        {spinnerContent}
      </div>
    )
  }

  return spinnerContent
}

export default Spinner
