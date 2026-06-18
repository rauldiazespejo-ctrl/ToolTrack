import { useState, useCallback, useEffect } from 'react'
import type { Dispatch, DispatchItem, QrScanEvent } from '../lib/supabase'
import { seedDispatches, seedDispatchItems, seedQrScanEvents } from '../data/seed'
import { createAdapter } from '../services'
import { buildDispatchCode, buildScanValue } from '../lib/tooltrack'

const dispatchAdapter = createAdapter<Dispatch>('tooltrack_dispatches', 'dispatches', seedDispatches)
const itemAdapter = createAdapter<DispatchItem>('tooltrack_dispatch_items', 'dispatch_items', seedDispatchItems)
const scanAdapter = createAdapter<QrScanEvent>('tooltrack_qr_scan_events', 'qr_scan_events', seedQrScanEvents)

type DispatchCreateInput = Omit<Dispatch, 'id' | 'dispatch_code' | 'created_at' | 'updated_at' | 'qr_verified_at' | 'dispatched_at' | 'received_at' | 'returned_at' | 'return_condition'>

type DispatchItemInput = Omit<DispatchItem, 'id' | 'dispatch_id' | 'created_at' | 'updated_at'>

type ScanCreateInput = Omit<QrScanEvent, 'id' | 'created_at'>

export function useDispatches() {
  const [dispatches, setDispatches] = useState<Dispatch[]>(() => {
    const stored = localStorage.getItem('tooltrack_dispatches')
    if (stored) return JSON.parse(stored)
    return seedDispatches
  })
  const [items, setItems] = useState<DispatchItem[]>(() => {
    const stored = localStorage.getItem('tooltrack_dispatch_items')
    if (stored) return JSON.parse(stored)
    return seedDispatchItems
  })
  const [scanEvents, setScanEvents] = useState<QrScanEvent[]>(() => {
    const stored = localStorage.getItem('tooltrack_qr_scan_events')
    if (stored) return JSON.parse(stored)
    return seedQrScanEvents
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    void Promise.all([dispatchAdapter.getAll(), itemAdapter.getAll(), scanAdapter.getAll()]).then(([dispatchItems, dispatchLineItems, scans]) => {
      setDispatches(dispatchItems)
      setItems(dispatchLineItems)
      setScanEvents(scans)
    })
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    const [dispatchItems, dispatchLineItems, scans] = await Promise.all([
      dispatchAdapter.getAll(),
      itemAdapter.getAll(),
      scanAdapter.getAll(),
    ])
    setDispatches(dispatchItems)
    setItems(dispatchLineItems)
    setScanEvents(scans)
    setLoading(false)
  }, [])

  const createDispatch = useCallback(async (data: DispatchCreateInput, dispatchItems: DispatchItemInput[] = []) => {
    setLoading(true)
    const now = new Date().toISOString()
    const created = await dispatchAdapter.create({
      ...data,
      dispatch_code: buildDispatchCode(),
      status: data.status || 'preparing',
      qr_verified_at: null,
      dispatched_at: null,
      received_at: null,
      returned_at: null,
      return_condition: null,
      created_at: now,
      updated_at: now,
    })
    setDispatches(prev => [...prev, created])

    if (dispatchItems.length > 0) {
      const createdItems: DispatchItem[] = []
      for (const item of dispatchItems) {
        const createdItem = await itemAdapter.create({
          ...item,
          dispatch_id: created.id,
          created_at: now,
          updated_at: now,
        })
        createdItems.push(createdItem)
      }
      setItems(prev => [...prev, ...createdItems])
    }

    setLoading(false)
    return created
  }, [])

  const updateDispatch = useCallback(async (id: string, data: Partial<Dispatch>) => {
    setLoading(true)
    const updated = await dispatchAdapter.update(id, { ...data, updated_at: new Date().toISOString() })
    setDispatches(prev => prev.map(item => item.id === id ? updated : item))
    setLoading(false)
    return updated
  }, [])

  const createScanEvent = useCallback(async (data: ScanCreateInput) => {
    const entry = await scanAdapter.create({
      ...data,
      created_at: new Date().toISOString(),
    })
    setScanEvents(prev => [entry, ...prev])
    return entry
  }, [])

  const addScanForItem = useCallback(async (
    entityType: QrScanEvent['entity_type'],
    entityId: string | null,
    scannedBy: string,
    locationSite: string,
    scanContext: QrScanEvent['scan_context'],
    notes: string,
  ) => {
    return createScanEvent({
      qr_value: buildScanValue(entityType, entityId || 'unknown'),
      entity_type: entityType,
      entity_id: entityId,
      scanned_by: scannedBy,
      location_site: locationSite,
      scan_context: scanContext,
      notes,
    })
  }, [createScanEvent])

  const markDispatched = useCallback(async (dispatchId: string) => {
    return updateDispatch(dispatchId, {
      status: 'dispatched',
      qr_verified_at: new Date().toISOString(),
      dispatched_at: new Date().toISOString(),
    })
  }, [updateDispatch])

  const markReceived = useCallback(async (dispatchId: string) => {
    return updateDispatch(dispatchId, {
      status: 'received',
      received_at: new Date().toISOString(),
    })
  }, [updateDispatch])

  const markReturned = useCallback(async (dispatchId: string, returnCondition: Dispatch['return_condition']) => {
    return updateDispatch(dispatchId, {
      status: 'returned',
      returned_at: new Date().toISOString(),
      return_condition: returnCondition,
    })
  }, [updateDispatch])

  const stats = {
    total: dispatches.length,
    preparing: dispatches.filter(item => item.status === 'preparing').length,
    dispatched: dispatches.filter(item => item.status === 'dispatched').length,
    received: dispatches.filter(item => item.status === 'received').length,
    returned: dispatches.filter(item => item.status === 'returned').length,
    scans: scanEvents.length,
  }

  return {
    dispatches,
    items,
    scanEvents,
    loading,
    stats,
    createDispatch,
    updateDispatch,
    createScanEvent,
    addScanForItem,
    markDispatched,
    markReceived,
    markReturned,
    refresh,
  }
}
