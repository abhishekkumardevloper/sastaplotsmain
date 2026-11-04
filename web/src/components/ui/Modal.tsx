import React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  description?: React.ReactNode
  trigger?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  className?: string
  showCloseButton?: boolean
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-4xl w-[95vw]',
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  trigger,
  children,
  footer,
  size = 'md',
  className,
  showCloseButton = true,
}) => {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}

      <DialogPrimitive.Portal>
        {/* Backdrop overlay */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in" />

        {/* Modal dialog content */}
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 duration-200 focus:outline-none max-h-[90vh] flex flex-col',
            sizeClasses[size],
            className
          )}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-gray-100">
              <div className="space-y-1">
                {title && (
                  <DialogPrimitive.Title className="text-lg font-bold text-gray-900 font-sans tracking-tight">
                    {title}
                  </DialogPrimitive.Title>
                )}
                {description && (
                  <DialogPrimitive.Description className="text-sm text-gray-500">
                    {description}
                  </DialogPrimitive.Description>
                )}
              </div>

              {showCloseButton && (
                <DialogPrimitive.Close
                  onClick={onClose}
                  aria-label="Close modal"
                  className="rounded-xl p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </DialogPrimitive.Close>
              )}
            </div>
          )}

          {/* Body */}
          <div className="py-4 overflow-y-auto scrollbar-thin flex-1 text-sm text-gray-700">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export default Modal
