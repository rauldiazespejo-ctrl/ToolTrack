import { useState, useCallback, useEffect } from 'react'
import type { ActivityLog } from '../lib/supabase'
import { seedActivityLog } from '../data/seed'
import { createAdapter } from '../services'

const adapter = createAdapter<ActivityLog>('tooltrack_activity_log', 'activity_logs', seedActivityLog)

export function useActivityLog() {
  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const stored = localStorage.getItem('tooltrack_activity_log')
    if (stored) return JSON.parse(stored)
    return seedActivityLog
  })

  useEffect(() => {
    adapter.getAll().then(setLogs)
  }, [])

  const refresh = useCallback(async () => {
    const items = await adapter.getAll()
    setLogs(items)
  }, [])

  const addEntry = useCallback(async (data: Omit<ActivityLog, 'id' | 'created_at'>) => {
    const entry = await adapter.create({
      ...data,
      created_at: new Date().toISOString(),
    } as Omit<ActivityLog, 'id'>)
    setLogs(prev => [entry, ...prev])
    return entry
  }, [])

  const recentLogs = logs.slice(0, 10)

  return { logs, recentLogs, addEntry, refresh }
}
