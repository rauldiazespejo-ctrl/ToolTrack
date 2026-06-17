# Evaluación Técnica — SOLDESP ToolTrack

**Fecha de auditoría:** `2025-06-15`  
**Revisor:** Experto Senior Full-Stack  
**Repositorio:** `tooltrack-app`  
**Stack detectado:** React 19 + TypeScript 6.0 + Vite 8 + Tailwind CSS v4 + Chart.js 4 + React Router v7 + Leaflet + Supabase JS (configurado pero no utilizado)

---

## 1. Ejecutivo de Hallazgos

| Criticidad | Cantidad | Categorías |
|---|---|---|
| 🔴 Crítica | 5 | Backend faltante, auth mock, persistencia local, README vacío, sin .env |
| 🟠 Alta | 7 | Sin tests, hooks redundantes, sin error boundaries, data race en localStorage, sin validación de formularios completa, sin API abstraction layer, duplicación de seed data |
| 🟡 Media | 5 | Sin PWA/offline, sin loading states reales, sin i18n, sin rate-limiting, código de mapa sin verificar |
| 🟢 Baja | 4 | ESLint warnings sin resolver, imports no usados, hardcoded strings, sin husky/pre-commit |

**Score general:** `52/100` — Proyecto funcional como MVP visual, pero no es producción-ready. Es un frontend con datos mock en `localStorage` sin backend real.

---

## 2. Hallazgos Detallados por Categoría

### 2.1 Arquitectura & Backend (🔴 Crítico)

| # | Hallazgo | Archivo(s) | Impacto |
|---|----------|-----------|---------|
| BE-01 | **Supabase está importado pero NUNCA se usa para persistencia real** | `src/lib/supabase.ts` | Todo el CRUD es localStorage = pérdida de datos en incógnito, borrado de caché, o múltiples pestañas |
| BE-02 | **Todos los hooks (`useEquipment`, `useInventory`, `useMaintenance`, `useAlerts`, `useActivityLog`) duplican exactamente el mismo patrón de localStorage** | `src/hooks/*` | Código duplicado, difícil de mantener, sin sincronización entre tabs |
| BE-03 | **No existe abstraction layer de API** — los hooks llaman directamente a `localStorage.setItem()` | `src/hooks/*` | Imposible migrar a Supabase sin reescribir todo |
| BE-04 | **No existe .env.example ni documentación de variables** | — | Otro dev no sabría cómo configurar Supabase |
| BE-05 | **No hay un `db/` o `services/` layer** | — | Arquitectura de frontend solo, sin separación de concerns |

### 2.2 Seguridad & Autenticación (🔴 Crítico)

| # | Hallazgo | Archivo(s) | Impacto |
|---|----------|-----------|---------|
| AUTH-01 | **Login es un mock puro** — cualquier email/password navega a `/` | `src/pages/LoginPage.tsx` | Cero seguridad, cualquier URL expuesta es accesible directamente |
| AUTH-02 | **No hay route guards** — cualquier ruta es accesible sin autenticar | `src/App.tsx` | Protección de rutas inexistente |
| AUTH-03 | **Supabase Auth está completamente ignorado** | `src/lib/supabase.ts` | Se podría usar auth con roles en minutos pero no está implementado |
| AUTH-04 | **Hardcoded avatar "RD" y nombre "Raul Diaz"** | `src/components/layout/Sidebar.tsx`, `Header.tsx` | Sin sistema de usuarios real |

### 2.3 Calidad de Código (🟠 Alta)

