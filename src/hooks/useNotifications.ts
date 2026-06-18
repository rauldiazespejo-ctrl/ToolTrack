import { useState, useCallback, useEffect } from 'react'
import type { Notification } from '../lib/supabase'
import { seedNotifications } from '../data/seed'
import { createAdapter } from '../services'

const adapter = createAdapter<Notification>('tooltrack_notifications', 'notifications', seedNotifications)

type NotificationCreateInput = Omit<Notification, 'id' | 'created_at'>

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const stored = localStorage.getItem('tooltrack_notifications')
    if (stored) return JSON.parse(stored)
    return seedNotifications
  })

  useEffect(() => {
    void adapter.getAll().then(setNotifications)
  }, [])

  const refresh = useCallback(async () => {
    const items = await adapter.getAll()
    setNotifications(items)
  }, [])

  const create = useCallback(async (data: NotificationCreateInput) => {
    const entry = await adapter.create({
      ...data,
      created_at: new Date().toISOString(),
    })
    setNotifications(prev => [entry, ...prev])
    return entry
  }, [])

  const markRead = useCallback(async (id: string) => {
    const updated = await adapter.update(id, { is_read: true })
    setNotifications(prev => prev.map(item => item.id === id ? updated : item))
  }, [])

  const markAllRead = useCallback(async () => {
    const items = await adapter.getAll()
    await Promise.all(items.map(item => adapter.update(item.id, { is_read: true })))
    setNotifications(prev => prev.map(item => ({ ...item, is_read: true })))
  }, [])

  const remove = useCallback(async (id: string) => {
    await adapter.remove(id)
    setNotifications(prev => prev.filter(item => item.id !== id))
  }, [])

  const unreadCount = notifications.filter(item => !item.is_read).length
  const criticalCount = notifications.filter(item => !item.is_read && item.severity === 'critica').length

  return {
    notifications,
    unreadCount,
    criticalCount,
    create,
    markRead,
    markAllRead,
    remove,
    refresh,
  }
}
