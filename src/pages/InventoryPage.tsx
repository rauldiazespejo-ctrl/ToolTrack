import { useState } from 'react'
import { Package, Plus, Edit2, Trash2, ArrowUpCircle, ArrowDownCircle, DollarSign, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Modal } from '../components/ui/Modal'
import { Table, TableRow, TableCell } from '../components/ui/Table'
import { StatCard } from '../components/shared/StatCard'
import { useInventory } from '../hooks/useInventory'
import { useSearch } from '../hooks/useSearch'
import { formatCurrency } from '../lib/utils'
import type { InventoryItem } from '../lib/supabase'

const categories = [
  { value: '', label: 'Todos' },
  { value: 'electrodos', label: 'Electrodos' },
  { value: 'discos', label: 'Discos' },
  { value: 'gases', label: 'Gases' },
  { value: 'epp', label: 'EPP' },
  { value: 'repuestos', label: 'Repuestos' },
]

const warehouses = [
  { value: '', label: 'Todos' },
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

const categoryBadgeVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  electrodos: 'info',
  discos: 'warning',
  gases: 'success',
  epp: 'danger',
  repuestos: 'default',
}

const adjustReasons = [
  { value: 'compra', label: 'Compra' },
  { value: 'uso_proyecto', label: 'Uso en proyecto' },
  { value: 'merma', label: 'Merma' },
  { value: 'devolucion', label: 'Devolucion' },
]

type FormData = Omit<InventoryItem, 'id'>

const emptyForm: FormData = {
  name: '',
  category: 'electrodos',
  quantity: 0,
  min_stock: 0,
  unit: 'unidad',
  location_warehouse: 'Bodega Quilicura',
  supplier: '',
  last_restock: new Date().toISOString().split('T')[0],
  cost_per_unit: 0,
}

