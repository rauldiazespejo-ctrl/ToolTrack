import { useState, useCallback } from 'react'
import type { Alert } from '../lib/supabase'
import { seedAlerts } from '../data/seed'

const STORAGE_KEY = 'tooltrack_alerts'

function loadAlerts(): Alert[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) return JSON.parse(stored)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedAlerts))
  return seedAlerts
}

function saveAlerts(items: Alert[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(loadAlerts)

  const refresh = useCallback(() => {
    setAlerts(loadAlerts())
  }, [])

  const markRead = useCallback((id: string) => {
    const items = loadAlerts()
    const updated = items.map(item => item.id === id ? { ...item, is_read: true } : item)
    saveAlerts(updated)
    setAlerts(updated)
  }, [])

  const markAllRead = useCallback(() => {
    const items = loadAlerts()
    const updated = items.map(item => ({ ...item, is_read: true }))
    saveAlerts(updated)
    setAlerts(updated)
  }, [])

  const dismiss = useCallback((id: string) => {
    const items = loadAlerts()
    const updated = items.filter(item => item.id !== id)
    saveAlerts(updated)
    setAlerts(updated)
  }, [])

  const unreadCount = alerts.filter(a => !a.is_read).length
  const criticalCount = alerts.filter(a => !a.is_read && a.severity === 'critica').length

  const stats = {
    total: alerts.length,
    unread: unreadCount,
    critical: criticalCount,
    byType: {
      stock_bajo: alerts.filter(a => a.type === 'stock_bajo').length,
      mantenimiento_vencido: alerts.filter(a => a.type === 'mantenimiento_vencido').length,
      calibracion: alerts.filter(a => a.type === 'calibracion').length,
      equipo_sin_devolver: alerts.filter(a => a.type === 'equipo_sin_devolver').length,
    },
  }

  return { alerts, stats, unreadCount, criticalCount, markRead, markAllRead, dismiss, refresh }
}
