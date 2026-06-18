import { useMemo, useState } from 'react'
import { AlertTriangle, BadgeCheck, FileText, Plus, ShieldCheck } from 'lucide-react'
import { toast } from '../lib/toast'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Modal } from '../components/ui/Modal'
import { Table, TableCell, TableRow } from '../components/ui/Table'
import { StatCard } from '../components/shared/StatCard'
import { useCompliance } from '../hooks/useCompliance'
import { useEquipment } from '../hooks/useEquipment'
import { formatDate } from '../lib/utils'
import type { ComplianceDocument } from '../lib/supabase'
import { DOCUMENT_STATUS_LABELS } from '../lib/tooltrack'

const documentTypes = [
  { value: 'certificacion', label: 'Certificación' },
  { value: 'calibracion', label: 'Calibración' },
  { value: 'mantencion', label: 'Mantención' },
  { value: 'inspeccion', label: 'Inspección' },
]

const requiredOptions = [
  { value: 'true', label: 'Sí' },
  { value: 'false', label: 'No' },
]

const statusVariant: Record<ComplianceDocument['status'], 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  vigente: 'success',
  vence_pronto: 'warning',
  vencido: 'danger',
  ausente: 'danger',
}

type FormData = {
  equipment_id: string
  inventory_item_id: string | null
  document_type: ComplianceDocument['document_type']
  number: string
  provider: string
  issued_at: string
  expires_at: string
  file_url: string
  required_for_dispatch: boolean
  notes: string
}

const emptyForm: FormData = {
  equipment_id: '',
  inventory_item_id: null,
  document_type: 'certificacion',
  number: '',
  provider: '',
  issued_at: new Date().toISOString().split('T')[0],
  expires_at: new Date().toISOString().split('T')[0],
  file_url: '',
  required_for_dispatch: true,
  notes: '',
}

