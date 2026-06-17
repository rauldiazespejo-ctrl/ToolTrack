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
