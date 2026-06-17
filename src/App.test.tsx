import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the real inventory dashboard', async () => {
    render(<App />)

    expect(screen.getByText('ToolTrack')).toBeInTheDocument()
    expect(await screen.findByText('Inventario valorizado')).toBeInTheDocument()
    expect(await screen.findByText('Ítems valorizados')).toBeInTheDocument()
  })
})
