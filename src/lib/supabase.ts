import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Equipment = {
  id: string
  name: string
  type: 'herramienta' | 'vehiculo' | 'maquinaria' | 'epp'
  brand: string
  model: string
  serial_number: string
  status: 'disponible' | 'en_uso' | 'mantenimiento' | 'fuera_servicio'
  location_site: string
  assigned_to: string | null
  qr_code: string
  purchase_date: string
  purchase_cost: number
  photo_url: string | null
  created_at: string
  updated_at: string
}

export type InventoryItem = {
  id: string
  name: string
  category: 'electrodos' | 'discos' | 'gases' | 'epp' | 'repuestos'
  quantity: number
  min_stock: number
  unit: 'unidad' | 'kg' | 'litro' | 'metro' | 'caja' | 'par' | 'cilindro'
  location_warehouse: string
  contract_code?: string | null
  ceco?: string | null
  supplier: string
  last_restock: string
  cost_per_unit: number
}

export type MaintenanceOrder = {
  id: string
  equipment_id: string
  equipment_name?: string
  type: 'preventivo' | 'correctivo' | 'calibracion'
  status: 'pendiente' | 'en_progreso' | 'completado' | 'vencido'
  description: string
  assigned_to: string
  priority: 'alta' | 'media' | 'baja'
  scheduled_date: string
  completed_date: string | null
  cost: number
  notes: string
}

export type Alert = {
  id: string
  type: 'stock_bajo' | 'mantenimiento_vencido' | 'equipo_sin_devolver' | 'calibracion'
  severity: 'critica' | 'alta' | 'media' | 'baja'
  title: string
  message: string
  related_id: string | null
  related_type: string | null
  is_read: boolean
  created_at: string
}

export type ActivityLog = {
  id: string
  equipment_id: string
  equipment_name?: string
  action: 'checkout' | 'checkin' | 'transfer' | 'maintenance'
  user_name: string
  from_location: string | null
  to_location: string | null
  notes: string
  created_at: string
}

export type AssetRequestStatus =
  | 'pending_approval'
  | 'approved'
  | 'warehouse_queue'
  | 'ready_to_dispatch'
  | 'dispatched'
  | 'closed'
  | 'quote_required'
  | 'rejected'

export type AssetRequestPriority = 'alta' | 'media' | 'baja'
export type AssetRequestSource = 'equipment' | 'inventory' | 'service'

export type AssetRequest = {
  id: string
  request_code: string
  title: string
  requested_item_type: AssetRequestSource
  requested_item_id: string | null
  requested_item_name: string
  quantity: number
  requester_name: string
  requester_role: string
  contract_code: string | null
  location_site: string
  priority: AssetRequestPriority
  status: AssetRequestStatus
  notes: string
  approver_name: string | null
  approved_at: string | null
  rejection_reason: string | null
  quote_request_id: string | null
  dispatch_id: string | null
  created_at: string
  updated_at: string
}

export type QuoteRequestStatus =
  | 'pending_quote'
  | 'quoted'
  | 'purchase_approved'
  | 'purchased'
  | 'received'
  | 'cancelled'

export type QuoteRequest = {
  id: string
  quote_code: string
  asset_request_id: string
  responsible_name: string
  supplier_name: string | null
  status: QuoteRequestStatus
  estimated_cost: number | null
  notes: string
  created_at: string
  updated_at: string
}

export type DispatchStatus = 'preparing' | 'dispatched' | 'received' | 'returned' | 'cancelled'
export type DispatchCondition = 'correcta' | 'danada' | 'incompleta' | 'requiere_mantenimiento' | 'pendiente'

export type Dispatch = {
  id: string
  dispatch_code: string
  asset_request_id: string
  prepared_by: string
  requester_name: string
  from_location: string
  to_location: string
  status: DispatchStatus
  qr_verified_at: string | null
  dispatched_at: string | null
  received_at: string | null
  returned_at: string | null
  return_condition: DispatchCondition | null
  notes: string
  created_at: string
  updated_at: string
}

export type DispatchItem = {
  id: string
  dispatch_id: string
  equipment_id: string | null
  inventory_item_id: string | null
  item_name: string
  qr_value: string | null
  quantity: number
  verified: boolean
  created_at: string
  updated_at: string
}

export type ComplianceDocumentStatus = 'vigente' | 'vence_pronto' | 'vencido' | 'ausente'
export type ComplianceDocumentType = 'certificacion' | 'calibracion' | 'mantencion' | 'inspeccion'

export type ComplianceDocument = {
  id: string
  equipment_id: string | null
  inventory_item_id: string | null
  document_type: ComplianceDocumentType
  number: string
  provider: string
  issued_at: string
  expires_at: string
  file_url: string
  required_for_dispatch: boolean
  status: ComplianceDocumentStatus
  notes: string
  created_at: string
  updated_at: string
}

export type QrScanEvent = {
  id: string
  qr_value: string
  entity_type: 'equipment' | 'inventory' | 'dispatch' | 'document' | 'request'
  entity_id: string | null
  scanned_by: string
  location_site: string
  scan_context: 'dispatch_out' | 'dispatch_in' | 'inventory_check' | 'compliance_verify' | 'asset_lookup'
  notes: string
  created_at: string
}

export type Notification = {
  id: string
  title: string
  message: string
  severity: 'critica' | 'alta' | 'media' | 'baja'
  recipient_role: string
  related_type: string | null
  related_id: string | null
  is_read: boolean
  source: string
  created_at: string
}
