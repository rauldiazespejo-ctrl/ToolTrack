import { useMemo, useState } from 'react'
import { CheckCircle2, ScanLine, Repeat2, Truck, Plus } from 'lucide-react'
import { toast } from '../lib/toast'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Modal } from '../components/ui/Modal'
import { Table, TableCell, TableRow } from '../components/ui/Table'
import { StatCard } from '../components/shared/StatCard'
import { useDispatches } from '../hooks/useDispatches'
import { useRequests } from '../hooks/useRequests'
import { useEquipment } from '../hooks/useEquipment'
import { useInventory } from '../hooks/useInventory'
import { useNotifications } from '../hooks/useNotifications'
import { useCompliance } from '../hooks/useCompliance'
import type { QrScanEvent } from '../lib/supabase'
import { DISPATCH_STATUS_LABELS, RETURN_CONDITION_LABELS, buildScanValue } from '../lib/tooltrack'

const entityOptions = [
  { value: 'equipment', label: 'Equipo' },
  { value: 'inventory', label: 'Existencia' },
  { value: 'dispatch', label: 'Despacho' },
  { value: 'request', label: 'Solicitud' },
]

const contextOptions = [
  { value: 'dispatch_out', label: 'Salida despacho' },
  { value: 'dispatch_in', label: 'Recepción despacho' },
  { value: 'inventory_check', label: 'Inventario' },
  { value: 'compliance_verify', label: 'Cumplimiento' },
  { value: 'asset_lookup', label: 'Consulta' },
]

const dispatchVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  preparing: 'warning',
  dispatched: 'info',
  received: 'success',
  returned: 'default',
  cancelled: 'danger',
}

type ScanForm = {
  entity_type: QrScanEvent['entity_type']
  entity_id: string
  scanned_by: string
  location_site: string
  scan_context: QrScanEvent['scan_context']
  notes: string
}

const emptyScanForm: ScanForm = {
  entity_type: 'equipment',
  entity_id: '',
  scanned_by: '',
  location_site: 'Bodega Quilicura',
  scan_context: 'asset_lookup',
  notes: '',
}

