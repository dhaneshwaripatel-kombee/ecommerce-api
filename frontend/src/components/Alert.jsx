export function Alert({ variant = 'info', title, children, onDismiss, className = '' }) {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }
  return (
    <div
      className={`rounded-lg border p-4 ${styles[variant]} ${className}`}
      role="alert"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          {title && <p className="font-medium">{title}</p>}
          <div className={title ? 'mt-1 text-sm' : ''}>{children}</div>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded p-1 hover:bg-black/10 focus:outline-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}
