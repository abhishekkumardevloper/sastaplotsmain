import React from 'react'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { motion } from 'framer-motion'

export interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  change?: string | number
  trend?: 'up' | 'down' | 'neutral'
  trendText?: string
  color?: 'orange' | 'green' | 'blue' | 'purple' | 'red' | 'amber'
  onClick?: () => void
  isLoading?: boolean
  className?: string
}

const colorStyles = {
  orange: {
    iconBg: 'bg-orange-50 text-[#F47B20] border-orange-100',
    accent: '#F47B20',
  },
  green: {
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    accent: '#168653',
  },
  blue: {
    iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
    accent: '#2563eb',
  },
  purple: {
    iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
    accent: '#9333ea',
  },
  red: {
    iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
    accent: '#D93636',
  },
  amber: {
    iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
    accent: '#d97706',
  },
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  change,
  trend = 'neutral',
  trendText,
  color = 'orange',
  onClick,
  isLoading = false,
  className = '',
}) => {
  const styles = colorStyles[color] || colorStyles.orange

  if (isLoading) {
    return (
      <div className={`card p-5 bg-white border border-[#EAEAEA] rounded-2xl ${className}`}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  const renderTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
    if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
    return <Minus className="w-3.5 h-3.5 text-gray-400" />
  }

  const trendTextColor =
    trend === 'up'
      ? 'text-emerald-700 bg-emerald-50'
      : trend === 'down'
      ? 'text-rose-700 bg-rose-50'
      : 'text-gray-600 bg-gray-50'

  return (
    <motion.div
      whileHover={onClick ? { y: -2, transition: { duration: 0.15 } } : undefined}
      onClick={onClick}
      className={`card p-5 bg-white border border-[#EAEAEA] rounded-2xl relative overflow-hidden transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-[#F47B20]/40 hover:shadow-md' : 'hover:border-gray-300'
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#727272] uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-[#202124] tracking-tight font-poppins">{value}</p>
        </div>
        <div
          className={`p-3 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 ${styles.iconBg}`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {(change !== undefined || trendText) && (
        <div className="mt-4 pt-3 border-t border-[#F5F5F5] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            {change !== undefined && (
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-semibold text-[11px] ${trendTextColor}`}
              >
                {renderTrendIcon()}
                {change}
              </span>
            )}
            {trendText && <span className="text-[#727272]">{trendText}</span>}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default StatCard
