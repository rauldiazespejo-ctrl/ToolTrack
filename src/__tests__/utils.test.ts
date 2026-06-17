import { describe, it, expect } from 'vitest'
import { cn, formatCurrency, formatDate } from '../lib/utils'

describe('cn', () => {
  it('merges classes', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('handles conditional classes', () => {
    const shouldInclude = false
    expect(cn('a', shouldInclude && 'b', 'c')).toBe('a c')
  })
})

describe('formatCurrency', () => {
  it('formats CLP correctly', () => {
    expect(formatCurrency(1500)).toBe('$1.500')
  })
})

describe('formatDate', () => {
  it('formats date correctly', () => {
    expect(formatDate('2024-01-15')).toBe('15 ene 2024')
  })
})
