import { describe, expect, it } from 'vitest'
import type { InventoryItem } from '../types'
import {
  getAvailabilityLabel,
  getAvailabilityStatus,
  getComplianceCandidates,
} from './inventory'

const baseItem: InventoryItem = {
  balance: 1,
  ceco: 1,
  code: 'ACB-1',
  description: 'PIE DE METRO',
  entries: 1,
  exits: 0,
  group: 'ACB',
  id: 'acb-1',
  status: 'ACTIVA',
  totalValue: 100,
  unitValue: 100,
  warehouse: 'BODEGA',
}

describe('request planning helpers', () => {
  it('derives availability from real status and balance fields', () => {
    expect(getAvailabilityStatus(baseItem)).toBe('available')
    expect(getAvailabilityLabel('available')).toBe('Disponible')
    expect(getAvailabilityStatus({ ...baseItem, balance: 0 })).toBe('out_of_stock')
    expect(getAvailabilityStatus({ ...baseItem, status: 'CERRADO' })).toBe(
      'needs_review',
    )
  })

  it('flags compliance candidates without inventing due dates', () => {
    const candidates = getComplianceCandidates([baseItem])
    expect(candidates).toHaveLength(1)
    expect(candidates[0].signal).toBe('requires_classification')
  })
})
