import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DashboardPage } from '../pages/DashboardPage'

vi.mock('chart.js', () => {
  const Chart = vi.fn(() => ({ destroy: vi.fn() }))
  Object.assign(Chart, { register: vi.fn() })
  return {
    Chart,
    DoughnutController: class {},
    ArcElement: class {},
    Tooltip: class {},
    Legend: class {},
    BarController: class {},
    BarElement: class {},
    CategoryScale: class {},
    LinearScale: class {},
  }
})

vi.mock('../hooks/useEquipment', () => ({
  useEquipment: () => ({
    equipment: [],
    stats: { total: 10, disponible: 5, en_uso: 3, mantenimiento: 1, fuera_servicio: 1, valorTotal: 1000000 },
  }),
}))

vi.mock('../hooks/useInventory', () => ({
  useInventory: () => ({
    stats: { totalItems: 20, lowStock: 2, valorTotal: 500000 },
    lowStockItems: [],
  }),
}))

vi.mock('../hooks/useMaintenance', () => ({
  useMaintenance: () => ({
    stats: { total: 5, pendiente: 2, en_progreso: 1, completado: 1, vencido: 1 },
  }),
}))

vi.mock('../hooks/useAlerts', () => ({
  useAlerts: () => ({
    alerts: [],
    unreadCount: 0,
  }),
}))

vi.mock('../hooks/useActivityLog', () => ({
  useActivityLog: () => ({
    recentLogs: [],
  }),
}))

describe('DashboardPage', () => {
  it('renders stat cards with correct labels', () => {
    const { getByText, getAllByText } = render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )
    expect(getByText('Total Equipos')).toBeInTheDocument()
    expect(getByText('10')).toBeInTheDocument()
    expect(getByText('En Uso')).toBeInTheDocument()
    expect(getByText('En Mantención')).toBeInTheDocument()
    expect(getByText('Alertas Activas')).toBeInTheDocument()
    expect(getAllByText('Stock Bajo').length).toBeGreaterThanOrEqual(1)
    expect(getByText('Valor Activos')).toBeInTheDocument()
  })
})
