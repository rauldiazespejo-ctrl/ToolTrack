# tooltrack-api

Backend Hono + Drizzle + Neon (Postgres) + Clerk (auth) para SOLDESP ToolTrack.

## Stack
- **Hono 4** sobre Node 22 (`@hono/node-server`).
- **Drizzle ORM** + **`@neondatabase/serverless`** (driver HTTP, edge-ready).
- **Clerk** (`@clerk/backend`) para verificar JWT.
- **Zod** para validacion.
- Multi-tenant por `org_id` derivado del Clerk user.

## Setup local

```bash
cp .env.example .env   # rellenar DATABASE_URL y CLERK_*
npm install
npm run db:push        # crea/actualiza schema en Neon
npm run db:seed        # opcional: datos demo
npm run dev            # http://localhost:8787
```

## Endpoints

Todos protegidos por `Authorization: Bearer <clerk_jwt>`. Operan dentro del `org` del usuario.

| Recurso | Path |
|---|---|
| Equipos | `/api/equipment` |
| Inventario | `/api/inventory` |
| Mantenimiento | `/api/maintenance` |
| Alertas | `/api/alerts` |
| Bitacora | `/api/activity-logs` |

Cada recurso expone `GET /` (list), `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`.

Health: `GET /health` (publico).

## Scripts

| Script | Descripcion |
|---|---|
| `npm run dev` | tsx watch |
| `npm run build` | tsc |
| `npm run start` | corre `dist/index.js` |
| `npm run db:generate` | genera SQL desde schema |
| `npm run db:push` | push schema a Neon |
| `npm run db:seed` | semilla inicial |
| `npm run db:studio` | Drizzle Studio |

## Deploy

Compatible con Vercel Functions / Railway / Fly.io. El driver Neon HTTP funciona en edge runtimes.
