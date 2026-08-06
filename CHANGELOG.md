# Changelog — SOLDESP ToolTrack

## 2026-06-30 — Hardening pass

### Fixed
- **Lint**: resueltos 13 errores `no-unsafe-*` en `src/__tests__/**` mediante override en `eslint.config.js`.
- **Tests**: instalado peer dep `@testing-library/dom`; las 3 suites pasan (6/6 tests).
- **Hooks**: eliminado el bypass de `localStorage` en `useEquipment`, `useInventory`, `useMaintenance`, `useAlerts` y `useActivityLog` (ahora dependen unicamente del adapter).
- **`adjustStock`**: el parametro `reason` ya no se descarta; se loguea con contexto.
- **`SupabaseAdapter`**: `created_at`, `updated_at` e `id` se eliminan antes de `insert`/`update` para no chocar con defaults/triggers del DB.
- **Tests**: `setupTests.ts` limpia `localStorage` antes de cada test.

### Removed
- `src/hooks/useLocalStorage.ts` (codigo muerto, sin consumidores).
- `TODO.md` (reemplazado por este changelog).

### Security
- `.gitignore`: excluido `.env` y variantes, manteniendo `.env.example`.

### Added
- `src/main.tsx`: `BrowserRouter` ahora recibe `basename={import.meta.env.BASE_URL}` para soportar correctamente el deploy bajo `/ToolTrack/` (GitHub Pages) sin romper Vercel (`base='/'`).

### Docs
- Reescrita `AUDITORIA_TECNICA.md` reflejando el estado real al 2026-06-30 (score 82/100).
- Nuevo `CHANGELOG.md` (este archivo).

### Known issues
- **Pantalla en blanco en `vite preview` local** (reproducible tanto antes como despues de este pass de hardening): el bundle se sirve correctamente pero React no monta el arbol. La consola solo muestra el `warning` esperado de Supabase. Lint, TSC, tests y build pasan. Sospechoso: interaccion entre el service worker de PWA y el cache local. **Mitigacion temporal**: ejecutar `npm run dev` (HMR) o desregistrar el SW (`navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()))`) antes de cargar `vite preview`. Ver pendiente PWA-01 en `AUDITORIA_TECNICA.md`.

## 2025-06-15 — Auditoria inicial

- Estado: prototipo visual con datos en `localStorage`, sin auth ni adapter (score 52/100).
- Ver `AUDITORIA_TECNICA.md` previo (sustituido).
