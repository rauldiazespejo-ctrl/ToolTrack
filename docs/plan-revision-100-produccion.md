# Plan De Revision 100% Produccion - ToolTrack

Fecha: 2026-06-17  
Objetivo: no dejar ningun punto pendiente antes de declarar ToolTrack listo para
produccion.

Este documento convierte `docs/implementar-17-06.md`,
`docs/production-checklist.md` y `docs/next-gen-product-prompt.md` en una
auditoria ejecutable por enjambre. Ningun punto se considera cerrado sin
evidencia.

## Regla De Cierre

Un punto solo pasa a `Cerrado` cuando cumple las 5 condiciones:

1. Existe implementacion o decision documentada.
2. Existe evidencia tecnica: comando, captura, SQL, registro o ruta verificada.
3. No introduce datos ficticios.
4. No expone secretos.
5. Esta respaldado en Git local y GitHub.

Estados permitidos:

- `Pendiente`: no iniciado.
- `En revision`: agente asignado y evidencia en curso.
- `Bloqueado`: falta dato externo, credencial, usuario, decision o permiso.
- `Cerrado`: cumple la regla de cierre.

## Enjambre Activo

Swarm: `swarm-1781697663034-43xwgr`  
Topologia: `hierarchical-mesh`  
Estrategia: `specialized`  
Cobertura esperada: 100% de puntos criticos, altos, medios y operativos.

### Agentes

| Agente | ID | Frente | Responsabilidad |
| --- | --- | --- | --- |
| Release Orchestrator | `agent-1781697683868-yxk8m9` | Coordinacion | Matriz 100%, gates y decision final de salida |
| Product Ops Auditor | `agent-1781697683892-44ar6d` | Operacion | Solicitudes, aprobaciones, bodega, despacho, devolucion, cotizacion |
| Supabase RLS Auditor | `agent-1781697683901-nqgfn6` | Backend | Schema, RLS, seed, Auth, politicas y migraciones |
| Security Agent | `agent-1781697683908-q7dqs3` | Seguridad | Secretos, permisos, audit log, boundaries frontend/backend |
| Frontend UX Auditor | `agent-1781697683918-w6t623` | UI/UX | Rutas, responsive, accesibilidad, densidad operacional |
| QA Automation Agent | `agent-1781697683925-31lr2j` | QA | Tests, browser flows, regresion, CI |
| Data Integrity Agent | `agent-1781697683934-okb53f` | Datos | Excel real, JSON, seed, conteos, no-fake-data |
| DevOps Release Agent | `agent-1781697683943-y5rfmw` | Deploy | GitHub, CI, hosting, rollback, monitoreo |

## Gate 0 - Integridad Del Repositorio

Responsable: Release Orchestrator + DevOps Release Agent.

### Checklist

- [ ] `git status -sb` sin cambios no respaldados.
- [ ] Ultimo commit local coincide con `origin/main`.
- [ ] No hay archivos operativos grandes versionados por error.
- [ ] `supabase/seed.generated.sql` esta ignorado.
- [ ] Capturas temporales `tooltrack-*.png` estan ignoradas.
- [ ] Existe documento de plan vigente.

### Evidencia Requerida

```bash
git status -sb
git rev-parse --short HEAD
git ls-remote --heads origin main
git status -sb --ignored
```

### Criterio De Bloqueo

- Hay cambios sin commit.
- Hay secretos detectados.
- El remoto no coincide con el commit local.

## Gate 1 - Seguridad Y Secretos

Responsable: Security Agent.

### Checklist

- [ ] No existe `sb_secret_` real en archivos versionados.
- [ ] No existe `service_role` real en variables frontend.
- [ ] `.env.local` no se versiona.
- [ ] `.env.example` solo contiene nombres de variables.
- [ ] `scripts/check-production-env.mjs` rechaza secret keys.
- [ ] `src/lib/supabaseConfig.ts` bloquea claves inseguras en navegador.
- [ ] No se registra token, password, anon key real ni service key en README/docs.

### Evidencia Requerida

```bash
git grep -n "sb_secret_\\|service_role\\|VITE_SUPABASE_ANON_KEY=.*ey" || true
npm run check:prod
VITE_SUPABASE_URL=https://example.supabase.co \
VITE_SUPABASE_ANON_KEY=sb_secret_wrong \
npm run check:prod
```

### Criterio De Bloqueo

