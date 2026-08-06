import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { eq, and, desc } from 'drizzle-orm'
import type { z } from 'zod'
import { db } from '../db/client'
import { requireAuth } from '../middleware/auth'
import type { AuthVariables } from './types'

type AnyTable = {
  id: any
  orgId: any
}

/**
 * Build a standard CRUD router (list, get, create, update, delete)
 * scoped to org_id from the authenticated user.
 */
export function buildCrudRouter<TTable extends Record<string, any>>(opts: {
  table: TTable
  createSchema: z.ZodTypeAny
  updateSchema: z.ZodTypeAny
  orderColumn?: keyof TTable
}) {
  const { table, createSchema, updateSchema, orderColumn } = opts
  const app = new Hono<{ Variables: AuthVariables }>()
  app.use('*', requireAuth)

  // LIST
  app.get('/', async (c) => {
    const orgId = c.get('orgId')
    const order = orderColumn ? desc(table[orderColumn] as any) : desc((table as any).id)
    const rows = await db.select().from(table as any).where(eq((table as any).orgId, orgId)).orderBy(order)
    return c.json(rows)
  })

  // GET BY ID
  app.get('/:id', async (c) => {
    const orgId = c.get('orgId')
    const id = c.req.param('id')
    const rows = await db.select().from(table as any)
      .where(and(eq((table as any).id, id), eq((table as any).orgId, orgId)))
      .limit(1)
    if (rows.length === 0) return c.json({ error: 'Not found' }, 404)
    return c.json(rows[0])
  })

  // CREATE
  app.post('/', zValidator('json', createSchema), async (c) => {
    const orgId = c.get('orgId')
    const data = c.req.valid('json') as Record<string, unknown>
    const rows = (await db.insert(table as any).values({ ...data, orgId }).returning()) as any[]
    return c.json(rows[0], 201)
  })

  // UPDATE
  app.patch('/:id', zValidator('json', updateSchema), async (c) => {
    const orgId = c.get('orgId')
    const id = c.req.param('id')
    const data = c.req.valid('json') as Record<string, unknown>
    const rows = (await db.update(table as any).set(data)
      .where(and(eq((table as any).id, id), eq((table as any).orgId, orgId)))
      .returning()) as any[]
    if (rows.length === 0) return c.json({ error: 'Not found' }, 404)
    return c.json(rows[0])
  })

  // DELETE
  app.delete('/:id', async (c) => {
    const orgId = c.get('orgId')
    const id = c.req.param('id')
    const rows = (await db.delete(table as any)
      .where(and(eq((table as any).id, id), eq((table as any).orgId, orgId)))
      .returning()) as any[]
    if (rows.length === 0) return c.json({ error: 'Not found' }, 404)
    return c.json({ ok: true })
  })

  return app
}
