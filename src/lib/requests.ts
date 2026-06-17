import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  AssetRequest,
  AssetRequestPriority,
  AssetRequestStatus,
  InventoryItem,
} from '../types'
import { getAvailabilityStatus } from './inventory'
import { supabase } from './supabase'

const storageKey = 'tooltrack.assetRequests.v1'

type RequestInput = {
  item: InventoryItem
  quantity: number
  requestedBy: string
  contract: string
  neededAt: string
  priority: AssetRequestPriority
  reason: string
}

type AssetRequestRow = {
  id: string
  inventory_item_id: string
  item_code: string
  description: string
  warehouse: string
  ceco: string | null
  item_group: string
  quantity: number
  requested_by_name: string
  contract: string
  needed_at: string | null
  priority: AssetRequestPriority
  status: AssetRequestStatus
  availability_status: AssetRequest['availabilityStatus']
  reason: string | null
  created_at: string
}

function readRequests(): AssetRequest[] {
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return []
    const parsed = JSON.parse(raw) as AssetRequest[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeRequests(requests: AssetRequest[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(requests))
}

function rowToRequest(row: AssetRequestRow): AssetRequest {
  return {
    availabilityStatus: row.availability_status,
    ceco: row.ceco,
    contract: row.contract,
    createdAt: row.created_at,
    description: row.description,
    group: row.item_group,
    id: row.id,
    inventoryItemId: row.inventory_item_id,
    itemCode: row.item_code,
    neededAt: row.needed_at ?? '',
    priority: row.priority,
    quantity: row.quantity,
    reason: row.reason ?? '',
    requestedBy: row.requested_by_name,
    status: row.status,
    warehouse: row.warehouse,
  }
}

function createRequest(input: RequestInput): AssetRequest {
  const availabilityStatus = getAvailabilityStatus(input.item)
  const canFulfill =
    availabilityStatus === 'available' && input.item.balance >= input.quantity

  return {
    availabilityStatus,
    ceco: input.item.ceco,
    contract: input.contract.trim() || 'Sin contrato informado',
    createdAt: new Date().toISOString(),
    description: input.item.description,
    group: input.item.group,
    id: crypto.randomUUID(),
    inventoryItemId: input.item.id,
    itemCode: input.item.code,
    neededAt: input.neededAt,
    priority: input.priority,
    quantity: input.quantity,
    reason: input.reason.trim(),
    requestedBy: input.requestedBy.trim() || 'Usuario no informado',
    status: canFulfill ? 'pending_approval' : 'quote_required',
    warehouse: input.item.warehouse,
  }
}

export function useAssetRequests() {
  const [requests, setRequests] = useState<AssetRequest[]>(() => readRequests())
  const [source, setSource] = useState<'local' | 'supabase'>(
    supabase ? 'supabase' : 'local',
  )
  const [error, setError] = useState('')

  useEffect(() => {
    if (!supabase) return

    const client = supabase
    let isMounted = true

    async function loadRemoteRequests() {
      const { data, error: loadError } = await client
        .from('asset_requests')
        .select(
          'id, inventory_item_id, item_code, description, warehouse, ceco, item_group, quantity, requested_by_name, contract, needed_at, priority, status, availability_status, reason, created_at',
        )
        .order('created_at', { ascending: false })
        .limit(500)

      if (!isMounted) return

      if (loadError) {
        setError(loadError.message)
        setSource('local')
        return
      }

      setError('')
      setSource('supabase')
      setRequests(((data ?? []) as AssetRequestRow[]).map(rowToRequest))
    }

    void loadRemoteRequests()

    return () => {
      isMounted = false
    }
  }, [])

  const addRequest = useCallback(async (input: RequestInput) => {
    const request = createRequest(input)

    if (supabase) {
      const { data: authData } = await supabase.auth.getUser()
      const { data, error: insertError } = await supabase
        .from('asset_requests')
        .insert({
          availability_status: request.availabilityStatus,
          ceco: String(request.ceco ?? ''),
          contract: request.contract,
          description: request.description,
          inventory_item_id: request.inventoryItemId,
          item_code: request.itemCode,
          item_group: request.group,
          needed_at: request.neededAt || null,
          priority: request.priority,
          quantity: request.quantity,
          reason: request.reason,
          requested_by: authData.user?.id ?? null,
          requested_by_name: request.requestedBy,
          status: request.status,
          warehouse: request.warehouse,
        })
        .select(
          'id, inventory_item_id, item_code, description, warehouse, ceco, item_group, quantity, requested_by_name, contract, needed_at, priority, status, availability_status, reason, created_at',
        )
        .single()

      if (!insertError && data) {
        const remoteRequest = rowToRequest(data as AssetRequestRow)
        setRequests((current) => [remoteRequest, ...current].slice(0, 500))
        setSource('supabase')
        setError('')
        return { request: remoteRequest, source: 'supabase' as const }
      }

      setError(insertError?.message ?? 'No se pudo crear la solicitud en Supabase')
    }

    setRequests((current) => {
      const next = [request, ...current].slice(0, 500)
      writeRequests(next)
      return next
    })
    setSource('local')

    return { request, source: 'local' as const }
  }, [])

  const warehouseQueue = useMemo(
    () =>
      requests.filter((request) =>
        ['approved', 'pending_approval', 'warehouse_queue', 'ready_to_dispatch'].includes(
          request.status,
        ),
      ),
    [requests],
  )

  const quoteQueue = useMemo(
    () => requests.filter((request) => request.status === 'quote_required'),
    [requests],
  )

  return {
    addRequest,
    error,
    quoteQueue,
    requests,
    source,
    warehouseQueue,
  }
}

export function getRequestStatusLabel(status: AssetRequestStatus) {
  const labels: Record<AssetRequestStatus, string> = {
    approved: 'Aprobada',
    closed: 'Cerrada',
    dispatched: 'Despachada',
    pending_approval: 'Pendiente aprobación',
    quote_required: 'Requiere cotización',
    ready_to_dispatch: 'Lista para despacho',
    rejected: 'Rechazada',
    warehouse_queue: 'Cola bodega',
  }

  return labels[status]
}

export function getRequestTone(status: AssetRequestStatus) {
  if (status === 'quote_required') return 'warning'
  if (status === 'rejected') return 'danger'
  if (status === 'closed') return 'neutral'
  if (status === 'dispatched') return 'info'
  return 'positive'
}
