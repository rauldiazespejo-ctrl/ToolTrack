import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { vi } from 'vitest'

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com', id: '1', user_metadata: {} }
  })
}))

vi.mock('../hooks/useAlerts', () => ({
  useAlerts: () => ({
    unreadCount: 0
  })
}))

vi.mock('../hooks/useSearch', () => ({
  useSearch: () => ({
    setQuery: vi.fn()
  })
}))

describe('Header Accessibility', () => {
  it('should have proper ARIA labels', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )

    const searchInput = screen.getByLabelText('Buscar equipos e inventario')
    expect(searchInput).toBeInTheDocument()

    const bellButton = screen.getByLabelText('Notificaciones')
    expect(bellButton).toBeInTheDocument()
  })
})
