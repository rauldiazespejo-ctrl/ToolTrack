import { AlertTriangle, Boxes, DollarSign, Gauge, Landmark, Warehouse } from 'lucide-react'
import { Bar, Doughnut } from 'react-chartjs-2'
import '../lib/chart'
import { StatCard } from '../components/StatCard'
import { inventorySource } from '../data/inventory'
import { formatCurrency, formatNumber } from '../lib/format'
import { aggregateBy, getInventoryStats } from '../lib/inventory'

export function Dashboard() {
  const stats = getInventoryStats()
  const groupBreakdown = aggregateBy('group').slice(0, 8)
  const statusBreakdown = aggregateBy('status')
  const warehouseBreakdown = aggregateBy('warehouse').slice(0, 8)
  const cecoBreakdown = aggregateBy('ceco').slice(0, 6)

  const statusData = {
    labels: statusBreakdown.map((item) => item.label),
    datasets: [
      {
        data: statusBreakdown.map((item) => item.totalValue),
        backgroundColor: ['#16a34a', '#64748b', '#2563eb', '#d97706'],
        borderWidth: 0,
      },
    ],
  }

  const groupData = {
    labels: groupBreakdown.map((item) => item.label),
    datasets: [
      {
        label: 'Valor total',
        data: groupBreakdown.map((item) => item.totalValue),
        backgroundColor: '#2563eb',
        borderRadius: 6,
      },
    ],
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Inventario valorizado</span>
          <h1>Control real de existencias, bodegas y valorización.</h1>
        </div>
        <button className="primary-button" type="button">
          <Boxes size={18} />
          {formatNumber(inventorySource.rowCount)} registros
        </button>
      </section>

      <section className="stats-grid">
        <StatCard
          icon={Boxes}
          label="Ítems valorizados"
          value={formatNumber(stats.totalItems)}
          detail={`${formatNumber(stats.totalBalance)} unidades en saldo`}
        />
        <StatCard
          icon={Warehouse}
          label="Bodegas"
          value={formatNumber(stats.warehouses)}
          detail={`${formatNumber(stats.cecos)} CECO asociados`}
        />
        <StatCard
          icon={DollarSign}
          label="Valor total"
          value={formatCurrency(stats.totalValue)}
          detail="Según columna V.TOTAL"
        />
        <StatCard
          icon={AlertTriangle}
          label="Registros cerrados"
          value={formatNumber(stats.closedItems)}
          detail={`${formatNumber(stats.activeItems)} registros activos`}
        />
      </section>

      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <h2>Valor por estado</h2>
              <p>Distribución monetaria declarada en el Excel.</p>
            </div>
          </div>
          <div className="doughnut-wrap">
            <Doughnut data={statusData} options={{ cutout: '68%' }} />
          </div>
        </article>

        <article className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <h2>Top grupos</h2>
              <p>Concentración de valor por grupo de inventario.</p>
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
      </section>

      <section className="split-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>Top bodegas</h2>
              <p>Mayor concentración de inventario valorizado.</p>
            </div>
          </div>
          <div className="compact-list">
            {warehouseBreakdown.map((warehouse) => (
              <div className="compact-row value-row" key={warehouse.label}>
                <Warehouse size={18} />
                <div>
                  <strong>{warehouse.label}</strong>
                  <span>{formatNumber(warehouse.count)} registros</span>
                </div>
                <strong>{formatCurrency(warehouse.totalValue)}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>Top CECO</h2>
              <p>Centros con mayor valor asignado.</p>
            </div>
          </div>
          <div className="compact-list">
            {cecoBreakdown.map((ceco) => (
              <div className="compact-row value-row" key={ceco.label}>
                <Landmark size={18} />
                <div>
                  <strong>CECO {ceco.label}</strong>
                  <span>{formatNumber(ceco.count)} registros</span>
                </div>
                <strong>{formatCurrency(ceco.totalValue)}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel source-panel">
        <Gauge size={20} />
        <div>
          <h2>Fuente de datos</h2>
          <p>
            Archivo {inventorySource.fileName}, hoja {inventorySource.sheetName}.
            La app no usa datos de demostración ni coordenadas inferidas.
          </p>
        </div>
      </section>
    </div>
  )
}
