import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar'
import { vi } from 'vitest'

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com', id: '1', user_metadata: {} },
    signOut: vi.fn()
  })
}))

describe('Sidebar Accessibility', () => {
  it('should have proper ARIA labels', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    )

    const openMenuBtn = screen.getByLabelText('Abrir menú de navegación')
    expect(openMenuBtn).toBeInTheDocument()

    const closeMenuBtn = screen.getByLabelText('Cerrar menú de navegación')
    expect(closeMenuBtn).toBeInTheDocument()

    const logoutBtn = screen.getByLabelText('Cerrar sesión')
    expect(logoutBtn).toBeInTheDocument()
  })
})
