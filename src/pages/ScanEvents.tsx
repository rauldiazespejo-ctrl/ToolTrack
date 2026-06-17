import { AlertTriangle, CheckCircle2, ClipboardList } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { getScanActionLabel, useScanEvents } from '../lib/scanEvents'

export function ScanEvents() {
  const { events, error, source } = useScanEvents()
  const sourceLabel = source === 'supabase' ? 'Supabase' : 'localmente'

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Control de terreno</span>
          <h1>Eventos QR capturados {sourceLabel}.</h1>
        </div>
        <span className="result-count">
          {events.length} eventos · {source === 'supabase' ? 'Supabase' : 'Local'}
        </span>
      </section>

      {error ? <div className="scan-warning">{error}</div> : null}

      <section className="panel">
        {events.length > 0 ? (
          <div className="table-wrap">
            <table className="events-table">
              <thead>
                <tr>
                  <th>Acción</th>
                  <th>Código</th>
                  <th>Bodega esperada</th>
                  <th>Bodega reportada</th>
                  <th>Fecha</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td data-label="Acción">
                      <Badge
                        tone={
                          event.action === 'confirm_location' ? 'positive' : 'warning'
                        }
                      >
                        {event.action === 'confirm_location' ? (
                          <CheckCircle2 size={13} />
                        ) : (
                          <AlertTriangle size={13} />
                        )}
                        {getScanActionLabel(event.action)}
                      </Badge>
                    </td>
                    <td data-label="Código">
                      <Link className="table-link" to={`/tools/${event.inventoryItemId}`}>
                        {event.itemCode}
                      </Link>
                    </td>
                    <td data-label="Bodega esperada">{event.expectedWarehouse}</td>
                    <td data-label="Bodega reportada">{event.reportedWarehouse}</td>
                    <td data-label="Fecha">
                      {new Date(event.createdAt).toLocaleString('es-CL')}
                    </td>
                    <td data-label="Notas">{event.notes || 'Sin notas'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <ClipboardList size={28} />
            <strong>Sin eventos todavía</strong>
            <span>
              Escanea un QR y usa Confirmar ubicación o Reportar diferencia para
              registrar actividad.
            </span>
          </div>
        )}
      </section>
    </div>
  )
}
