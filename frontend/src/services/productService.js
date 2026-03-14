import api from './api'
import { API_BASE } from '../utils/constants'

/**
 * @param {Object} params - { page, per_page, name, price_min, price_max, sort_price }
 */
export const productService = {
  async list(params = {}) {
    const { data: res } = await api.get(`${API_BASE}/products`, { params })
    return res?.data ?? res
  },

  async getById(id) {
    const { data: res } = await api.get(`${API_BASE}/products/${id}`)
    return res?.data ?? res
  },

  async create(payload) {
    const { data: res } = await api.post(`${API_BASE}/products`, payload)
    return res?.data ?? res
  },

  async update(id, payload) {
    const { data: res } = await api.put(`${API_BASE}/products/${id}`, payload)
    return res?.data ?? res
  },

  async delete(id) {
    const { data: res } = await api.delete(`${API_BASE}/products/${id}`)
    return res?.data ?? res
  },
}
