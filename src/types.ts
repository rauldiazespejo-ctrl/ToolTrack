export type InventoryItem = {
  id: string
  warehouse: string
  ceco: number | string | null
  status: string
  group: string
  code: string
  description: string
  entries: number
  exits: number
  balance: number
  unitValue: number
  totalValue: number
}

export type InventoryAggregate = {
  label: string
  count: number
  balance: number
  totalValue: number
}

export type InventoryMovement = {
  date: string
  document: string
  number: string
  warehouse: string
  entry: number
  exit: number
  balance: number
}

export type MovementSummary = {
  movementCount: number
  lastMovements: InventoryMovement[]
}

export type ScanAction = 'confirm_location' | 'report_difference'

export type ScanEvent = {
  id: string
  inventoryItemId: string
  itemCode: string
  action: ScanAction
  expectedWarehouse: string
  reportedWarehouse: string
  notes: string
  createdAt: string
}

export type AvailabilityStatus =
  | 'available'
  | 'needs_review'
  | 'out_of_stock'
  | 'blocked'

export type AssetRequestStatus =
  | 'pending_approval'
  | 'approved'
  | 'warehouse_queue'
  | 'ready_to_dispatch'
  | 'dispatched'
  | 'closed'
  | 'quote_required'
  | 'rejected'

export type AssetRequestPriority = 'normal' | 'urgent' | 'critical'

export type AssetRequest = {
  id: string
  inventoryItemId: string
  itemCode: string
  description: string
  warehouse: string
  ceco: number | string | null
  group: string
  quantity: number
  requestedBy: string
  contract: string
  neededAt: string
  priority: AssetRequestPriority
  status: AssetRequestStatus
  availabilityStatus: AvailabilityStatus
  reason: string
  createdAt: string
}

export type ComplianceCandidate = {
  inventoryItemId: string
  itemCode: string
  description: string
  warehouse: string
  group: string
  signal: 'requires_classification' | 'document_not_loaded'
  reason: string
}
