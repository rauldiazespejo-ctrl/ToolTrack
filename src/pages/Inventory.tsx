import { QrCode, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { formatCurrency, formatNumber } from '../lib/format'
import { getStatusTone, getUniqueValues, searchInventoryItems } from '../lib/inventory'

const visibleLimit = 250

export function Inventory() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [group, setGroup] = useState('all')
  const [warehouse, setWarehouse] = useState('all')

  const statuses = useMemo(() => getUniqueValues('status'), [])
  const groups = useMemo(() => getUniqueValues('group'), [])
  const warehouses = useMemo(() => getUniqueValues('warehouse'), [])

  const filteredItems = useMemo(
    () => searchInventoryItems({ query, status, group, warehouse }),
    [query, status, group, warehouse],
  )
  const visibleItems = filteredItems.slice(0, visibleLimit)

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Inventario real</span>
          <h1>Buscar por código, descripción, grupo, bodega o CECO.</h1>
        </div>
        <span className="result-count">
          {formatNumber(filteredItems.length)} resultados
        </span>
      </section>

      <section className="toolbar inventory-toolbar">
        <label className="input-with-icon">
          <Search size={18} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ej: ESMERIL, BODEGA CENTRAL, ACT-0400021"
          />
        </label>

        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">Todos los estados</option>
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select value={group} onChange={(event) => setGroup(event.target.value)}>
          <option value="all">Todos los grupos</option>
          {groups.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select value={warehouse} onChange={(event) => setWarehouse(event.target.value)}>
          <option value="all">Todas las bodegas</option>
          {warehouses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </section>

      <section className="panel">
        <div className="table-wrap">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Bodega</th>
                <th>Estado</th>
                <th>Grupo</th>
                <th>Saldo</th>
                <th>V. total</th>
                <th>QR</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link className="table-link" to={`/tools/${item.id}`}>
                      {item.code}
                    </Link>
                  </td>
                  <td>{item.description}</td>
                  <td>{item.warehouse}</td>
                  <td>
                    <Badge tone={getStatusTone(item.status)}>{item.status}</Badge>
                  </td>
                  <td>{item.group}</td>
                  <td>{formatNumber(item.balance)}</td>
                  <td>{formatCurrency(item.totalValue)}</td>
                  <td>
                    <Link
                      className="qr-row-link"
                      to={`/tools/${item.id}?print=qr`}
                      aria-label={`Abrir QR de ${item.code}`}
                    >
                      <QrCode size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredItems.length > visibleLimit ? (
          <p className="table-note">
            Mostrando {formatNumber(visibleLimit)} de {formatNumber(filteredItems.length)}.
            Usa búsqueda o filtros para acotar.
          </p>
        ) : null}
      </section>
    </div>
  )
}
