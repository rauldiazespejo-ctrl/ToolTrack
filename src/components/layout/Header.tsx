import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Search, Bell } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useAlerts } from '../../hooks/useAlerts'
import { useNotifications } from '../../hooks/useNotifications'
import { useDebounce } from '../../hooks/useDebounce'
import { useSearch } from '../../hooks/useSearch'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/equipment': 'Equipos',
  '/inventory': 'Inventario',
  '/requests': 'Solicitudes',
  '/warehouse': 'Bodega',
  '/compliance': 'Cumplimiento',
  '/events': 'Eventos',
  '/maintenance': 'Mantenimiento',
  '/alerts': 'Alertas',
  '/map': 'Mapa de Sitios',
  '/settings': 'Configuracion',
}

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/equipment/')) return 'Detalle Equipo'
  return pageTitles[pathname] || 'SOLDESP ToolTrack'
}

function getAvatarFallback(user: ReturnType<typeof useAuth>['user']): string {
  if (!user) return 'U'
  const email = user.email || ''
  if (!email) return 'U'
  return email.slice(0, 2).toUpperCase()
}

export function Header() {
  const location = useLocation()
  const title = getPageTitle(location.pathname)
  const { user } = useAuth()
  const { unreadCount } = useAlerts()
  const { unreadCount: notificationUnreadCount } = useNotifications()
  const avatarFallback = getAvatarFallback(user)

  const [inputValue, setInputValue] = useState('')
  const debouncedValue = useDebounce(inputValue, 300)
  const { setQuery } = useSearch()

  useEffect(() => {
    setQuery(debouncedValue)
  }, [debouncedValue, setQuery])

  return (
    <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-secondary)] px-6 py-4">
      <div className="pl-12 lg:pl-0">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Buscar equipos, inventario..."
            aria-label="Buscar equipos, inventario..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="w-64 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] py-2 pl-9 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 outline-none transition-colors focus:border-[var(--accent)]"
          />
        </div>

        <button
          className="relative rounded-lg p-2 text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          aria-label="Notificaciones"
          title="Notificaciones"
        >
          <Bell size={20} />
          {unreadCount + notificationUnreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--danger)] text-[10px] font-bold text-white">
              {unreadCount + notificationUnreadCount > 9 ? '9+' : unreadCount + notificationUnreadCount}
            </span>
          )}
        </button>

        <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)]/20 text-xs font-bold text-[var(--accent)]">
          {avatarFallback}
        </div>
      </div>
    </header>
  )
}