- Cualquier secreto real queda en Git.
- `check:prod` acepta una clave `sb_secret_`.

## Gate 2 - Datos Reales E Importacion

Responsable: Data Integrity Agent.

### Checklist

- [ ] Excel fuente identificado: `INVENTARIO GENERAL ACTUALIZADO.xlsx`.
- [ ] Hoja inventario: `INVENTARIO VALORIZADO`.
- [ ] Hoja movimientos: `LMA`.
- [ ] `src/data/inventory.generated.json` deriva del Excel real.
- [ ] `src/data/movements.generated.json` deriva del Excel real.
- [ ] Seed Supabase genera 13.299 items.
- [ ] Seed Supabase genera 282.402 movimientos.
- [ ] No hay ubicaciones, responsables, fechas de mantencion o coordenadas inventadas.
- [ ] Valores monetarios y saldos se preservan desde fuente.
- [ ] Documentos de cumplimiento se muestran como candidatos cuando faltan fechas reales.

### Evidencia Requerida

```bash
npm run supabase:seed
ls -lh supabase/seed.generated.sql
head -20 supabase/seed.generated.sql
node -e "const i=require('./src/data/inventory.generated.json'); console.log(i.length)"
```

### Criterio De Bloqueo

- Conteos no coinciden.
- Hay datos simulados en UI/producto.
- El seed no se puede regenerar.

## Gate 3 - Supabase, Auth Y RLS

Responsable: Supabase RLS Auditor.

### Checklist

- [ ] `supabase/schema.sql` corre completo en Supabase.
- [ ] Todas las tablas productivas tienen RLS habilitado.
- [ ] `inventory_items`, `inventory_movements`, `qr_scan_events`, `asset_requests`,
  `quote_requests`, `asset_documents`, `maintenance_events`, `dispatches`,
  `notifications`, `audit_log` tienen politicas revisadas.
- [ ] `profiles` modela roles reales.
- [ ] Politicas distinguen lectura, insercion y actualizacion por rol.
- [ ] `requested_by` y `scanned_by` se asocian a `auth.uid()`.
- [ ] Se define quien puede aprobar, despachar, cargar documentos y auditar.
- [ ] Existe estrategia de migracion incremental para cambios futuros.

### Evidencia Requerida

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;

select *
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

### Criterio De Bloqueo

- Cualquier tabla operacional queda sin RLS.
- Un usuario sin rol puede modificar datos criticos.
- No existe usuario autenticado de prueba por rol.

## Gate 4 - Usuarios, Roles Y Permisos

Responsable: Security Agent + Product Ops Auditor.

### Checklist

- [ ] Crear usuario administrador.
- [ ] Crear jefe de bodega.
- [ ] Crear solicitante autorizado.
- [ ] Crear supervisor de contrato.
- [ ] Crear mantenimiento/calidad.
- [ ] Crear auditor.
- [ ] Poblar `profiles`.
- [ ] Mapear usuario a contrato, bodega o CECO.
- [ ] UI oculta acciones no permitidas.
- [ ] Backend bloquea acciones no permitidas aunque el frontend falle.

### Evidencia Requerida

- Captura o registro de cada usuario creado.
- Matriz rol/accion aprobada.
- Prueba manual por rol.

### Matriz Minima

| Accion | Admin | Bodega | Solicitante | Supervisor | Mantenimiento | Auditor |
| --- | --- | --- | --- | --- | --- | --- |
| Solicitar activo | Si | Si | Si | Si | Si | No |
| Aprobar solicitud | Si | No | No | Si | No | No |
| Preparar despacho | Si | Si | No | No | No | No |
| Registrar devolucion | Si | Si | No | No | No | No |
| Cargar documento | Si | No | No | No | Si | No |
| Ver auditoria | Si | No | No | Si | Si | Si |
| Crear existencia | Si | Si | No | No | No | No |

### Criterio De Bloqueo

- Un solicitante puede despachar.
- Un usuario anonimo puede escribir.
- Auditor puede modificar datos.

## Gate 5 - Flujo De Solicitudes

Responsable: Product Ops Auditor + QA Automation Agent.

### Checklist

