import { useState, useCallback, useEffect } from 'react'
import type { Alert } from '../lib/supabase'
import { seedAlerts } from '../data/seed'
import { createAdapter } from '../services'

const adapter = createAdapter<Alert>('tooltrack_alerts', 'alerts', seedAlerts)

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(() => {
    try {
      const stored = localStorage.getItem('tooltrack_alerts')
      if (stored) return JSON.parse(stored)
    } catch {
      console.error('[useAlerts] Error parsing localStorage, using seed.')
    }
    return seedAlerts
  })

  useEffect(() => {
    let mounted = true
    void adapter.getAll().then(items => {
      if (mounted) setAlerts(items)
    })
    return () => { mounted = false }
  }, [])

  const refresh = useCallback(async () => {
    const items = await adapter.getAll()
    setAlerts(items)
  }, [])

  const markRead = useCallback(async (id: string) => {
    try {
      const updated = await adapter.update(id, { is_read: true })
      setAlerts(prev => prev.map(item => item.id === id ? updated : item))
    } catch (e) {
      console.error('[useAlerts] markRead error:', e)
    }
  }, [])

  const markAllRead = useCallback(async () => {
    try {
      const items = await adapter.getAll()
      await Promise.all(items.map(item => adapter.update(item.id, { is_read: true })))
      setAlerts(prev => prev.map(item => ({ ...item, is_read: true })))
    } catch (e) {
      console.error('[useAlerts] markAllRead error:', e)
    }
  }, [])

  const dismiss = useCallback(async (id: string) => {
    try {
      await adapter.remove(id)
      setAlerts(prev => prev.filter(item => item.id !== id))
    } catch (e) {
      console.error('[useAlerts] dismiss error:', e)
    }
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
