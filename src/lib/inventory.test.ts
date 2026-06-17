import { describe, expect, it } from 'vitest'
import { inventoryItems } from '../data/inventory'
import { aggregateBy, getInventoryStats } from './inventory'

describe('real inventory helpers', () => {
  it('loads the real Excel-derived inventory', () => {
    const stats = getInventoryStats()

    expect(inventoryItems.length).toBe(13299)
    expect(stats.totalValue).toBeGreaterThan(5_000_000_000)
    expect(stats.warehouses).toBeGreaterThan(50)
  })

  it('aggregates every row by group', () => {
    const groupedCount = aggregateBy('group').reduce(
      (sum, group) => sum + group.count,
      0,
    )

    expect(groupedCount).toBe(inventoryItems.length)
  })
})
