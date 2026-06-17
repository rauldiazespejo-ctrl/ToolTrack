import { useState, useCallback } from 'react'
import type { Equipment } from '../lib/supabase'
import { seedEquipment } from '../data/seed'
import { generateId } from '../lib/utils'

const STORAGE_KEY = 'tooltrack_equipment'

function loadEquipment(): Equipment[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) return JSON.parse(stored)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedEquipment))
  return seedEquipment
}

function saveEquipment(items: Equipment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function useEquipment() {
  const [equipment, setEquipment] = useState<Equipment[]>(loadEquipment)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(() => {
    setEquipment(loadEquipment())
  }, [])

  const create = useCallback((data: Omit<Equipment, 'id' | 'created_at' | 'updated_at' | 'qr_code'>) => {
    setLoading(true)
    const now = new Date().toISOString()
    const id = generateId()
    const newItem: Equipment = {
      ...data,
      id,
      qr_code: `SOLDESP-${id.toUpperCase()}`,
      created_at: now,
      updated_at: now,
    }
    const updated = [...loadEquipment(), newItem]
    saveEquipment(updated)
    setEquipment(updated)
    setLoading(false)
    return newItem
  }, [])

  const update = useCallback((id: string, data: Partial<Equipment>) => {
    setLoading(true)
    const items = loadEquipment()
    const updated = items.map(item =>
      item.id === id ? { ...item, ...data, updated_at: new Date().toISOString() } : item
    )
    saveEquipment(updated)
    setEquipment(updated)
    setLoading(false)
  }, [])

  const remove = useCallback((id: string) => {
    const items = loadEquipment()
    const updated = items.filter(item => item.id !== id)
    saveEquipment(updated)
    setEquipment(updated)
  }, [])

  const getById = useCallback((id: string) => {
    return loadEquipment().find(item => item.id === id) ?? null
  }, [])

  const stats = {
    total: equipment.length,
    disponible: equipment.filter(e => e.status === 'disponible').length,
    en_uso: equipment.filter(e => e.status === 'en_uso').length,
    mantenimiento: equipment.filter(e => e.status === 'mantenimiento').length,
    fuera_servicio: equipment.filter(e => e.status === 'fuera_servicio').length,
    valorTotal: equipment.reduce((sum, e) => sum + e.purchase_cost, 0),
  }

  return { equipment, loading, stats, create, update, remove, getById, refresh }
}
