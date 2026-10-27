import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { AuthContext } from '../context/AuthContext'
import { SearchContext } from '../context/SearchContext'

vi.mock('../hooks/useAlerts', () => ({
  useAlerts: () => ({ unreadCount: 0 })
}))

describe('Header accessibility', () => {
  it('has aria-labels on interactive elements', () => {
    const mockAuthContext = {
      user: null,
      session: null,
      isLoading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    }

    const mockSearchContext = {
      query: '',
      setQuery: vi.fn(),
    }

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <SearchContext.Provider value={mockSearchContext}>
          <BrowserRouter>
            <Header />
          </BrowserRouter>
        </SearchContext.Provider>
      </AuthContext.Provider>
    )

    const searchInput = screen.getByLabelText('Buscar equipos')
    expect(searchInput).toBeDefined()

    const notifButton = screen.getByLabelText('Notificaciones')
    expect(notifButton).toBeDefined()
  })
})
