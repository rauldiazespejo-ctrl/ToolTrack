import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Header } from './Header'
import React from 'react'

// Mock the hooks
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { email: 'test@example.com' } })
}))
vi.mock('../../hooks/useAlerts', () => ({
  useAlerts: () => ({ unreadCount: 3 })
}))
vi.mock('../../hooks/useSearch', () => ({
  useSearch: () => ({ setQuery: vi.fn() })
}))

describe('Header Accessibility', () => {
  it('search input has correct aria-label and focus-visible classes', () => {
    render(<MemoryRouter><Header /></MemoryRouter>)
    const input = screen.getByLabelText('Buscar equipos e inventario')
    expect(input).toBeInTheDocument()
    expect(input.className).toContain('focus-visible:outline-2')
    expect(input.className).toContain('focus-visible:outline-[var(--accent)]')
  })

  it('notification button has correct aria-label and focus-visible classes', () => {
    render(<MemoryRouter><Header /></MemoryRouter>)
    const button = screen.getByLabelText('Notificaciones')
    expect(button).toBeInTheDocument()
    expect(button.className).toContain('focus-visible:outline-2')
    expect(button.className).toContain('focus-visible:outline-[var(--accent)]')
  })
})
