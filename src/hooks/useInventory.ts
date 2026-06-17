import { useState, useCallback } from 'react'
import type { InventoryItem } from '../lib/supabase'
import { seedInventory } from '../data/seed'
import { generateId } from '../lib/utils'

const STORAGE_KEY = 'tooltrack_inventory'

function loadInventory(): InventoryItem[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) return JSON.parse(stored)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedInventory))
  return seedInventory
}

function saveInventory(items: InventoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>(loadInventory)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(() => {
    setInventory(loadInventory())
  }, [])

  const create = useCallback((data: Omit<InventoryItem, 'id'>) => {
    setLoading(true)
    const newItem: InventoryItem = { ...data, id: generateId() }
    const updated = [...loadInventory(), newItem]
    saveInventory(updated)
    setInventory(updated)
    setLoading(false)
    return newItem
  }, [])

  const update = useCallback((id: string, data: Partial<InventoryItem>) => {
    setLoading(true)
    const items = loadInventory()
    const updated = items.map(item => item.id === id ? { ...item, ...data } : item)
    saveInventory(updated)
    setInventory(updated)
    setLoading(false)
  }, [])

  const remove = useCallback((id: string) => {
    const items = loadInventory()
    const updated = items.filter(item => item.id !== id)
    saveInventory(updated)
    setInventory(updated)
  }, [])

  const adjustStock = useCallback((id: string, delta: number, reason: string) => {
    const items = loadInventory()
    const updated = items.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta)
        return { ...item, quantity: newQty, last_restock: delta > 0 ? new Date().toISOString().split('T')[0] : item.last_restock }
      }
      return item
    })
    saveInventory(updated)
    setInventory(updated)
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
