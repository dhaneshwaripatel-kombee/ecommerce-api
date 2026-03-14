import { useCallback, useEffect, useState } from 'react'
import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Modal } from '../components/Modal'
import { Select } from '../components/Select'
import { Spinner } from '../components/Spinner'
import { Table } from '../components/Table'
import { useToast } from '../contexts/ToastContext'
import { productService } from '../services/productService'
import { getApiErrorMessage, getApiValidationErrors } from '../utils/apiError'
import { DEFAULT_PER_PAGE, PER_PAGE_OPTIONS } from '../utils/constants'
import { formatCurrency } from '../utils/format'

const initialProductForm = { name: '', description: '', price: '', stock: '' }

export default function ProductList() {
  const [list, setList] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [nameFilter, setNameFilter] = useState('')
  const [sortPrice, setSortPrice] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [form, setForm] = useState(initialProductForm)
  const [formErrors, setFormErrors] = useState({})
  const [submitLoading, setSubmitLoading] = useState(false)

  const fetchList = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { page, per_page: perPage }
      if (nameFilter.trim()) params.name = nameFilter.trim()
      if (sortPrice) params.sort_price = sortPrice
      const data = await productService.list(params)
      setList(data)
    } catch (err) {
      const message = getApiErrorMessage(err)
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [page, perPage, nameFilter, sortPrice])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  const openCreate = () => {
    setForm(initialProductForm)
    setFormErrors({})
    setCreateOpen(true)
  }

  const openEdit = (product) => {
    setSelectedProduct(product)
    setForm({
      name: product.name,
      description: product.description ?? '',
      price: product.price?.toString() ?? '',
      stock: product.stock?.toString() ?? '',
    })
    setFormErrors({})
    setEditOpen(true)
  }

  const openDelete = (product) => {
    setSelectedProduct(product)
    setDeleteOpen(true)
  }

  const validateForm = () => {
    const next = {}
    if (!form.name?.trim()) next.name = 'Name is required'
    if (form.price === '' || form.price == null) next.price = 'Price is required'
    else if (isNaN(Number(form.price)) || Number(form.price) < 0) next.price = 'Invalid price'
    if (form.stock === '' || form.stock == null) next.stock = 'Stock is required'
    else if (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) next.stock = 'Stock must be a non-negative integer'
    setFormErrors(next)
    return Object.keys(next).length === 0
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setSubmitLoading(true)
    try {
      await productService.create({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price),
        stock: Number(form.stock),
      })
      setCreateOpen(false)
      toast.success('Product created successfully.')
      fetchList()
    } catch (err) {
      const validation = getApiValidationErrors(err)
      if (Object.keys(validation).length > 0) {
        setFormErrors(validation)
        toast.error('Please fix the validation errors.')
      } else {
        setFormErrors({ _: getApiErrorMessage(err) })
        toast.error(getApiErrorMessage(err))
      }
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    if (!validateForm() || !selectedProduct) return
    setSubmitLoading(true)
    try {
      await productService.update(selectedProduct.id, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price),
        stock: Number(form.stock),
      })
      setEditOpen(false)
      toast.success('Product updated successfully.')
      fetchList()
    } catch (err) {
      const validation = getApiValidationErrors(err)
      if (Object.keys(validation).length > 0) {
        setFormErrors(validation)
        toast.error('Please fix the validation errors.')
      } else {
        setFormErrors({ _: getApiErrorMessage(err) })
        toast.error(getApiErrorMessage(err))
      }
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedProduct) return
    setSubmitLoading(true)
    try {
      await productService.delete(selectedProduct.id)
      setDeleteOpen(false)
      setSelectedProduct(null)
      toast.success('Product deleted successfully.')
      fetchList()
    } catch (err) {
      const message = getApiErrorMessage(err)
      setFormErrors({ _: message })
      toast.error(message)
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const columns = [
    { key: 'id', header: 'ID', width: '80px' },
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description', render: (v) => (v ? (v.length > 50 ? v.slice(0, 50) + '…' : v) : '—') },
    { key: 'price', header: 'Price', render: (v) => formatCurrency(v) },
    { key: 'stock', header: 'Stock' },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => openDelete(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  const paginatedData = list?.data ?? []
  const total = list?.total ?? 0
  const lastPage = list?.last_page ?? 1

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Button onClick={openCreate}>Create product</Button>
      </div>

      {error && (
        <Alert variant="error" className="mt-4" onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Input
          placeholder="Filter by name..."
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="max-w-xs"
        />
        <Select
          placeholder="Sort by price"
          value={sortPrice}
          onChange={(e) => setSortPrice(e.target.value)}
          options={[
            { value: 'asc', label: 'Price: Low to High' },
            { value: 'desc', label: 'Price: High to Low' },
          ]}
          className="w-48"
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
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : (
          <>
            <Table columns={columns} data={paginatedData} emptyMessage="No products found." />
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

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create product" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          {formErrors._ && (
            <Alert variant="error" onDismiss={() => setFormErrors((e) => ({ ...e, _: '' }))}>
              {formErrors._}
            </Alert>
          )}
          <Input label="Name" name="name" value={form.name} onChange={handleFormChange} error={formErrors.name} required />
          <Input label="Description" name="description" value={form.description} onChange={handleFormChange} error={formErrors.description} />
          <Input label="Price" name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleFormChange} error={formErrors.price} required />
          <Input label="Stock" name="stock" type="number" min="0" value={form.stock} onChange={handleFormChange} error={formErrors.stock} required />
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

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit product" size="lg">
        <form onSubmit={handleEdit} className="space-y-4">
          {formErrors._ && (
            <Alert variant="error" onDismiss={() => setFormErrors((e) => ({ ...e, _: '' }))}>
              {formErrors._}
            </Alert>
          )}
          <Input label="Name" name="name" value={form.name} onChange={handleFormChange} error={formErrors.name} required />
          <Input label="Description" name="description" value={form.description} onChange={handleFormChange} error={formErrors.description} />
          <Input label="Price" name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleFormChange} error={formErrors.price} required />
          <Input label="Stock" name="stock" type="number" min="0" value={form.stock} onChange={handleFormChange} error={formErrors.stock} required />
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
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete product">
        {selectedProduct && (
          <>
            <p className="text-gray-600">
              Are you sure you want to delete <strong>{selectedProduct.name}</strong>? This cannot be undone.
            </p>
            {formErrors._ && (
              <Alert variant="error" className="mt-2">
                {formErrors._}
              </Alert>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={submitLoading}>
                {submitLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
