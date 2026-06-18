import { useMemo, useState } from 'react'
import { Plus, Package, Warehouse, AlertTriangle, ArrowUpCircle, ArrowDownCircle, ClipboardCheck } from 'lucide-react'
import { toast } from '../lib/toast'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Modal } from '../components/ui/Modal'
import { Table, TableCell, TableRow } from '../components/ui/Table'
import { StatCard } from '../components/shared/StatCard'
import { useInventory } from '../hooks/useInventory'
import { useRequests } from '../hooks/useRequests'
import { useSearch } from '../hooks/useSearch'
import type { InventoryItem } from '../lib/supabase'

const categories = [
  { value: 'electrodos', label: 'Electrodos' },
  { value: 'discos', label: 'Discos' },
  { value: 'gases', label: 'Gases' },
  { value: 'epp', label: 'EPP' },
  { value: 'repuestos', label: 'Repuestos' },
]

const warehouses = [
  { value: 'Bodega Quilicura', label: 'Bodega Quilicura' },
  { value: 'Planta Central Santiago', label: 'Planta Central Santiago' },
  { value: 'Proyecto Los Bronces', label: 'Proyecto Los Bronces' },
]

const units = [
  { value: 'unidad', label: 'Unidad' },
  { value: 'kg', label: 'Kg' },
  { value: 'litro', label: 'Litro' },
  { value: 'metro', label: 'Metro' },
  { value: 'caja', label: 'Caja' },
  { value: 'par', label: 'Par' },
  { value: 'cilindro', label: 'Cilindro' },
]

const categoryVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  electrodos: 'info',
  discos: 'warning',
  gases: 'success',
  epp: 'danger',
  repuestos: 'default',
}

type FormData = Omit<InventoryItem, 'id'>

const emptyForm: FormData = {
  name: '',
  category: 'electrodos',
  quantity: 0,
  min_stock: 0,
  unit: 'unidad',
  location_warehouse: 'Bodega Quilicura',
  contract_code: '',
  ceco: '',
  supplier: '',
  last_restock: new Date().toISOString().split('T')[0],
  cost_per_unit: 0,
}

