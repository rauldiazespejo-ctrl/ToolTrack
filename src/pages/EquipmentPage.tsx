import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2, Package, Truck, HardHat, ShieldCheck } from 'lucide-react'
import { toast } from '../lib/toast'
import { useEquipment } from '../hooks/useEquipment'
import { useSearch } from '../hooks/useSearch'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Modal } from '../components/ui/Modal'
import { Table, TableRow, TableCell } from '../components/ui/Table'
import { StatCard } from '../components/shared/StatCard'

import type { Equipment } from '../lib/supabase'

const typeLabels: Record<string, string> = {
  herramienta: 'Herramienta',
  vehiculo: 'Vehículo',
  maquinaria: 'Maquinaria',
  epp: 'EPP',
}

const statusLabels: Record<string, string> = {
  disponible: 'Disponible',
  en_uso: 'En Uso',
  mantenimiento: 'Mantenimiento',
  fuera_servicio: 'Fuera de Servicio',
}

const typeOptions = [
  { value: '', label: 'Todos' },
  { value: 'herramienta', label: 'Herramienta' },
  { value: 'vehiculo', label: 'Vehículo' },
  { value: 'maquinaria', label: 'Maquinaria' },
  { value: 'epp', label: 'EPP' },
]

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'disponible', label: 'Disponible' },
  { value: 'en_uso', label: 'En Uso' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'fuera_servicio', label: 'Fuera de Servicio' },
]

const siteOptions = [
  { value: '', label: 'Todos' },
  { value: 'Planta Central Santiago', label: 'Planta Central Santiago' },
  { value: 'Proyecto Los Bronces', label: 'Proyecto Los Bronces' },
  { value: 'Bodega Quilicura', label: 'Bodega Quilicura' },
]

const formTypeOptions = typeOptions.filter(o => o.value !== '')
const formStatusOptions = statusOptions.filter(o => o.value !== '')
const formSiteOptions = siteOptions.filter(o => o.value !== '')

const typeBadgeVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  herramienta: 'info',
  vehiculo: 'warning',
  maquinaria: 'default',
  epp: 'success',
}

const statusBadgeVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  disponible: 'success',
  en_uso: 'info',
  mantenimiento: 'warning',
  fuera_servicio: 'danger',
}

type FormData = {
  name: string
  type: Equipment['type']
  brand: string
  model: string
  serial_number: string
  status: Equipment['status']
  location_site: string
  assigned_to: string
  purchase_date: string
  purchase_cost: string
  photo_url: string | null
}

const emptyForm: FormData = {
  name: '',
  type: 'herramienta',
  brand: '',
  model: '',
  serial_number: '',
  status: 'disponible',
  location_site: 'Planta Central Santiago',
  assigned_to: '',
  purchase_date: new Date().toISOString().split('T')[0],
  purchase_cost: '0',
  photo_url: null,
}

