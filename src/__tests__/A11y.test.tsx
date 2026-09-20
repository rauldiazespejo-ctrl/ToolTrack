import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from '../components/layout/Header'
import { Sidebar } from '../components/layout/Sidebar'
import { BrowserRouter } from 'react-router-dom'

// Mock the hooks used in Header and Sidebar
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com', user_metadata: { full_name: 'Test User' } },
    signOut: vi.fn(),
  }),
}))

vi.mock('../hooks/useAlerts', () => ({
  useAlerts: () => ({
    unreadCount: 3,
  }),
}))

vi.mock('../hooks/useSearch', () => ({
  useSearch: () => ({
    setQuery: vi.fn(),
  }),
}))

test('Header has correct ARIA labels', () => {
  render(
    <BrowserRouter>
      <Header />
    </BrowserRouter>
  )

  const searchInput = screen.getByLabelText('Buscar')
  expect(searchInput).toBeInTheDocument()

  const bellButton = screen.getByLabelText(/Notificaciones, 3 no leídas/i)
  expect(bellButton).toBeInTheDocument()
})

test('Sidebar has correct ARIA labels', () => {
  render(
    <BrowserRouter>
      <Sidebar />
    </BrowserRouter>
  )

  const menuButton = screen.getByLabelText('Abrir menú')
  expect(menuButton).toBeInTheDocument()

  const logoutButton = screen.getByLabelText('Cerrar sesión')
  expect(logoutButton).toBeInTheDocument()
})
