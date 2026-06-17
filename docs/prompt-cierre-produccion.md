# Prompt Maestro Para Terminar Produccion ToolTrack

Usa este prompt para continuar el trabajo hasta cerrar los bloqueos reales de
produccion detectados el 2026-06-17.

## Prompt

Actua como un equipo senior multiagente de cierre productivo para ToolTrack.
Tu objetivo no es proponer ideas nuevas: es terminar lo necesario para que la app
pueda operar en produccion con Supabase, usuarios reales, permisos, trazabilidad,
despachos, documentos y respaldo GitHub.

Contexto obligatorio:

- Repo: `rauldiazespejo-ctrl/ToolTrack`.
- App local: React + Vite + TypeScript.
- Datos reales: `INVENTARIO GENERAL ACTUALIZADO.xlsx`.
- Inventario generado: 13.299 items reales.
- Movimientos seed: 282.402 movimientos reales.
- Schema base: `supabase/schema.sql`.
- Reporte de auditoria: `docs/revision-100-ejecucion-17-06.md`.
- Plan 100%: `docs/plan-revision-100-produccion.md`.
- Plan implementacion: `docs/implementar-17-06.md`.

Restricciones no negociables:

- No inventar datos.
- No usar datos demo.
- No inventar certificaciones, calibraciones, mantenciones, fechas, dueños,
  responsables, GPS o coordenadas.
- No exponer claves `sb_secret_`, `service_role` ni passwords en frontend,
  README, docs, commits o logs.
- Respaldar cada avance con commit local y push a GitHub.
- Todo flujo critico debe dejar auditoria.
- Todo bloqueo debe documentarse con causa real.

## Bloqueos A Cerrar

Trabaja en este orden. No saltes un bloqueo sin dejar evidencia.

### 1. Supabase Real

Objetivo: sacar la app de modo local para datos operacionales.

Tareas:

1. Configurar `VITE_SUPABASE_URL` real.
2. Configurar `VITE_SUPABASE_ANON_KEY` real.
3. Ejecutar:

```bash
npm run check:prod
```

4. Ejecutar `supabase/schema.sql` en Supabase.
5. Generar seed:

```bash
npm run supabase:seed
```

6. Ejecutar/importar `supabase/seed.generated.sql` en Supabase.
7. Validar tablas:
   - `inventory_items`
   - `inventory_movements`
   - `qr_scan_events`
   - `asset_requests`
   - `quote_requests`
   - `asset_documents`
   - `maintenance_events`
   - `dispatches`
   - `dispatch_items`
   - `notifications`
   - `audit_log`

Criterio de cierre:

- La app escribe eventos QR y solicitudes en Supabase autenticado.
- El fallback local queda solo para desarrollo.

### 2. Usuarios, Roles Y Permisos

Objetivo: RBAC real.

Crear usuarios piloto:

- Administrador.
- Jefe de bodega.
- Solicitante autorizado.
- Supervisor de contrato.
- Mantenimiento/calidad.
- Auditor.

Tareas:

1. Poblar `profiles`.
2. Asociar usuario a rol.
3. Definir contrato/bodega/CECO cuando aplique.
4. Ajustar RLS por rol.
5. Ajustar UI para ocultar acciones no permitidas.
6. Probar que backend bloquea aunque el frontend falle.

Criterio de cierre:

- Solicitante no puede despachar.
- Bodega puede preparar despacho.
- Supervisor puede aprobar.
- Mantenimiento puede cargar documentos.
- Auditor no puede modificar.

### 3. Flujo Completo De Solicitudes

Objetivo: solicitud de punta a punta.

Estados:

- `pending_approval`
- `approved`
- `warehouse_queue`
- `ready_to_dispatch`
- `dispatched`
- `closed`
- `quote_required`
- `rejected`

Tareas:

1. Crear acciones de aprobacion/rechazo.
2. Crear transicion a cola bodega.
3. Crear transicion a listo para despacho.
4. Guardar cada cambio en `audit_log`.
5. Crear notificacion interna por cada estado critico.
6. Validar cantidad contra stock real.

Criterio de cierre:

- Una solicitud real puede avanzar sin editar base de datos manualmente.
- Cada cambio queda auditado.

### 4. Despacho, Recepcion Y Devolucion QR

Objetivo: trazabilidad fisica del activo.

Tareas:

1. Crear pantalla `Preparar despacho`.
2. Crear `dispatches`.
3. Crear `dispatch_items`.
4. Escanear QR antes de salida.
5. Validar item correcto contra solicitud.
6. Registrar salida.
7. Confirmar recepcion.
8. Registrar devolucion.
9. Registrar condicion de devolucion:
   - Correcta.
   - Dañada.
   - Incompleta.
   - Requiere mantencion.
10. Mostrar todo en timeline del activo.

Criterio de cierre:

- Cada despacho queda enlazado a solicitud, activo, usuario, fecha y QR.

### 5. Documentos, Certificaciones, Calibraciones Y Mantenciones

