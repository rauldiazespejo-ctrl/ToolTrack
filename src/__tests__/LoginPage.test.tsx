import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { LoginPage } from '../pages/LoginPage'

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    signIn: () => Promise.resolve({ error: null }),
    isAuthenticated: false,
    isLoading: false,
  }),
}))

describe('LoginPage', () => {
  it('renders email, password inputs and submit button', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
    )
    expect(screen.getByLabelText(/correo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contrasena/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar/i })).toBeInTheDocument()
  })
})
