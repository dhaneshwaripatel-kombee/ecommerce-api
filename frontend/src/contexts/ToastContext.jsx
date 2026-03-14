import { createContext, useCallback, useContext, useState } from 'react'

const TOAST_DURATION = 5000

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const add = useCallback(({ message, variant = 'info', duration = TOAST_DURATION }) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, variant, duration }])
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }
    return id
  }, [])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const success = useCallback((message) => add({ message, variant: 'success' }), [add])
  const error = useCallback((message) => add({ message, variant: 'error' }), [add])
  const warning = useCallback((message) => add({ message, variant: 'warning' }), [add])
  const info = useCallback((message) => add({ message, variant: 'info' }), [add])

  const value = { toasts, add, remove, success, error, warning, info }

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
