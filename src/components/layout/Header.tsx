import { useLocation } from 'react-router-dom'
import { Search, Bell } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/equipment': 'Equipos',
  '/inventory': 'Inventario',
  '/maintenance': 'Mantenimiento',
  '/alerts': 'Alertas',
  '/map': 'Mapa de Sitios',
  '/settings': 'Configuracion',
}

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/equipment/')) return 'Detalle Equipo'
  return pageTitles[pathname] || 'SOLDESP ToolTrack'
}

export function Header() {
  const location = useLocation()
  const title = getPageTitle(location.pathname)

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
            className="w-64 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] py-2 pl-9 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 outline-none transition-colors focus:border-[var(--accent)]"
          />
        </div>

        <button className="relative rounded-lg p-2 text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors cursor-pointer">
          <Bell size={20} />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--danger)] text-[10px] font-bold text-white">
            3
          </span>
        </button>

        <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)]/20 text-xs font-bold text-[var(--accent)]">
          RD
        </div>
      </div>
    </header>
  )
}