- [ ] Buscar activo real por codigo.
- [ ] Buscar por descripcion.
- [ ] Buscar por bodega.
- [ ] Buscar por CECO.
- [ ] Crear solicitud con stock disponible.
- [ ] Crear solicitud con item `CERRADO` y derivar a cotizacion/revision.
- [ ] Crear solicitud sin stock y derivar a cotizacion.
- [ ] Registrar solicitante, contrato, prioridad, cantidad, fecha requerida y motivo.
- [ ] Guardar solicitud en Supabase autenticado.
- [ ] Fallback local solo para desarrollo.
- [ ] Listar ultimas solicitudes.
- [ ] Crear cambio de estado con auditoria.

### Evidencia Requerida

Rutas:

- `/requests`
- `/warehouse`
- `/tools/:id`

Comandos:

```bash
npm run test
```

Pruebas manuales:

- Solicitud `ACB-1000053` debe quedar como revision/cotizacion si su estado no es
  operacionalmente disponible.
- Solicitud de item `ACTIVA` con saldo suficiente debe quedar pendiente aprobacion.

### Criterio De Bloqueo

- Solicitud se crea sin item real.
- Solicitud no queda persistida.
- No hay trazabilidad de estado.

## Gate 6 - Bodega, Despacho, Recepcion Y Devolucion

Responsable: Product Ops Auditor + Frontend UX Auditor.

### Checklist

- [ ] Cola bodega muestra solicitudes pendientes.
- [ ] Cola cotizacion muestra solicitudes no disponibles.
- [ ] Preparar despacho desde solicitud aprobada.
- [ ] Escanear QR antes de salida.
- [ ] Validar documento requerido antes de salida.
- [ ] Registrar despacho.
- [ ] Confirmar recepcion.
- [ ] Registrar devolucion.
- [ ] Registrar condicion de devolucion.
- [ ] Actualizar timeline del activo.

### Evidencia Requerida

Rutas:

- `/warehouse`
- `/scan/:toolId`
- `/tools/:toolId`

Tablas:

- `dispatches`
- `dispatch_items`
- `qr_scan_events`
- `audit_log`

### Criterio De Bloqueo

- Se puede despachar sin solicitud aprobada.
- No queda evento QR.
- No queda auditoria.

## Gate 7 - Certificaciones, Calibraciones Y Mantenciones

Responsable: Product Ops Auditor + Supabase RLS Auditor.

### Checklist

- [ ] Definir matriz real de activos que requieren documento.
- [ ] Cargar documento por activo.
- [ ] Cargar fecha emision.
- [ ] Cargar fecha vencimiento.
- [ ] Cargar proveedor.
- [ ] Cargar archivo o URL.
- [ ] Alertar 30/15/7 dias antes.
- [ ] Alertar vencido.
- [ ] Bloquear despacho por documento vencido.
- [ ] Permitir excepcion solo con permiso y auditoria.
- [ ] No inventar fechas.

### Evidencia Requerida

Rutas:

- `/compliance`
- `/tools/:toolId`

Tablas:

- `asset_documents`
- `maintenance_events`
- `dispatch_items`
- `audit_log`

### Criterio De Bloqueo

- La app muestra vencimientos no cargados por usuario/fuente real.
- Un activo que requiere documento vencido se despacha sin excepcion auditada.

## Gate 8 - Alta De Existencias Y Ajustes

Responsable: Product Ops Auditor + Data Integrity Agent.

### Checklist

- [ ] Pantalla alta nueva existencia.
- [ ] Codigo unico.
- [ ] Descripcion obligatoria.
- [ ] Grupo obligatorio.
- [ ] Bodega obligatoria.
- [ ] CECO/contrato cuando aplique.
- [ ] Saldo inicial.
- [ ] Valor unitario.
- [ ] Motivo obligatorio.
- [ ] Auditoria de alta.
- [ ] Ajuste de inventario con motivo.

### Evidencia Requerida

Tablas:

- `inventory_items`
- `inventory_imports`
- `audit_log`

### Criterio De Bloqueo

- Se puede crear existencia sin motivo.
- Se duplica codigo sin control.
- No queda auditoria.

## Gate 9 - Cotizaciones Y Compras

Responsable: Product Ops Auditor.

### Checklist

- [ ] Solicitud sin stock genera `quote_request`.
- [ ] Solicitud de item bloqueado genera `quote_request` o revision.
- [ ] Responsable de compra asignado.
- [ ] Estados de cotizacion implementados.
- [ ] Compra recibida puede alimentar alta de existencia.
- [ ] Notificacion al responsable.

### Evidencia Requerida

