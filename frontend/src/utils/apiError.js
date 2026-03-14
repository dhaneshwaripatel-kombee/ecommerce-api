/**
 * Extract a user-friendly message from an API (axios) error.
 * Handles Laravel-style { message, errors } and network/unknown errors.
 * @param {Error} err - Caught error from axios or fetch
 * @returns {string}
 */
export function getApiErrorMessage(err) {
  if (!err) return 'Something went wrong.'
  const data = err.response?.data
  if (data?.message) return data.message
  if (data?.errors && typeof data.errors === 'object') {
    const first = Object.values(data.errors).flat()
    if (first.length) return first[0]
  }
  if (err.response?.status === 401) return 'Invalid credentials.'
  if (err.response?.status === 403) return 'You do not have permission.'
  if (err.response?.status === 404) return 'Resource not found.'
  if (err.response?.status >= 500) return 'Server error. Please try again later.'
  if (err.message === 'Network Error') return 'Network error. Check your connection.'
  return err.message || 'Something went wrong.'
}

/**
 * Extract Laravel-style validation errors from an API error.
 * @param {Error} err
 * @returns {{ [field: string]: string }}
 */
export function getApiValidationErrors(err) {
  const data = err.response?.data
  if (!data?.errors || typeof data.errors !== 'object') return {}
  const next = {}
  Object.keys(data.errors).forEach((key) => {
    const val = data.errors[key]
    next[key] = Array.isArray(val) ? val[0] : String(val)
  })
  return next
}
