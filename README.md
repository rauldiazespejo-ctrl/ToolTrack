# SOLDESP ToolTrack

Gestión industrial de activos y equipos. Plataforma web para registrar, controlar y rastrear herramientas, maquinaria, vehículos y EPP en tiempo real.

## Stack Tecnológico

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Chart.js + react-chartjs-2
- Leaflet + react-leaflet
- Supabase (backend y autenticación)

## Instalación

```bash
npm install
```

> Se recomienda usar Node.js v22 (ver `.nvmrc`).

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo Vite |
| `npm run build` | Compilación de producción |
| `npm run lint` | ESLint con reglas type-aware |
| `npm test` | Tests con Vitest (watch) |
| `npm run test:run` | Tests con Vitest (una vez) |

## Variables de entorno

Crear `.env` a partir de `.env.example`:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_USE_SUPABASE=false
```

## Estructura del proyecto

```
src/
  hooks/        # Hooks de datos (useEquipment, etc.)
  pages/        # Vistas principales (EquipmentPage, etc.)
  components/   # UI reutilizable (Button, Card, Table, etc.)
  services/     # Clientes y lógica de API
  lib/          # Utilidades, tipos y configuración Supabase
```

---
Proyecto chileno 🇨🇱 — SOLDESP ToolTrack.
