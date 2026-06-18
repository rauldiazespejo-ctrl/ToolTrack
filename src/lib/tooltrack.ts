import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { ComplianceDocument, ComplianceDocumentStatus, DispatchCondition } from './supabase'

export const REQUEST_STATUS_LABELS = {
  pending_approval: 'Pendiente',
  approved: 'Aprobada',
  warehouse_queue: 'Cola Bodega',
  ready_to_dispatch: 'Lista para despacho',
  dispatched: 'Despachada',
  closed: 'Cerrada',
  quote_required: 'Requiere cotización',
  rejected: 'Rechazada',
} as const

export const QUOTE_STATUS_LABELS = {
  pending_quote: 'Pendiente',
  quoted: 'Cotizada',
  purchase_approved: 'Compra aprobada',
  purchased: 'Comprada',
  received: 'Recibida',
  cancelled: 'Cancelada',
} as const

export const DISPATCH_STATUS_LABELS = {
  preparing: 'Preparando',
  dispatched: 'Despachado',
  received: 'Recibido',
  returned: 'Devuelto',
  cancelled: 'Cancelado',
} as const

export const DOCUMENT_STATUS_LABELS = {
  vigente: 'Vigente',
  vence_pronto: 'Vence pronto',
  vencido: 'Vencido',
  ausente: 'Ausente',
} as const

export const RETURN_CONDITION_LABELS: Record<DispatchCondition, string> = {
  correcta: 'Correcta',
  danada: 'Dañada',
  incompleta: 'Incompleta',
  requiere_mantenimiento: 'Requiere mantenimiento',
  pendiente: 'Pendiente',
} as const

export function buildEquipmentQrValue(equipmentId: string): string {
  return `tooltrack://equipment/${equipmentId}`
}

export function buildRequestCode(): string {
  return `REQ-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

export function buildQuoteCode(): string {
  return `COT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

export function buildDispatchCode(): string {
  return `DSP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

export function buildScanValue(entityType: string, entityId: string): string {
  return `tooltrack://${entityType}/${entityId}`
}

export function getComplianceStatus(expiresAt: string): ComplianceDocumentStatus {
  const days = differenceInCalendarDays(parseISO(expiresAt), new Date())
  if (Number.isNaN(days)) return 'ausente'
  if (days < 0) return 'vencido'
  if (days <= 15) return 'vence_pronto'
  return 'vigente'
}

export function normalizeComplianceDocument(document: ComplianceDocument): ComplianceDocument {
  return {
    ...document,
    status: getComplianceStatus(document.expires_at),
  }
}

export function getDispatchConditionLabel(condition: DispatchCondition | null): string {
  if (!condition) return 'Pendiente'
  return RETURN_CONDITION_LABELS[condition]
}
