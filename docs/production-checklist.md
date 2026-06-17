# ToolTrack Production Checklist

Use this checklist before exposing ToolTrack outside local development.

## 1. Supabase Project

- Run `supabase/schema.sql` in the Supabase SQL editor.
- Create at least one authenticated user in Supabase Auth.
- Copy only the Project URL and anon public key into the hosting provider env vars.
- Never use `service_role` or `sb_secret_` keys in frontend variables.

Required variables:

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=ey...
```

Validate production env locally:

```bash
VITE_SUPABASE_URL="https://xxxxx.supabase.co" \
VITE_SUPABASE_ANON_KEY="ey..." \
npm run check:prod
```

## 2. Real Inventory Import

Generate a SQL seed from the real Excel workbook:

```bash
python3 scripts/generate-supabase-seed.py \
  "/Users/rauldiazespejogmail.com/Downloads/INVENTARIO GENERAL ACTUALIZADO.xlsx" \
  supabase/seed.generated.sql
```

Review `supabase/seed.generated.sql`, then run it in Supabase after the schema.
The generated seed is ignored by Git because it is operational output.

## 3. Operational Modules

The first implementation slice includes:

- Asset requests generated from real inventory rows.
- Availability derived from `saldo` and `estado`.
- Quote routing when an item has no available operational stock or requires review.
- Warehouse queue for pending/approved/prepared requests.
- Compliance candidate list for assets that may need certificates, calibrations
  or maintenance rules.

Do not activate dispatch blocking until real document rules and expiration dates
are loaded.

## 4. Frontend Verification

Run:

```bash
npm ci
npm run lint
npm run test
npm run build
```

Then verify these routes:

- `/`
- `/tools`
- `/qr`
- `/requests`
- `/warehouse`
- `/compliance`
- `/scan/acb-1000053-1?v=1&code=ACB-1000053`
- `/events`
- `/login`

## 5. Deployment

The repo includes SPA fallback files for Vercel and Netlify-style hosts:

- `vercel.json`
- `public/_redirects`

Build command:

```bash
npm run build
```

Output directory:

```bash
dist
```

## 6. GitHub CI

The CI template is stored at `docs/github-actions-ci.yml`. Copy it to
`.github/workflows/ci.yml` from a GitHub token with `workflow` scope enabled.
The current backup token cannot create workflow files directly.

## 7. Data Rules

- Keep generated UI values tied to the real workbook or Supabase tables.
- Do not invent owners, GPS coordinates, maintenance dates, photos, or custody history.
- QR scan events can be created in the app; inventory and movement source data must come from the real workbook until a formal import UI exists.
