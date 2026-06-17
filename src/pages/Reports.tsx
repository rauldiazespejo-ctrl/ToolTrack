import { Download, TrendingUp } from 'lucide-react'
import { Bar } from 'react-chartjs-2'
import '../lib/chart'
import { formatCurrency, formatNumber } from '../lib/format'
import { aggregateBy, getInventoryStats } from '../lib/inventory'

export function Reports() {
  const stats = getInventoryStats()
  const groups = aggregateBy('group')
  const topGroups = groups.slice(0, 10)
  const status = aggregateBy('status')
  const groupData = {
    labels: topGroups.map((item) => item.label),
    datasets: [
      {
        label: 'Valor total',
        data: topGroups.map((item) => item.totalValue),
        backgroundColor: '#16a34a',
        borderRadius: 6,
      },
    ],
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Reportes</span>
          <h1>Valorización por grupo, estado y concentración.</h1>
        </div>
        <button className="secondary-button" type="button">
          <Download size={18} />
          Exportar CSV
        </button>
      </section>

      <section className="report-grid">
        <article className="panel report-card-large">
          <div className="panel-heading">
            <div>
              <h2>Top grupos por valor</h2>
              <p>Ranking calculado desde V.TOTAL.</p>
            </div>
          </div>
          <Bar
            data={groupData}
            options={{
              plugins: { legend: { display: false } },
              scales: {
                y: {
                  ticks: {
                    callback: (value) => `$${Number(value) / 1000000}M`,
                  },
                },
              },
            }}
          />
        </article>

        <article className="panel">
          <TrendingUp size={22} />
          <h2>Resumen ejecutivo</h2>
          <p>
            El inventario contiene {formatNumber(stats.totalItems)} registros en{' '}
            {formatNumber(stats.warehouses)} bodegas, con saldo acumulado de{' '}
            {formatNumber(stats.totalBalance)} unidades.
          </p>
          <strong>{formatCurrency(stats.totalValue)}</strong>
          <span>Valor total valorizado</span>
        </article>
      </section>

      <section className="split-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>Estado</h2>
              <p>Registros activos y cerrados.</p>
            </div>
          </div>
          <div className="compact-list">
            {status.map((item) => (
              <div className="compact-row value-row" key={item.label}>
                <div>
                  <strong>{item.label}</strong>
                  <span>{formatNumber(item.count)} registros</span>
                </div>
                <strong>{formatCurrency(item.totalValue)}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>Grupos</h2>
              <p>Detalle tabular para revisión de compras y control.</p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Grupo</th>
                  <th>Registros</th>
                  <th>Saldo</th>
                  <th>Valor total</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={group.label}>
                    <td>{group.label}</td>
                    <td>{formatNumber(group.count)}</td>
                    <td>{formatNumber(group.balance)}</td>
                    <td>{formatCurrency(group.totalValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  )
}
