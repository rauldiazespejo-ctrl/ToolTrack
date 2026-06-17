import generatedItems from './inventory.generated.json'
import type { InventoryItem } from '../types'

export const inventoryItems = generatedItems as InventoryItem[]

export const inventorySource = {
  fileName: 'INVENTARIO GENERAL ACTUALIZADO.xlsx',
  sheetName: 'INVENTARIO VALORIZADO',
  movementSheetName: 'LMA',
  rowCount: inventoryItems.length,
}
