import { useState, useCallback, useEffect } from 'react'
import type { AssetRequest } from '../lib/supabase'
import { seedAssetRequests } from '../data/seed'
import { createAdapter } from '../services'
import { buildRequestCode } from '../lib/tooltrack'

const adapter = createAdapter<AssetRequest>('tooltrack_asset_requests', 'asset_requests', seedAssetRequests)

type RequestCreateInput = Omit<AssetRequest, 'id' | 'request_code' | 'created_at' | 'updated_at'>

export function useRequests() {
  const [requests, setRequests] = useState<AssetRequest[]>(() => {
    const stored = localStorage.getItem('tooltrack_asset_requests')
    if (stored) return JSON.parse(stored)
    return seedAssetRequests
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    void adapter.getAll().then(setRequests)
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    const items = await adapter.getAll()
    setRequests(items)
    setLoading(false)
  }, [])

  const create = useCallback(async (data: RequestCreateInput) => {
    setLoading(true)
    const now = new Date().toISOString()
    const created = await adapter.create({
      ...data,
      request_code: buildRequestCode(),
      status: data.status || 'pending_approval',
      approver_name: data.approver_name ?? null,
      approved_at: data.approved_at ?? null,
      rejection_reason: data.rejection_reason ?? null,
      quote_request_id: data.quote_request_id ?? null,
      dispatch_id: data.dispatch_id ?? null,
      created_at: now,
      updated_at: now,
    })
    setRequests(prev => [...prev, created])
    setLoading(false)
    return created
  }, [])

  const update = useCallback(async (id: string, data: Partial<AssetRequest>) => {
    setLoading(true)
    const updated = await adapter.update(id, { ...data, updated_at: new Date().toISOString() })
    setRequests(prev => prev.map(item => item.id === id ? updated : item))
    setLoading(false)
    return updated
  }, [])

  const remove = useCallback(async (id: string) => {
    await adapter.remove(id)
    setRequests(prev => prev.filter(item => item.id !== id))
  }, [])

  const approve = useCallback(async (id: string, approverName: string) => {
    return update(id, {
      status: 'approved',
      approver_name: approverName,
      approved_at: new Date().toISOString(),
      rejection_reason: null,
    })
  }, [update])

  const reject = useCallback(async (id: string, approverName: string, reason: string) => {
    return update(id, {
      status: 'rejected',
      approver_name: approverName,
      approved_at: new Date().toISOString(),
      rejection_reason: reason,
    })
  }, [update])

  const moveToWarehouseQueue = useCallback(async (id: string) => {
    return update(id, { status: 'warehouse_queue' })
  }, [update])

  const markReadyToDispatch = useCallback(async (id: string) => {
    return update(id, { status: 'ready_to_dispatch' })
  }, [update])

  const markDispatched = useCallback(async (id: string, dispatchId?: string) => {
    return update(id, { status: 'dispatched', dispatch_id: dispatchId ?? null })
  }, [update])

  const close = useCallback(async (id: string) => {
    return update(id, { status: 'closed' })
  }, [update])

  const requireQuote = useCallback(async (id: string, quoteRequestId?: string) => {
    return update(id, { status: 'quote_required', quote_request_id: quoteRequestId ?? null })
  }, [update])

  const linkQuote = useCallback(async (id: string, quoteRequestId: string) => {
    return update(id, { quote_request_id: quoteRequestId })
  }, [update])

  const linkDispatch = useCallback(async (id: string, dispatchId: string) => {
    return update(id, { dispatch_id: dispatchId })
  }, [update])

  const stats = {
    total: requests.length,
    pendingApproval: requests.filter(item => item.status === 'pending_approval').length,
    approved: requests.filter(item => item.status === 'approved').length,
    warehouseQueue: requests.filter(item => item.status === 'warehouse_queue').length,
    readyToDispatch: requests.filter(item => item.status === 'ready_to_dispatch').length,
    dispatched: requests.filter(item => item.status === 'dispatched').length,
    closed: requests.filter(item => item.status === 'closed').length,
    quoteRequired: requests.filter(item => item.status === 'quote_required').length,
    rejected: requests.filter(item => item.status === 'rejected').length,
  }

  return {
    requests,
    loading,
    stats,
    create,
    update,
    remove,
    approve,
    reject,
    moveToWarehouseQueue,
    markReadyToDispatch,
    markDispatched,
    close,
    requireQuote,
    linkQuote,
    linkDispatch,
    refresh,
  }
}