Objetivo: control documental real sin inventar fechas.

Tareas:

1. Definir matriz real de activos que requieren documento.
2. Crear alta de documento por activo.
3. Campos obligatorios:
   - Tipo.
   - Numero.
   - Proveedor.
   - Fecha emision.
   - Fecha vencimiento.
   - Archivo/URL.
4. Generar alertas:
   - Vence en 30 dias.
   - Vence en 15 dias.
   - Vence en 7 dias.
   - Vencido.
5. Bloquear despacho si documento requerido esta vencido o ausente.
6. Permitir excepcion solo con rol autorizado y auditoria.

Criterio de cierre:

- Cumplimiento muestra fechas reales.
- Despacho bloquea documentos vencidos.

### 6. Alta De Existencias Y Ajustes De Bodega

Objetivo: bodega puede crear/ajustar inventario sin Excel manual.

Tareas:

1. Crear pantalla `Nueva existencia`.
2. Validar codigo unico.
3. Capturar descripcion, grupo, bodega, CECO, saldo, valor unitario, contrato.
4. Motivo obligatorio.
5. Registrar en `audit_log`.
6. Crear ajuste con motivo obligatorio.

Criterio de cierre:

- No se puede crear o ajustar stock sin motivo y usuario.

### 7. Cotizaciones Y Compras

Objetivo: cuando no hay stock, la app genera accion concreta.

Tareas:

1. Crear pantalla `Cotizaciones`.
2. Crear `quote_requests` desde solicitudes sin stock.
3. Asignar responsable de compra.
4. Implementar estados:
   - `pending_quote`
   - `quoted`
   - `purchase_approved`
   - `purchased`
   - `received`
   - `cancelled`
5. Si se recibe compra, permitir alta de existencia enlazada.

Criterio de cierre:

- Ninguna solicitud sin stock queda sin siguiente accion.

### 8. Notificaciones

Objetivo: avisar al responsable correcto.

Tareas:

1. Crear panel interno de notificaciones.
2. Notificar solicitud pendiente a supervisor.
3. Notificar solicitud aprobada a bodega.
4. Notificar cotizacion requerida a compras/responsable.
5. Notificar documento vencido a mantenimiento.
6. Notificar devolucion atrasada a bodega/supervisor.
7. Dejar email/Teams/WhatsApp documentado o implementado.

Criterio de cierre:

- Cada evento critico crea registro en `notifications`.

### 9. CI, Deploy Y Rollback

Objetivo: deploy reproducible.

Tareas:

1. Elegir hosting.
2. Configurar variables de entorno.
3. Configurar dominio.
4. Copiar:

```bash
docs/github-actions-ci.yml
```

a:

```bash
.github/workflows/ci.yml
```

5. Usar token GitHub con scope `workflow`.
6. Crear tag de release.
7. Documentar rollback.

Criterio de cierre:

- Push a `main` dispara CI.
- Hay URL productiva.
- Hay rollback.

## Verificaciones Obligatorias

Ejecutar siempre:

```bash
npm run lint
npm run test
npm run build
git grep -n "sb_secret_\\|service_role" || true
git status -sb
```

Smoke browser:

- `/`
- `/tools`
- `/tools/acb-1000053-1`
- `/requests`
- `/warehouse`
- `/compliance`
- `/events`
- `/login`

Flujos obligatorios:

1. Login con usuario real.
2. Crear solicitud con item disponible.
3. Crear solicitud con item cerrado/sin stock y derivar a cotizacion.
4. Aprobar solicitud.
5. Preparar despacho.
6. Escanear QR.
7. Confirmar recepcion.
8. Registrar devolucion.
9. Cargar documento real.
10. Bloquear despacho por documento vencido.

## Resultado Esperado

Al finalizar, crear un reporte:

```bash
docs/cierre-produccion-ejecucion.md
```

Debe incluir:

- Gates cerrados.
- Evidencia.
- Comandos ejecutados.
- Usuarios probados.
- Capturas o descripciones de rutas.
- Bloqueos restantes, si existen.
- Commit local.
- Push GitHub.
- Decision final: produccion, piloto controlado o bloqueado.

## Estilo De UI Esperado

Plataforma web desktop-first y mobile-compatible para operaciones industriales.

Diseno:

- Tema claro, sobrio y profesional.
- Fondo gris operativo `#f4f6f8`.
- Superficies blancas `#ffffff`.
- Acento rojo industrial `#d71920`.
- Texto principal grafito `#111827`.
- Texto secundario gris `#64748b`.
- Estados:
  - Disponible: verde.
  - Revision/cotizacion: amarillo.
  - Bloqueado/vencido: rojo.
  - Cerrado/historico: gris.
- Tablas densas.
- Paneles de bodega tipo command center.
- Timeline de activo.
- Formularios sobrios con labels claros.
- Nada de hero marketing.
- Nada de datos de fantasia.

## Ultima Regla

No marques nada como cerrado por intuicion. Cierra solo con evidencia.