Rutas:

- `/requests`
- `/warehouse`

Tablas:

- `asset_requests`
- `quote_requests`
- `notifications`

### Criterio De Bloqueo

- Una solicitud sin stock queda sin accion.
- No existe responsable ni estado siguiente.

## Gate 10 - Notificaciones

Responsable: Product Ops Auditor + DevOps Release Agent.

### Checklist

- [ ] Panel interno muestra alertas.
- [ ] Solicitud pendiente notifica supervisor.
- [ ] Solicitud aprobada notifica bodega.
- [ ] Cotizacion requerida notifica compras.
- [ ] Documento por vencer notifica mantenimiento.
- [ ] Devolucion atrasada notifica bodega/supervisor.
- [ ] Diferencia de inventario notifica responsable.
- [ ] Email/Teams/WhatsApp decidido o documentado como futuro.

### Evidencia Requerida

Tabla:

- `notifications`

### Criterio De Bloqueo

- Evento critico no avisa a nadie.
- No hay registro de lectura/estado.

## Gate 11 - Frontend, UX Y Accesibilidad

Responsable: Frontend UX Auditor.

### Checklist

- [ ] Dashboard operativo sin copy de marketing.
- [ ] Inventario con filtros y busqueda.
- [ ] Solicitudes usable en desktop y mobile.
- [ ] Bodega usable por personal operativo.
- [ ] Cumplimiento no inventa fechas.
- [ ] Ficha de activo tiene QR, trazabilidad y documentos.
- [ ] Eventos QR legibles en mobile.
- [ ] Reportes mantienen valores reales.
- [ ] No hay textos solapados.
- [ ] Tablas grandes tienen scroll o layout mobile.
- [ ] Contraste y foco de teclado revisados.
- [ ] Iconos y botones tienen proposito claro.

### Rutas A Verificar

- `/`
- `/tools`
- `/tools/acb-1000053-1`
- `/requests`
- `/warehouse`
- `/compliance`
- `/qr`
- `/events`
- `/reports`
- `/login`

### Evidencia Requerida

- Capturas desktop.
- Capturas mobile.
- Consola sin errores.
- Checklist de responsive.

### Criterio De Bloqueo

- Texto se superpone.
- Flujo critico no funciona en mobile.
- Consola muestra errores runtime.

## Gate 12 - QA Automatizado Y Regresion

Responsable: QA Automation Agent.

### Checklist

- [ ] `npm run lint` pasa.
- [ ] `npm run test` pasa.
- [ ] `npm run build` pasa.
- [ ] Tests de configuracion Supabase.
- [ ] Tests de inventario.
- [ ] Tests de disponibilidad.
- [ ] Test App render.
- [ ] Browser smoke en rutas criticas.
- [ ] Crear solicitud desde navegador.
- [ ] Confirmar evento QR desde navegador.

### Evidencia Requerida

```bash
npm run lint
npm run test
npm run build
```

Browser:

- Crear solicitud.
- Ver cola bodega.
- Ver cumplimiento.
- Confirmar QR.

### Criterio De Bloqueo

- Cualquier test falla.
- Build falla.
- Ruta critica no carga.

## Gate 13 - Deploy, CI Y Rollback

Responsable: DevOps Release Agent.

### Checklist

- [ ] Hosting elegido.
- [ ] Variables configuradas.
- [ ] Dominio configurado.
- [ ] SPA fallback activo.
- [ ] CI activo en GitHub.
- [ ] Token GitHub con scope `workflow`.
- [ ] Rollback documentado.
- [ ] Release tag creado.
- [ ] Monitoreo minimo definido.
- [ ] Backup de base Supabase definido.

### Evidencia Requerida

Archivos:

- `vercel.json`
- `public/_redirects`
- `docs/github-actions-ci.yml`

Comandos:

```bash
npm run build
git tag
```

### Criterio De Bloqueo

- No hay deploy reproducible.
- No hay rollback.
- CI no corre en pull/push.

## Gate 14 - Documentacion Y Capacitacion

Responsable: Release Orchestrator + Product Ops Auditor.

### Checklist

- [ ] README actualizado.
- [ ] Checklist produccion actualizado.
- [ ] Plan implementacion actualizado.
- [ ] Plan revision 100% actualizado.
- [ ] Manual solicitante.
- [ ] Manual bodega.
- [ ] Manual supervisor.
- [ ] Manual mantenimiento.
- [ ] Manual auditor.
- [ ] Matriz de permisos aprobada.

