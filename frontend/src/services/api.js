import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: API_BASE || '',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  config.metadata = { startTime: new Date() }
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    const duration = new Date() - response.config.metadata.startTime
    if (duration > 1000) {
      console.warn(`Slow response from ${response.config.url}: ${duration}ms`)
    }
    return response
  },
  async (error) => {
    const { config, response } = error
    
    // Slow response logging even on error
    if (config?.metadata?.startTime) {
      const duration = new Date() - config.metadata.startTime
      if (duration > 1000) {
        console.warn(`Slow error response from ${config.url}: ${duration}ms`)
      }
    }

    if (response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.dispatchEvent(new Event('storage'))
    }

    // Basic retry for transient errors (Network Error or 5xx)
    if (!response || response.status >= 500) {
      config._retryCount = config._retryCount || 0
      if (config._retryCount < 2) {
        config._retryCount += 1
        console.info(`Retrying request to ${config.url} (Attempt ${config._retryCount})`)
        return api(config)
      }
    }

    return Promise.reject(error)
  }
)

export default api