| # | Hallazgo | Archivo(s) | Impacto |
|---|----------|-----------|---------|
| CODE-01 | **ESLint reporta 4 errores de `no-unused-vars`** en `EquipmentPage.tsx` | `src/pages/EquipmentPage.tsx` | Build falla si lint es estricto en CI/CD |
| CODE-02 | **Todos los hooks reimplementan `useLocalStorage` manualmente** | `src/hooks/*` | Violación de DRY, debería existir un `useLocalStorage` genérico |
| CODE-03 | **No hay tests unitarios, ni de integración, ni E2E** | — | Sin cobertura = regresiones no detectables |
| CODE-04 | **No hay Error Boundaries** | `src/main.tsx` | Un error en cualquier componente crashea toda la app |
| CODE-05 | **No hay custom hooks de fetching** (como `useAsync`) | — | Estados de loading/error duplicados en cada hook |
| CODE-06 | **`adjustStock` en `useInventory` tiene un parámetro `reason` que se descarta con `void reason`** | `src/hooks/useInventory.ts` | Parámetro sin usar, probablemente de diseño incompleto |
| CODE-07 | **`getStatusColor` y `getSeverityColor` devuelven clases de Tailwind como strings** — si Tailwind purga clases no usadas, estas pueden desaparecer | `src/lib/utils.ts` | Riesgo de CSS purgado en producción |

### 2.4 UX/UI & Frontend (🟡 Media)

| # | Hallazgo | Archivo(s) | Impacto |
|---|----------|-----------|---------|
| UI-01 | **Loading states en hooks son `setLoading(true)` → `setLoading(false)` en el mismo tick** | `src/hooks/useEquipment.ts` | El usuario nunca ve el loading, es sincrónico |
| UI-02 | **Search en Header es un input visual sin funcionalidad** | `src/components/layout/Header.tsx` | No filtra ni busca nada |
| UI-03 | **Badge de notificaciones tiene "3" hardcoded** | `src/components/layout/Header.tsx` | No refleja `unreadCount` real |
| UI-04 | **No hay manejo de errores en formularios** (solo name y serial_number) | `src/pages/*` | Campos como costo pueden ser negativos, fechas futuras, etc. |
| UI-05 | **No hay feedback toast/notification tras CRUD** | — | Usuario no sabe si la operación funcionó |

### 2.5 DevOps & Tooling (🟡 Media / 🟢 Baja)

| # | Hallazgo | Impacto |
|---|----------|---------|
| DEV-01 | **README.md es el template por defecto de Vite** — cero info del proyecto | Otros devs no saben qué es ni cómo ejecutarlo |
| DEV-02 | **Sin GitHub Actions / CI/CD** | No hay lint, build ni deploy automático |
| DEV-03 | **Sin `.nvmrc` o especificación de versión de Node** | Inconsistencias entre devs |
| DEV-04 | **Sin `vite-plugin-pwa` o manifiesto** | No es instalable como app |
| DEV-05 | **Sin pre-commit hooks (husky + lint-staged)** | Código roto puede entrar al repo |

---

## 3. Prompt Autogenerado para Corrección Inmediata

> **Instrucción:** Este prompt está diseñado para ser entregado a un agente de desarrollo o equipo junior. Divide las correcciones en 4 milestones ejecutables.

