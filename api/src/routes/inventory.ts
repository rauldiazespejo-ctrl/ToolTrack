import { z } from 'zod'
import { inventoryItems } from '../db/schema'
import { buildCrudRouter } from '../lib/crud'

const cats = ['electrodos', 'discos', 'gases', 'epp', 'repuestos'] as const
const units = ['unidad', 'kg', 'litro', 'metro', 'caja', 'par', 'cilindro'] as const

const createSchema = z.object({
  name: z.string().min(1),
  category: z.enum(cats),
  quantity: z.number().int().nonnegative().default(0),
  minStock: z.number().int().nonnegative().default(0),
  unit: z.enum(units).default('unidad'),
  locationWarehouse: z.string().default(''),
  supplier: z.string().default(''),
  lastRestock: z.string().default(''),
  costPerUnit: z.union([z.string(), z.number()]).transform(String).default('0'),
})

const updateSchema = createSchema.partial()

export const inventoryRouter = buildCrudRouter({
  table: inventoryItems,
  createSchema,
  updateSchema,
})
