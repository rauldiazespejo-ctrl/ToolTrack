import { Warehouse } from 'lucide-react'
import { formatCurrency, formatNumber } from '../lib/format'
import { aggregateBy } from '../lib/inventory'

export function AssetMap() {
  const warehouses = aggregateBy('warehouse')
  const maxValue = warehouses[0]?.totalValue ?? 1

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Bodegas reales</span>
          <h1>Distribución por bodega sin coordenadas inventadas.</h1>
        </div>
      </section>

      <section className="panel">
        <div className="warehouse-rank">
          {warehouses.map((warehouse) => (
            <article className="warehouse-row" key={warehouse.label}>
              <div className="warehouse-label">
                <Warehouse size={18} />
                <div>
                  <strong>{warehouse.label}</strong>
                  <span>
                    {formatNumber(warehouse.count)} registros · saldo{' '}
                    {formatNumber(warehouse.balance)}
                  </span>
                </div>
              </div>
              <div className="warehouse-value">
                <strong>{formatCurrency(warehouse.totalValue)}</strong>
                <div className="value-bar">
                  <span
                    style={{
                      width: `${Math.max(
                        3,
                        (warehouse.totalValue / maxValue) * 100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
