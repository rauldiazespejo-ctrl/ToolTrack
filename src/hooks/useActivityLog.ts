import { useState, useCallback } from 'react'
import type { ActivityLog } from '../lib/supabase'
import { seedActivityLog } from '../data/seed'
import { generateId } from '../lib/utils'

const STORAGE_KEY = 'tooltrack_activity_log'

function loadLog(): ActivityLog[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) return JSON.parse(stored)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedActivityLog))
  return seedActivityLog
}

function saveLog(items: ActivityLog[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function useActivityLog() {
  const [logs, setLogs] = useState<ActivityLog[]>(loadLog)

  const refresh = useCallback(() => {
    setLogs(loadLog())
  }, [])

  const addEntry = useCallback((data: Omit<ActivityLog, 'id' | 'created_at'>) => {
    const entry: ActivityLog = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
    }
    const updated = [entry, ...loadLog()]
    saveLog(updated)
    setLogs(updated)
    return entry
  }, [])

  const recentLogs = logs.slice(0, 10)

  return { logs, recentLogs, addEntry, refresh }
}
