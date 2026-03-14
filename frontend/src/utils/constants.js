export const API_BASE = '/api/v1'

export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

export const DEFAULT_PER_PAGE = 15
export const PER_PAGE_OPTIONS = [10, 15, 25, 50, 100]
