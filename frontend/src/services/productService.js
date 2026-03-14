import api from './api'
// import { API_BASE } from '../utils/constants'

/**
 * @param {Object} params - { page, per_page, name, price_min, price_max, sort_price }
 */
export const productService = {
  async list(params = {}) {
    const { data: res } = await api.get(`/products`, { params })
    return res?.data ?? res
  },

  async getById(id) {
    const { data: res } = await api.get(`/products/${id}`)
    return res?.data ?? res
  },

  async create(payload) {
    const { data: res } = await api.post(`/products`, payload)
    return res?.data ?? res
  },

  async update(id, payload) {
    const { data: res } = await api.put(`/products/${id}`, payload)
    return res?.data ?? res
  },

  async delete(id) {
    const { data: res } = await api.delete(`/products/${id}`)
    return res?.data ?? res
  },
}
