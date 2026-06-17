import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Landmark,
  PackageSearch,
  Warehouse,
} from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { formatCurrency, formatNumber, formatShortDate } from '../lib/format'
import { findInventoryItem, getStatusTone } from '../lib/inventory'
import { getMovementSummary } from '../lib/movements'
import { getScanActionLabel, useScanEvents } from '../lib/scanEvents'

export function ScanAsset() {
  const { toolId } = useParams()
  const [reportedWarehouse, setReportedWarehouse] = useState('')
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState('')
  const item = toolId ? findInventoryItem(toolId) : undefined
  const { scopedEvents, addEvent, error, source } = useScanEvents(item?.id)

  if (!item) {
    return <Navigate to="/tools" replace />
  }

  const currentItem = item
  const movementSummary = getMovementSummary(currentItem.code)
  const lastMovement = movementSummary.lastMovements[0]
  const lastScanEvent = scopedEvents[0]

  async function confirmLocation() {
    const result = await addEvent({
      item: currentItem,
      action: 'confirm_location',
    })
    setMessage(
      result.source === 'supabase'
        ? 'Ubicación confirmada y sincronizada con Supabase.'
        : 'Ubicación confirmada localmente. Pendiente sincronizar con backend.',
    )
  }

  async function reportDifference() {
    const result = await addEvent({
      item: currentItem,
      action: 'report_difference',
      reportedWarehouse,
      notes,
    })
    setMessage(
      result.source === 'supabase'
        ? 'Diferencia reportada y sincronizada con Supabase.'
        : 'Diferencia reportada localmente. Pendiente revisión.',
    )
    setReportedWarehouse('')
    setNotes('')
  }

  return (
    <div className="scan-page">
      <section className="scan-card">
        <div className="scan-status">
          <PackageSearch size={24} />
          <div>
            <span>Escaneo ToolTrack</span>
            <strong>{currentItem.code}</strong>
          </div>
          <Badge tone={getStatusTone(currentItem.status)}>
            {currentItem.status}
          </Badge>
        </div>

        <div className="scan-title">
          <h1>{currentItem.description}</h1>
          <p>
            QR versionado para identificación en terreno. Los botones de acción quedan
            listos para conectar a backend.
          </p>
        </div>

        <div className="scan-facts">
          <article>
            <Warehouse size={18} />
            <span>Bodega</span>
            <strong>{currentItem.warehouse}</strong>
          </article>
          <article>
            <Landmark size={18} />
            <span>CECO</span>
            <strong>{currentItem.ceco ?? 'Sin dato'}</strong>
          </article>
          <article>
            <CheckCircle2 size={18} />
            <span>Saldo</span>
            <strong>{formatNumber(currentItem.balance)}</strong>
          </article>
          <article>
            <ClipboardList size={18} />
            <span>Movimientos</span>
            <strong>{formatNumber(movementSummary.movementCount)}</strong>
          </article>
        </div>

        <div className="scan-last">
          <span>Última lectura LMA</span>
          {lastMovement ? (
            <strong>
              {formatShortDate(lastMovement.date)} · {lastMovement.document}{' '}
              {lastMovement.number}
            </strong>
          ) : (
            <strong>Sin movimientos asociados</strong>
          )}
        </div>

        <div className="scan-value">
          <span>Valor total</span>
          <strong>{formatCurrency(currentItem.totalValue)}</strong>
        </div>

        <div className="scan-actions">
          <button type="button" onClick={confirmLocation}>
            <CheckCircle2 size={18} />
            Confirmar ubicación
          </button>
          <button type="button" onClick={reportDifference}>
            <AlertTriangle size={18} />
            Reportar diferencia
          </button>
          <Link to={`/tools/${currentItem.id}`}>
            Ver ficha completa
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="scan-form">
          <label>
            <span>Bodega reportada si hay diferencia</span>
            <input
              value={reportedWarehouse}
              onChange={(event) => setReportedWarehouse(event.target.value)}
              placeholder={currentItem.warehouse}
            />
          </label>
          <label>
            <span>Notas de terreno</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Ej: activo encontrado en otra bodega, etiqueta dañada, saldo físico distinto..."
            />
          </label>
        </div>

        {message ? <div className="scan-message">{message}</div> : null}
        {error ? <div className="scan-warning">{error}</div> : null}

        {lastScanEvent ? (
          <div className="scan-last-event">
            <span>Último evento {source === 'supabase' ? 'Supabase' : 'local'}</span>
            <strong>{getScanActionLabel(lastScanEvent.action)}</strong>
            <p>
              Reportado: {lastScanEvent.reportedWarehouse} ·{' '}
              {new Date(lastScanEvent.createdAt).toLocaleString('es-CL')}
            </p>
          </div>
        ) : null}
      </section>
    </div>
  )
}
