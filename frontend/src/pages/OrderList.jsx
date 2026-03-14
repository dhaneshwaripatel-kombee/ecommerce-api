import { useCallback, useEffect, useState } from 'react'
import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { Select } from '../components/Select'
import { Spinner } from '../components/Spinner'
import { Table } from '../components/Table'
import { useToast } from '../contexts/ToastContext'
import { orderService } from '../services/orderService'
import { productService } from '../services/productService'
import { getApiErrorMessage } from '../utils/apiError'
import { DEFAULT_PER_PAGE, ORDER_STATUSES, PER_PAGE_OPTIONS } from '../utils/constants'
import { formatCurrency, formatDate } from '../utils/format'

export default function OrderList() {
  const toast = useToast()
  const [list, setList] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [statusFilter, setStatusFilter] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [createForm, setCreateForm] = useState({ product_id: '', quantity: '', status: 'pending' })
  const [editForm, setEditForm] = useState({ status: '' })
  const [formErrors, setFormErrors] = useState({})
  const [submitLoading, setSubmitLoading] = useState(false)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { page, per_page: perPage }
      if (statusFilter) params.status = statusFilter
      const data = await orderService.list(params)
      setList(data)
    } catch (err) {
      const message = getApiErrorMessage(err)
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [page, perPage, statusFilter, toast])

  const fetchProducts = useCallback(async () => {
    try {
      const result = await productService.list({ per_page: 100 })
      const items = result?.data ?? []
      setProducts(Array.isArray(items) ? items : [])
    } catch {
      setProducts([])
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    if (createOpen) fetchProducts()
  }, [createOpen, fetchProducts])

  const openCreate = () => {
    setCreateForm({ product_id: '', quantity: '', status: 'pending' })
    setFormErrors({})
    setCreateOpen(true)
  }

  const openEdit = (order) => {
    setSelectedOrder(order)
    setEditForm({ status: order.status ?? 'pending' })
    setFormErrors({})
    setEditOpen(true)
  }

  const validateCreate = () => {
    const next = {}
    if (!createForm.product_id) next.product_id = 'Product is required'
    if (createForm.quantity === '' || createForm.quantity == null) next.quantity = 'Quantity is required'
    else if (Number(createForm.quantity) < 1) next.quantity = 'Quantity must be at least 1'
    setFormErrors(next)
    return Object.keys(next).length === 0
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!validateCreate()) return
    setSubmitLoading(true)
    try {
      await orderService.create({
        product_id: Number(createForm.product_id),
        quantity: Number(createForm.quantity),
        status: createForm.status,
      })
      setCreateOpen(false)
      toast.success('Order created successfully.')
      fetchOrders()
    } catch (err) {
      const message = getApiErrorMessage(err)
      setFormErrors({ _: message })
      toast.error(message)
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    if (!selectedOrder) return
    setSubmitLoading(true)
    try {
      await orderService.update(selectedOrder.id, { status: editForm.status })
      setEditOpen(false)
      toast.success('Order updated successfully.')
      fetchOrders()
    } catch (err) {
      const message = getApiErrorMessage(err)
      setFormErrors({ _: message })
      toast.error(message)
    } finally {
      setSubmitLoading(false)
    }
  }

  const columns = [
    { key: 'id', header: 'ID', width: '80px' },
    { key: 'user_id', header: 'User ID', render: (v) => v ?? '—' },
    {
      key: 'product',
      header: 'Product',
      render: (_, row) => (row.product?.name ?? row.product_id ?? '—'),
    },
    { key: 'quantity', header: 'Quantity' },
    { key: 'total_price', header: 'Total', render: (v) => formatCurrency(v) },
    {
      key: 'status',
      header: 'Status',
      render: (v) => (
        <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
          {v ?? '—'}
        </span>
      ),
    },
    { key: 'created_at', header: 'Date', render: (v) => formatDate(v) },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>
          Edit
        </Button>
      ),
    },
  ]

  const paginatedData = list?.data ?? []
  const total = list?.total ?? 0
  const lastPage = list?.last_page ?? 1

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <Button onClick={openCreate}>Create order</Button>
      </div>

      {error && (
        <Alert variant="error" className="mt-4" onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Select
          placeholder="All statuses"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          options={ORDER_STATUSES}
          className="w-40"
        />
        <Select
          value={perPage}
          onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1) }}
          options={PER_PAGE_OPTIONS.map((n) => ({ value: n, label: `${n} per page` }))}
          className="w-36"
        />
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Spinner size="lg" />
            <p className="text-gray-500">Loading orders...</p>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={paginatedData}
              emptyMessage="No orders found."
            />
            {lastPage > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing page {page} of {lastPage} ({total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={page >= lastPage}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create order">
        <form onSubmit={handleCreate} className="space-y-4">
          {formErrors._ && (
            <Alert variant="error" onDismiss={() => setFormErrors((e) => ({ ...e, _: '' }))}>
              {formErrors._}
            </Alert>
          )}
          <Select
            label="Product"
            name="product_id"
            value={createForm.product_id}
            onChange={(e) => setCreateForm((p) => ({ ...p, product_id: e.target.value }))}
            options={products.map((p) => ({ value: p.id, label: `${p.name} (${formatCurrency(p.price)})` }))}
            error={formErrors.product_id}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
            <input
              type="number"
              min="1"
              value={createForm.quantity}
              onChange={(e) => setCreateForm((p) => ({ ...p, quantity: e.target.value }))}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
            />
            {formErrors.quantity && (
              <p className="mt-1 text-sm text-red-600">{formErrors.quantity}</p>
            )}
          </div>
          <Select
            label="Status"
            name="status"
            value={createForm.status}
            onChange={(e) => setCreateForm((p) => ({ ...p, status: e.target.value }))}
            options={ORDER_STATUSES}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitLoading}>
              {submitLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit order">
        {selectedOrder && (
          <form onSubmit={handleEdit} className="space-y-4">
            {formErrors._ && (
              <Alert variant="error" onDismiss={() => setFormErrors((e) => ({ ...e, _: '' }))}>
                {formErrors._}
              </Alert>
            )}
            <p className="text-sm text-gray-600">
              Order #{selectedOrder.id} — {selectedOrder.product?.name} × {selectedOrder.quantity}
            </p>
            <Select
              label="Status"
              name="status"
              value={editForm.status}
              onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
              options={ORDER_STATUSES}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitLoading}>
                {submitLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
