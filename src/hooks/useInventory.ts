import { useState, useCallback, useEffect } from 'react'
import type { InventoryItem } from '../lib/supabase'
import { seedInventory } from '../data/seed'
import { createAdapter } from '../services'

const adapter = createAdapter<InventoryItem>('tooltrack_inventory', 'inventory', seedInventory)

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('tooltrack_inventory')
      if (stored) return JSON.parse(stored)
    } catch {
      console.error('[useInventory] Error parsing localStorage, using seed.')
    }
    return seedInventory
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    void adapter.getAll().then(items => {
      if (mounted) setInventory(items)
    })
    return () => { mounted = false }
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const items = await adapter.getAll()
      setInventory(items)
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (data: Omit<InventoryItem, 'id'>) => {
    setLoading(true)
    try {
      const newItem = await adapter.create(data)
      setInventory(prev => [...prev, newItem])
      return newItem
    } finally {
      setLoading(false)
    }
  }, [])

  const update = useCallback(async (id: string, data: Partial<InventoryItem>) => {
    setLoading(true)
    try {
      const updated = await adapter.update(id, data)
      setInventory(prev => prev.map(item => item.id === id ? updated : item))
    } finally {
      setLoading(false)
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    try {
      await adapter.remove(id)
      setInventory(prev => prev.filter(item => item.id !== id))
    } catch (e) {
      console.error('[useInventory] remove error:', e)
    }
  }, [])

  const adjustStock = useCallback(async (id: string, delta: number, reason: string) => {
    const items = await adapter.getAll()
    const item = items.find(i => i.id === id)
    if (!item) return
    if (delta < 0 && Math.abs(delta) > item.quantity) {
      console.warn('[useInventory] adjustStock: cannot reduce below zero')
      return
    }
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
    valorTotal: inventory.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.cost_per_unit) || 0), 0),
  }

  return { inventory, loading, stats, lowStockItems, create, update, remove, adjustStock, refresh }
}
