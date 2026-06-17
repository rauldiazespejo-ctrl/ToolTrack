import { ClipboardCheck, PackageCheck, ScanLine, Truck } from 'lucide-react'
import { Badge } from '../components/Badge'
import { formatNumber } from '../lib/format'
import { getRequestStatusLabel, getRequestTone, useAssetRequests } from '../lib/requests'

export function WarehouseOps() {
  const { quoteQueue, source, warehouseQueue } = useAssetRequests()

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Bodega profesional</span>
          <h1>Preparación, despacho y recepción controlada por solicitud.</h1>
        </div>
        <span className="result-count">
          {formatNumber(warehouseQueue.length)} pendientes ·{' '}
          {source === 'supabase' ? 'Supabase' : 'Local'}
        </span>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-icon">
            <ClipboardCheck size={20} />
          </div>
          <span>Solicitudes por preparar</span>
          <strong>{formatNumber(warehouseQueue.length)}</strong>
          <small>Desde flujo de aprobación</small>
        </article>
        <article className="stat-card">
          <div className="stat-icon">
            <Truck size={20} />
          </div>
          <span>Listas para despacho</span>
          <strong>
            {formatNumber(
              warehouseQueue.filter((item) => item.status === 'ready_to_dispatch')
                .length,
            )}
          </strong>
          <small>Validación QR pendiente</small>
        </article>
        <article className="stat-card">
          <div className="stat-icon">
            <PackageCheck size={20} />
          </div>
          <span>Cotización requerida</span>
          <strong>{formatNumber(quoteQueue.length)}</strong>
          <small>Sin stock o requiere revisión</small>
        </article>
      </section>

      <section className="split-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>Cola de trabajo bodega</h2>
              <p>Solicitudes que deben preparar, validar o despachar.</p>
            </div>
          </div>
          <div className="compact-list">
            {warehouseQueue.length > 0 ? (
              warehouseQueue.map((request) => (
                <div className="compact-row value-row" key={request.id}>
                  <ScanLine size={18} />
                  <div>
                    <strong>
                      {request.itemCode} · {request.quantity} un.
                    </strong>
                    <span>
                      {request.warehouse} · {request.contract} ·{' '}
                      {request.neededAt || 'Sin fecha requerida'}
                    </span>
                  </div>
                  <Badge tone={getRequestTone(request.status)}>
                    {getRequestStatusLabel(request.status)}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="empty-copy">No hay solicitudes en cola de bodega.</p>
            )}
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>Compras y cotizaciones</h2>
              <p>Casos donde no hay existencia disponible o hay bloqueo operativo.</p>
            </div>
          </div>
          <div className="compact-list">
            {quoteQueue.length > 0 ? (
              quoteQueue.map((request) => (
                <div className="compact-row value-row" key={request.id}>
                  <PackageCheck size={18} />
                  <div>
                    <strong>{request.itemCode}</strong>
                    <span>
                      {request.description} · {request.contract}
                    </span>
                  </div>
                  <Badge tone="warning">Cotizar</Badge>
                </div>
              ))
            ) : (
              <p className="empty-copy">No hay solicitudes que requieran cotización.</p>
            )}
          </div>
        </article>
      </section>
    </div>
  )
}
