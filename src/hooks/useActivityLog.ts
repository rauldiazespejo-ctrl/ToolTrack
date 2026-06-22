import { useState, useCallback, useEffect } from 'react'
import type { ActivityLog } from '../lib/supabase'
import { seedActivityLog } from '../data/seed'
import { createAdapter } from '../services'

const adapter = createAdapter<ActivityLog>('tooltrack_activity_log', 'activity_logs', seedActivityLog)

export function useActivityLog() {
  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    try {
      const stored = localStorage.getItem('tooltrack_activity_log')
      if (stored) return JSON.parse(stored)
    } catch {
      console.error('[useActivityLog] Error parsing localStorage, using seed.')
    }
    return seedActivityLog
  })

  useEffect(() => {
    let mounted = true
    void adapter.getAll().then(items => {
      if (mounted) setLogs(items)
    })
    return () => { mounted = false }
  }, [])

  const refresh = useCallback(async () => {
    const items = await adapter.getAll()
    setLogs(items)
  }, [])

  const addEntry = useCallback(async (data: Omit<ActivityLog, 'id' | 'created_at'>) => {
    try {
      const entry = await adapter.create({
        ...data,
        created_at: new Date().toISOString(),
      })
      setLogs(prev => [entry, ...prev])
      return entry
    } catch (e) {
      console.error('[useActivityLog] addEntry error:', e)
      throw e
    }
  }, [])

  const recentLogs = logs.slice(0, 10)

  return { logs, recentLogs, addEntry, refresh }
}