```markdown
# 🛠️ Prompt de Corrección — SOLDESP ToolTrack

## Contexto
Este es un ERP de gestión de activos industriales para una empresa de soldadura.  
Stack: React 19 + TypeScript + Vite + Tailwind CSS v4 + Chart.js + Leaflet + Supabase (conectado pero sin usar).

## Milestone 1: Infraestructura & Tooling (Prioridad: 🔴 Crítica)

### Tareas:
1. [ ] Reemplazar README.md con documentación real del proyecto (instalación, variables de env, stack, estructura de carpetas).
2. [ ] Crear `.env.example` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
3. [ ] Agregar `.nvmrc` con `v22`.
4. [ ] Configurar husky + lint-staged para pre-commit (lint + type-check).
5. [ ] Crear GitHub Action: `lint.yml` que ejecute `npm run lint` en cada PR.
6. [ ] Corregir los 4 errores de ESLint en `EquipmentPage.tsx` (remover imports no usados: `Wrench`, `formatCurrency`, `formatDate`, `getStatusColor`).

### Criterio de aceptación:
- `npm run lint` pasa 0 errores.
- README explica cómo levantar el proyecto en 3 pasos.
- Cada push a main ejecuta lint en CI.

## Milestone 2: Abstraction Layer de Datos (Prioridad: 🔴 Crítica)

### Tareas:
1. [ ] Crear `src/services/api.ts` con una interfaz genérica:
   ```typescript
   interface ApiService<T> {
     getAll(): Promise<T[]>;
     getById(id: string): Promise<T | null>;
     create(data: Omit<T, 'id'>): Promise<T>;
     update(id: string, data: Partial<T>): Promise<T>;
     remove(id: string): Promise<void>;
   }
   ```
2. [ ] Crear `src/services/localStorageAdapter.ts` que implemente `ApiService` usando `localStorage` (encapsular lógica duplicada actual).
3. [ ] Crear `src/services/supabaseAdapter.ts` que implemente `ApiService` usando Supabase real.
4. [ ] Crear un flag `VITE_USE_SUPABASE=true|false` para switchear entre adapters sin cambiar código de hooks.
5. [ ] Refactorizar TODOS los hooks (`useEquipment`, `useInventory`, `useMaintenance`, `useAlerts`, `useActivityLog`) para que usen el adapter inyectado, eliminando DUPLICACIÓN de código de localStorage.
6. [ ] Crear un hook genérico `useLocalStorage<T>(key: string, seed: T[])` para eliminar lógica repetida en cada domain hook.

### Criterio de aceptación:
- Los hooks tienen < 30 líneas cada uno.
- Cambiar `VITE_USE_SUPABASE=true` hace que los datos persistan en Supabase sin tocar hooks ni páginas.
- Los seed data se cargan solo en el adapter de localStorage, no en cada hook.

## Milestone 3: Autenticación & Seguridad (Prioridad: 🔴 Crítica)

### Tareas:
1. [ ] Implementar autenticación real con Supabase Auth en `LoginPage.tsx`.
2. [ ] Crear `src/hooks/useAuth.ts` que exponga `{ user, signIn, signOut, isLoading }`.
3. [ ] Crear componente `ProtectedRoute` que redirija a `/login` si no hay sesión.
4. [ ] Proteger todas las rutas excepto `/login` con `ProtectedRoute`.
5. [ ] Mostrar nombre/email real del usuario logueado en `Sidebar` y `Header` (no hardcoded "RD").
6. [ ] Agregar botón de logout funcional.
7. [ ] Implementar RLS (Row Level Security) básico en Supabase para que usuarios solo vean sus organizaciones.

### Criterio de aceptación:
- No se puede acceder a `/equipment` sin estar logueado (redirige a login).
- El login valida credenciales contra Supabase Auth.
- El logout limpia la sesión y redirige.
- RLS está activo en tablas críticas.

## Milestone 4: Testing, UX Polish & Producción (Prioridad: 🟠 Alta)

### Tareas:
1. [ ] Instalar Vitest + React Testing Library + jsdom.
2. [ ] Escribir tests para `useAuth` (mock de Supabase Auth).
3. [ ] Escribir tests para `cn()` y `formatCurrency` en `utils.ts`.
4. [ ] Escribir al menos 1 test de render para `LoginPage` y `DashboardPage`.
5. [ ] Instalar `react-hot-toast` o `sonner` y mostrar toasts en todas las operaciones CRUD.
6. [ ] Conectar el input de búsqueda del `Header` al contexto global de búsqueda (o usar `useDebounce` + filtrado).
7. [ ] Hacer que el badge de notificaciones en `Header` refleje `unreadCount` real del hook `useAlerts`.
8. [ ] Agregar validación completa en formularios: costo >= 0, fecha de compra no futura, serial único.
9. [ ] Agregar Error Boundary con `react-error-boundary` para capturar crashes graceful.
10. [ ] Agregar `vite-plugin-pwa` con manifest para hacerla instalable.
11. [ ] Agregar un hook `useDebounce` para el search y evitar renders excesivos.

### Criterio de aceptación:
- `npm test` ejecuta al menos 5 tests pasando.
- Cada CRUD muestra toast de éxito/error.
- Search global funciona con debounce.
- Badge de notificaciones es dinámico.
- App es instalable como PWA en móvil.

## Reglas de estilo durante corrección:
- Mantener dark theme con CSS variables actuales.
- No romper funcionalidad existente; todo debe seguir funcionando en localStorage hasta activar Supabase.
- Usar TypeScript estricto; no usar `any`.
- Preferir `const` callbacks con `useCallback` para funciones pasadas a hijos.
- Mantener el patrón de componentes UI en `src/components/ui/`.

## Definición de "Done"
- [ ] Milestone 1: ✅ 0 errores lint + CI + docs
- [ ] Milestone 2: ✅ Adapter pattern + Supabase conectado
- [ ] Milestone 3: ✅ Auth real + route guards + RLS
- [ ] Milestone 4: ✅ Tests + toasts + search + PWA + error boundaries
```

