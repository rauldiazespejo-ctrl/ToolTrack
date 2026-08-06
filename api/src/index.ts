import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import { equipmentRouter } from './routes/equipment'
import { inventoryRouter } from './routes/inventory'
import { maintenanceRouter } from './routes/maintenance'
import { alertsRouter } from './routes/alerts'
import { activityLogRouter } from './routes/activityLog'

const app = new Hono()

app.use('*', logger())
app.use('*', cors({
  origin: (origin) => {
    const allowed = (process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173')
      .split(',').map(s => s.trim())
    if (!origin) return allowed[0]
    return allowed.includes(origin) ? origin : null
  },
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}))

app.get('/', (c) => c.json({ name: 'tooltrack-api', status: 'ok' }))
app.get('/health', (c) => c.json({ ok: true, ts: new Date().toISOString() }))

app.route('/api/equipment', equipmentRouter)
app.route('/api/inventory', inventoryRouter)
app.route('/api/maintenance', maintenanceRouter)
app.route('/api/alerts', alertsRouter)
app.route('/api/activity-logs', activityLogRouter)

app.notFound((c) => c.json({ error: 'Not found' }, 404))
app.onError((err, c) => {
  console.error('[error]', err)
  return c.json({ error: err.message }, 500)
})

const port = Number(process.env.PORT ?? 8787)
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`tooltrack-api listening on http://localhost:${info.port}`)
})
