import { useState, useCallback } from 'react'
import type { MaintenanceOrder } from '../lib/supabase'
import { seedMaintenance } from '../data/seed'
import { generateId } from '../lib/utils'

const STORAGE_KEY = 'tooltrack_maintenance'

function loadMaintenance(): MaintenanceOrder[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) return JSON.parse(stored)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedMaintenance))
  return seedMaintenance
}

function saveMaintenance(items: MaintenanceOrder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function useMaintenance() {
  const [orders, setOrders] = useState<MaintenanceOrder[]>(loadMaintenance)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(() => {
    setOrders(loadMaintenance())
  }, [])

  const create = useCallback((data: Omit<MaintenanceOrder, 'id'>) => {
    setLoading(true)
    const newOrder: MaintenanceOrder = { ...data, id: generateId() }
    const updated = [...loadMaintenance(), newOrder]
    saveMaintenance(updated)
    setOrders(updated)
    setLoading(false)
    return newOrder
  }, [])

  const update = useCallback((id: string, data: Partial<MaintenanceOrder>) => {
    setLoading(true)
    const items = loadMaintenance()
    const updated = items.map(item => item.id === id ? { ...item, ...data } : item)
    saveMaintenance(updated)
    setOrders(updated)
    setLoading(false)
  }, [])

  const remove = useCallback((id: string) => {
    const items = loadMaintenance()
    const updated = items.filter(item => item.id !== id)
    saveMaintenance(updated)
    setOrders(updated)
  }, [])

  const complete = useCallback((id: string) => {
    update(id, { status: 'completado', completed_date: new Date().toISOString().split('T')[0] })
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
