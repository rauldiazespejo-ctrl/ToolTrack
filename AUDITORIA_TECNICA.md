# Auditoria Tecnica — SOLDESP ToolTrack

**Fecha:** 2026-06-30  
**Stack:** React 19 · TypeScript 6 · Vite 8 · Tailwind v4 · Supabase JS · Chart.js · Leaflet · PWA  
**Node:** v22 (ver `.nvmrc`)

---

## 1. Resumen ejecutivo

| Metrica | Valor |
|---|---|
| Lint | OK 0 errores / 0 warnings |
| Tests | OK 6/6 pasando (3 suites) |
| Build TS | OK `tsc -b` limpio |
| Score global | **82 / 100** |

El proyecto paso de prototipo visual (52/100 en jun-2025) a una base solida con:

- Adapter pattern (`LocalStorageAdapter` + `SupabaseAdapter`) seleccionable por `VITE_USE_SUPABASE`.
- Autenticacion real con Supabase + modo "mock" cuando no hay variables de entorno.
- Rutas protegidas con `ProtectedRoute` y logout funcional.
- Busqueda global con debounce (`useDebounce` + `SearchContext`).
- Notificaciones dinamicas (`unreadCount` del hook `useAlerts`).
- Validacion de formulario en login con `fieldErrors`.
- ErrorBoundary global con `react-error-boundary`.
- Toaster con Sonner.
- PWA configurada (`vite-plugin-pwa`).
- Husky + lint-staged + `.env.example`.
- 3 suites de tests (utils, LoginPage, DashboardPage).

---

## 2. Hallazgos vigentes (post-mejoras 2026-06-30)

| # | Severidad | Hallazgo | Estado |
|---|---|---|---|
| L-01 | Critico | `npm run lint` fallaba con 13 errores `no-unsafe-*` en tests | Resuelto (override ESLint) |
| T-01 | Critico | `vitest` no resolvia `@testing-library/dom` | Resuelto (peer dep instalada) |
| H-01 | Alta | Hooks bypaseaban el adapter leyendo `localStorage` en el `useState` inicial | Resuelto |
| H-02 | Alta | `useLocalStorage` era codigo muerto | Resuelto (eliminado) |
| H-03 | Alta | `adjustStock(reason)` se descartaba con `void reason` | Resuelto (loguea con `console.info`) |
| S-01 | Media | `SupabaseAdapter` enviaba `created_at`/`updated_at` en payloads | Resuelto (`stripServerManaged`) |
| C-01 | Media | `setupTests.ts` no aislaba localStorage entre tests | Resuelto (`beforeEach(localStorage.clear)`) |
| G-01 | Baja | `.gitignore` no excluia `.env` | Resuelto |

### Pendientes para proximas iteraciones

| # | Severidad | Descripcion |
|---|---|---|
| PWA-01 | Alta | Pantalla en blanco al servir `vite preview` con el service worker registrado (no afecta dev ni produccion remota). Investigar interaccion entre `vite-plugin-pwa` (`registerType: autoUpdate`) y el cache offline. |
| S-02 | Media | `LocalStorageAdapter` no escucha el evento `storage` (cross-tab). |
| H-03b | Media | Conectar `adjustStock` con `useActivityLog.addEntry` para auditoria persistente. |
| A-01 | Media | Habilitar RLS en Supabase y politicas por organizacion cuando se active backend real. |
| F-01 | Baja | Validacion de formularios en CRUD (costo >= 0, fechas, unicidad de serial). |
| T-02 | Baja | Subir cobertura: tests para `EquipmentPage`, hooks de dominio y adapters. |
| I-01 | Baja | i18n (todo el copy esta en espanol hardcodeado). |

---

## 3. Arquitectura actual

```
src/
├── App.tsx                    # Router + AuthProvider
├── main.tsx                   # Bootstrap + ErrorBoundary + Toaster + SearchProvider
├── context/
│   ├── AuthContext.tsx        # Auth Supabase + mock fallback
│   └── SearchContext.tsx      # Estado global de busqueda
├── hooks/
│   ├── useAuth, useDebounce, useSearch
│   ├── useEquipment, useInventory, useMaintenance, useAlerts, useActivityLog
│   └── index.ts
├── services/
│   ├── api.ts                 # interface ApiService<T>
│   ├── localStorageAdapter.ts
│   ├── supabaseAdapter.ts
│   └── index.ts               # createAdapter() switch
├── components/
│   ├── ProtectedRoute.tsx
│   ├── ErrorFallback.tsx
│   ├── layout/ (AppLayout, Header, Sidebar)
│   ├── shared/
│   └── ui/ (Button, Input, Card, Table, ...)
├── pages/
│   └── (Dashboard, Equipment, EquipmentDetail, Inventory, Maintenance, Alerts, Map, Settings, Login)
├── lib/
│   ├── supabase.ts            # cliente + tipos
│   └── utils.ts               # cn, formatCurrency, getStatusColor, ...
├── data/seed.ts               # datos de demo
└── __tests__/                 # vitest + RTL
```

---

## 4. Decisiones recomendadas

### Para deploy SaaS real
1. Aprovisionar Supabase, crear tablas (`equipment`, `inventory`, `maintenance_orders`, `alerts`, `activity_logs`) y RLS por organizacion.
2. `VITE_USE_SUPABASE=true` en produccion.
3. Migrar `seed.ts` a `supabase/seed.sql`.
4. Anadir Playwright para flujos criticos (login, crear equipo, ajustar stock).
5. CI: GitHub Actions corriendo `npm run lint && npm run test:run && npm run build`.

### Para el MVP demo
El proyecto esta listo. Funciona offline con `localStorage`, autentica en modo mock, persiste cambios y es instalable como PWA.

---

**Fin del informe.**
