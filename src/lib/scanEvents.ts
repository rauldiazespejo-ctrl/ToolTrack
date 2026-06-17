import { useCallback, useEffect, useMemo, useState } from 'react'
import type { InventoryItem, ScanAction, ScanEvent } from '../types'
import { findInventoryItem } from './inventory'
import { supabase } from './supabase'

const storageKey = 'tooltrack.scanEvents.v1'

function readEvents(): ScanEvent[] {
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ScanEvent[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeEvents(events: ScanEvent[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(events))
}

type ScanEventRow = {
  id: string
  inventory_item_id: string
  action: ScanAction
  expected_warehouse: string | null
  reported_warehouse: string | null
  notes: string | null
  scanned_at: string
}

function rowToEvent(row: ScanEventRow): ScanEvent {
  const item = findInventoryItem(row.inventory_item_id)

  return {
    id: row.id,
    inventoryItemId: row.inventory_item_id,
    itemCode: item?.code ?? row.inventory_item_id,
    action: row.action,
    expectedWarehouse: row.expected_warehouse ?? item?.warehouse ?? '',
    reportedWarehouse: row.reported_warehouse ?? '',
    notes: row.notes ?? '',
    createdAt: row.scanned_at,
  }
}

export function useScanEvents(itemId?: string) {
  const [events, setEvents] = useState<ScanEvent[]>(() => readEvents())
  const [source, setSource] = useState<'local' | 'supabase'>(
    supabase ? 'supabase' : 'local',
  )
  const [error, setError] = useState('')

  useEffect(() => {
    if (!supabase) return

    const client = supabase
    let isMounted = true

    async function loadRemoteEvents() {
      let query = client
        .from('qr_scan_events')
        .select(
          'id, inventory_item_id, action, expected_warehouse, reported_warehouse, notes, scanned_at',
        )
        .order('scanned_at', { ascending: false })
        .limit(500)

      if (itemId) {
        query = query.eq('inventory_item_id', itemId)
      }

      const { data, error: loadError } = await query

      if (!isMounted) return

      if (loadError) {
        setError(loadError.message)
        setSource('local')
        return
      }

      setError('')
      setSource('supabase')
      setEvents(((data ?? []) as ScanEventRow[]).map(rowToEvent))
    }

    void loadRemoteEvents()

    return () => {
      isMounted = false
    }
  }, [itemId])

  const addEvent = useCallback(
    async ({
      item,
      action,
      reportedWarehouse,
      notes,
    }: {
      item: InventoryItem
      action: ScanAction
      reportedWarehouse?: string
      notes?: string
    }) => {
      const baseEvent: ScanEvent = {
        id: crypto.randomUUID(),
        inventoryItemId: item.id,
        itemCode: item.code,
        action,
        expectedWarehouse: item.warehouse,
        reportedWarehouse: reportedWarehouse?.trim() || item.warehouse,
        notes: notes?.trim() || '',
        createdAt: new Date().toISOString(),
      }

      if (supabase) {
        const { data: authData } = await supabase.auth.getUser()
        const { data, error: insertError } = await supabase
          .from('qr_scan_events')
          .insert({
            inventory_item_id: item.id,
            scanned_by: authData.user?.id ?? null,
            action,
            expected_warehouse: item.warehouse,
            reported_warehouse: baseEvent.reportedWarehouse,
            notes: baseEvent.notes,
          })
          .select(
            'id, inventory_item_id, action, expected_warehouse, reported_warehouse, notes, scanned_at',
          )
          .single()

        if (!insertError && data) {
          const event = rowToEvent(data as ScanEventRow)
          setEvents((current) => [event, ...current].slice(0, 500))
          setSource('supabase')
          setError('')
          return { event, source: 'supabase' as const }
        }

        setError(insertError?.message ?? 'No se pudo escribir en Supabase')
      }

      setEvents((current) => {
        const next = [baseEvent, ...current].slice(0, 500)
        writeEvents(next)
        return next
      })
      setSource('local')

      return { event: baseEvent, source: 'local' as const }
    },
    [],
  )

  const scopedEvents = useMemo(
    () =>
      itemId
        ? events.filter((event) => event.inventoryItemId === itemId)
        : events,
    [events, itemId],
  )

  return {
    events,
    scopedEvents,
    addEvent,
    error,
    source,
  }
}

export function getScanActionLabel(action: ScanAction) {
  return action === 'confirm_location'
    ? 'Ubicación confirmada'
    : 'Diferencia reportada'
}
