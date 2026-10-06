import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import React from 'react'

// Mock the hooks
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com', user_metadata: { full_name: 'Test User' } },
    signOut: vi.fn()
  })
}))

describe('Sidebar Accessibility', () => {
  it('menu button has correct aria-label and focus-visible classes', () => {
    render(<MemoryRouter><Sidebar /></MemoryRouter>)
    const button = screen.getByLabelText('Abrir menú')
    expect(button).toBeInTheDocument()
    expect(button.className).toContain('focus-visible:outline-2')
  })

  it('close button has correct aria-label and focus-visible classes', () => {
    render(<MemoryRouter><Sidebar /></MemoryRouter>)
    const button = screen.getByLabelText('Cerrar menú')
    expect(button).toBeInTheDocument()
    expect(button.className).toContain('focus-visible:outline-2')
  })

  it('logout button has correct aria-label and focus-visible classes', () => {
    render(<MemoryRouter><Sidebar /></MemoryRouter>)
    const button = screen.getByLabelText('Cerrar sesión')
    expect(button).toBeInTheDocument()
    expect(button.className).toContain('focus-visible:outline-2')
  })

  it('nav links have correct focus-visible classes', () => {
    render(<MemoryRouter><Sidebar /></MemoryRouter>)
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
    links.forEach(link => {
      expect(link.className).toContain('focus-visible:outline-2')
    })
  })
})
