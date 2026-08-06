import { z } from 'zod'
import { alerts } from '../db/schema'
import { buildCrudRouter } from '../lib/crud'

const types = ['stock_bajo', 'mantenimiento_vencido', 'equipo_sin_devolver', 'calibracion'] as const
const sevs = ['critica', 'alta', 'media', 'baja'] as const

const createSchema = z.object({
  type: z.enum(types),
  severity: z.enum(sevs).default('media'),
  title: z.string().min(1),
  message: z.string().default(''),
  relatedId: z.string().nullable().optional(),
  relatedType: z.string().nullable().optional(),
  isRead: z.boolean().default(false),
})

const updateSchema = createSchema.partial()

export const alertsRouter = buildCrudRouter({
  table: alerts,
  createSchema,
  updateSchema,
  orderColumn: 'createdAt',
})
