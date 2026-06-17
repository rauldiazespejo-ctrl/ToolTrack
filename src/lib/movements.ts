import { movementSummaries } from '../data/movements'

export function getMovementSummary(code: string) {
  return movementSummaries[code] ?? { movementCount: 0, lastMovements: [] }
}
