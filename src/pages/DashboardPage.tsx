import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Wrench, Package, Settings, AlertTriangle, DollarSign, TrendingUp, ArrowRight, ArrowDownToLine, ArrowUpFromLine, RefreshCw, Clock } from 'lucide-react'
import { Chart, DoughnutController, ArcElement, Tooltip, Legend, BarController, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { StatCard } from '../components/shared/StatCard'
import { Badge } from '../components/ui/Badge'
import { useEquipment } from '../hooks/useEquipment'
import { useInventory } from '../hooks/useInventory'
import { useMaintenance } from '../hooks/useMaintenance'
import { useAlerts } from '../hooks/useAlerts'
import { useActivityLog } from '../hooks/useActivityLog'
import { useRequests } from '../hooks/useRequests'
import { useCompliance } from '../hooks/useCompliance'
import { useNotifications } from '../hooks/useNotifications'
import { formatCurrency, formatDate, getSeverityColor } from '../lib/utils'

Chart.register(DoughnutController, ArcElement, Tooltip, Legend, BarController, BarElement, CategoryScale, LinearScale)

const actionIcons: Record<string, typeof ArrowDownToLine> = {
  checkout: ArrowUpFromLine,
  checkin: ArrowDownToLine,
  transfer: RefreshCw,
  maintenance: Settings,
}

const actionLabels: Record<string, string> = {
  checkout: 'Retiro',
  checkin: 'Devolución',
  transfer: 'Transferencia',
  maintenance: 'Mantención',
}

export function DashboardPage() {
  const { equipment, stats: eqStats } = useEquipment()
  const { stats: invStats, lowStockItems } = useInventory()
  const { stats: mtStats } = useMaintenance()
  const { alerts, unreadCount } = useAlerts()
  const { recentLogs } = useActivityLog()
  const { stats: requestStats } = useRequests()
  const { stats: complianceStats } = useCompliance()
  const { unreadCount: notificationUnreadCount } = useNotifications()

  const doughnutRef = useRef<HTMLCanvasElement>(null)
  const barRef = useRef<HTMLCanvasElement>(null)
  const doughnutChart = useRef<Chart | null>(null)
  const barChart = useRef<Chart | null>(null)

  useEffect(() => {
    if (!doughnutRef.current) return
    doughnutChart.current?.destroy()
    doughnutChart.current = new Chart(doughnutRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Disponible', 'En Uso', 'Mantención', 'Fuera de Servicio'],
        datasets: [{
          data: [eqStats.disponible, eqStats.en_uso, eqStats.mantenimiento, eqStats.fuera_servicio],
          backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { display: false },
        },
      },
    })
    return () => { doughnutChart.current?.destroy() }
  }, [eqStats])

  useEffect(() => {
    if (!barRef.current) return
    barChart.current?.destroy()
    const typeCounts = {
      herramienta: equipment.filter(e => e.type === 'herramienta').length,
      vehiculo: equipment.filter(e => e.type === 'vehiculo').length,
      maquinaria: equipment.filter(e => e.type === 'maquinaria').length,
      epp: equipment.filter(e => e.type === 'epp').length,
    }
    barChart.current = new Chart(barRef.current, {
      type: 'bar',
      data: {
        labels: ['Herramientas', 'Vehículos', 'Maquinaria', 'EPP'],
        datasets: [{
          data: [typeCounts.herramienta, typeCounts.vehiculo, typeCounts.maquinaria, typeCounts.epp],
          backgroundColor: ['#6366f1', '#8b5cf6', '#06b6d4', '#14b8a6'],
          borderRadius: 6,
          barThickness: 32,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { color: '#94a3b8', font: { size: 11 } },
            grid: { display: false },
            border: { display: false },
          },
          y: {
            ticks: { color: '#94a3b8', font: { size: 11 }, stepSize: 1 },
            grid: { color: 'rgba(255,255,255,0.04)' },
            border: { display: false },
          },
        },
      },
    })
    return () => { barChart.current?.destroy() }
  }, [equipment])

  const recentAlerts = alerts.filter(a => !a.is_read).slice(0, 4)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard icon={<Wrench size={20} />} label="Total Equipos" value={eqStats.total} />
        <StatCard icon={<TrendingUp size={20} />} label="En Uso" value={eqStats.en_uso} trend={{ direction: 'up', percentage: Math.round((eqStats.en_uso / Math.max(eqStats.total, 1)) * 100) }} />
        <StatCard icon={<Settings size={20} />} label="En Mantención" value={eqStats.mantenimiento + mtStats.vencido} />
        <StatCard icon={<AlertTriangle size={20} />} label="Alertas Activas" value={unreadCount + notificationUnreadCount} trend={unreadCount + notificationUnreadCount > 3 ? { direction: 'up', percentage: unreadCount + notificationUnreadCount } : undefined} />
        <StatCard icon={<Package size={20} />} label="Stock Bajo" value={invStats.lowStock} />
        <StatCard icon={<DollarSign size={20} />} label="Valor Activos" value={formatCurrency(eqStats.valorTotal)} />
        <StatCard icon={<ArrowRight size={20} />} label="Solicitudes" value={requestStats.total} />
        <StatCard icon={<Clock size={20} />} label="Docs vence pronto" value={complianceStats.vencePronto} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">Estado de Equipos</h3>
          <div className="relative mx-auto" style={{ height: 180, maxWidth: 180 }}>
            <canvas ref={doughnutRef} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { label: 'Disponible', count: eqStats.disponible, color: '#22c55e' },
              { label: 'En Uso', count: eqStats.en_uso, color: '#3b82f6' },
              { label: 'Mantención', count: eqStats.mantenimiento, color: '#f59e0b' },
              { label: 'Fuera Servicio', count: eqStats.fuera_servicio, color: '#ef4444' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-[var(--text-secondary)]">{item.label}: {item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">Equipos por Tipo</h3>
          <div style={{ height: 220 }}>
            <canvas ref={barRef} />
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Alertas Recientes</h3>
            <Link to="/alerts" className="flex items-center gap-1 text-xs text-[var(--accent)] hover:underline">
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentAlerts.length === 0 && (
              <p className="py-6 text-center text-sm text-[var(--text-secondary)]">Sin alertas pendientes</p>
            )}
            {recentAlerts.map(alert => (
              <div
                key={alert.id}
                className="flex items-start gap-3 rounded-lg bg-white/[0.02] px-3 py-2.5"
                style={{ borderLeft: `3px solid var(--${getSeverityColor(alert.severity)})` }}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--text-primary)]">{alert.title}</p>
                  <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{alert.message.slice(0, 60)}...</p>
                </div>
                <Badge variant={alert.severity === 'critica' ? 'danger' : alert.severity === 'alta' ? 'warning' : 'default'}>
                  {alert.severity}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Actividad Reciente</h3>
            <Link to="/equipment" className="flex items-center gap-1 text-xs text-[var(--accent)] hover:underline">
              Ver equipos <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentLogs.slice(0, 5).map(log => {
              const Icon = actionIcons[log.action] || Clock
              return (
                <div key={log.id} className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
                    <Icon size={16} className="text-[var(--accent)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">{log.equipment_name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {actionLabels[log.action] || log.action} — {log.user_name}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-[var(--text-secondary)]">{formatDate(log.created_at)}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Stock Bajo</h3>
            <Link to="/inventory" className="flex items-center gap-1 text-xs text-[var(--accent)] hover:underline">
              Ver inventario <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {lowStockItems.length === 0 && (
              <p className="py-6 text-center text-sm text-[var(--text-secondary)]">Todo el inventario sobre stock mínimo</p>
            )}
            {lowStockItems.slice(0, 5).map(item => (
              <div key={item.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{item.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{item.location_warehouse}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[var(--danger)]">{item.quantity} {item.unit}</p>
                  <p className="text-xs text-[var(--text-secondary)]">Mín: {item.min_stock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
