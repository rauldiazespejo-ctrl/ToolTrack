import { useState, useCallback, useEffect } from 'react'
import type { InventoryItem } from '../lib/supabase'
import { seedInventory } from '../data/seed'
import { createAdapter } from '../services'

const adapter = createAdapter<InventoryItem>('tooltrack_inventory', 'inventory', seedInventory)

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const stored = localStorage.getItem('tooltrack_inventory')
    if (stored) return JSON.parse(stored)
    return seedInventory
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    adapter.getAll().then(setInventory)
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    const items = await adapter.getAll()
    setInventory(items)
    setLoading(false)
  }, [])

  const create = useCallback(async (data: Omit<InventoryItem, 'id'>) => {
    setLoading(true)
    const newItem = await adapter.create(data)
    setInventory(prev => [...prev, newItem])
    setLoading(false)
    return newItem
  }, [])

  const update = useCallback(async (id: string, data: Partial<InventoryItem>) => {
    setLoading(true)
    const updated = await adapter.update(id, data)
    setInventory(prev => prev.map(item => item.id === id ? updated : item))
    setLoading(false)
  }, [])

  const remove = useCallback(async (id: string) => {
    await adapter.remove(id)
    setInventory(prev => prev.filter(item => item.id !== id))
  }, [])

  const adjustStock = useCallback(async (id: string, delta: number, reason: string) => {
    const items = await adapter.getAll()
    const item = items.find(i => i.id === id)
    if (!item) return
    const newQty = Math.max(0, item.quantity + delta)
    const updated = await adapter.update(id, {
      quantity: newQty,
      last_restock: delta > 0 ? new Date().toISOString().split('T')[0] : item.last_restock,
    })
    setInventory(prev => prev.map(i => i.id === id ? updated : i))
    void reason
  }, [])

  const lowStockItems = inventory.filter(item => item.quantity < item.min_stock)

  const stats = {
    totalItems: inventory.length,
    lowStock: lowStockItems.length,
    valorTotal: inventory.reduce((sum, i) => sum + i.quantity * i.cost_per_unit, 0),
  }

  return { inventory, loading, stats, lowStockItems, create, update, remove, adjustStock, refresh }
}
