import { AlertTriangle, ClipboardList, FileWarning, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { formatNumber } from '../lib/format'
import { getComplianceCandidates } from '../lib/inventory'

export function Compliance() {
  const candidates = getComplianceCandidates()

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Cumplimiento documental</span>
          <h1>Certificaciones, calibraciones y mantenciones por cargar.</h1>
        </div>
        <span className="result-count">
          {formatNumber(candidates.length)} candidatos iniciales
        </span>
      </section>

      <section className="panel source-panel">
        <ShieldCheck size={20} />
        <div>
          <h2>Sin vencimientos inventados</h2>
          <p>
            El Excel actual no trae fechas de certificación o calibración. Esta vista
            identifica activos candidatos por descripción real y deja preparado el
            control documental en Supabase.
          </p>
        </div>
      </section>

      <section className="split-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>Priorización documental</h2>
              <p>Activos que deberían clasificarse antes de despacho controlado.</p>
            </div>
          </div>
          <div className="compliance-meter">
            <FileWarning size={28} />
            <strong>{formatNumber(candidates.length)}</strong>
            <span>pendientes de regla documental</span>
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>Reglas futuras</h2>
              <p>Bloqueo por documento vencido, alerta 30/15/7 días y auditoría.</p>
            </div>
          </div>
          <div className="compact-list">
            <div className="compact-row value-row">
              <AlertTriangle size={18} />
              <div>
                <strong>Bloqueo de despacho</strong>
                <span>Si requiere certificación vigente y no existe documento.</span>
              </div>
            </div>
            <div className="compact-row value-row">
              <ClipboardList size={18} />
              <div>
                <strong>Timeline documental</strong>
                <span>Certificados, calibraciones, mantenciones e inspecciones.</span>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Candidatos desde inventario real</h2>
            <p>La clasificación final la debe crear un usuario autorizado.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table className="compliance-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Grupo</th>
                <th>Bodega</th>
                <th>Señal</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((item) => (
                <tr key={item.inventoryItemId}>
                  <td>
                    <Link className="table-link" to={`/tools/${item.inventoryItemId}`}>
                      {item.itemCode}
                    </Link>
                  </td>
                  <td>{item.description}</td>
                  <td>{item.group}</td>
                  <td>{item.warehouse}</td>
                  <td>
                    <Badge tone="warning">Clasificar</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
