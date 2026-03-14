import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
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
import { useToast } from '../contexts/ToastContext'
import { productService } from '../services/productService'
import { getApiErrorMessage, getApiValidationErrors } from '../utils/apiError'
import { DEFAULT_PER_PAGE } from '../utils/constants'
import { formatCurrency } from '../utils/format'
import { Package, Plus, Search, Edit2, Trash2, Loader2, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'

const initialProductForm = { name: '', description: '', price: '', stock: '' }

export default function ProductList() {
  const toast = useToast()
  const [list, setList] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [perPage] = useState(DEFAULT_PER_PAGE)
  const [nameFilter, setNameFilter] = useState('')
  const [sortPrice, setSortPrice] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [form, setForm] = useState(initialProductForm)
  const [formErrors, setFormErrors] = useState({})
  const [submitLoading, setSubmitLoading] = useState(false)

  const paramsRef = useRef({ page, perPage, nameFilter, sortPrice })
  paramsRef.current = { page, perPage, nameFilter, sortPrice }

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const { page: p, perPage: pp, nameFilter: nf, sortPrice: sp } = paramsRef.current
      const params = { page: p, per_page: pp }
      if (nf?.trim()) params.name = nf.trim()
      if (sp) params.sort_price = sp
      const data = await productService.list(params)
      setList(data)
    } catch (err) {
      const message = getApiErrorMessage(err)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchList()
    }, nameFilter ? 300 : 0)
    return () => clearTimeout(timer)
  }, [fetchList, nameFilter, sortPrice, page])

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
      setSelectedProduct(null)
      toast.success('Product updated successfully.')
      fetchList()
    } catch (err) {
      const validation = getApiValidationErrors(err)
      if (Object.keys(validation).length > 0) {
        setFormErrors(validation)
        toast.error('Please fix the validation errors.')
      } else {
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
      toast.error(getApiErrorMessage(err))
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const lastPage = list?.last_page ?? 1
  const total = list?.total ?? 0

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Vault Catalog</h1>
          <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
            <Package className="h-4 w-4" />
            Inventory Control
          </div>
        </div>
        <Button onClick={openCreate} className="h-12 px-8 text-base font-black uppercase tracking-widest bg-primary text-white shadow-glow-purple hover:shadow-primary/40">
          <Plus className="h-5 w-5 mr-2" />
          Acquire Item
        </Button>
      </div>

      <Card className="border-white/5 bg-white/5 shadow-netflix overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row items-center gap-6 p-8 border-b border-white/5 bg-white/[0.02]">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
              <Input
                placeholder="Search the archives..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="pl-12 bg-black/40 border-white/10 text-white placeholder:text-slate-700 h-12 rounded-xl focus-visible:ring-primary/50"
              />
            </div>
            <div className="flex items-center gap-4 w-full lg:w-auto">
                <SlidersHorizontal className="h-5 w-5 text-slate-600 ml-2" />
                <select 
                    className="h-12 w-full lg:w-64 rounded-xl border border-white/10 bg-black/40 px-4 py-1 text-sm text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={sortPrice}
                    onChange={(e) => setSortPrice(e.target.value)}
                >
                    <option value="" className="bg-background">Sort by Value</option>
                    <option value="asc" className="bg-background">Value: Low to High</option>
                    <option value="desc" className="bg-background">Value: High to Low</option>
                </select>
            </div>
          </div>

          <div className="relative">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                <Loader2 className="h-12 w-12 animate-spin text-primary shadow-glow-purple" />
              </div>
            )}
            
            <Table>
              <TableHeader className="bg-white/[0.01]">
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="w-[100px] text-slate-500 font-black uppercase tracking-widest text-[10px]">Registry ID</TableHead>
                  <TableHead className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Entity</TableHead>
                  <TableHead className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Valuation</TableHead>
                  <TableHead className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Allocation</TableHead>
                  <TableHead className="text-right text-slate-500 font-black uppercase tracking-widest text-[10px]">Operations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list?.data?.length === 0 ? (
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableCell colSpan={5} className="h-48 text-center text-slate-600 font-bold uppercase tracking-widest text-xs">
                      The archives are empty.
                    </TableCell>
                  </TableRow>
                ) : (
                  list?.data?.map((product) => (
                    <TableRow key={product.id} className="border-white/5 hover:bg-white/[0.03] transition-all group">
                      <TableCell className="font-mono text-xs text-slate-700">#{product.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-black text-white group-hover:text-primary transition-colors">{product.name}</span>
                          <span className="text-xs text-slate-500 line-clamp-1 max-w-[400px]">
                            {product.description || 'Null pointer description'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-black text-white text-lg">
                        {formatCurrency(product.price)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={product.stock > 10 ? "success" : product.stock > 0 ? "warning" : "destructive"}
                          className="px-4 py-1 font-black uppercase tracking-tighter shadow-sm"
                        >
                          {product.stock} units
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(product)} className="h-10 w-10 text-slate-500 hover:text-white hover:bg-white/10 rounded-full">
                            <Edit2 className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDelete(product)} className="h-10 w-10 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-full">
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between p-8 border-t border-white/5 bg-white/[0.01] gap-6">
            <p className="text-xs font-black text-slate-600 uppercase tracking-[0.2em]">
              Synchronizing <span className="text-white">{list?.data?.length ?? 0}</span> of <span className="text-white">{total}</span> assets
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

      {/* Forms & Dialogs */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[550px] bg-background border-white/10 p-0 overflow-hidden shadow-netflix">
          <div className="h-2 bg-primary w-full animate-pulse" />
          <div className="p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tighter">Manifest Entity</DialogTitle>
              <DialogDescription className="text-slate-500 font-bold uppercase tracking-widest text-xs">Inject new data into the global catalog.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-600">Entity Name</Label>
                <Input name="name" value={form.name} onChange={handleFormChange} placeholder="Cyberware Optic..." className="bg-black/40 border-white/10 text-white h-12" />
                {formErrors.name && <p className="text-xs font-bold text-destructive italic">{formErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-600">Physical Spec</Label>
                <textarea 
                  name="description"
                  className="flex min-h-[120px] w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enhanced visual sensory array..."
                  value={form.description}
                  onChange={handleFormChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-600">Credit Value ($)</Label>
                  <Input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleFormChange} className="bg-black/40 border-white/10 text-white h-12" />
                  {formErrors.price && <p className="text-xs font-bold text-destructive italic">{formErrors.price}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-600">Archive Count</Label>
                  <Input name="stock" type="number" min="0" value={form.stock} onChange={handleFormChange} className="bg-black/40 border-white/10 text-white h-12" />
                  {formErrors.stock && <p className="text-xs font-bold text-destructive italic">{formErrors.stock}</p>}
                </div>
              </div>
              <DialogFooter className="pt-6">
                <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)} className="h-12 text-slate-500 font-black uppercase tracking-widest">Abort</Button>
                <Button type="submit" disabled={submitLoading} className="h-12 px-8 bg-primary text-white font-black uppercase tracking-widest shadow-glow-purple">
                  {submitLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Manifest Now
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[550px] bg-background border-white/10 p-0 overflow-hidden shadow-netflix">
          <div className="h-2 bg-primary w-full animate-pulse" />
          <div className="p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tighter">Modify Sequence</DialogTitle>
              <DialogDescription className="text-slate-500 font-bold uppercase tracking-widest text-xs">Update asset parameters and valuation.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-600">Entity Name</Label>
                <Input name="name" value={form.name} onChange={handleFormChange} className="bg-black/40 border-white/10 text-white h-12" />
                {formErrors.name && <p className="text-xs font-bold text-destructive italic">{formErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-600">Physical Spec</Label>
                <textarea 
                  name="description"
                  className="flex min-h-[120px] w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={form.description}
                  onChange={handleFormChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-600">Credit Value ($)</Label>
                  <Input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleFormChange} className="bg-black/40 border-white/10 text-white h-12" />
                  {formErrors.price && <p className="text-xs font-bold text-destructive italic">{formErrors.price}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-600">Archive Count</Label>
                  <Input name="stock" type="number" min="0" value={form.stock} onChange={handleFormChange} className="bg-black/40 border-white/10 text-white h-12" />
                  {formErrors.stock && <p className="text-xs font-bold text-destructive italic">{formErrors.stock}</p>}
                </div>
              </div>
              <DialogFooter className="pt-6">
                <Button type="button" variant="ghost" onClick={() => setEditOpen(false)} className="h-12 text-slate-500 font-black uppercase tracking-widest">Abort</Button>
                <Button type="submit" disabled={submitLoading} className="h-12 px-8 bg-primary text-white font-black uppercase tracking-widest shadow-glow-purple">
                  {submitLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Commit Edits
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[450px] bg-background border-primary/20 p-8 shadow-glow-purple">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-3xl font-black text-primary uppercase italic tracking-tighter">Purge Protocol</DialogTitle>
            <DialogDescription className="text-white font-bold text-base leading-relaxed">
              Are you certain you wish to purge <span className="text-primary tracking-tight">"{selectedProduct?.name}"</span> from the global registry? This procedure is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-8 gap-4 sm:flex-row flex-col">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)} className="h-12 text-slate-500 font-black uppercase tracking-widest">Negative, Abort</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitLoading} className="h-12 px-8 font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
              {submitLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Execute Purge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

