import { useToast } from '../contexts/ToastContext'

const variants = {
  success: 'bg-green-600 text-white border-green-700',
  error: 'bg-red-600 text-white border-red-700',
  warning: 'bg-amber-500 text-white border-amber-600',
  info: 'bg-blue-600 text-white border-blue-700',
}

export function ToastContainer() {
  const { toasts, remove } = useToast()

  if (!toasts.length) return null

  return (
    <div
      className="fixed right-4 top-4 z-[100] flex max-w-sm flex-col gap-2"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center justify-between rounded-lg border px-4 py-3 shadow-lg ${variants[toast.variant]}`}
          role="alert"
        >
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            type="button"
            onClick={() => remove(toast.id)}
            className="ml-2 rounded p-1 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
