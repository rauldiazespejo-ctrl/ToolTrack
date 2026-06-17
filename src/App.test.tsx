import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('react-chartjs-2', () => ({
  Doughnut: () => null,
  Bar: () => null,
}))

describe('App', () => {
  it('renders the real inventory dashboard', async () => {
    render(<App />)

    expect(screen.getByText('ToolTrack')).toBeInTheDocument()
    expect(await screen.findByText('Inventario valorizado')).toBeInTheDocument()

    await waitFor(() => {
        expect(screen.getByText(/Ítems valorizados/i)).toBeInTheDocument()
    }, { timeout: 4000 })
  })
})
