import { inventoryItems } from '../data/inventory'
import type { InventoryAggregate, InventoryItem } from '../types'

export function getInventoryStats(items: InventoryItem[] = inventoryItems) {
  const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0)
  const totalBalance = items.reduce((sum, item) => sum + item.balance, 0)
  const activeItems = items.filter((item) => item.status === 'ACTIVA')
  const closedItems = items.filter((item) => item.status === 'CERRADO')
  const warehouses = new Set(items.map((item) => item.warehouse)).size
  const cecos = new Set(items.map((item) => String(item.ceco ?? ''))).size

  return {
    totalItems: items.length,
    totalValue,
    totalBalance,
    activeItems: activeItems.length,
    closedItems: closedItems.length,
    warehouses,
    cecos,
  }
}

export function aggregateBy(
  key: keyof Pick<InventoryItem, 'warehouse' | 'status' | 'group' | 'ceco'>,
  items: InventoryItem[] = inventoryItems,
): InventoryAggregate[] {
  const buckets = new Map<string, InventoryAggregate>()

  for (const item of items) {
    const label = String(item[key] ?? 'Sin dato') || 'Sin dato'
    const bucket =
      buckets.get(label) ??
      ({
        label,
        count: 0,
        balance: 0,
        totalValue: 0,
      } satisfies InventoryAggregate)

    bucket.count += 1
    bucket.balance += item.balance
    bucket.totalValue += item.totalValue
    buckets.set(label, bucket)
  }

  return [...buckets.values()].sort((a, b) => b.totalValue - a.totalValue)
}

export function findInventoryItem(itemId: string) {
  return inventoryItems.find((item) => item.id === itemId)
}

export function getQrValue(item: InventoryItem, origin = window.location.origin) {
  const url = new URL(`/scan/${item.id}`, origin)
  url.searchParams.set('v', '1')
  url.searchParams.set('code', item.code)
  url.searchParams.set('bodega', item.warehouse)
  return url.toString()
}

export function getQrIdentity(item: InventoryItem) {
  return `${item.code} · ${item.group} · CECO ${item.ceco ?? 'S/D'}`
}

export function getUniqueValues(
  key: keyof Pick<InventoryItem, 'warehouse' | 'status' | 'group'>,
) {
  return [...new Set(inventoryItems.map((item) => item[key]).filter(Boolean))].sort()
}

export function searchInventoryItems({
  query,
  status,
  group,
  warehouse,
}: {
  query: string
  status: string
  group: string
  warehouse: string
}) {
  const normalizedQuery = query.trim().toLowerCase()

  return inventoryItems.filter((item) => {
    const matchesQuery =
      !normalizedQuery ||
      [item.code, item.description, item.warehouse, item.group, String(item.ceco ?? '')]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)

    return (
      matchesQuery &&
      (status === 'all' || item.status === status) &&
      (group === 'all' || item.group === group) &&
      (warehouse === 'all' || item.warehouse === warehouse)
    )
  })
}

export function getStatusTone(status: string) {
  if (status === 'ACTIVA') return 'positive'
  if (status === 'CERRADO') return 'neutral'
  return 'info'
}
