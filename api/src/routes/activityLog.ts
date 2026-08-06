import { z } from 'zod'
import { activityLogs } from '../db/schema'
import { buildCrudRouter } from '../lib/crud'

const actions = ['checkout', 'checkin', 'transfer', 'maintenance'] as const

const createSchema = z.object({
  equipmentId: z.string().uuid().nullable().optional(),
  equipmentName: z.string().nullable().optional(),
  action: z.enum(actions),
  userName: z.string().default(''),
  fromLocation: z.string().nullable().optional(),
  toLocation: z.string().nullable().optional(),
  notes: z.string().default(''),
})

const updateSchema = createSchema.partial()

export const activityLogRouter = buildCrudRouter({
  table: activityLogs,
  createSchema,
  updateSchema,
  orderColumn: 'createdAt',
})
