import { useEffect } from 'react'
import { Button } from './Button'

export function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    const handleEscape = (e) => e.key === 'Escape' && onClose?.()
    if (open) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  if (!open) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          aria-hidden
          onClick={onClose}
        />
        <div
          className={`relative w-full ${sizes[size]} bg-white rounded-xl shadow-xl`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
              ×
            </Button>
          </div>
          <div className="px-6 py-4">{children}</div>
        </div>
      </div>
    </div>
  )
}
