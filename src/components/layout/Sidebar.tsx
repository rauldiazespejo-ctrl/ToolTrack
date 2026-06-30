import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Wrench,
  Package,
  Settings,
  Bell,
  MapPin,
  Settings2,
  Menu,
  X,
  HardHat,
  LogOut,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/equipment', icon: Wrench, label: 'Equipos' },
  { to: '/inventory', icon: Package, label: 'Inventario' },
  { to: '/maintenance', icon: Settings, label: 'Mantenimiento' },
  { to: '/alerts', icon: Bell, label: 'Alertas' },
  { to: '/map', icon: MapPin, label: 'Mapa' },
  { to: '/settings', icon: Settings2, label: 'Configuracion' },
]

function getUserDisplayName(user: ReturnType<typeof useAuth>['user']): string {
  if (!user) return 'Usuario'
  const meta = user.user_metadata as Record<string, unknown> | undefined
  if (typeof meta?.full_name === 'string' && meta.full_name.trim()) return meta.full_name
  if (user.email) return user.email
  return 'Usuario'
}

function getAvatarFallback(user: ReturnType<typeof useAuth>['user']): string {
  if (!user) return 'U'
  const email = user.email || ''
  if (!email) return 'U'
  return email.slice(0, 2).toUpperCase()
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const displayName = getUserDisplayName(user)
  const avatarFallback = getAvatarFallback(user)

  async function handleLogout() {
    await signOut()
    void navigate('/login')
  }

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-[var(--bg-card)] p-2 text-[var(--text-secondary)] lg:hidden cursor-pointer border border-[var(--border)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        aria-label="Abrir menú"
      >
        <Menu size={20} />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={cn(
        'fixed top-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-[var(--border)] bg-[var(--bg-secondary)] transition-transform duration-200 lg:static lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)]">
              <HardHat size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-[var(--text-primary)] tracking-wide">SOLDESP</h1>
              <p className="text-[10px] font-medium text-[var(--text-secondary)] tracking-widest uppercase">ToolTrack</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] lg:hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[var(--border)] px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/20 text-xs font-bold text-[var(--accent)]">
                {avatarFallback}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{displayName}</p>
                <p className="text-xs text-[var(--text-secondary)] truncate">{user?.email || 'Usuario'}</p>
              </div>
            </div>
            <button
              onClick={() => { void handleLogout(); }}
              className="shrink-0 rounded-lg p-2 text-[var(--text-secondary)] hover:bg-white/5 hover:text-red-400 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              title="Cerrar sesion"
              aria-label="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
