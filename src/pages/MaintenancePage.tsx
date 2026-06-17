import { useState } from 'react'
import { Wrench, Plus, ClipboardList, LayoutGrid, List, Clock, CheckCircle2, AlertTriangle, Calendar, User } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Modal } from '../components/ui/Modal'
import { Table, TableRow, TableCell } from '../components/ui/Table'
import { StatCard } from '../components/shared/StatCard'
import { useMaintenance } from '../hooks/useMaintenance'
import { formatDate, formatCurrency } from '../lib/utils'
import type { MaintenanceOrder } from '../lib/supabase'

const typeBadge: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  preventivo: { label: 'Preventivo', variant: 'info' },
  correctivo: { label: 'Correctivo', variant: 'danger' },
  calibracion: { label: 'Calibracion', variant: 'warning' },
}

const priorityBadge: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  alta: { label: 'Alta', variant: 'danger' },
  media: { label: 'Media', variant: 'warning' },
  baja: { label: 'Baja', variant: 'success' },
}

const statusLabels: Record<string, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En Progreso',
  completado: 'Completado',
  vencido: 'Vencido',
}

const priorityBorderColor: Record<string, string> = {
  alta: 'border-l-red-500',
  media: 'border-l-yellow-500',
  baja: 'border-l-green-500',
}

type FormData = Omit<MaintenanceOrder, 'id'>

const emptyForm: FormData = {
  equipment_id: '',
  equipment_name: '',
  type: 'preventivo',
  status: 'pendiente',
  description: '',
  assigned_to: '',
  priority: 'media',
  scheduled_date: new Date().toISOString().split('T')[0],
  completed_date: null,
  cost: 0,
  notes: '',
}

