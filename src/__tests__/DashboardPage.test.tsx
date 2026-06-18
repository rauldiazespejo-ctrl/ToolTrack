import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DashboardPage } from '../pages/DashboardPage'

vi.mock('chart.js', () => {
  class Chart {
    destroy = vi.fn()
    static register = vi.fn()
    constructor() {}
  }
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

vi.mock('../hooks/useRequests', () => ({
  useRequests: () => ({
    stats: { total: 0, pendingApproval: 0, approved: 0, warehouseQueue: 0, readyToDispatch: 0, dispatched: 0, closed: 0, quoteRequired: 0, rejected: 0 },
  }),
}))

vi.mock('../hooks/useCompliance', () => ({
  useCompliance: () => ({
    stats: { total: 0, vigente: 0, vencePronto: 0, vencido: 0, ausente: 0 },
  }),
}))

vi.mock('../hooks/useNotifications', () => ({
  useNotifications: () => ({
    unreadCount: 0,
  }),
}))

describe('DashboardPage', () => {
  it('renders stat cards with correct labels', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )
    expect(screen.getByText('Total Equipos')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('En Uso')).toBeInTheDocument()
    expect(screen.getByText('En Mantención')).toBeInTheDocument()
    expect(screen.getByText('Alertas Activas')).toBeInTheDocument()
    expect(screen.getAllByText('Stock Bajo').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Valor Activos')).toBeInTheDocument()
  })
})
