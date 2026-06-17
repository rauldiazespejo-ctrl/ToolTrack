import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, LogOut, LogIn, Wrench, Printer, Clock, MapPin, User, Tag, Hash, Calendar, DollarSign, Box } from 'lucide-react'
import { useEquipment } from '../hooks/useEquipment'
import { useActivityLog } from '../hooks/useActivityLog'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Modal } from '../components/ui/Modal'
import { QRGenerator } from '../components/shared/QRGenerator'
import { formatCurrency, formatDate } from '../lib/utils'
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

const statusBadgeVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  disponible: 'success',
  en_uso: 'info',
  mantenimiento: 'warning',
  fuera_servicio: 'danger',
}

const actionLabels: Record<string, string> = {
  checkout: 'Check-out',
  checkin: 'Check-in',
  transfer: 'Transferencia',
  maintenance: 'Mantenimiento',
}

const siteOptions = [
  { value: 'Planta Central Santiago', label: 'Planta Central Santiago' },
  { value: 'Proyecto Los Bronces', label: 'Proyecto Los Bronces' },
  { value: 'Bodega Quilicura', label: 'Bodega Quilicura' },
]

const formTypeOptions = [
  { value: 'herramienta', label: 'Herramienta' },
  { value: 'vehiculo', label: 'Vehículo' },
  { value: 'maquinaria', label: 'Maquinaria' },
  { value: 'epp', label: 'EPP' },
]

const formStatusOptions = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'en_uso', label: 'En Uso' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'fuera_servicio', label: 'Fuera de Servicio' },
]

