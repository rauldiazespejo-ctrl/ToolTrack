import { z } from 'zod'
import { maintenanceOrders } from '../db/schema'
import { buildCrudRouter } from '../lib/crud'

const types = ['preventivo', 'correctivo', 'calibracion'] as const
const statuses = ['pendiente', 'en_progreso', 'completado', 'vencido'] as const
const priorities = ['alta', 'media', 'baja'] as const

const createSchema = z.object({
  equipmentId: z.string().uuid().nullable().optional(),
  equipmentName: z.string().nullable().optional(),
  type: z.enum(types),
  status: z.enum(statuses).default('pendiente'),
  description: z.string().default(''),
  assignedTo: z.string().default(''),
  priority: z.enum(priorities).default('media'),
  scheduledDate: z.string().default(''),
  completedDate: z.string().nullable().optional(),
  cost: z.union([z.string(), z.number()]).transform(String).default('0'),
  notes: z.string().default(''),
})

const updateSchema = createSchema.partial()

export const maintenanceRouter = buildCrudRouter({
  table: maintenanceOrders,
  createSchema,
  updateSchema,
})