export function MaintenancePage() {
  const { orders, stats, create, update, complete, remove } = useMaintenance()
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [showModal, setShowModal] = useState(false)
  const [editingOrder, setEditingOrder] = useState<MaintenanceOrder | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)

  function openCreate() {
    setForm(emptyForm)
    setEditingOrder(null)
    setShowModal(true)
  }

  function openEdit(order: MaintenanceOrder) {
    setForm({
      equipment_id: order.equipment_id,
      equipment_name: order.equipment_name,
      type: order.type,
      status: order.status,
      description: order.description,
      assigned_to: order.assigned_to,
      priority: order.priority,
      scheduled_date: order.scheduled_date,
      completed_date: order.completed_date,
      cost: order.cost,
      notes: order.notes,
    })
    setEditingOrder(order)
    setShowModal(true)
  }

  function handleSave() {
    if (editingOrder) {
      update(editingOrder.id, form)
    } else {
      create(form)
    }
    setShowModal(false)
  }

  function handleComplete(id: string) {
    complete(id)
  }

  const columns: { key: MaintenanceOrder['status']; label: string; color: string }[] = [
    { key: 'pendiente', label: 'Pendiente', color: 'bg-yellow-500' },
    { key: 'en_progreso', label: 'En Progreso', color: 'bg-blue-500' },
    { key: 'completado', label: 'Completado', color: 'bg-green-500' },
    { key: 'vencido', label: 'Vencido', color: 'bg-red-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Gestion de Mantenimiento</h1>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
            <button
              onClick={() => setView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                view === 'kanban' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
              }`}
            >
              <LayoutGrid size={14} /> Kanban
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                view === 'list' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
              }`}
            >
              <List size={14} /> Lista
            </button>
          </div>
          <Button icon={<Plus size={16} />} onClick={openCreate}>Nueva Orden</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard icon={<ClipboardList size={20} />} label="Total Ordenes" value={stats.total} />
        <StatCard icon={<Clock size={20} />} label="Pendientes" value={stats.pendiente} />
        <StatCard icon={<Wrench size={20} />} label="En Progreso" value={stats.en_progreso} />
        <StatCard icon={<AlertTriangle size={20} />} label="Vencidas" value={stats.vencido} className={stats.vencido > 0 ? 'border-red-500/30' : ''} />
      </div>

      {view === 'kanban' ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {columns.map(col => {
            const colOrders = orders.filter(o => o.status === col.key)
            return (
              <div key={col.key} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{col.label}</span>
                  <span className="ml-auto rounded-full bg-[var(--bg-secondary)] px-2 py-0.5 text-xs text-[var(--text-secondary)]">{colOrders.length}</span>
                </div>
                <div className="space-y-2">
                  {colOrders.map(order => (
                    <div
                      key={order.id}
                      onClick={() => openEdit(order)}
                      className={`cursor-pointer rounded-lg border border-[var(--border)] border-l-4 ${priorityBorderColor[order.priority]} bg-[var(--bg-card)] p-3 transition-colors hover:bg-white/[0.03]`}
                    >
                      <p className="text-sm font-medium text-[var(--text-primary)]">{order.equipment_name || order.equipment_id}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge variant={typeBadge[order.type]?.variant || 'default'}>
                          {typeBadge[order.type]?.label || order.type}
                        </Badge>
                        <Badge variant={priorityBadge[order.priority]?.variant || 'default'}>
                          {priorityBadge[order.priority]?.label || order.priority}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                        <Calendar size={12} />
                        {formatDate(order.scheduled_date)}
                      </div>
                      {order.assigned_to && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                          <User size={12} />
                          {order.assigned_to}
                        </div>
                      )}
                    </div>
                  ))}
                  {colOrders.length === 0 && (
                    <div className="rounded-lg border border-dashed border-[var(--border)] py-8 text-center text-xs text-[var(--text-secondary)]">
                      Sin ordenes
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <Card padding={false}>
          <Table headers={['Equipo', 'Tipo', 'Estado', 'Prioridad', 'Fecha Programada', 'Asignado', 'Costo', 'Acciones']}>
            {orders.map(order => (
              <TableRow key={order.id}>
                <TableCell>
                  <span className="font-medium">{order.equipment_name || order.equipment_id}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={typeBadge[order.type]?.variant || 'default'}>
                    {typeBadge[order.type]?.label || order.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={order.status === 'completado' ? 'success' : order.status === 'vencido' ? 'danger' : order.status === 'en_progreso' ? 'info' : 'warning'}>
                    {statusLabels[order.status] || order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={priorityBadge[order.priority]?.variant || 'default'}>
                    {priorityBadge[order.priority]?.label || order.priority}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(order.scheduled_date)}</TableCell>
                <TableCell>
                  <span className="text-xs">{order.assigned_to}</span>
                </TableCell>
                <TableCell>{formatCurrency(order.cost)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {order.status !== 'completado' && (
                      <button onClick={() => handleComplete(order.id)} className="rounded p-1 text-[var(--text-secondary)] hover:bg-white/5 hover:text-green-400 transition-colors cursor-pointer" title="Completar">
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                    <button onClick={() => openEdit(order)} className="rounded p-1 text-[var(--text-secondary)] hover:bg-white/5 hover:text-blue-400 transition-colors cursor-pointer" title="Editar">
                      <Wrench size={16} />
                    </button>
                    <button onClick={() => remove(order.id)} className="rounded p-1 text-[var(--text-secondary)] hover:bg-white/5 hover:text-red-400 transition-colors cursor-pointer" title="Eliminar">
                      <AlertTriangle size={16} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </Card>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingOrder ? 'Editar Orden' : 'Nueva Orden de Mantenimiento'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Nombre del Equipo" value={form.equipment_name || ''} onChange={e => setForm({ ...form, equipment_name: e.target.value })} />
          </div>
          <Select
            label="Tipo"
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value as MaintenanceOrder['type'] })}
            options={[
              { value: 'preventivo', label: 'Preventivo' },
              { value: 'correctivo', label: 'Correctivo' },
              { value: 'calibracion', label: 'Calibracion' },
            ]}
          />
          <Select
            label="Prioridad"
            value={form.priority}
            onChange={e => setForm({ ...form, priority: e.target.value as MaintenanceOrder['priority'] })}
            options={[
              { value: 'alta', label: 'Alta' },
              { value: 'media', label: 'Media' },
              { value: 'baja', label: 'Baja' },
            ]}
          />
          <div className="col-span-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Descripcion</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
          </div>
          <Input label="Asignado a" value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} />
          <Input label="Fecha Programada" type="date" value={form.scheduled_date} onChange={e => setForm({ ...form, scheduled_date: e.target.value })} />
          <Input label="Costo Estimado" type="number" value={form.cost} onChange={e => setForm({ ...form, cost: Number(e.target.value) })} />
          <div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Notas</label>
              <textarea
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-between">
          <div>
            {editingOrder && editingOrder.status !== 'completado' && (
              <Button
                variant="secondary"
                icon={<CheckCircle2 size={16} />}
                onClick={() => { handleComplete(editingOrder.id); setShowModal(false) }}
              >
                Completar Orden
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editingOrder ? 'Guardar Cambios' : 'Crear Orden'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