export function EquipmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getById, update, remove } = useEquipment()
  const { logs, addEntry } = useActivityLog()

  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkinOpen, setCheckinOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [checkoutUser, setCheckoutUser] = useState('')
  const [checkoutLocation, setCheckoutLocation] = useState('Planta Central Santiago')
  const [checkoutNotes, setCheckoutNotes] = useState('')

  const [editForm, setEditForm] = useState<{
    name: string; type: string; brand: string; model: string; serial_number: string;
    status: string; location_site: string; assigned_to: string; purchase_date: string;
    purchase_cost: string
  }>({
    name: '', type: 'herramienta', brand: '', model: '', serial_number: '',
    status: 'disponible', location_site: 'Planta Central Santiago', assigned_to: '',
    purchase_date: '', purchase_cost: '0'
  })
  const [editErrors, setEditErrors] = useState<{ name?: string; serial_number?: string }>({})

  const equipment = id ? getById(id) : null

  const equipmentLogs = useMemo(() => {
    if (!id) return []
    return logs.filter(l => l.equipment_id === id).slice(0, 20)
  }, [logs, id])

  if (!equipment) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Box size={32} className="text-[var(--text-secondary)] mb-3" />
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Equipo no encontrado</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">El equipo solicitado no existe</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/equipment')}>
          Volver a Equipos
        </Button>
      </div>
    )
  }

  function openEdit() {
    if (!equipment) return
    setEditForm({
      name: equipment.name,
      type: equipment.type,
      brand: equipment.brand,
      model: equipment.model,
      serial_number: equipment.serial_number,
      status: equipment.status,
      location_site: equipment.location_site,
      assigned_to: equipment.assigned_to || '',
      purchase_date: equipment.purchase_date.split('T')[0],
      purchase_cost: String(equipment.purchase_cost),
    })
    setEditErrors({})
    setEditOpen(true)
  }

  function handleEditSave() {
    const newErrors: { name?: string; serial_number?: string } = {}
    if (!editForm.name.trim()) newErrors.name = 'Nombre es requerido'
    if (!editForm.serial_number.trim()) newErrors.serial_number = 'Serial es requerido'
    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors)
      return
    }
    update(equipment!.id, {
      name: editForm.name.trim(),
      type: editForm.type as Equipment['type'],
      brand: editForm.brand.trim(),
      model: editForm.model.trim(),
      serial_number: editForm.serial_number.trim(),
      status: editForm.status as Equipment['status'],
      location_site: editForm.location_site,
      assigned_to: editForm.assigned_to.trim() || null,
      purchase_date: editForm.purchase_date,
      purchase_cost: Number(editForm.purchase_cost) || 0,
    })
    setEditOpen(false)
  }

  function handleDelete() {
    remove(equipment!.id)
    navigate('/equipment')
  }

  function handleCheckout() {
    if (!checkoutUser.trim()) return
    update(equipment!.id, {
      status: 'en_uso',
      assigned_to: checkoutUser.trim(),
      location_site: checkoutLocation,
    })
    addEntry({
      equipment_id: equipment!.id,
      equipment_name: equipment!.name,
      action: 'checkout',
      user_name: checkoutUser.trim(),
      from_location: equipment!.location_site,
      to_location: checkoutLocation,
      notes: checkoutNotes.trim(),
    })
    setCheckoutUser('')
    setCheckoutNotes('')
    setCheckoutOpen(false)
  }

  function handleCheckin() {
    addEntry({
      equipment_id: equipment!.id,
      equipment_name: equipment!.name,
      action: 'checkin',
      user_name: equipment!.assigned_to || 'Sistema',
      from_location: equipment!.location_site,
      to_location: equipment!.location_site,
      notes: 'Devolución de equipo',
    })
    update(equipment!.id, {
      status: 'disponible',
      assigned_to: null,
    })
    setCheckinOpen(false)
  }

  function handleMaintenance() {
    addEntry({
      equipment_id: equipment!.id,
      equipment_name: equipment!.name,
      action: 'maintenance',
      user_name: equipment!.assigned_to || 'Sistema',
      from_location: equipment!.location_site,
      to_location: equipment!.location_site,
      notes: 'Enviado a mantención',
    })
    update(equipment!.id, {
      status: 'mantenimiento',
      assigned_to: null,
    })
  }

  function handlePrintQR() {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const svgEl = document.querySelector('.qr-container svg')
    const svgHtml = svgEl ? svgEl.outerHTML : ''
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head><title>QR - ${equipment!.name}</title>
        <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;margin:0}h2{margin-bottom:8px}p{color:#666;font-size:14px;margin:4px 0}</style></head>
        <body>
          <h2>${equipment!.name}</h2>
          <p>${equipment!.serial_number}</p>
          <div style="padding:16px">${svgHtml}</div>
          <p>${equipment!.qr_code}</p>
          <script>setTimeout(()=>window.print(),300)</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const infoItems = [
    { icon: <Tag size={16} />, label: 'Tipo', value: typeLabels[equipment.type] || equipment.type },
    { icon: <Box size={16} />, label: 'Marca', value: equipment.brand || '—' },
    { icon: <Box size={16} />, label: 'Modelo', value: equipment.model || '—' },
    { icon: <Hash size={16} />, label: 'Serial', value: equipment.serial_number },
    { icon: <MapPin size={16} />, label: 'Ubicación', value: equipment.location_site },
    { icon: <User size={16} />, label: 'Asignado a', value: equipment.assigned_to || '—' },
    { icon: <Calendar size={16} />, label: 'Fecha de Compra', value: formatDate(equipment.purchase_date) },
    { icon: <DollarSign size={16} />, label: 'Costo', value: formatCurrency(equipment.purchase_cost) },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/equipment')}>
            <ArrowLeft size={16} />
            <span>Volver</span>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[var(--text-primary)]">{equipment.name}</h1>
              <Badge variant={statusBadgeVariant[equipment.status] || 'default'}>
                {statusLabels[equipment.status] || equipment.status}
              </Badge>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">{equipment.brand} {equipment.model} — {equipment.serial_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<Pencil size={14} />} onClick={openEdit}>Editar</Button>
          <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={() => setDeleteOpen(true)}>Eliminar</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Información del Equipo">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {infoItems.map(item => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-[var(--bg-secondary)] p-2 text-[var(--text-secondary)]">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">{item.label}</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Historial de Actividad" action={
            <span className="text-xs text-[var(--text-secondary)]">{equipmentLogs.length} registros</span>
          }>
            {equipmentLogs.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Clock size={24} className="text-[var(--text-secondary)] mb-2" />
                <p className="text-sm text-[var(--text-secondary)]">Sin actividad registrada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {equipmentLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3">
                    <div className="mt-0.5 rounded-full bg-[var(--accent)]/10 p-1.5 text-[var(--accent)]">
                      {log.action === 'checkout' && <LogOut size={14} />}
                      {log.action === 'checkin' && <LogIn size={14} />}
                      {log.action === 'maintenance' && <Wrench size={14} />}
                      {log.action === 'transfer' && <MapPin size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          {actionLabels[log.action] || log.action}
                        </span>
                        <span className="text-xs text-[var(--text-secondary)] shrink-0">
                          {formatDate(log.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {log.user_name}
                        {log.from_location && log.to_location && log.from_location !== log.to_location
                          ? ` — ${log.from_location} → ${log.to_location}`
                          : log.to_location ? ` — ${log.to_location}` : ''}
                      </p>
                      {log.notes && <p className="text-xs text-[var(--text-secondary)] mt-1">{log.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Código QR">
            <div className="qr-container">
              <QRGenerator value={equipment.qr_code} size={180} />
            </div>
            <Button variant="secondary" className="mt-4 w-full" icon={<Printer size={16} />} onClick={handlePrintQR}>
              Imprimir QR
            </Button>
          </Card>

          <Card title="Acciones Rápidas">
            <div className="space-y-3">
              {equipment.status === 'disponible' && (
                <Button className="w-full" icon={<LogOut size={16} />} onClick={() => setCheckoutOpen(true)}>
                  Check-out
                </Button>
              )}
              {equipment.status === 'en_uso' && (
                <Button className="w-full" variant="secondary" icon={<LogIn size={16} />} onClick={() => setCheckinOpen(true)}>
                  Check-in (Devolver)
                </Button>
              )}
              {equipment.status !== 'mantenimiento' && equipment.status !== 'fuera_servicio' && (
                <Button className="w-full" variant="secondary" icon={<Wrench size={16} />} onClick={handleMaintenance}>
                  Enviar a Mantención
                </Button>
              )}
              {equipment.status === 'mantenimiento' && (
                <Button className="w-full" onClick={() => {
                  update(equipment.id, { status: 'disponible', assigned_to: null })
                  addEntry({
                    equipment_id: equipment.id,
                    equipment_name: equipment.name,
                    action: 'maintenance',
                    user_name: 'Sistema',
                    from_location: equipment.location_site,
                    to_location: equipment.location_site,
                    notes: 'Mantención completada',
                  })
                }}>
                  Finalizar Mantención
                </Button>
              )}
              {equipment.status === 'fuera_servicio' && (
                <Button className="w-full" onClick={() => update(equipment.id, { status: 'disponible' })}>
                  Rehabilitar Equipo
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Modal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} title="Check-out de Equipo">
        <div className="space-y-4">
          <Input
            label="Asignar a *"
            value={checkoutUser}
            onChange={e => setCheckoutUser(e.target.value)}
            placeholder="Nombre del responsable"
          />
          <Select
            label="Ubicación destino"
            options={siteOptions}
            value={checkoutLocation}
            onChange={e => setCheckoutLocation(e.target.value)}
          />
          <Input
            label="Notas"
            value={checkoutNotes}
            onChange={e => setCheckoutNotes(e.target.value)}
            placeholder="Observaciones opcionales"
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setCheckoutOpen(false)}>Cancelar</Button>
          <Button onClick={handleCheckout} disabled={!checkoutUser.trim()}>Confirmar Check-out</Button>
        </div>
      </Modal>

      <Modal isOpen={checkinOpen} onClose={() => setCheckinOpen(false)} title="Check-in de Equipo" size="sm">
        <p className="text-sm text-[var(--text-secondary)]">
          ¿Confirmar la devolución de <strong className="text-[var(--text-primary)]">{equipment.name}</strong>?
          {equipment.assigned_to && <> Actualmente asignado a <strong className="text-[var(--text-primary)]">{equipment.assigned_to}</strong>.</>}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setCheckinOpen(false)}>Cancelar</Button>
          <Button onClick={handleCheckin}>Confirmar Devolución</Button>
        </div>
      </Modal>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Editar Equipo" size="lg">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Nombre *"
            value={editForm.name}
            onChange={e => { setEditForm(p => ({ ...p, name: e.target.value })); setEditErrors(p => ({ ...p, name: undefined })) }}
            error={editErrors.name}
          />
          <Select
            label="Tipo"
            options={formTypeOptions}
            value={editForm.type}
            onChange={e => setEditForm(p => ({ ...p, type: e.target.value }))}
          />
          <Input
            label="Marca"
            value={editForm.brand}
            onChange={e => setEditForm(p => ({ ...p, brand: e.target.value }))}
          />
          <Input
            label="Modelo"
            value={editForm.model}
            onChange={e => setEditForm(p => ({ ...p, model: e.target.value }))}
          />
          <Input
            label="Número de Serie *"
            value={editForm.serial_number}
            onChange={e => { setEditForm(p => ({ ...p, serial_number: e.target.value })); setEditErrors(p => ({ ...p, serial_number: undefined })) }}
            error={editErrors.serial_number}
          />
          <Select
            label="Estado"
            options={formStatusOptions}
            value={editForm.status}
            onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
          />
          <Select
            label="Ubicación"
            options={siteOptions}
            value={editForm.location_site}
            onChange={e => setEditForm(p => ({ ...p, location_site: e.target.value }))}
          />
          <Input
            label="Asignado a"
            value={editForm.assigned_to}
            onChange={e => setEditForm(p => ({ ...p, assigned_to: e.target.value }))}
          />
          <Input
            label="Fecha de Compra"
            type="date"
            value={editForm.purchase_date}
            onChange={e => setEditForm(p => ({ ...p, purchase_date: e.target.value }))}
          />
          <Input
            label="Costo (CLP)"
            type="number"
            value={editForm.purchase_cost}
            onChange={e => setEditForm(p => ({ ...p, purchase_cost: e.target.value }))}
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancelar</Button>
          <Button onClick={handleEditSave}>Guardar Cambios</Button>
        </div>
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Confirmar Eliminación" size="sm">
        <p className="text-sm text-[var(--text-secondary)]">
          ¿Estás seguro de que deseas eliminar <strong className="text-[var(--text-primary)]">{equipment.name}</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  )
}
