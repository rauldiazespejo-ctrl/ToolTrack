import {
  ArrowLeft,
  Boxes,
  ClipboardList,
  Landmark,
  MapPinned,
  PackageCheck,
  QrCode,
  ScanLine,
  Warehouse,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { formatCurrency, formatNumber, formatShortDate } from '../lib/format'
import {
  findInventoryItem,
  getQrIdentity,
  getQrValue,
  getStatusTone,
} from '../lib/inventory'
import { getMovementSummary } from '../lib/movements'
import { getScanActionLabel, useScanEvents } from '../lib/scanEvents'

export function ToolDetail() {
  const { toolId } = useParams()
  const item = toolId ? findInventoryItem(toolId) : undefined
  const { scopedEvents, source } = useScanEvents(item?.id)

  if (!item) {
    return <Navigate to="/tools" replace />
  }

  const qrValue = getQrValue(item)
  const movementSummary = getMovementSummary(item.code)

  return (
    <div className="page-stack detail-workspace">
      <Link className="back-link" to="/tools">
        <ArrowLeft size={18} />
        Volver al inventario
      </Link>

      <section className="asset-command">
        <div className="asset-identity-panel">
          <span className="eyebrow">Activo identificado</span>
          <strong>{item.code}</strong>
          <p>{item.description}</p>
          <div className="hero-actions">
            <Badge tone={getStatusTone(item.status)}>{item.status}</Badge>
            <span className="asset-chip">{item.group}</span>
            <span className="asset-chip">CECO {item.ceco ?? 'S/D'}</span>
          </div>
        </div>

        <aside className="qr-command-card">
          <div className="qr-command-top">
            <div>
              <span className="eyebrow">Etiqueta escaneable</span>
              <h2>QR único</h2>
            </div>
            <ScanLine size={22} />
          </div>
          <div className="qr-command-code">
            <QRCodeSVG value={qrValue} size={178} level="M" />
          </div>
          <dl className="qr-payload">
            <div>
              <dt>Identidad</dt>
              <dd>{getQrIdentity(item)}</dd>
            </div>
            <div>
              <dt>Destino</dt>
              <dd>{qrValue}</dd>
            </div>
          </dl>
          <button className="primary-button" type="button" onClick={() => window.print()}>
            <QrCode size={18} />
            Imprimir etiqueta
          </button>
        </aside>
      </section>

      <section className="detail-grid">
        <article className="panel asset-profile">
          <div className="panel-heading">
            <div>
              <h2>Ficha valorizada</h2>
              <p>Datos reales importados desde Inventario Valorizado.</p>
            </div>
          </div>
          <dl className="detail-list">
            <div>
              <dt>Bodega actual</dt>
              <dd>{item.warehouse}</dd>
            </div>
            <div>
              <dt>CECO</dt>
              <dd>{item.ceco ?? 'Sin dato'}</dd>
            </div>
            <div>
              <dt>Grupo</dt>
              <dd>{item.group}</dd>
            </div>
            <div>
              <dt>Entradas</dt>
              <dd>{formatNumber(item.entries)}</dd>
            </div>
            <div>
              <dt>Salidas</dt>
              <dd>{formatNumber(item.exits)}</dd>
            </div>
            <div>
              <dt>Saldo</dt>
              <dd>{formatNumber(item.balance)}</dd>
            </div>
            <div>
              <dt>Valor unitario</dt>
              <dd>{formatCurrency(item.unitValue)}</dd>
            </div>
            <div>
              <dt>Valor total</dt>
              <dd>{formatCurrency(item.totalValue)}</dd>
            </div>
            <div>
              <dt>Movimientos LMA</dt>
              <dd>{formatNumber(movementSummary.movementCount)}</dd>
            </div>
          </dl>
        </article>

        <article className="panel tracking-health">
          <div className="panel-heading">
            <div>
              <h2>Rastreo</h2>
              <p>Estado operativo calculado desde campos reales.</p>
            </div>
          </div>
          <div className="tracking-meter">
            <PackageCheck size={22} />
            <strong>{movementSummary.movementCount > 0 ? 'Trazable' : 'Sin LMA'}</strong>
            <span>
              {movementSummary.movementCount > 0
                ? 'Tiene historial de movimientos asociado al código.'
                : 'No se encontraron movimientos en la hoja LMA.'}
            </span>
          </div>
        </article>
      </section>

      <section className="split-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>Ubicación y custodia contable</h2>
              <p>Sin responsables inventados: solo bodega y CECO fuente.</p>
            </div>
          </div>
          <div className="custody-card">
            <Warehouse size={20} />
            <div>
              <strong>{item.warehouse}</strong>
              <span>Bodega declarada en el inventario</span>
            </div>
          </div>
          <div className="custody-card">
            <Landmark size={20} />
            <div>
              <strong>CECO {item.ceco ?? 'Sin dato'}</strong>
              <span>Centro de costo asociado</span>
            </div>
          </div>
          <div className="custody-card">
            <MapPinned size={20} />
            <div>
              <strong>Geolocalización pendiente</strong>
              <span>Requiere coordenadas reales por bodega para mapa GPS.</span>
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>Últimos movimientos reales</h2>
              <p>Resumen desde la hoja LMA por código.</p>
            </div>
          </div>
          <div className="timeline">
            {movementSummary.lastMovements.length > 0 ? (
              movementSummary.lastMovements.map((movement, index) => (
                <div className="timeline-item" key={`${movement.date}-${index}`}>
                  <div className="timeline-pin">
                    <ClipboardList size={16} />
                  </div>
                  <div>
                    <strong>
                      {movement.document || 'Movimiento'} {movement.number}
                    </strong>
                    <span>
                      {movement.date ? formatShortDate(movement.date) : 'Sin fecha'} ·{' '}
                      {movement.warehouse || 'Sin bodega'}
                    </span>
                    <p>
                      Entrada {formatNumber(movement.entry)} · Salida{' '}
                      {formatNumber(movement.exit)} · Saldo {formatNumber(movement.balance)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-copy">No hay movimientos LMA para este código.</p>
            )}
          </div>
        </article>
      </section>

      <section className="panel movement-summary">
        <div className="compact-row value-row">
          <Boxes size={18} />
          <div>
            <strong>Movimiento acumulado</strong>
            <span>
              Entrada {formatNumber(item.entries)} · Salida {formatNumber(item.exits)} ·
              Saldo {formatNumber(item.balance)}
            </span>
          </div>
          <strong>{formatCurrency(item.totalValue)}</strong>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Eventos QR {source === 'supabase' ? 'Supabase' : 'locales'}</h2>
            <p>Confirmaciones y diferencias capturadas desde la pantalla de escaneo.</p>
          </div>
        </div>
        <div className="compact-list">
          {scopedEvents.length > 0 ? (
            scopedEvents.slice(0, 8).map((event) => (
              <div className="compact-row value-row" key={event.id}>
                <ClipboardList size={18} />
                <div>
                  <strong>{getScanActionLabel(event.action)}</strong>
                  <span>
                    Esperada: {event.expectedWarehouse} · Reportada:{' '}
                    {event.reportedWarehouse} ·{' '}
                    {source === 'supabase' ? 'Supabase' : 'Local'}
                  </span>
                  {event.notes ? <p>{event.notes}</p> : null}
                </div>
                <strong>{new Date(event.createdAt).toLocaleDateString('es-CL')}</strong>
              </div>
            ))
          ) : (
            <p className="empty-copy">Todavía no hay eventos QR para este activo.</p>
          )}
        </div>
      </section>
    </div>
  )
}
