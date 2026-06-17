# ToolTrack App

ToolTrack is a React + TypeScript inventory dashboard built from the real Excel
workbook `INVENTARIO GENERAL ACTUALIZADO.xlsx`.

The app currently uses the workbook sheet `INVENTARIO VALORIZADO` and preserves
its source fields: bodega, CECO, estado, grupo, código, descripción, entradas,
salidas, saldo, valor unitario, and valor total.

## Stack

- Vite, React 19, TypeScript
- React Router
- Chart.js for summaries
- QR code detail cards
- Supabase client scaffold
- Vitest and Testing Library

## Getting Started

```bash
npm ci
npm run dev
```

## Scripts

```bash
npm run lint
npm run test
npm run build
npm run preview
```

Regenerate the app inventory JSON from the real Excel file:

```bash
python3 scripts/generate-inventory-json.py \
  "/Users/rauldiazespejogmail.com/Downloads/INVENTARIO GENERAL ACTUALIZADO.xlsx" \
  src/data/inventory.generated.json
```

## Environment

Copy `.env.example` to `.env.local` when connecting Supabase:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Use only the browser-safe Supabase Project URL and anon public key. Do not put
`service_role` keys or keys starting with `sb_secret_` in Vite variables because
they are exposed to the browser bundle.

The UI works without Supabase because it reads `src/data/inventory.generated.json`.
Without those variables, QR scan events are stored in browser `localStorage`.

## Product Areas

- Dashboard: total rows, bodegas, CECO, saldo, value, status and group charts.
- Inventario: search and filters by estado, grupo, bodega, code, CECO.
- Detail: factual QR card for each real inventory row.
- Scan: mobile QR landing page for field verification.
- Eventos: local QR confirmations and differences ready to map to Supabase.
- Bodegas: value concentration by bodega without invented coordinates.
- Reportes: value by grupo and estado.

## Data Integrity Notes

- Do not add fake locations, owners, maintenance events, photos, or coordinates.
- If geospatial maps are needed later, add real coordinates to a source table.
- Large inventory data is bundled as a generated JSON chunk.

## Production Backend

`supabase/schema.sql` contains the first production schema for imports, inventory
items, movements, and QR scan events. The frontend still uses generated JSON
until Supabase credentials and import workflows are configured. QR scan actions
currently persist in `localStorage` with the same shape planned for
`qr_scan_events`; when Supabase env vars are present, the app writes scan events
to Supabase and associates them with the authenticated user.
