import {
  AlertTriangle,
  ClipboardCheck,
  FileSearch,
  PackageCheck,
  Search,
  Send,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { formatCurrency, formatNumber } from '../lib/format'
import {
  getAvailabilityLabel,
  getAvailabilityStatus,
  getAvailabilityTone,
  searchInventoryItems,
} from '../lib/inventory'
import {
  getRequestStatusLabel,
  getRequestTone,
  useAssetRequests,
} from '../lib/requests'
import type { AssetRequestPriority, InventoryItem } from '../types'

const visibleLimit = 60

export function Requests() {
  const [query, setQuery] = useState('')
  const [contract, setContract] = useState('')
  const [requestedBy, setRequestedBy] = useState('')
  const [neededAt, setNeededAt] = useState('')
  const [priority, setPriority] = useState<AssetRequestPriority>('normal')
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const { addRequest, error, quoteQueue, requests, source, warehouseQueue } =
    useAssetRequests()

  const results = useMemo(() => {
    if (!query.trim()) return []
    return searchInventoryItems({
      group: 'all',
      query,
      status: 'all',
      warehouse: 'all',
    }).slice(0, visibleLimit)
  }, [query])

  async function submitRequest(item: InventoryItem) {
    const result = await addRequest({
      contract,
      item,
      neededAt,
      priority,
      quantity: Math.max(1, quantity),
      reason,
      requestedBy,
    })

    setMessage(
      result.request.status === 'quote_required'
        ? `Solicitud ${result.request.itemCode} creada como cotización requerida.`
        : `Solicitud ${result.request.itemCode} creada para aprobación.`,
    )
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Solicitudes operacionales</span>
          <h1>Buscar disponibilidad y solicitar herramientas o activos.</h1>
        </div>
        <span className="result-count">
          {requests.length} solicitudes · {source === 'supabase' ? 'Supabase' : 'Local'}
        </span>
      </section>

      <section className="ops-command">
        <article className="panel request-search-panel">
          <div className="panel-heading">
            <div>
              <h2>Disponibilidad inteligente</h2>
              <p>Usa saldo, estado, bodega y CECO reales del inventario cargado.</p>
            </div>
          </div>
          <div className="request-form-grid">
            <label className="input-with-icon request-query">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar código, descripción, grupo, bodega o CECO"
              />
            </label>
            <input
              value={requestedBy}
              onChange={(event) => setRequestedBy(event.target.value)}
              placeholder="Solicitante autorizado"
            />
            <input
              value={contract}
              onChange={(event) => setContract(event.target.value)}
              placeholder="Contrato / frente / área"
            />
            <input
              type="date"
              value={neededAt}
              onChange={(event) => setNeededAt(event.target.value)}
            />
            <input
              min={1}
              type="number"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
            />
            <select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as AssetRequestPriority)
              }
            >
              <option value="normal">Prioridad normal</option>
              <option value="urgent">Urgente</option>
              <option value="critical">Crítica</option>
            </select>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Motivo operacional, orden de trabajo o justificación"
            />
          </div>
          {message ? <div className="scan-message">{message}</div> : null}
          {error ? <div className="scan-warning">{error}</div> : null}
        </article>

        <aside className="panel ops-summary">
          <div className="ops-metric">
            <ClipboardCheck size={20} />
            <span>Cola bodega</span>
            <strong>{formatNumber(warehouseQueue.length)}</strong>
          </div>
          <div className="ops-metric">
            <FileSearch size={20} />
            <span>Requiere cotización</span>
            <strong>{formatNumber(quoteQueue.length)}</strong>
          </div>
          <div className="ops-metric">
            <PackageCheck size={20} />
            <span>Resultados actuales</span>
            <strong>{formatNumber(results.length)}</strong>
          </div>
        </aside>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Resultados disponibles para solicitud</h2>
            <p>Si no hay existencia suficiente, la solicitud queda como cotización.</p>
          </div>
        </div>
        {results.length > 0 ? (
          <div className="table-wrap">
            <table className="request-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Bodega</th>
                  <th>Estado</th>
                  <th>Saldo</th>
                  <th>Valor</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item) => {
                  const availability = getAvailabilityStatus(item)

                  return (
                    <tr key={item.id}>
                      <td>
                        <Link className="table-link" to={`/tools/${item.id}`}>
                          {item.code}
                        </Link>
                      </td>
                      <td>{item.description}</td>
                      <td>{item.warehouse}</td>
                      <td>
                        <Badge tone={getAvailabilityTone(availability)}>
                          {availability === 'available' ? (
                            <PackageCheck size={13} />
                          ) : (
                            <AlertTriangle size={13} />
                          )}
                          {getAvailabilityLabel(availability)}
                        </Badge>
                      </td>
                      <td>{formatNumber(item.balance)}</td>
                      <td>{formatCurrency(item.totalValue)}</td>
                      <td>
                        <button
                          className="row-action"
                          type="button"
                          onClick={() => void submitRequest(item)}
                        >
                          <Send size={15} />
                          Solicitar
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <Search size={28} />
            <strong>Busca un activo real del inventario</strong>
            <span>
              La solicitud se evaluará contra saldo, estado y bodega existentes.
            </span>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Últimas solicitudes</h2>
            <p>Registro operativo listo para sincronizar con Supabase.</p>
          </div>
        </div>
        <div className="compact-list">
          {requests.length > 0 ? (
            requests.slice(0, 8).map((request) => (
              <div className="compact-row value-row" key={request.id}>
                <ClipboardCheck size={18} />
                <div>
                  <strong>
                    {request.itemCode} · {request.quantity} un.
                  </strong>
                  <span>
                    {request.contract} · {request.requestedBy} ·{' '}
                    {getRequestStatusLabel(request.status)}
                  </span>
                </div>
                <Badge tone={getRequestTone(request.status)}>
                  {getRequestStatusLabel(request.status)}
                </Badge>
              </div>
            ))
          ) : (
            <p className="empty-copy">Todavía no hay solicitudes registradas.</p>
          )}
        </div>
      </section>
    </div>
  )
}
