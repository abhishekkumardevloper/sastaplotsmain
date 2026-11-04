import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Construction, ArrowLeft, Home, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PlaceholderPageProps {
  title: string
  category?: 'Public' | 'User Dashboard' | 'Admin Portal'
  description?: string
  icon?: React.ReactNode
  className?: string
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  category = 'Public',
  description = 'This feature module is currently under active development and will be available soon with full production capabilities.',
  icon,
  className,
}) => {
  const location = useLocation()

  return (
    <div className={cn('min-h-[60vh] flex items-center justify-center py-12 px-4', className)}>
      <div className="w-full max-w-xl text-center bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 shadow-sm space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-[#FFF8F2] border border-[#FFE4CC] text-[#F47B20] mx-auto flex items-center justify-center shadow-xs">
          {icon || <Construction className="w-8 h-8 stroke-[1.75]" />}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-50 text-[#F47B20] border border-orange-200/60">
              {category}
            </span>
            <span className="text-xs text-gray-400 font-mono">
              {location.pathname}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-poppins tracking-tight">
            {title}
          </h1>

          <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="btn-secondary text-xs sm:text-sm inline-flex items-center gap-2">
            <Home className="w-4 h-4" />
            <span>Home Page</span>
          </Link>
          <Link to="/search" className="btn-primary text-xs sm:text-sm inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Explore Properties</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PlaceholderPage
