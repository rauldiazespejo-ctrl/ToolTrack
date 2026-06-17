import generatedMovements from './movements.generated.json'
import type { MovementSummary } from '../types'

export const movementSummaries = generatedMovements as Record<string, MovementSummary>
