import { Printer, QrCode, Search } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useMemo, useState } from 'react'
import { Badge } from '../components/Badge'
import { formatCurrency, formatNumber } from '../lib/format'
import {
  getQrIdentity,
  getQrValue,
  getStatusTone,
  getUniqueValues,
  searchInventoryItems,
} from '../lib/inventory'

const labelLimit = 96

export function QRLabels() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [group, setGroup] = useState('all')
  const [warehouse, setWarehouse] = useState('all')

  const statuses = useMemo(() => getUniqueValues('status'), [])
  const groups = useMemo(() => getUniqueValues('group'), [])
  const warehouses = useMemo(() => getUniqueValues('warehouse'), [])
  const items = useMemo(
    () => searchInventoryItems({ query, status, group, warehouse }),
    [query, status, group, warehouse],
  )
  const labels = items.slice(0, labelLimit)

  return (
    <div className="page-stack qr-workspace">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Centro de etiquetas</span>
          <h1>QR único por componente del inventario.</h1>
        </div>
        <button className="primary-button" type="button" onClick={() => window.print()}>
          <Printer size={18} />
          Imprimir selección
        </button>
      </section>

      <section className="toolbar inventory-toolbar no-print">
        <label className="input-with-icon">
          <Search size={18} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filtrar etiquetas por código, bodega, descripción"
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

      <section className="qr-summary no-print">
        <article>
          <QrCode size={20} />
          <div>
            <strong>{formatNumber(items.length)} elementos únicos</strong>
            <span>
              Mostrando {formatNumber(labels.length)} etiquetas. Filtra antes de imprimir
              lotes grandes.
            </span>
          </div>
        </article>
      </section>

      <section className="qr-label-grid">
        {labels.map((item) => (
          <article className="qr-label" key={item.id}>
            <div className="qr-label-header">
              <strong>{item.code}</strong>
              <Badge tone={getStatusTone(item.status)}>{item.status}</Badge>
            </div>
            <div className="qr-label-body">
              <QRCodeSVG value={getQrValue(item)} size={112} level="M" />
              <div>
                <span>{getQrIdentity(item)}</span>
                <p>{item.description}</p>
              </div>
            </div>
            <div className="qr-label-footer">
              <span>{item.warehouse}</span>
              <strong>{formatCurrency(item.totalValue)}</strong>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
