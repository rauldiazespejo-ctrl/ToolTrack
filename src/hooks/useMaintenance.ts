import { useState, useCallback, useEffect } from 'react'
import type { MaintenanceOrder } from '../lib/supabase'
import { seedMaintenance } from '../data/seed'
import { createAdapter } from '../services'

const adapter = createAdapter<MaintenanceOrder>('tooltrack_maintenance', 'maintenance_orders', seedMaintenance)

export function useMaintenance() {
  const [orders, setOrders] = useState<MaintenanceOrder[]>(() => {
    try {
      const stored = localStorage.getItem('tooltrack_maintenance')
      if (stored) return JSON.parse(stored)
    } catch {
      console.error('[useMaintenance] Error parsing localStorage, using seed.')
    }
    return seedMaintenance
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    void adapter.getAll().then(items => {
      if (mounted) setOrders(items)
    })
    return () => { mounted = false }
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const items = await adapter.getAll()
      setOrders(items)
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (data: Omit<MaintenanceOrder, 'id'>) => {
    setLoading(true)
    try {
      const newOrder = await adapter.create(data)
      setOrders(prev => [...prev, newOrder])
      return newOrder
    } finally {
      setLoading(false)
    }
  }, [])

  const update = useCallback(async (id: string, data: Partial<MaintenanceOrder>) => {
    setLoading(true)
    try {
      const updated = await adapter.update(id, data)
      setOrders(prev => prev.map(item => item.id === id ? updated : item))
    } finally {
      setLoading(false)
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    try {
      await adapter.remove(id)
      setOrders(prev => prev.filter(item => item.id !== id))
    } catch (e) {
      console.error('[useMaintenance] remove error:', e)
    }
  }, [])

  const complete = useCallback(async (id: string) => {
    try {
      await adapter.update(id, { status: 'completado', completed_date: new Date().toISOString().split('T')[0] })
      setOrders(prev => prev.map(item => item.id === id ? { ...item, status: 'completado', completed_date: new Date().toISOString().split('T')[0] } : item))
    } catch (e) {
      console.error('[useMaintenance] complete error:', e)
    }
  }, [])

  const stats = {
    total: orders.length,
    pendiente: orders.filter(o => o.status === 'pendiente').length,
    en_progreso: orders.filter(o => o.status === 'en_progreso').length,
    completado: orders.filter(o => o.status === 'completado').length,
    vencido: orders.filter(o => o.status === 'vencido').length,
  }

  return { orders, loading, stats, create, update, remove, complete, refresh }
}