export function EquipmentPage() {
  const navigate = useNavigate()
  const { equipment, stats, create, update, remove } = useEquipment()
  const { query: search } = useSearch()

  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSite, setFilterSite] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [errors, setErrors] = useState<{ name?: string; serial_number?: string }>({})
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return equipment.filter(e => {
      const q = search.toLowerCase()
      if (q && !e.name.toLowerCase().includes(q) && !e.serial_number.toLowerCase().includes(q) && !e.brand.toLowerCase().includes(q)) return false
      if (filterType && e.type !== filterType) return false
      if (filterStatus && e.status !== filterStatus) return false
      if (filterSite && e.location_site !== filterSite) return false
      return true
    })
  }, [equipment, search, filterType, filterStatus, filterSite])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setErrors({})
    setModalOpen(true)
  }

  function openEdit(e: Equipment) {
    setEditingId(e.id)
    setForm({
      name: e.name,
      type: e.type,
      brand: e.brand,
      model: e.model,
      serial_number: e.serial_number,
      status: e.status,
      location_site: e.location_site,
      assigned_to: e.assigned_to || '',
      purchase_date: e.purchase_date.split('T')[0],
      purchase_cost: String(e.purchase_cost),
      photo_url: e.photo_url,
    })
    setErrors({})
    setModalOpen(true)
  }

  function handleSave() {
    const newErrors: { name?: string; serial_number?: string } = {}
    if (!form.name.trim()) newErrors.name = 'Nombre es requerido'
    if (!form.serial_number.trim()) newErrors.serial_number = 'Serial es requerido'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const cost = Number(form.purchase_cost) || 0
    if (cost < 0) {
      toast.error('El costo de compra no puede ser negativo')
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const pDate = new Date(form.purchase_date)
    if (pDate > today) {
      toast.error('La fecha de compra no puede estar en el futuro')
      return
    }

    const existing = equipment.find(e => e.serial_number === form.serial_number.trim() && e.id !== editingId)
    if (existing) {
      toast.error('El número de serie ya existe')
      return
    }

    const data = {
      name: form.name.trim(),
      type: form.type,
      brand: form.brand.trim(),
      model: form.model.trim(),
      serial_number: form.serial_number.trim(),
      status: form.status,
      location_site: form.location_site,
      assigned_to: form.assigned_to.trim() || null,
      purchase_date: form.purchase_date,
      purchase_cost: cost,
      photo_url: form.photo_url,
    }

    void (async () => {
      try {
        if (editingId) {
          await update(editingId, data)
          toast.success('Equipo actualizado')
        } else {
          await create(data)
          toast.success('Equipo creado')
        }
        setModalOpen(false)
      } catch {
        toast.error('Error al guardar el equipo')
      }
    })()
  }

  function handleDelete(id: string) {
    void (async () => {
      try {
        await remove(id)
        toast.success('Equipo eliminado')
        setDeleteConfirm(null)
      } catch {
        toast.error('Error al eliminar el equipo')
      }
    })()
  }

  function setField(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (field === 'name' || field === 'serial_number') {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Package size={20} />} label="Total Equipos" value={stats.total} />
        <StatCard icon={<ShieldCheck size={20} />} label="Disponibles" value={stats.disponible} />
        <StatCard icon={<Truck size={20} />} label="En Uso" value={stats.en_uso} />
        <StatCard icon={<HardHat size={20} />} label="En Mantenimiento" value={stats.mantenimiento} />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Registro de Equipos</h1>
          <p className="text-sm text-[var(--text-secondary)]">{equipment.length} equipos registrados</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>Nuevo Equipo</Button>
      </div>

      <Card padding={false}>
        <div className="border-b border-[var(--border)] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="flex flex-wrap gap-3">
              <div className="w-40">
                <Select
                  options={typeOptions}
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                />
              </div>
              <div className="w-44">
                <Select
                  options={statusOptions}
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                />
              </div>
              <div className="w-52">
                <Select
                  options={siteOptions}
                  value={filterSite}
                  onChange={e => setFilterSite(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search size={32} className="text-[var(--text-secondary)] mb-3" />
            <p className="text-sm text-[var(--text-secondary)]">No se encontraron equipos</p>
          </div>
        ) : (
          <Table headers={['Nombre', 'Tipo', 'Serial', 'Ubicación', 'Estado', 'Asignado a', 'Acciones']}>
            {filtered.map(eq => (
              <TableRow key={eq.id} onClick={() => void navigate(`/equipment/${eq.id}`)}>
                <TableCell>
                  <span className="font-medium">{eq.name}</span>
                  {eq.brand && <span className="block text-xs text-[var(--text-secondary)]">{eq.brand} {eq.model}</span>}
                </TableCell>
                <TableCell>
                  <Badge variant={typeBadgeVariant[eq.type] || 'default'}>{typeLabels[eq.type] || eq.type}</Badge>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs">{eq.serial_number}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{eq.location_site}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant[eq.status] || 'default'}>{statusLabels[eq.status] || eq.status}</Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{eq.assigned_to || '—'}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(eq)}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(eq.id)}>
                      <Trash2 size={14} className="text-red-400" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Equipo' : 'Nuevo Equipo'} size="lg">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Nombre *"
            value={form.name}
            onChange={e => setField('name', e.target.value)}
            error={errors.name}
            placeholder="Ej: Esmeril Angular 7 pulgadas"
          />
          <Select
            label="Tipo"
            options={formTypeOptions}
            value={form.type}
            onChange={e => setField('type', e.target.value)}
          />
          <Input
            label="Marca"
            value={form.brand}
            onChange={e => setField('brand', e.target.value)}
            placeholder="Ej: DeWalt"
          />
          <Input
            label="Modelo"
            value={form.model}
            onChange={e => setField('model', e.target.value)}
            placeholder="Ej: DWE4314"
          />
          <Input
            label="Número de Serie *"
            value={form.serial_number}
            onChange={e => setField('serial_number', e.target.value)}
            error={errors.serial_number}
            placeholder="Ej: SN-2024-001"
          />
          <Select
            label="Estado"
            options={formStatusOptions}
            value={form.status}
            onChange={e => setField('status', e.target.value)}
          />
          <Select
            label="Ubicación"
            options={formSiteOptions}
            value={form.location_site}
            onChange={e => setField('location_site', e.target.value)}
          />
          <Input
            label="Asignado a"
            value={form.assigned_to}
            onChange={e => setField('assigned_to', e.target.value)}
            placeholder="Nombre del responsable"
          />
          <Input
            label="Fecha de Compra"
            type="date"
            value={form.purchase_date}
            onChange={e => setField('purchase_date', e.target.value)}
          />
          <Input
            label="Costo de Compra (CLP)"
            type="number"
            value={form.purchase_cost}
            onChange={e => setField('purchase_cost', e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave}>{editingId ? 'Guardar Cambios' : 'Crear Equipo'}</Button>
        </div>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar Eliminación" size="sm">
        <p className="text-sm text-[var(--text-secondary)]">
          ¿Estás seguro de que deseas eliminar este equipo? Esta acción no se puede deshacer.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
          <Button variant="danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  )
}