export function InventoryPage() {
  const { inventory, stats, create, update, remove, adjustStock } = useInventory()
  const { query: search } = useSearch()
  const [filterCategory, setFilterCategory] = useState('')
  const [filterWarehouse, setFilterWarehouse] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null)
  const [adjustAmount, setAdjustAmount] = useState(0)
  const [adjustDirection, setAdjustDirection] = useState<'in' | 'out'>('in')
  const [adjustReason, setAdjustReason] = useState('compra')
  const [form, setForm] = useState<FormData>(emptyForm)

  const filtered = inventory.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.supplier.toLowerCase().includes(search.toLowerCase())
    const matchCategory = !filterCategory || item.category === filterCategory
    const matchWarehouse = !filterWarehouse || item.location_warehouse === filterWarehouse
    return matchSearch && matchCategory && matchWarehouse
  })

  function openCreate() {
    setForm(emptyForm)
    setEditingItem(null)
    setShowCreateModal(true)
  }

  function openEdit(item: InventoryItem) {
    setForm({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      min_stock: item.min_stock,
      unit: item.unit,
      location_warehouse: item.location_warehouse,
      supplier: item.supplier,
      last_restock: item.last_restock,
      cost_per_unit: item.cost_per_unit,
    })
    setEditingItem(item)
    setShowCreateModal(true)
  }

  function openAdjust(item: InventoryItem) {
    setAdjustItem(item)
    setAdjustAmount(0)
    setAdjustDirection('in')
    setAdjustReason('compra')
    setShowAdjustModal(true)
  }

  function handleSave() {
    if (form.cost_per_unit < 0) {
      toast.error('El costo por unidad no puede ser negativo')
      return
    }
    if (form.quantity < 0) {
      toast.error('La cantidad no puede ser negativa')
      return
    }

    void (async () => {
      try {
        if (editingItem) {
          await update(editingItem.id, form)
          toast.success('Item actualizado')
        } else {
          await create(form)
          toast.success('Item creado')
        }
        setShowCreateModal(false)
      } catch {
        toast.error('Error al guardar el item')
      }
    })()
  }

  function handleAdjust() {
    if (!adjustItem) return
    const delta = adjustDirection === 'in' ? adjustAmount : -adjustAmount
    void (async () => {
      try {
        await adjustStock(adjustItem.id, delta, adjustReason)
        toast.success('Stock ajustado')
        setShowAdjustModal(false)
      } catch {
        toast.error('Error al ajustar stock')
      }
    })()
  }

  function handleDeleteItem(id: string) {
    void (async () => {
      try {
        await remove(id)
        toast.success('Item eliminado')
      } catch {
        toast.error('Error al eliminar item')
      }
    })()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Inventario de Consumibles</h1>
        <div className="flex items-center gap-3">
          <Button icon={<Plus size={16} />} onClick={openCreate}>Nuevo Item</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={<Package size={20} />} label="Total Items" value={stats.totalItems} />
        <StatCard icon={<AlertTriangle size={20} />} label="Items Stock Bajo" value={stats.lowStock} className={stats.lowStock > 0 ? 'border-red-500/30' : ''} />
        <StatCard icon={<DollarSign size={20} />} label="Valor Total Inventario" value={formatCurrency(stats.valorTotal)} />
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--text-secondary)]">Categoria:</span>
          {categories.map(c => (
            <button
              key={c.value}
              onClick={() => setFilterCategory(c.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                filterCategory === c.value
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--text-secondary)]">Bodega:</span>
          <select
            value={filterWarehouse}
            onChange={e => setFilterWarehouse(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1.5 text-xs text-[var(--text-primary)] outline-none cursor-pointer"
          >
            {warehouses.map(w => (
              <option key={w.value} value={w.value}>{w.label}</option>
            ))}
          </select>
        </div>
      </div>

      <Card padding={false}>
        <Table headers={['Nombre', 'Categoria', 'Stock', 'Minimo', 'Unidad', 'Bodega', 'Proveedor', 'Acciones']}>
          {filtered.map(item => {
            const isLow = item.quantity < item.min_stock
            const stockPercent = Math.min(100, item.min_stock > 0 ? (item.quantity / item.min_stock) * 100 : 100)
            return (
              <TableRow key={item.id} className={isLow ? 'bg-red-500/5' : ''}>
                <TableCell>
                  <span className="font-medium">{item.name}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={categoryBadgeVariant[item.category] || 'default'}>
                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={isLow ? 'text-red-400 font-semibold' : ''}>{item.quantity}</span>
                    <div className="h-1.5 w-16 rounded-full bg-[var(--bg-secondary)]">
                      <div
                        className={`h-full rounded-full transition-all ${isLow ? 'bg-red-400' : 'bg-green-400'}`}
                        style={{ width: `${stockPercent}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>{item.min_stock}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>
                  <span className="text-xs">{item.location_warehouse}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-[var(--text-secondary)]">{item.supplier}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openAdjust(item)} className="rounded p-1 text-[var(--text-secondary)] hover:bg-white/5 hover:text-green-400 transition-colors cursor-pointer" title="Ajustar stock">
                      <ArrowUpCircle size={16} />
                    </button>
                    <button onClick={() => openEdit(item)} className="rounded p-1 text-[var(--text-secondary)] hover:bg-white/5 hover:text-blue-400 transition-colors cursor-pointer" title="Editar">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => { void handleDeleteItem(item.id); }} className="rounded p-1 text-[var(--text-secondary)] hover:bg-white/5 hover:text-red-400 transition-colors cursor-pointer" title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </Table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-[var(--text-secondary)]">No se encontraron items</div>
        )}
      </Card>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={editingItem ? 'Editar Item' : 'Nuevo Item'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <Select
            label="Categoria"
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value as InventoryItem['category'] })}
            options={categories.filter(c => c.value !== '')}
          />
          <Select
            label="Unidad"
            value={form.unit}
            onChange={e => setForm({ ...form, unit: e.target.value as InventoryItem['unit'] })}
            options={units}
          />
          <Input label="Cantidad" type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} />
          <Input label="Stock Minimo" type="number" value={form.min_stock} onChange={e => setForm({ ...form, min_stock: Number(e.target.value) })} />
          <Select
            label="Bodega"
            value={form.location_warehouse}
            onChange={e => setForm({ ...form, location_warehouse: e.target.value })}
            options={warehouses.filter(w => w.value !== '')}
          />
          <Input label="Proveedor" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} />
          <Input label="Costo por Unidad" type="number" value={form.cost_per_unit} onChange={e => setForm({ ...form, cost_per_unit: Number(e.target.value) })} />
          <Input label="Ultimo Restock" type="date" value={form.last_restock} onChange={e => setForm({ ...form, last_restock: e.target.value })} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
          <Button onClick={handleSave}>{editingItem ? 'Guardar Cambios' : 'Crear Item'}</Button>
        </div>
      </Modal>

      <Modal isOpen={showAdjustModal} onClose={() => setShowAdjustModal(false)} title="Ajuste de Stock" size="sm">
        {adjustItem && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-secondary)]">
              <span className="font-medium text-[var(--text-primary)]">{adjustItem.name}</span>
              <br />Stock actual: <span className="font-semibold">{adjustItem.quantity} {adjustItem.unit}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setAdjustDirection('in')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium transition-colors cursor-pointer ${
                  adjustDirection === 'in'
                    ? 'border-green-500/50 bg-green-500/10 text-green-400'
                    : 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                }`}
              >
                <ArrowUpCircle size={16} /> Entrada
              </button>
              <button
                onClick={() => setAdjustDirection('out')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium transition-colors cursor-pointer ${
                  adjustDirection === 'out'
                    ? 'border-red-500/50 bg-red-500/10 text-red-400'
                    : 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                }`}
              >
                <ArrowDownCircle size={16} /> Salida
              </button>
            </div>
            <Input label="Cantidad" type="number" min={0} value={adjustAmount} onChange={e => setAdjustAmount(Number(e.target.value))} />
            <Select label="Motivo" value={adjustReason} onChange={e => setAdjustReason(e.target.value)} options={adjustReasons} />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowAdjustModal(false)}>Cancelar</Button>
              <Button onClick={handleAdjust} disabled={adjustAmount <= 0}>Aplicar Ajuste</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
