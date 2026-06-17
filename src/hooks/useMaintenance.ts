import { useState, useCallback, useEffect } from 'react'
import type { MaintenanceOrder } from '../lib/supabase'
import { seedMaintenance } from '../data/seed'
import { createAdapter } from '../services'

const adapter = createAdapter<MaintenanceOrder>('tooltrack_maintenance', 'maintenance_orders', seedMaintenance)

export function useMaintenance() {
  const [orders, setOrders] = useState<MaintenanceOrder[]>(() => {
    const stored = localStorage.getItem('tooltrack_maintenance')
    if (stored) return JSON.parse(stored)
    return seedMaintenance
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    adapter.getAll().then(setOrders)
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    const items = await adapter.getAll()
    setOrders(items)
    setLoading(false)
  }, [])

  const create = useCallback(async (data: Omit<MaintenanceOrder, 'id'>) => {
    setLoading(true)
    const newOrder = await adapter.create(data)
    setOrders(prev => [...prev, newOrder])
    setLoading(false)
    return newOrder
  }, [])

  const update = useCallback(async (id: string, data: Partial<MaintenanceOrder>) => {
    setLoading(true)
    const updated = await adapter.update(id, data)
    setOrders(prev => prev.map(item => item.id === id ? updated : item))
    setLoading(false)
  }, [])

  const remove = useCallback(async (id: string) => {
    await adapter.remove(id)
    setOrders(prev => prev.filter(item => item.id !== id))
  }, [])

  const complete = useCallback(async (id: string) => {
    await update(id, { status: 'completado', completed_date: new Date().toISOString().split('T')[0] })
  }, [update])

  const stats = {
    total: orders.length,
    pendiente: orders.filter(o => o.status === 'pendiente').length,
    en_progreso: orders.filter(o => o.status === 'en_progreso').length,
    completado: orders.filter(o => o.status === 'completado').length,
    vencido: orders.filter(o => o.status === 'vencido').length,
  }

  return { orders, loading, stats, create, update, remove, complete, refresh }
}