---

## 4. Decisiones Arquitectónicas Recomendadas

### Opción A: MVP Rápido (1-2 semanas, 1 dev)
- Milestone 1 + 2 (localStorage adapter limpio + tests básicos + docs).
- Dejar auth mock pero con route guards simples (localStorage flag `isLoggedIn`).
- Deploy a Vercel/Netlify como static site.

### Opción B: Producción SaaS (3-4 semanas, 2 devs)
- Todos los milestones completos.
- Supabase real con RLS, auth, y triggers para alertas automáticas.
- CI/CD con GitHub Actions → Vercel preview + producción.
- Tests de integración con Playwright para flujos críticos.

### Recomendación para el dueño de este repo:
> **Vas por la Opción A primero** — limpia el código, documenta, y haz que el MVP sea presentable. Luego, cuando tengas usuarios validando, invierte en la Opción B. El código actual es un excelente prototipo visual, pero no puede salir a producción sin al menos Milestone 1 y 2.

---

## 5. Resumen de Calidad por Archivo

| Archivo | Líneas | Problemas | Score |
|---------|--------|-----------|-------|
| `src/hooks/useEquipment.ts` | 77 | Backend localStorage, código duplicado, loading falso | 4/10 |
| `src/hooks/useInventory.ts` | 76 | Mismo patrón, `void reason` descartado | 4/10 |
| `src/hooks/useMaintenance.ts` | 66 | Mismo patrón | 4/10 |
| `src/hooks/useAlerts.ts` | 62 | Mismo patrón | 4/10 |
| `src/hooks/useActivityLog.ts` | 41 | Mismo patrón, más simple | 5/10 |
| `src/pages/LoginPage.tsx` | 54 | Auth mock, sin validación | 3/10 |
| `src/pages/DashboardPage.tsx` | 236 | Charts bien, sin error boundary | 6/10 |
| `src/pages/EquipmentPage.tsx` | 375 | ESLint errors, form básico | 5/10 |
| `src/components/layout/Sidebar.tsx` | 102 | Hardcoded user, mobile OK | 6/10 |
| `src/components/layout/Header.tsx` | 52 | Search falso, badge hardcoded | 5/10 |
| `src/lib/supabase.ts` | 76 | Configurado pero desconectado | 3/10 |
| `src/lib/utils.ts` | 48 | Bien estructurado, riesgo purge | 7/10 |
| `src/data/seed.ts` | 539 | Datos ricos, pero deberían ser migración | 6/10 |
| `index.html` | 16 | OK, buena estructura | 8/10 |
| `package.json` | 43 | Stack moderno, sin scripts de test | 6/10 |
| `README.md` | 73 | Template Vite, no documenta nada | 1/10 |
| `eslint.config.js` | — | No inspeccionado, pero lint falla | 5/10 |

---

**Fin del reporte.** Este documento debe guardarse como referencia técnica del proyecto.
