import { z } from 'zod'
import { equipment } from '../db/schema'
import { buildCrudRouter } from '../lib/crud'

const equipmentTypes = ['herramienta', 'vehiculo', 'maquinaria', 'epp'] as const
const equipmentStatuses = ['disponible', 'en_uso', 'mantenimiento', 'fuera_servicio'] as const

const createSchema = z.object({
  name: z.string().min(1),
  type: z.enum(equipmentTypes),
  brand: z.string().default(''),
  model: z.string().default(''),
  serialNumber: z.string().min(1),
  status: z.enum(equipmentStatuses).default('disponible'),
  locationSite: z.string().default(''),
  assignedTo: z.string().nullable().optional(),
  qrCode: z.string().default(''),
  purchaseDate: z.string().default(''),
  purchaseCost: z.union([z.string(), z.number()]).transform(String).default('0'),
  photoUrl: z.string().nullable().optional(),
})

const updateSchema = createSchema.partial()

export const equipmentRouter = buildCrudRouter({
  table: equipment,
  createSchema,
  updateSchema,
  orderColumn: 'createdAt',
})
