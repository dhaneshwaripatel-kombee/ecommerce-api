import api from './api'
// import { API_BASE } from '../utils/constants'

/**
 * @param {Object} params - { page, per_page, status }
 */
export const orderService = {
  async list(params = {}) {
    const { data: res } = await api.get(`/orders`, { params })
    return res?.data ?? res
  },

  async getById(id) {
    const { data: res } = await api.get(`/orders/${id}`)
    return res?.data ?? res
  },

  async create(payload) {
    const { data: res } = await api.post(`/orders`, payload)
    return res?.data ?? res
  },

  async update(id, payload) {
    const { data: res } = await api.patch(`/orders/${id}`, payload)
    return res?.data ?? res
  },

  async delete(id) {
    const { data: res } = await api.delete(`/orders/${id}`)
    return res?.data ?? res
  },
}
