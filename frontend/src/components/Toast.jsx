import { useToast } from '../contexts/ToastContext'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '../lib/utils'

const icons = {
  success: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  error: <AlertCircle className="h-4 w-4 text-destructive" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  info: <Info className="h-4 w-4 text-blue-500" />,
}

export function ToastContainer() {
  const { toasts, remove } = useToast()

  if (!toasts.length) return null

  return (
    <div
      className="fixed right-4 top-4 z-[100] flex max-w-sm flex-col gap-3"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-start gap-3 rounded-xl border bg-white/95 p-4 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-right-full",
            "border-slate-200"
          )}
          role="alert"
        >
          <div className="mt-0.5 shrink-0">
            {icons[toast.variant] || icons.info}
          </div>
          <div className="flex-1 pt-0.5">
            <p className="text-sm font-semibold text-slate-900 leading-none capitalize mb-1">{toast.variant}</p>
            <p className="text-sm text-slate-500 leading-relaxed">{toast.message}</p>
          </div>
          <button
            type="button"
            onClick={() => remove(toast.id)}
            className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