export function WarehousePage() {
  const { inventory, lowStockItems, stats, create, update, adjustStock } = useInventory()
  const { requests, markReadyToDispatch } = useRequests()
  const { query } = useSearch()

  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null)
  const [adjustAmount, setAdjustAmount] = useState('0')
  const [adjustDirection, setAdjustDirection] = useState<'in' | 'out'>('in')
  const [adjustReason, setAdjustReason] = useState('compra')

  const filteredInventory = useMemo(() => {
    const q = query.trim().toLowerCase()
    return inventory.filter(item => !q || item.name.toLowerCase().includes(q) || item.supplier.toLowerCase().includes(q))
  }, [inventory, query])

  function openCreate() {
    setEditingItem(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  function openEdit(item: InventoryItem) {
    setEditingItem(item)
    setForm({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      min_stock: item.min_stock,
      unit: item.unit,
      location_warehouse: item.location_warehouse,
      contract_code: item.contract_code || '',
      ceco: item.ceco || '',
      supplier: item.supplier,
      last_restock: item.last_restock,
      cost_per_unit: item.cost_per_unit,
    })
    setShowModal(true)
  }

  function openAdjust(item: InventoryItem) {
    setAdjustItem(item)
    setAdjustAmount('0')
    setAdjustDirection('in')
  }

  async function handleSave() {
    try {
      if (form.quantity < 0 || form.cost_per_unit < 0 || form.min_stock < 0) {
        toast.error('Los valores no pueden ser negativos')
        return
      }
      if (editingItem) {
        await update(editingItem.id, form)
        toast.success('Existencia actualizada')
      } else {
        await create(form)
        toast.success('Existencia creada')
      }
      setShowModal(false)
    } catch {
      toast.error('No se pudo guardar la existencia')
    }
  }

  async function handleAdjust() {
    if (!adjustItem) return
    const delta = Number(adjustAmount) || 0
    if (delta <= 0) {
      toast.error('Ingresa una cantidad mayor a cero')
      return
    }
    try {
      await adjustStock(adjustItem.id, adjustDirection === 'in' ? delta : -delta, adjustReason)
      toast.success('Stock ajustado')
      setAdjustItem(null)
    } catch {
      toast.error('No se pudo ajustar el stock')
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Package size={20} />} label="Existencias" value={stats.totalItems} />
        <StatCard icon={<AlertTriangle size={20} />} label="Stock Bajo" value={stats.lowStock} className={stats.lowStock > 0 ? 'border-red-500/30' : ''} />
        <StatCard icon={<Warehouse size={20} />} label="Bodegas" value={warehouses.length} />
        <StatCard icon={<ClipboardCheck size={20} />} label="Solicitudes en cola" value={requests.filter(item => item.status === 'warehouse_queue').length} />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Bodega y Existencias</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Alta, ajuste y cola de despacho sobre inventario real.
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>Nueva Existencia</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card title="Inventario Operativo" action={<span className="text-xs text-[var(--text-secondary)]">{filteredInventory.length} items</span>} padding={false}>
          <Table headers={['Nombre', 'Categoria', 'Stock', 'Ubicación', 'Proveedor', 'Acciones']}>
            {filteredInventory.map(item => {
              const isLow = item.quantity < item.min_stock
              return (
                <TableRow key={item.id} className={isLow ? 'bg-red-500/5' : ''}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-[var(--text-secondary)] font-mono">{item.contract_code || 'Sin contrato'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={categoryVariant[item.category]}>
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className={`text-sm font-semibold ${isLow ? 'text-red-400' : ''}`}>{item.quantity} {item.unit}</p>
                      <p className="text-xs text-[var(--text-secondary)]">Mín: {item.min_stock}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{item.location_warehouse}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{item.ceco || 'Sin CECO'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-[var(--text-secondary)]">{item.supplier}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label="Ajustar stock"
                        onClick={() => openAdjust(item)}
                        className="rounded p-1 text-[var(--text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--accent)]"
                      >
                        <ArrowUpCircle size={14} />
                      </button>
                      <button
                        type="button"
                        aria-label="Editar existencia"
                        onClick={() => openEdit(item)}
                        className="rounded p-1 text-[var(--text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--accent)]"
                      >
                        <ArrowDownCircle size={14} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </Table>
        </Card>

        <Card title="Cola de Bodega" action={<span className="text-xs text-[var(--text-secondary)]">Pendientes y listos</span>} padding={false}>
          <div className="divide-y divide-[var(--border)]">
            {requests.filter(item => item.status === 'warehouse_queue' || item.status === 'ready_to_dispatch').map(request => (
              <div key={request.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{request.title}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{request.request_code}</p>
                  </div>
                  <Badge variant={request.status === 'ready_to_dispatch' ? 'info' : 'warning'}>
                    {request.status === 'ready_to_dispatch' ? 'Listo' : 'En cola'}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-[var(--text-secondary)]">
                  {request.requested_item_name} · {request.quantity} unidad(es) · {request.location_site}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {request.status === 'warehouse_queue' && (
                    <Button size="sm" variant="secondary" onClick={() => { void markReadyToDispatch(request.id); }}>
                      Listo para despacho
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {requests.filter(item => item.status === 'warehouse_queue' || item.status === 'ready_to_dispatch').length === 0 && (
              <div className="p-8 text-center text-sm text-[var(--text-secondary)]">Sin solicitudes en cola.</div>
            )}
          </div>
        </Card>
      </div>

      <Card title="Stock Bajo" padding={false}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {lowStockItems.map(item => (
            <div key={item.id} className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
              <p className="text-sm font-medium text-[var(--text-primary)]">{item.name}</p>
              <p className="text-xs text-[var(--text-secondary)]">{item.location_warehouse}</p>
              <p className="mt-2 text-sm font-semibold text-red-400">{item.quantity} {item.unit}</p>
            </div>
          ))}
          {lowStockItems.length === 0 && (
            <div className="py-10 text-center text-sm text-[var(--text-secondary)] md:col-span-2 xl:col-span-3">
              No hay existencias bajo mínimo.
            </div>
          )}
        </div>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Editar Existencia' : 'Nueva Existencia'} size="lg">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Nombre" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} />
          <Select label="Categoria" options={categories} value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value as InventoryItem['category'] }))} />
          <Select label="Unidad" options={units} value={form.unit} onChange={e => setForm(prev => ({ ...prev, unit: e.target.value as InventoryItem['unit'] }))} />
          <Select label="Bodega" options={warehouses} value={form.location_warehouse} onChange={e => setForm(prev => ({ ...prev, location_warehouse: e.target.value }))} />
          <Input label="Contrato" value={form.contract_code || ''} onChange={e => setForm(prev => ({ ...prev, contract_code: e.target.value }))} />
          <Input label="CECO" value={form.ceco || ''} onChange={e => setForm(prev => ({ ...prev, ceco: e.target.value }))} />
          <Input label="Cantidad" type="number" value={form.quantity} onChange={e => setForm(prev => ({ ...prev, quantity: Number(e.target.value) }))} />
          <Input label="Stock Mínimo" type="number" value={form.min_stock} onChange={e => setForm(prev => ({ ...prev, min_stock: Number(e.target.value) }))} />
          <Input label="Proveedor" value={form.supplier} onChange={e => setForm(prev => ({ ...prev, supplier: e.target.value }))} />
          <Input label="Costo Unitario" type="number" value={form.cost_per_unit} onChange={e => setForm(prev => ({ ...prev, cost_per_unit: Number(e.target.value) }))} />
          <Input label="Último Restock" type="date" value={form.last_restock} onChange={e => setForm(prev => ({ ...prev, last_restock: e.target.value }))} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button onClick={() => { void handleSave(); }}>Guardar</Button>
        </div>
      </Modal>

      <Modal isOpen={!!adjustItem} onClose={() => setAdjustItem(null)} title="Ajuste de Stock" size="sm">
        {adjustItem && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-secondary)]">
              <span className="font-medium text-[var(--text-primary)]">{adjustItem.name}</span>
              <br />Actual: {adjustItem.quantity} {adjustItem.unit}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setAdjustDirection('in')}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm ${adjustDirection === 'in' ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]'}`}
              >
                Entrada
              </button>
              <button
                onClick={() => setAdjustDirection('out')}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm ${adjustDirection === 'out' ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]'}`}
              >
                Salida
              </button>
            </div>
            <Input label="Cantidad" type="number" min={0} value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} />
            <Input label="Motivo" value={adjustReason} onChange={e => setAdjustReason(e.target.value)} />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setAdjustItem(null)}>Cancelar</Button>
              <Button onClick={() => { void handleAdjust(); }}>Aplicar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
