import {
  BarChart3,
  Boxes,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  QrCode,
  Search,
  Settings,
  Warehouse,
  Wrench,
} from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tools', label: 'Inventario', icon: Boxes },
  { to: '/map', label: 'Bodegas', icon: Warehouse },
  { to: '/qr', label: 'Etiquetas QR', icon: QrCode },
  { to: '/events', label: 'Eventos', icon: ClipboardList },
  { to: '/reports', label: 'Reportes', icon: BarChart3 },
]

export function Layout() {
  const { isSupabaseConfigured, user, signOut } = useAuth()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Wrench size={22} />
          </div>
          <div>
            <strong>ToolTrack</strong>
            <span>Inventario valorizado</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                isActive ? 'nav-item nav-item-active' : 'nav-item'
              }
              end={item.to === '/'}
              key={item.to}
              to={item.to}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-card">
          <ClipboardCheck size={20} />
          <strong>Control por QR</strong>
          <span>Cada registro único genera una etiqueta escaneable.</span>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="search-box">
            <Search size={18} />
            <span>Buscar código, descripción, bodega, CECO...</span>
          </div>
          <button className="icon-button" type="button" aria-label="Settings">
            <Settings size={18} />
          </button>
          <div className="auth-pill">
            {isSupabaseConfigured ? (
              user ? (
                <>
                  <span>{user.email}</span>
                  <button type="button" onClick={() => void signOut()}>
                    Salir
                  </button>
                </>
              ) : (
                <NavLink to="/login">Entrar</NavLink>
              )
            ) : (
              <span>Modo local</span>
            )}
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
