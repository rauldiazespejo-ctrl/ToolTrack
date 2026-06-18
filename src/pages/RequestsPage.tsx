import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  PackageSearch,
  Plus,
  RotateCw,
  Send,
  ShieldAlert,
  ShoppingCart,
  XCircle,
} from 'lucide-react'
import { toast } from '../lib/toast'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Modal } from '../components/ui/Modal'
import { Table, TableCell, TableRow } from '../components/ui/Table'
import { StatCard } from '../components/shared/StatCard'
import { useAuth } from '../hooks/useAuth'
import { useSearch } from '../hooks/useSearch'
import { useRequests } from '../hooks/useRequests'
import { useQuotes } from '../hooks/useQuotes'
import { useEquipment } from '../hooks/useEquipment'
import { useInventory } from '../hooks/useInventory'
import { useCompliance } from '../hooks/useCompliance'
import { useNotifications } from '../hooks/useNotifications'
import { useDispatches } from '../hooks/useDispatches'
import type { AssetRequest, QuoteRequest } from '../lib/supabase'
import { REQUEST_STATUS_LABELS, QUOTE_STATUS_LABELS, buildScanValue } from '../lib/tooltrack'

const requestTypeOptions = [
  { value: 'inventory', label: 'Consumible / Existencia' },
  { value: 'equipment', label: 'Equipo único' },
  { value: 'service', label: 'Servicio / Cotización' },
]

const priorityOptions = [
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja', label: 'Baja' },
]

const siteOptions = [
  { value: 'Planta Central Santiago', label: 'Planta Central Santiago' },
  { value: 'Proyecto Los Bronces', label: 'Proyecto Los Bronces' },
  { value: 'Bodega Quilicura', label: 'Bodega Quilicura' },
]

const requestBadgeVariant: Record<AssetRequest['status'], 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending_approval: 'warning',
  approved: 'info',
  warehouse_queue: 'default',
  ready_to_dispatch: 'info',
  dispatched: 'success',
  closed: 'default',
  quote_required: 'danger',
  rejected: 'danger',
}

const quoteBadgeVariant: Record<QuoteRequest['status'], 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending_quote: 'warning',
  quoted: 'info',
  purchase_approved: 'default',
  purchased: 'success',
  received: 'success',
  cancelled: 'danger',
}

type RequestForm = {
  title: string
  requested_item_type: AssetRequest['requested_item_type']
  requested_item_id: string
  requested_item_name: string
  quantity: string
  requester_name: string
  requester_role: string
  contract_code: string
  location_site: string
  priority: AssetRequest['priority']
  notes: string
}

const emptyForm: RequestForm = {
  title: '',
  requested_item_type: 'inventory',
  requested_item_id: '',
  requested_item_name: '',
  quantity: '1',
  requester_name: '',
  requester_role: 'solicitante_autorizado',
  contract_code: '',
  location_site: 'Planta Central Santiago',
  priority: 'media',
  notes: '',
}

type DispatchForm = {
  prepared_by: string
  from_location: string
  to_location: string
  notes: string
}

const emptyDispatchForm: DispatchForm = {
  prepared_by: '',
  from_location: 'Bodega Quilicura',
  to_location: 'Planta Central Santiago',
  notes: '',
}

function getUserRole(user: ReturnType<typeof useAuth>['user']): string {
  if (!user) return 'administrador'
  const metadata = user.user_metadata as Record<string, unknown> | undefined
  if (typeof metadata?.role === 'string' && metadata.role.trim()) return metadata.role
  return 'administrador'
}

function isWarehouseRole(role: string) {
  return ['administrador', 'jefe_bodega', 'supervisor_contrato'].includes(role)
}

function isSupervisorRole(role: string) {
  return ['administrador', 'supervisor_contrato', 'jefe_bodega'].includes(role)
}

