export function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  placeholder = 'Select...',
  required,
  className = '',
  ...props
}) {
  const id = name || label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        id={id}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        className={`block w-full rounded-lg border px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
