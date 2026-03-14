import api from './api'
import { API_BASE } from '../utils/constants'

export const authService = {
  async register(payload) {
    const { data: res } = await api.post(`${API_BASE}/register`, payload)
    return res?.data ?? res
  },

  async login(credentials) {
    const { data: res } = await api.post(`${API_BASE}/login`, credentials)
    return res?.data ?? res
  },

  async logout() {
    await api.post(`${API_BASE}/logout`)
  },
}