export function RequestsPage() {
  const { user } = useAuth()
  const role = getUserRole(user)
  const { query } = useSearch()
  const { requests, stats, create, approve, reject, moveToWarehouseQueue, markReadyToDispatch, markDispatched, close, linkQuote, linkDispatch } = useRequests()
  const { quotes, create: createQuote, update: updateQuote } = useQuotes()
  const { inventory } = useInventory()
  const { equipment } = useEquipment()
  const { documents } = useCompliance()
  const { create: createNotification } = useNotifications()
  const { createDispatch, addScanForItem } = useDispatches()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDispatchModal, setShowDispatchModal] = useState(false)
  const [dispatchTarget, setDispatchTarget] = useState<AssetRequest | null>(null)
  const [form, setForm] = useState<RequestForm>(emptyForm)
  const [dispatchForm, setDispatchForm] = useState<DispatchForm>(emptyDispatchForm)
  const [saving, setSaving] = useState(false)

  const availableInventory = useMemo(() => inventory.filter(item => item.quantity > 0), [inventory])
  const availableEquipment = useMemo(() => equipment.filter(item => item.status === 'disponible'), [equipment])

  const selectedInventory = useMemo(() => (
    form.requested_item_type === 'inventory'
      ? inventory.find(item => item.id === form.requested_item_id) || null
      : null
  ), [form.requested_item_type, form.requested_item_id, inventory])

  const selectedEquipment = useMemo(() => (
    form.requested_item_type === 'equipment'
      ? equipment.find(item => item.id === form.requested_item_id) || null
      : null
  ), [form.requested_item_type, form.requested_item_id, equipment])

  const selectedRequestAvailability = useMemo(() => {
    if (form.requested_item_type === 'service') {
      return { label: 'Servicio externo', available: false, quoteRequired: true }
    }
    if (form.requested_item_type === 'inventory') {
      if (!selectedInventory) {
        return { label: 'Sin item seleccionado', available: false, quoteRequired: true }
      }
      const quantity = Number(form.quantity) || 0
      const available = selectedInventory.quantity >= quantity
      return {
        label: `${selectedInventory.quantity} disponibles`,
        available,
        quoteRequired: !available,
      }
    }
    if (!selectedEquipment) {
      return { label: 'Sin equipo seleccionado', available: false, quoteRequired: true }
    }
    const available = selectedEquipment.status === 'disponible'
    return {
      label: selectedEquipment.status === 'disponible' ? 'Disponible' : 'No disponible',
      available,
      quoteRequired: !available,
    }
  }, [form.quantity, form.requested_item_type, selectedEquipment, selectedInventory])

  const filteredRequests = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return requests
    return requests.filter(item => (
      item.title.toLowerCase().includes(q)
      || item.request_code.toLowerCase().includes(q)
      || item.requester_name.toLowerCase().includes(q)
      || item.requested_item_name.toLowerCase().includes(q)
    ))
  }, [query, requests])

  function resetForm() {
    setForm(emptyForm)
  }

  function handleFieldChange(field: keyof RequestForm, value: string) {
    setForm(prev => field === 'requested_item_type'
      ? {
          ...prev,
          requested_item_type: value as AssetRequest['requested_item_type'],
          requested_item_id: '',
          requested_item_name: '',
        }
      : { ...prev, [field]: value })
  }

  async function handleCreateRequest() {
    const quantity = Number(form.quantity) || 0
    if (!form.title.trim()) {
      toast.error('Ingresa un título para la solicitud')
      return
    }
    if (!form.requester_name.trim()) {
      toast.error('Ingresa el solicitante')
      return
    }
    if (quantity <= 0) {
      toast.error('La cantidad debe ser mayor a cero')
      return
    }

    const quoteRequired = selectedRequestAvailability.quoteRequired
    const requestedItemName = form.requested_item_type === 'inventory'
      ? selectedInventory?.name || form.requested_item_name.trim()
      : form.requested_item_type === 'equipment'
        ? selectedEquipment?.name || form.requested_item_name.trim()
        : form.requested_item_name.trim()

    try {
      setSaving(true)
      const request = await create({
        title: form.title.trim(),
        requested_item_type: form.requested_item_type,
        requested_item_id: form.requested_item_id || null,
        requested_item_name: requestedItemName || form.title.trim(),
        quantity,
        requester_name: form.requester_name.trim(),
        requester_role: form.requester_role.trim(),
        contract_code: form.contract_code.trim() || null,
        location_site: form.location_site,
        priority: form.priority,
        status: quoteRequired ? 'quote_required' : 'pending_approval',
        notes: form.notes.trim(),
        approver_name: null,
        approved_at: null,
        rejection_reason: null,
        quote_request_id: null,
        dispatch_id: null,
      })

      if (quoteRequired) {
        const quote = await createQuote({
          asset_request_id: request.id,
          responsible_name: isSupervisorRole(role) ? role : 'compras',
          supplier_name: form.requested_item_type === 'inventory' ? selectedInventory?.supplier || null : null,
          status: 'pending_quote',
          estimated_cost: form.requested_item_type === 'inventory' && selectedInventory ? selectedInventory.cost_per_unit * quantity : null,
          notes: `Derivación automática por ${selectedRequestAvailability.label}`,
        })
        await linkQuote(request.id, quote.id)
        await createNotification({
          title: 'Solicitud derivada a cotización',
          message: `${request.request_code} requiere cotización por falta de disponibilidad.`,
          severity: 'alta',
          recipient_role: 'compras',
          related_type: 'asset_request',
          related_id: request.id,
          is_read: false,
          source: 'requests',
        })
      } else {
        await createNotification({
          title: 'Nueva solicitud pendiente',
          message: `${request.request_code} espera aprobación de ${request.requester_name}.`,
          severity: 'media',
          recipient_role: 'supervisor_contrato',
          related_type: 'asset_request',
          related_id: request.id,
          is_read: false,
          source: 'requests',
        })
      }

      toast.success('Solicitud creada')
      setShowCreateModal(false)
      resetForm()
    } catch (error) {
      console.error(error)
      toast.error('No se pudo crear la solicitud')
    } finally {
      setSaving(false)
    }
  }

  async function handleApprove(request: AssetRequest) {
    try {
      setSaving(true)
      await approve(request.id, user?.email || 'sistema')
      await moveToWarehouseQueue(request.id)
      await createNotification({
        title: 'Solicitud aprobada',
        message: `${request.request_code} pasó a cola de bodega.`,
        severity: 'media',
        recipient_role: 'jefe_bodega',
        related_type: 'asset_request',
        related_id: request.id,
        is_read: false,
        source: 'requests',
      })
      toast.success('Solicitud aprobada')
    } catch {
      toast.error('No se pudo aprobar la solicitud')
    } finally {
      setSaving(false)
    }
  }

  async function handleReject(request: AssetRequest) {
    const reason = window.prompt('Motivo del rechazo')
    if (!reason?.trim()) return
    try {
      setSaving(true)
      await reject(request.id, user?.email || 'sistema', reason.trim())
      await createNotification({
        title: 'Solicitud rechazada',
        message: `${request.request_code} fue rechazada: ${reason.trim()}`,
        severity: 'alta',
        recipient_role: 'solicitante_autorizado',
        related_type: 'asset_request',
        related_id: request.id,
        is_read: false,
        source: 'requests',
      })
      toast.success('Solicitud rechazada')
    } catch {
      toast.error('No se pudo rechazar la solicitud')
    } finally {
      setSaving(false)
    }
  }

  async function handleReady(request: AssetRequest) {
    try {
      setSaving(true)
      await markReadyToDispatch(request.id)
      toast.success('Solicitud lista para despacho')
    } catch {
      toast.error('No se pudo mover a despacho')
    } finally {
      setSaving(false)
    }
  }

  function openDispatch(request: AssetRequest) {
    setDispatchTarget(request)
    setDispatchForm({
      prepared_by: user?.email || '',
      from_location: form.location_site || 'Bodega Quilicura',
      to_location: request.location_site,
      notes: request.notes,
    })
    setShowDispatchModal(true)
  }

  async function handleCreateDispatch() {
    if (!dispatchTarget) return
    const request = dispatchTarget
    const equipmentItem = request.requested_item_type === 'equipment'
      ? equipment.find(item => item.id === request.requested_item_id)
      : null
    const inventoryItem = request.requested_item_type === 'inventory'
      ? inventory.find(item => item.id === request.requested_item_id)
      : null

    if (equipmentItem) {
      const requiredDocs = documents.filter(doc => doc.equipment_id === equipmentItem.id && doc.required_for_dispatch)
      const blocked = requiredDocs.some(doc => doc.status === 'vencido' || doc.status === 'ausente')
      if (blocked || requiredDocs.length === 0) {
        toast.error('No se puede despachar sin documentos vigentes')
        await createNotification({
          title: 'Despacho bloqueado por cumplimiento',
          message: `${request.request_code} requiere documentos vigentes antes de salir.`,
          severity: 'critica',
          recipient_role: 'mantenimiento_calidad',
          related_type: 'asset_request',
          related_id: request.id,
          is_read: false,
          source: 'compliance',
        })
        return
      }
    }

    try {
      setSaving(true)
      const dispatch = await createDispatch({
        asset_request_id: request.id,
        prepared_by: dispatchForm.prepared_by.trim() || user?.email || 'sistema',
        requester_name: request.requester_name,
        from_location: dispatchForm.from_location.trim(),
        to_location: dispatchForm.to_location.trim(),
        status: 'preparing',
        notes: dispatchForm.notes.trim(),
      }, [
        request.requested_item_type === 'equipment' && equipmentItem ? {
          equipment_id: equipmentItem.id,
          inventory_item_id: null,
          item_name: equipmentItem.name,
          qr_value: equipmentItem.qr_code || buildScanValue('equipment', equipmentItem.id),
          quantity: 1,
          verified: true,
        } : {
          equipment_id: null,
          inventory_item_id: inventoryItem?.id || null,
          item_name: inventoryItem?.name || request.requested_item_name,
          qr_value: inventoryItem ? buildScanValue('inventory', inventoryItem.id) : null,
          quantity: request.quantity,
          verified: true,
        },
      ])

      await addScanForItem(
        request.requested_item_type === 'equipment' ? 'equipment' : 'inventory',
        request.requested_item_id,
        dispatchForm.prepared_by.trim() || user?.email || 'sistema',
        dispatchForm.from_location.trim(),
        'dispatch_out',
        `Salida asociada a ${request.request_code}`,
      )
      await markDispatched(request.id, dispatch.id)
      await linkDispatch(request.id, dispatch.id)
      await createNotification({
        title: 'Despacho generado',
        message: `${request.request_code} fue despachada con ${dispatch.dispatch_code}.`,
        severity: 'media',
        recipient_role: 'jefe_bodega',
        related_type: 'dispatch',
        related_id: dispatch.id,
        is_read: false,
        source: 'dispatch',
      })
      toast.success('Despacho generado')
      setShowDispatchModal(false)
      setDispatchTarget(null)
    } catch (error) {
      console.error(error)
      toast.error('No se pudo generar el despacho')
    } finally {
      setSaving(false)
    }
  }

  async function handleClose(request: AssetRequest) {
    try {
      setSaving(true)
      await close(request.id)
      toast.success('Solicitud cerrada')
    } catch {
      toast.error('No se pudo cerrar la solicitud')
    } finally {
      setSaving(false)
    }
  }

  async function handleQuoteStatus(quote: QuoteRequest, status: QuoteRequest['status']) {
    try {
      setSaving(true)
      await updateQuote(quote.id, { status })
      toast.success('Cotización actualizada')
    } catch {
      toast.error('No se pudo actualizar la cotización')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<FileSearch size={20} />} label="Solicitudes" value={stats.total} />
        <StatCard icon={<ShieldAlert size={20} />} label="Pendientes" value={stats.pendingApproval} />
        <StatCard icon={<PackageSearch size={20} />} label="Cola Bodega" value={stats.warehouseQueue} />
        <StatCard icon={<ShoppingCart size={20} />} label="Cotización" value={stats.quoteRequired} className={stats.quoteRequired > 0 ? 'border-red-500/30' : ''} />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Solicitudes y Cotizaciones</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            El flujo queda trazado por solicitud, cotización y despacho. Rol actual: {role}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button icon={<Plus size={16} />} onClick={() => setShowCreateModal(true)}>
            Nueva Solicitud
          </Button>
          <Link to="/warehouse" className="inline-flex">
            <Button variant="secondary" icon={<ArrowRight size={16} />}>Ir a Bodega</Button>
          </Link>
        </div>
      </div>

      <Card title="Solicitudes Activas" action={<span className="text-xs text-[var(--text-secondary)]">{filteredRequests.length} registros</span>} padding={false}>
        <Table headers={['Código', 'Solicitud', 'Tipo', 'Prioridad', 'Estado', 'Solicitante', 'Acciones']}>
          {filteredRequests.map(request => (
            <TableRow key={request.id}>
              <TableCell>
                <div className="space-y-0.5">
                  <p className="font-mono text-xs text-[var(--text-secondary)]">{request.request_code}</p>
                  <p className="text-sm font-medium">{request.title}</p>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm">{request.requested_item_name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{request.location_site}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={request.requested_item_type === 'equipment' ? 'info' : request.requested_item_type === 'service' ? 'warning' : 'success'}>
                  {request.requested_item_type === 'equipment' ? 'Equipo' : request.requested_item_type === 'service' ? 'Servicio' : 'Existencia'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={request.priority === 'alta' ? 'danger' : request.priority === 'media' ? 'warning' : 'success'}>
                  {request.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={requestBadgeVariant[request.status]}>
                  {REQUEST_STATUS_LABELS[request.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="space-y-0.5">
                  <p className="text-sm">{request.requester_name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{request.quantity} unidad(es)</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {request.status === 'pending_approval' && isSupervisorRole(role) && (
                    <Button size="sm" onClick={() => { void handleApprove(request); }} icon={<CheckCircle2 size={14} />}>Aprobar</Button>
                  )}
                  {(request.status === 'pending_approval' || request.status === 'approved') && isSupervisorRole(role) && (
                    <Button size="sm" variant="secondary" onClick={() => { void handleReject(request); }} icon={<XCircle size={14} />}>Rechazar</Button>
                  )}
                  {request.status === 'approved' && isWarehouseRole(role) && (
                    <Button size="sm" variant="secondary" onClick={() => { void handleReady(request); }} icon={<RotateCw size={14} />}>A cola</Button>
                  )}
                  {request.status === 'ready_to_dispatch' && isWarehouseRole(role) && request.requested_item_type !== 'service' && (
                    <Button size="sm" onClick={() => openDispatch(request)} icon={<Send size={14} />}>Despachar</Button>
                  )}
                  {request.status === 'dispatched' && (
                    <Button size="sm" variant="secondary" onClick={() => { void handleClose(request); }} icon={<CheckCircle2 size={14} />}>Cerrar</Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
        {filteredRequests.length === 0 && (
          <div className="py-12 text-center text-sm text-[var(--text-secondary)]">No hay solicitudes cargadas.</div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card title="Estado de Disponibilidad" padding className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
              <p className="text-xs text-[var(--text-secondary)]">Existencias disponibles</p>
              <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">{availableInventory.length}</p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
              <p className="text-xs text-[var(--text-secondary)]">Equipos listos</p>
              <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">{availableEquipment.length}</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-[var(--text-primary)]">Selección actual</p>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-sm text-[var(--text-secondary)]">
              {selectedRequestAvailability.label}
              <div className="mt-2">
                <Badge variant={selectedRequestAvailability.available ? 'success' : 'warning'}>
                  {selectedRequestAvailability.available ? 'Disponible' : 'Requiere revisión'}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Cotizaciones" action={<span className="text-xs text-[var(--text-secondary)]">{quotes.length} registros</span>} padding={false}>
          <Table headers={['Código', 'Solicitud', 'Estado', 'Responsable', 'Acciones']}>
            {quotes.map(quote => {
              const related = requests.find(request => request.id === quote.asset_request_id)
              return (
                <TableRow key={quote.id}>
                  <TableCell>
                    <div>
                      <p className="font-mono text-xs text-[var(--text-secondary)]">{quote.quote_code}</p>
                      <p className="text-sm">{related?.request_code || quote.asset_request_id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{related?.title || 'Solicitud asociada'}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={quoteBadgeVariant[quote.status]}>
                      {QUOTE_STATUS_LABELS[quote.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-[var(--text-secondary)]">{quote.responsible_name}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="secondary" onClick={() => { void handleQuoteStatus(quote, 'quoted'); }}>Cotizada</Button>
                      <Button size="sm" onClick={() => { void handleQuoteStatus(quote, 'purchase_approved'); }}>Aprobar</Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </Table>
          {quotes.length === 0 && (
            <div className="py-10 text-center text-sm text-[var(--text-secondary)]">No hay cotizaciones derivadas.</div>
          )}
        </Card>
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Nueva Solicitud" size="lg">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input label="Título" value={form.title} onChange={e => handleFieldChange('title', e.target.value)} placeholder="Ej: Retiro de esmeril para mantenimiento de soldadura" />
          </div>
          <Select label="Tipo" options={requestTypeOptions} value={form.requested_item_type} onChange={e => handleFieldChange('requested_item_type', e.target.value)} />
          <Select label="Prioridad" options={priorityOptions} value={form.priority} onChange={e => handleFieldChange('priority', e.target.value)} />
          <Select label="Sitio destino" options={siteOptions} value={form.location_site} onChange={e => handleFieldChange('location_site', e.target.value)} />
          <Input label="Cantidad" type="number" min={1} value={form.quantity} onChange={e => handleFieldChange('quantity', e.target.value)} />
          <Input label="Solicitante" value={form.requester_name} onChange={e => handleFieldChange('requester_name', e.target.value)} placeholder="Nombre y apellido" />
          <Input label="Rol del solicitante" value={form.requester_role} onChange={e => handleFieldChange('requester_role', e.target.value)} placeholder="Ej: supervisor_contrato" />
          <Input label="Contrato / CECO" value={form.contract_code} onChange={e => handleFieldChange('contract_code', e.target.value)} placeholder="Opcional" />
          {form.requested_item_type === 'inventory' && (
            <Select
              label="Existencia"
              options={[{ value: '', label: 'Seleccionar' }, ...inventory.map(item => ({ value: item.id, label: `${item.name} (${item.quantity} ${item.unit})` }))]}
              value={form.requested_item_id}
              onChange={e => {
                const item = inventory.find(inv => inv.id === e.target.value)
                setForm(prev => ({
                  ...prev,
                  requested_item_id: e.target.value,
                  requested_item_name: item?.name || prev.requested_item_name,
                  title: prev.title || item?.name || '',
                }))
              }}
            />
          )}
          {form.requested_item_type === 'equipment' && (
            <Select
              label="Equipo"
              options={[{ value: '', label: 'Seleccionar' }, ...equipment.map(item => ({ value: item.id, label: `${item.name} · ${item.serial_number}` }))]}
              value={form.requested_item_id}
              onChange={e => {
                const item = equipment.find(eq => eq.id === e.target.value)
                setForm(prev => ({
                  ...prev,
                  requested_item_id: e.target.value,
                  requested_item_name: item?.name || prev.requested_item_name,
                  title: prev.title || item?.name || '',
                }))
              }}
            />
          )}
          {form.requested_item_type === 'service' && (
            <div className="md:col-span-2">
              <Input
                label="Servicio requerido"
                value={form.requested_item_name}
                onChange={e => handleFieldChange('requested_item_name', e.target.value)}
                placeholder="Ej: Calibración externa de equipo"
              />
            </div>
          )}
          <div className="md:col-span-2">
            <Input label="Observaciones" value={form.notes} onChange={e => handleFieldChange('notes', e.target.value)} placeholder="Notas operativas, estado o urgencia" />
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
          <Button onClick={() => { void handleCreateRequest(); }} disabled={saving}>Crear solicitud</Button>
        </div>
      </Modal>

      <Modal isOpen={showDispatchModal} onClose={() => setShowDispatchModal(false)} title="Preparar Despacho" size="lg">
        <div className="space-y-4">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
            <p className="text-sm font-medium text-[var(--text-primary)]">{dispatchTarget?.request_code}</p>
            <p className="text-xs text-[var(--text-secondary)]">{dispatchTarget?.requested_item_name}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Preparado por" value={dispatchForm.prepared_by} onChange={e => setDispatchForm(prev => ({ ...prev, prepared_by: e.target.value }))} />
            <Input label="Origen" value={dispatchForm.from_location} onChange={e => setDispatchForm(prev => ({ ...prev, from_location: e.target.value }))} />
            <Input label="Destino" value={dispatchForm.to_location} onChange={e => setDispatchForm(prev => ({ ...prev, to_location: e.target.value }))} />
            <Input label="Nota de salida" value={dispatchForm.notes} onChange={e => setDispatchForm(prev => ({ ...prev, notes: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowDispatchModal(false)}>Cancelar</Button>
            <Button onClick={() => { void handleCreateDispatch(); }} disabled={saving}>Generar despacho</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