export function EventsPage() {
  const { dispatches, scanEvents, markReceived, markReturned, addScanForItem } = useDispatches()
  const { requests, close } = useRequests()
  const { equipment } = useEquipment()
  const { inventory } = useInventory()
  const { create: createNotification } = useNotifications()
  const { documents } = useCompliance()

  const [showScanModal, setShowScanModal] = useState(false)
  const [scanForm, setScanForm] = useState<ScanForm>(emptyScanForm)

  const readyToReceive = useMemo(() => dispatches.filter(item => item.status === 'dispatched'), [dispatches])
  const returned = useMemo(() => dispatches.filter(item => item.status === 'returned'), [dispatches])

  async function handleReceive(dispatchId: string) {
    try {
      await markReceived(dispatchId)
      const dispatch = dispatches.find(item => item.id === dispatchId)
      const request = requests.find(item => item.id === dispatch?.asset_request_id)
      if (request) {
        await close(request.id)
      }
      await createNotification({
        title: 'Recepción confirmada',
        message: `${dispatch?.dispatch_code || dispatchId} fue recibido correctamente.`,
        severity: 'media',
        recipient_role: 'jefe_bodega',
        related_type: 'dispatch',
        related_id: dispatchId,
        is_read: false,
        source: 'dispatch',
      })
      toast.success('Recepción confirmada')
    } catch {
      toast.error('No se pudo confirmar la recepción')
    }
  }

  async function handleReturn(dispatchId: string) {
    const condition = window.prompt('Condición de devolución', 'correcta') as
      | 'correcta'
      | 'danada'
      | 'incompleta'
      | 'requiere_mantenimiento'
      | null
    if (!condition) return
    try {
      await markReturned(dispatchId, condition)
      await createNotification({
        title: 'Devolución registrada',
        message: `${dispatchId} retornó con condición ${RETURN_CONDITION_LABELS[condition]}.`,
        severity: condition === 'correcta' ? 'media' : 'alta',
        recipient_role: 'bodega',
        related_type: 'dispatch',
        related_id: dispatchId,
        is_read: false,
        source: 'dispatch',
      })
      toast.success('Devolución registrada')
    } catch {
      toast.error('No se pudo registrar la devolución')
    }
  }

  async function handleScanSave() {
    const entityId = scanForm.entity_id.trim()
    if (!entityId || !scanForm.scanned_by.trim()) {
      toast.error('Completa los campos obligatorios')
      return
    }
    try {
      await addScanForItem(
        scanForm.entity_type,
        entityId,
        scanForm.scanned_by.trim(),
        scanForm.location_site.trim(),
        scanForm.scan_context,
        scanForm.notes.trim(),
      )
      await createNotification({
        title: 'Escaneo QR registrado',
        message: `${scanForm.entity_type} ${entityId} fue escaneado en ${scanForm.location_site}.`,
        severity: 'baja',
        recipient_role: 'bodega',
        related_type: 'qr_scan',
        related_id: entityId,
        is_read: false,
        source: 'qr_scan',
      })
      toast.success('Escaneo guardado')
      setShowScanModal(false)
      setScanForm(emptyScanForm)
    } catch {
      toast.error('No se pudo registrar el escaneo')
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Truck size={20} />} label="Despachos" value={dispatches.length} />
        <StatCard icon={<CheckCircle2 size={20} />} label="Recibidos" value={readyToReceive.length} />
        <StatCard icon={<Repeat2 size={20} />} label="Retornos" value={returned.length} />
        <StatCard icon={<ScanLine size={20} />} label="Escaneos QR" value={scanEvents.length} />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Eventos, Despachos y QR</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Trazabilidad de salida, recepción y devolución con evidencia de escaneo.
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setShowScanModal(true)}>Nuevo Escaneo</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card title="Despachos" action={<span className="text-xs text-[var(--text-secondary)]">{dispatches.length} registros</span>} padding={false}>
          <Table headers={['Código', 'Solicitud', 'Estado', 'Destino', 'Acciones']}>
            {dispatches.map(dispatch => {
              const request = requests.find(item => item.id === dispatch.asset_request_id)
              return (
                <TableRow key={dispatch.id}>
                  <TableCell>
                    <div>
                      <p className="font-mono text-xs text-[var(--text-secondary)]">{dispatch.dispatch_code}</p>
                      <p className="text-sm">{dispatch.prepared_by}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{request?.request_code || dispatch.asset_request_id}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{request?.requested_item_name || dispatch.notes}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={dispatchVariant[dispatch.status]}>
                      {DISPATCH_STATUS_LABELS[dispatch.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{dispatch.to_location}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {dispatch.status === 'dispatched' && (
                        <Button size="sm" onClick={() => { void handleReceive(dispatch.id); }}>Recibir</Button>
                      )}
                      {dispatch.status === 'received' && (
                        <Button size="sm" variant="secondary" onClick={() => { void handleReturn(dispatch.id); }}>Devolver</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </Table>
          {dispatches.length === 0 && (
            <div className="py-12 text-center text-sm text-[var(--text-secondary)]">Aún no hay despachos.</div>
          )}
        </Card>

        <Card title="Lecturas QR recientes" action={<span className="text-xs text-[var(--text-secondary)]">{scanEvents.length} registros</span>} padding={false}>
          <div className="divide-y divide-[var(--border)]">
            {scanEvents.slice(0, 8).map(event => (
              <div key={event.id} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{event.scanned_by}</p>
                  <Badge variant="info">{event.scan_context}</Badge>
                </div>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {event.entity_type} · {event.location_site}
                </p>
                <p className="mt-1 font-mono text-[11px] text-[var(--text-secondary)]">{event.qr_value}</p>
              </div>
            ))}
            {scanEvents.length === 0 && (
              <div className="p-8 text-center text-sm text-[var(--text-secondary)]">Sin escaneos registrados.</div>
            )}
          </div>
        </Card>
      </div>

      <Card title="Estado de Cumplimiento para Despacho">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
            <p className="text-xs text-[var(--text-secondary)]">Documentos totales</p>
            <p className="mt-1 text-xl font-bold text-[var(--text-primary)]">{documents.length}</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
            <p className="text-xs text-[var(--text-secondary)]">Equipos con trazabilidad</p>
            <p className="mt-1 text-xl font-bold text-[var(--text-primary)]">{equipment.length}</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
            <p className="text-xs text-[var(--text-secondary)]">Existencias disponibles</p>
            <p className="mt-1 text-xl font-bold text-[var(--text-primary)]">{inventory.filter(item => item.quantity > 0).length}</p>
          </div>
        </div>
      </Card>

      <Modal isOpen={showScanModal} onClose={() => setShowScanModal(false)} title="Nuevo Escaneo QR" size="lg">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select label="Entidad" options={entityOptions} value={scanForm.entity_type} onChange={e => setScanForm(prev => ({ ...prev, entity_type: e.target.value as QrScanEvent['entity_type'] }))} />
          <Select label="Contexto" options={contextOptions} value={scanForm.scan_context} onChange={e => setScanForm(prev => ({ ...prev, scan_context: e.target.value as QrScanEvent['scan_context'] }))} />
          <Input label="ID entidad" value={scanForm.entity_id} onChange={e => setScanForm(prev => ({ ...prev, entity_id: e.target.value }))} placeholder="Equipo, despacho o solicitud" />
          <Input label="Escaneado por" value={scanForm.scanned_by} onChange={e => setScanForm(prev => ({ ...prev, scanned_by: e.target.value }))} />
          <Input label="Ubicación" value={scanForm.location_site} onChange={e => setScanForm(prev => ({ ...prev, location_site: e.target.value }))} />
          <Input label="QR" value={buildScanValue(scanForm.entity_type, scanForm.entity_id || 'pending')} readOnly />
          <div className="md:col-span-2">
            <Input label="Notas" value={scanForm.notes} onChange={e => setScanForm(prev => ({ ...prev, notes: e.target.value }))} />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowScanModal(false)}>Cancelar</Button>
          <Button onClick={() => { void handleScanSave(); }}>Guardar escaneo</Button>
        </div>
      </Modal>
    </div>
  )
}
