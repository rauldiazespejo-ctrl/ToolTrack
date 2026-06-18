import { Bell, BellRing, CheckCheck, TriangleAlert } from 'lucide-react'
import { toast } from '../lib/toast'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Table, TableCell, TableRow } from '../components/ui/Table'
import { StatCard } from '../components/shared/StatCard'
import { useAlerts } from '../hooks/useAlerts'
import { useNotifications } from '../hooks/useNotifications'
import { formatDate } from '../lib/utils'

export function AlertsPage() {
  const { alerts, stats, markRead, markAllRead, dismiss } = useAlerts()
  const { notifications, unreadCount, criticalCount, markRead: markNotificationRead, markAllRead: markNotificationsRead } = useNotifications()

  async function handleMarkAll() {
    await markAllRead()
    await markNotificationsRead()
    toast.success('Todo marcado como leído')
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Bell size={20} />} label="Alertas" value={stats.total} />
        <StatCard icon={<BellRing size={20} />} label="No leídas" value={stats.unread + unreadCount} />
        <StatCard icon={<TriangleAlert size={20} />} label="Críticas" value={stats.critical + criticalCount} className={stats.critical + criticalCount > 0 ? 'border-red-500/30' : ''} />
        <StatCard icon={<CheckCheck size={20} />} label="Notificaciones" value={notifications.length} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Alertas y Notificaciones</h1>
          <p className="text-sm text-[var(--text-secondary)]">Todo lo que requiere atención operativa y documental.</p>
        </div>
        <Button variant="secondary" onClick={() => { void handleMarkAll(); }}>
          Marcar todo leído
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card title="Alertas del sistema" action={<span className="text-xs text-[var(--text-secondary)]">{alerts.length} registros</span>} padding={false}>
          <Table headers={['Título', 'Mensaje', 'Estado', 'Acciones']}>
            {alerts.map(alert => (
              <TableRow key={alert.id}>
                <TableCell>
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{formatDate(alert.created_at)}</p>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-[var(--text-secondary)]">{alert.message}</p>
                </TableCell>
                <TableCell>
                  <Badge variant={alert.severity === 'critica' ? 'danger' : alert.severity === 'alta' ? 'warning' : alert.severity === 'media' ? 'info' : 'default'}>
                    {alert.is_read ? 'Leída' : 'Pendiente'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {!alert.is_read && (
                      <Button size="sm" variant="secondary" onClick={() => { void markRead(alert.id); }}>
                        Leer
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => { void dismiss(alert.id); }}>
                      Eliminar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </Card>

        <Card title="Notificaciones internas" action={<span className="text-xs text-[var(--text-secondary)]">{notifications.length} registros</span>} padding={false}>
          <Table headers={['Título', 'Destinatario', 'Severidad', 'Acciones']}>
            {notifications.map(notification => (
              <TableRow key={notification.id}>
                <TableCell>
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{notification.message}</p>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-[var(--text-secondary)]">{notification.recipient_role}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={notification.severity === 'critica' ? 'danger' : notification.severity === 'alta' ? 'warning' : notification.severity === 'media' ? 'info' : 'default'}>
                    {notification.is_read ? 'Leída' : 'Nueva'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {!notification.is_read && (
                      <Button size="sm" variant="secondary" onClick={() => { void markNotificationRead(notification.id); }}>
                        Leer
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => { void toast.success('Registro conservado en historial'); }}>
                      Historial
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </Card>
      </div>
    </div>
  )
}
