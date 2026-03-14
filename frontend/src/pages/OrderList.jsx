import { useCallback, useEffect, useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import { Label } from '../components/ui/label'
import { Input } from '../components/ui/input'
import { useToast } from '../contexts/ToastContext'
import { orderService } from '../services/orderService'
import { productService } from '../services/productService'
import { getApiErrorMessage } from '../utils/apiError'
import { DEFAULT_PER_PAGE, ORDER_STATUSES } from '../utils/constants'
import { formatCurrency, formatDate } from '../utils/format'
import { ShoppingBag, Plus, Loader2, ChevronLeft, ChevronRight, SlidersHorizontal, Edit3, PackageOpen } from 'lucide-react'

export default function OrderList() {
  const toast = useToast()
  const [list, setList] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [perPage] = useState(DEFAULT_PER_PAGE)
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
    try {
      const params = { page, per_page: perPage }
      if (statusFilter) params.status = statusFilter
      const data = await orderService.list(params)
      setList(data)
    } catch (err) {
      const message = getApiErrorMessage(err)
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
      toast.error(getApiErrorMessage(err))
    } finally {
      setSubmitLoading(false)
    }
  }

  const lastPage = list?.last_page ?? 1
  const total = list?.total ?? 0

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success'
      case 'shipped': return 'default'
      case 'processing': return 'warning'
      case 'pending': return 'secondary'
      case 'cancelled': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Transaction Stream</h1>
          <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
            <ShoppingBag className="h-4 w-4" />
            Order Nexus
          </div>
        </div>
        <Button onClick={openCreate} className="h-12 px-8 text-base font-black uppercase tracking-widest bg-primary text-white shadow-glow-purple hover:shadow-primary/40">
          <Plus className="h-5 w-5 mr-2" />
          Log Transaction
        </Button>
      </div>

      <Card className="border-white/5 bg-white/5 shadow-netflix overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row items-center gap-6 p-8 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-4 w-full lg:w-auto">
                <SlidersHorizontal className="h-5 w-5 text-slate-600 mr-2" />
                <select 
                    className="h-12 w-full lg:w-64 rounded-xl border border-white/10 bg-black/40 px-4 py-1 text-sm text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                >
                    <option value="" className="bg-background">Fulfillment Status: All</option>
                    {ORDER_STATUSES.map(s => (
                        <option key={s.value} value={s.value} className="bg-background">{s.label}</option>
                    ))}
                </select>
            </div>
          </div>

          <div className="relative">
            {loading && !list && (
              <div className="p-8 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-12 w-full animate-pulse rounded-xl bg-white/5" />
                  </div>
                ))}
              </div>
            )}
            
            <Table>
              <TableHeader className="bg-white/[0.01]">
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="w-[100px] text-slate-500 font-black uppercase tracking-widest text-[10px]">Reference</TableHead>
                  <TableHead className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Client</TableHead>
                  <TableHead className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Entitlement</TableHead>
                  <TableHead className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Valuation</TableHead>
                  <TableHead className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Fulfillment</TableHead>
                  <TableHead className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Timestamp</TableHead>
                  <TableHead className="text-right text-slate-500 font-black uppercase tracking-widest text-[10px]">Operations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && !list ? null : (list?.data?.length === 0 ? (
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableCell colSpan={7} className="h-48 text-center text-slate-600 font-bold uppercase tracking-widest text-xs">
                      No transactions detected in the stream.
                    </TableCell>
                  </TableRow>
                ) : (
                  list?.data?.map((order) => (
                    <TableRow key={order.id} className="border-white/5 hover:bg-white/[0.03] transition-all group">
                      <TableCell className="font-mono text-xs text-slate-700">#{order.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                                <span className="text-[10px] font-black text-primary uppercase">C{order.user_id || '?'}</span>
                            </div>
                            <span className="text-sm font-bold text-white tracking-tight">Client #{order.user_id || 'Alpha'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-black text-white group-hover:text-primary transition-colors">{order.product?.name ?? 'Ghost Asset'}</span>
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Quantity: <span className="text-white">{order.quantity}</span> units</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-black text-white text-lg">
                        {formatCurrency(order.total_price)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(order.status)} className="px-4 py-1 font-black uppercase tracking-tighter shadow-sm animate-pulse">
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(order)} className="h-10 w-10 text-slate-500 hover:text-white hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                          <Edit3 className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between p-8 border-t border-white/5 bg-white/[0.01] gap-6">
            <p className="text-xs font-black text-slate-600 uppercase tracking-[0.2em]">
              Processing <span className="text-white">{list?.data?.length ?? 0}</span> of <span className="text-white">{total}</span> signals
            </p>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="h-10 w-10 rounded-full border-white/10 hover:bg-white/10 text-white disabled:opacity-20"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-white px-3 py-1 rounded-lg bg-primary shadow-glow-purple">{page}</span>
                <span className="text-xs text-slate-700 font-bold">/</span>
                <span className="text-xs font-black text-slate-500 px-2">{lastPage}</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                disabled={page >= lastPage}
                onClick={() => setPage(p => p + 1)}
                className="h-10 w-10 rounded-full border-white/10 hover:bg-white/10 text-white disabled:opacity-20"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[550px] bg-background border-white/10 p-0 overflow-hidden shadow-netflix">
          <div className="h-2 bg-primary w-full animate-pulse" />
          <div className="p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tighter">Forge Transaction</DialogTitle>
              <DialogDescription className="text-slate-500 font-bold uppercase tracking-widest text-xs">Log a manual transaction event into the stream.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-600">Secure Asset Select</Label>
                <select 
                  className="flex h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={createForm.product_id}
                  onChange={(e) => setCreateForm((p) => ({ ...p, product_id: e.target.value }))}
                >
                  <option value="" className="bg-background">Choose allocation target...</option>
                  {products.map((p) => (
                      <option key={p.id} value={p.id} className="bg-background">{p.name} ({formatCurrency(p.price)})</option>
                  ))}
                </select>
                {formErrors.product_id && <p className="text-xs font-bold text-destructive italic">{formErrors.product_id}</p>}
              </div>
              <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-600">Allocation Volume</Label>
                      <Input type="number" min="1" value={createForm.quantity} onChange={(e) => setCreateForm(p => ({ ...p, quantity: e.target.value }))} className="bg-black/40 border-white/10 text-white h-12" />
                      {formErrors.quantity && <p className="text-xs font-bold text-destructive italic">{formErrors.quantity}</p>}
                  </div>
                  <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-600">Initial State</Label>
                      <select 
                          className="flex h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                          value={createForm.status}
                          onChange={(e) => setCreateForm(p => ({ ...p, status: e.target.value }))}
                      >
                          {ORDER_STATUSES.map(s => <option key={s.value} value={s.value} className="bg-background">{s.label}</option>)}
                      </select>
                  </div>
              </div>
              <DialogFooter className="pt-6">
                <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)} className="h-12 text-slate-500 font-black uppercase tracking-widest">Abort</Button>
                <Button type="submit" disabled={submitLoading} className="h-12 px-8 bg-primary text-white font-black uppercase tracking-widest shadow-glow-purple">
                  {submitLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Execute Transaction
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[450px] bg-background border-white/10 p-0 overflow-hidden shadow-netflix">
          <div className="h-2 bg-primary w-full animate-pulse" />
          <div className="p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tighter">Protocol Update</DialogTitle>
              <DialogDescription className="text-slate-500 font-bold uppercase tracking-widest text-xs">Modify fulfillment state for Registry #{selectedOrder?.id}.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-6 text-center">
              <div className="rounded-2xl bg-white/[0.02] p-6 border border-white/5 shadow-inner">
                  <div className="flex flex-col items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 shadow-glow-purple flex items-center justify-center border border-primary/20">
                          <PackageOpen className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                          <p className="text-lg font-black text-white tracking-tighter uppercase">{selectedOrder?.product?.name}</p>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Payload: {selectedOrder?.quantity} Units</p>
                      </div>
                  </div>
              </div>
              <div className="space-y-2 text-left">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-600">New Fulfillment State</Label>
                  <select 
                      className="flex h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={editForm.status}
                      onChange={(e) => setEditForm(p => ({ ...p, status: e.target.value }))}
                  >
                      {ORDER_STATUSES.map(s => <option key={s.value} value={s.value} className="bg-background">{s.label}</option>)}
                  </select>
              </div>
              <DialogFooter className="pt-6">
                <Button type="button" variant="ghost" onClick={() => setEditOpen(false)} className="h-12 text-slate-500 font-black uppercase tracking-widest">Negative, Abort</Button>
                <Button type="submit" disabled={submitLoading} className="h-12 px-8 bg-primary text-white font-black uppercase tracking-widest shadow-glow-purple">
                  {submitLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Commit State
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