### Criterio De Bloqueo

- Usuario operativo no puede ejecutar su flujo sin asistencia tecnica.

## Matriz 100% De Puntos Del Plan

| Punto | Gate | Agente Lider | Estado Inicial | Evidencia |
| --- | --- | --- | --- | --- |
| Supabase real | 3 | Supabase RLS Auditor | Pendiente | SQL, RLS, seed |
| Import Excel real | 2 | Data Integrity Agent | En revision | Seed, conteos |
| Usuarios reales | 4 | Security Agent | Pendiente | Auth/profiles |
| Roles y permisos | 4 | Security Agent | Pendiente | Matriz RBAC |
| Solicitudes | 5 | Product Ops Auditor | En revision | `/requests` |
| Aprobaciones | 5 | Product Ops Auditor | Pendiente | Estados/audit |
| Bodega | 6 | Product Ops Auditor | En revision | `/warehouse` |
| Despacho QR | 6 | QA Automation Agent | Pendiente | QR + dispatch |
| Recepcion | 6 | Product Ops Auditor | Pendiente | dispatch status |
| Devolucion | 6 | Product Ops Auditor | Pendiente | return event |
| Certificaciones | 7 | Supabase RLS Auditor | Pendiente | asset_documents |
| Calibraciones | 7 | Supabase RLS Auditor | Pendiente | maintenance_events |
| Mantenciones | 7 | Product Ops Auditor | Pendiente | maintenance_events |
| Bloqueo documental | 7 | Security Agent | Pendiente | policy + UI |
| Alta existencias | 8 | Data Integrity Agent | Pendiente | inventory/audit |
| Ajustes bodega | 8 | Data Integrity Agent | Pendiente | reason/audit |
| Cotizaciones | 9 | Product Ops Auditor | En revision | quote_requests |
| Compras | 9 | Product Ops Auditor | Pendiente | status flow |
| Notificaciones | 10 | DevOps Release Agent | Pendiente | notifications |
| Reportes ejecutivos | 11 | Frontend UX Auditor | En revision | `/reports` |
| UX responsive | 11 | Frontend UX Auditor | En revision | screenshots |
| QA automatizado | 12 | QA Automation Agent | En revision | lint/test/build |
| CI | 13 | DevOps Release Agent | Pendiente | workflow activo |
| Deploy | 13 | DevOps Release Agent | Pendiente | URL prod |
| Rollback | 13 | DevOps Release Agent | Pendiente | tag/release |
| Documentacion | 14 | Release Orchestrator | En revision | docs |
| Capacitacion | 14 | Product Ops Auditor | Pendiente | manuales |

## Ritmo De Trabajo Del Enjambre

1. Release Orchestrator abre el ciclo y asigna gates.
2. Cada agente revisa su gate y produce evidencia.
3. QA Automation Agent ejecuta pruebas despues de cada cambio funcional.
4. Security Agent revisa secretos y permisos antes de cada push.
5. DevOps Release Agent valida respaldo local y GitHub.
6. Ningun gate se marca `Cerrado` sin evidencia adjunta.

## Orden De Ejecucion Recomendado

1. Gate 0: repositorio limpio.
2. Gate 1: seguridad y secretos.
3. Gate 2: datos reales.
4. Gate 3: Supabase y RLS.
5. Gate 4: usuarios y permisos.
6. Gate 5: solicitudes.
7. Gate 6: bodega/despacho/devolucion.
8. Gate 7: documentos y cumplimiento.
9. Gate 8: altas y ajustes.
10. Gate 9: cotizaciones.
11. Gate 10: notificaciones.
12. Gate 11: UI/UX.
13. Gate 12: QA.
14. Gate 13: deploy/CI/rollback.
15. Gate 14: documentacion/capacitacion.

## Definicion De 100%

ToolTrack alcanza 100% de revision cuando:

- Todos los gates estan `Cerrado`.
- Todos los criterios de bloqueo estan resueltos o aceptados formalmente.
- Supabase opera con usuarios reales.
- La app no depende de `localStorage` para datos productivos.
- Las rutas criticas fueron probadas en navegador.
- `lint`, `test`, `build` pasan.
- El deploy productivo existe y tiene rollback.
- El ultimo commit esta respaldado en GitHub.

