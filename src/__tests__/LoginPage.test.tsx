import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
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
    const { getByLabelText, getByRole } = render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
    )
    expect(getByLabelText(/correo/i)).toBeInTheDocument()
    expect(getByLabelText(/contrasena/i)).toBeInTheDocument()
    expect(getByRole('button', { name: /iniciar/i })).toBeInTheDocument()
  })
})
