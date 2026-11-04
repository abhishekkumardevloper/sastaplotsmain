import React from 'react'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import Spinner from './Spinner'

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description: React.ReactNode
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'primary'
  isLoading?: boolean
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const iconMap = {
    danger: (
      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
        <AlertTriangle className="w-6 h-6 stroke-[1.75]" />
      </div>
    ),
    warning: (
      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
        <AlertCircle className="w-6 h-6 stroke-[1.75]" />
      </div>
    ),
    primary: (
      <div className="w-12 h-12 rounded-2xl bg-[#FFF8F2] text-[#F47B20] flex items-center justify-center shrink-0 border border-[#FFE4CC]">
        <Info className="w-6 h-6 stroke-[1.75]" />
      </div>
    ),
  }

  const confirmBtnStyles = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs focus:ring-amber-500',
    primary: 'bg-[#F47B20] hover:bg-[#E96512] text-white shadow-xs focus:ring-[#F47B20]',
  }

  return (
    <AlertDialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in" />
        <AlertDialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 focus:outline-none animate-in zoom-in-95 duration-200">
          <div className="flex items-start gap-4">
            {iconMap[variant]}
            <div className="space-y-1.5 flex-1">
              <AlertDialogPrimitive.Title className="text-base font-bold text-gray-900 font-sans">
                {title}
              </AlertDialogPrimitive.Title>
              <AlertDialogPrimitive.Description className="text-sm text-gray-600 leading-relaxed">
                {description}
              </AlertDialogPrimitive.Description>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <AlertDialogPrimitive.Cancel asChild>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="btn-secondary text-sm px-4 py-2"
              >
                {cancelText}
              </button>
            </AlertDialogPrimitive.Cancel>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none',
                confirmBtnStyles[variant]
              )}
            >
              {isLoading && <Spinner size="sm" color="white" />}
              <span>{confirmText}</span>
            </button>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}

export default ConfirmDialog
