import { useState, useCallback, useEffect } from 'react'
import type { Equipment } from '../lib/supabase'
import { seedEquipment } from '../data/seed'
import { createAdapter } from '../services'
import { buildEquipmentQrValue } from '../lib/tooltrack'

const adapter = createAdapter<Equipment>('tooltrack_equipment', 'equipment', seedEquipment)

export function useEquipment() {
  const [equipment, setEquipment] = useState<Equipment[]>(() => {
    const stored = localStorage.getItem('tooltrack_equipment')
    if (stored) return JSON.parse(stored)
    return seedEquipment
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    void adapter.getAll().then(setEquipment)
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    const items = await adapter.getAll()
    setEquipment(items)
    setLoading(false)
  }, [])

  const create = useCallback(async (data: Omit<Equipment, 'id' | 'created_at' | 'updated_at' | 'qr_code'>) => {
    setLoading(true)
    const now = new Date().toISOString()
    const created = await adapter.create({
      ...data,
      created_at: now,
      updated_at: now,
    } as Omit<Equipment, 'id'>)
    const withQr = await adapter.update(created.id, {
      qr_code: buildEquipmentQrValue(created.id),
    })
    setEquipment(prev => [...prev, withQr])
    setLoading(false)
    return withQr
  }, [])

  const update = useCallback(async (id: string, data: Partial<Equipment>) => {
    setLoading(true)
    const updated = await adapter.update(id, { ...data, updated_at: new Date().toISOString() })
    setEquipment(prev => prev.map(item => item.id === id ? updated : item))
    setLoading(false)
  }, [])

  const remove = useCallback(async (id: string) => {
    await adapter.remove(id)
    setEquipment(prev => prev.filter(item => item.id !== id))
  }, [])

  const getById = useCallback((id: string) => {
    return equipment.find(item => item.id === id) ?? null
  }, [equipment])

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
