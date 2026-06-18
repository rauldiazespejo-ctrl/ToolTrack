import { describe, expect, it } from 'vitest'
import { buildEquipmentQrValue, getComplianceStatus } from '../lib/tooltrack'

describe('tooltrack helpers', () => {
  it('builds stable equipment qr values', () => {
    expect(buildEquipmentQrValue('eq-123')).toBe('tooltrack://equipment/eq-123')
  })

  it('computes compliance status by expiry date', () => {
    expect(getComplianceStatus('2099-12-31')).toBe('vigente')
  })

  it('marks near-expiry documents', () => {
    expect(getComplianceStatus('2026-06-25')).toBe('vence_pronto')
  })
})