export function CompliancePage() {
  const { documents, stats, expiringSoon, expired, create, update } = useCompliance()
  const { equipment } = useEquipment()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<ComplianceDocument | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)

  const equipmentOptions = useMemo(() => [
    { value: '', label: 'Seleccionar' },
    ...equipment.map(item => ({ value: item.id, label: `${item.name} · ${item.serial_number}` })),
  ], [equipment])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  function openEdit(document: ComplianceDocument) {
    setEditing(document)
    setForm({
      equipment_id: document.equipment_id || '',
      inventory_item_id: document.inventory_item_id,
      document_type: document.document_type,
      number: document.number,
      provider: document.provider,
      issued_at: document.issued_at,
      expires_at: document.expires_at,
      file_url: document.file_url,
      required_for_dispatch: document.required_for_dispatch,
      notes: document.notes,
    })
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.equipment_id) {
      toast.error('Selecciona un activo')
      return
    }
    if (!form.number.trim() || !form.provider.trim()) {
      toast.error('Completa número y proveedor')
      return
    }
    try {
      if (editing) {
        await update(editing.id, {
          ...form,
          equipment_id: form.equipment_id || null,
        })
        toast.success('Documento actualizado')
      } else {
        await create({
          ...form,
          equipment_id: form.equipment_id,
        })
        toast.success('Documento creado')
      }
      setShowModal(false)
    } catch {
      toast.error('No se pudo guardar el documento')
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<FileText size={20} />} label="Documentos" value={stats.total} />
        <StatCard icon={<ShieldCheck size={20} />} label="Vigentes" value={stats.vigente} />
        <StatCard icon={<AlertTriangle size={20} />} label="Vence pronto" value={stats.vencePronto} className={stats.vencePronto > 0 ? 'border-amber-500/30' : ''} />
        <StatCard icon={<BadgeCheck size={20} />} label="Vencidos" value={stats.vencido} className={stats.vencido > 0 ? 'border-red-500/30' : ''} />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Cumplimiento y Trazabilidad Documental</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Registra certificaciones, calibraciones y mantenciones reales para bloquear o permitir despacho.
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>Nuevo Documento</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card title="Repositorio de Documentos" action={<span className="text-xs text-[var(--text-secondary)]">{documents.length} registros</span>} padding={false}>
          <Table headers={['Activo', 'Documento', 'Vigencia', 'Estado', 'Acciones']}>
            {documents.map(document => {
              const active = equipment.find(item => item.id === document.equipment_id)
              return (
                <TableRow key={document.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{active?.name || document.equipment_id}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{document.provider}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{document.number}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{documentTypes.find(type => type.value === document.document_type)?.label || document.document_type}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-[var(--text-secondary)]">
                      <p>Emite: {formatDate(document.issued_at)}</p>
                      <p>Vence: {formatDate(document.expires_at)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[document.status]}>
                      {DOCUMENT_STATUS_LABELS[document.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(document)}>Editar</Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </Table>
          {documents.length === 0 && (
            <div className="py-12 text-center text-sm text-[var(--text-secondary)]">No hay documentos cargados.</div>
          )}
        </Card>

        <div className="space-y-6">
          <Card title="Alertas de Vigencia">
            <div className="space-y-3">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                <p className="text-xs text-[var(--text-secondary)]">Vence en 15 días o menos</p>
                <p className="mt-1 text-xl font-bold text-[var(--text-primary)]">{expiringSoon.length}</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                <p className="text-xs text-[var(--text-secondary)]">Vencidos</p>
                <p className="mt-1 text-xl font-bold text-[var(--danger)]">{expired.length}</p>
              </div>
            </div>
          </Card>

          <Card title="Documentos críticos">
            <div className="space-y-3">
              {[...expired, ...expiringSoon].slice(0, 6).map(document => {
                const active = equipment.find(item => item.id === document.equipment_id)
                return (
                  <div key={document.id} className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{active?.name || document.equipment_id}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{document.number}</p>
                    <div className="mt-2">
                      <Badge variant={statusVariant[document.status]}>{DOCUMENT_STATUS_LABELS[document.status]}</Badge>
                    </div>
                  </div>
                )
              })}
              {[...expired, ...expiringSoon].length === 0 && (
                <p className="py-4 text-center text-sm text-[var(--text-secondary)]">Sin alertas documentales.</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Documento' : 'Nuevo Documento'} size="lg">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            label="Activo"
            options={equipmentOptions}
            value={form.equipment_id}
            onChange={e => setForm(prev => ({ ...prev, equipment_id: e.target.value }))}
          />
          <Select
            label="Tipo"
            options={documentTypes}
            value={form.document_type}
            onChange={e => setForm(prev => ({ ...prev, document_type: e.target.value as ComplianceDocument['document_type'] }))}
          />
          <Input label="Número" value={form.number} onChange={e => setForm(prev => ({ ...prev, number: e.target.value }))} />
          <Input label="Proveedor" value={form.provider} onChange={e => setForm(prev => ({ ...prev, provider: e.target.value }))} />
          <Input label="Fecha de emisión" type="date" value={form.issued_at} onChange={e => setForm(prev => ({ ...prev, issued_at: e.target.value }))} />
          <Input label="Fecha de vencimiento" type="date" value={form.expires_at} onChange={e => setForm(prev => ({ ...prev, expires_at: e.target.value }))} />
          <Input label="URL del archivo" value={form.file_url} onChange={e => setForm(prev => ({ ...prev, file_url: e.target.value }))} />
          <Select
            label="Requerido para despacho"
            options={requiredOptions}
            value={String(form.required_for_dispatch)}
            onChange={e => setForm(prev => ({ ...prev, required_for_dispatch: e.target.value === 'true' }))}
          />
          <div className="md:col-span-2">
            <Input label="Notas" value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button onClick={() => { void handleSave(); }}>Guardar</Button>
        </div>
      </Modal>
    </div>
  )
}
