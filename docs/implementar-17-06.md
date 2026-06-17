# Plan de Implementacion Pendiente - 17-06

Este plan deja ordenado lo que falta para llevar ToolTrack a produccion real.
La app ya tiene inventario real, QR, solicitudes, cola de bodega, cumplimiento
base, schema Supabase y respaldo GitHub. Lo pendiente es conectar operacion real,
roles, datos documentales y flujos completos.

## Objetivo De Produccion

Convertir ToolTrack en una plataforma operacional para:

- Consultar existencia real por codigo, descripcion, bodega, CECO y contrato.
- Solicitar herramientas, activos e insumos segun permisos.
- Validar disponibilidad antes de aprobar o despachar.
- Registrar despacho, recepcion, devolucion y trazabilidad por QR.
- Bloquear activos con certificaciones, calibraciones o mantenciones vencidas.
- Generar solicitudes de cotizacion cuando no hay stock disponible.
- Mantener auditoria completa por usuario, fecha, activo y accion.

## Fase 1 - Supabase Real

Prioridad: critica.

### Tareas

1. Crear proyecto Supabase definitivo.
2. Ejecutar `supabase/schema.sql` en SQL Editor.
3. Generar seed desde Excel real:

```bash
npm run supabase:seed
```

4. Revisar `supabase/seed.generated.sql`.
5. Ejecutar seed en Supabase.
6. Configurar `.env.local`:

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=ey...
```

7. Validar entorno:

```bash
npm run check:prod
```

8. Probar login, eventos QR y solicitudes con usuario autenticado.

### Criterio De Listo

- La app deja de operar solo en modo local.
- Solicitudes y eventos QR se guardan en Supabase.
- No existe ninguna clave `sb_secret_` o `service_role` en frontend.

## Fase 2 - Usuarios, Roles Y Permisos

Prioridad: critica.

### Roles Iniciales

- Administrador.
- Jefe de bodega.
- Solicitante autorizado.
- Supervisor de contrato.
- Mantenimiento/calidad.
- Auditor.

### Tareas

1. Crear usuarios reales en Supabase Auth.
2. Poblar tabla `profiles`.
3. Asignar rol, contrato, bodega o CECO permitido.
4. Ajustar RLS para cada rol.
5. Ocultar acciones en UI segun permisos:
   - Solicitar.
   - Aprobar.
   - Despachar.
   - Crear existencia.
   - Cargar documentos.
   - Ver auditoria.

### Criterio De Listo

- Un solicitante no puede despachar.
- Bodega puede preparar y registrar salida.
- Mantenimiento puede cargar certificados/calibraciones.
- Auditor solo puede leer.

## Fase 3 - Flujo Completo De Solicitudes

Prioridad: alta.

### Estados Del Flujo

1. Borrador.
2. Pendiente aprobacion.
3. Aprobada.
4. Rechazada.
5. Cola bodega.
6. Lista para despacho.
7. Despachada.
8. Recibida.
9. Devuelta.
10. Cerrada.
11. Requiere cotizacion.

### Tareas

1. Crear pantalla de aprobacion para supervisor.
2. Agregar acciones de cambio de estado.
3. Registrar cada cambio en `audit_log`.
4. Crear notificacion interna al cambiar estado.
5. Asociar solicitud a contrato/CECO real.
6. Validar cantidad solicitada contra saldo disponible.

### Criterio De Listo

- Una solicitud avanza de punta a punta sin editar base de datos a mano.
- Cada cambio de estado queda auditado.

## Fase 4 - Despacho, Recepcion Y Devolucion QR

Prioridad: alta.

### Tareas

1. Crear pantalla `Preparar despacho`.
2. Escanear QR para validar item antes de salir.
3. Crear `dispatches` y `dispatch_items`.
4. Registrar responsable de entrega y receptor.
5. Confirmar recepcion desde QR.
6. Registrar devolucion con condicion:
   - Correcta.
   - Dañada.
   - Incompleta.
   - Requiere mantencion.
7. Actualizar timeline del activo.

### Criterio De Listo

- Cada despacho queda enlazado al activo, solicitud y usuario.
- El historial del activo muestra salida, recepcion y devolucion.

## Fase 5 - Certificaciones, Calibraciones Y Mantenciones

Prioridad: alta.

### Tareas

1. Definir matriz real de activos que requieren documentos:
   - Certificacion.
   - Calibracion.
   - Mantencion.
   - Inspeccion.
2. Crear pantalla para cargar documento por activo.
3. Campos obligatorios:
   - Tipo.
   - Numero.
   - Proveedor.
   - Fecha emision.
   - Fecha vencimiento.
   - Archivo.
4. Crear alertas:
   - Vence en 30 dias.
   - Vence en 15 dias.
   - Vence en 7 dias.
   - Vencido.
5. Bloquear despacho si documento requerido esta vencido o ausente.
6. Permitir excepcion solo con permiso especial y auditoria.

### Criterio De Listo

- Un activo con documento vencido no puede salir sin autorizacion especial.
- Cumplimiento muestra vencimientos reales, no inferidos.

## Fase 6 - Alta De Existencias Y Ajustes De Bodega

Prioridad: media-alta.

### Tareas

1. Crear pantalla `Nueva existencia`.
2. Campos:
   - Codigo.
   - Descripcion.
   - Grupo.
   - Bodega.
   - CECO.
   - Saldo.
   - Valor unitario.
   - Contrato.
   - Motivo de alta.
3. Validar codigo unico.
4. Crear ajuste de inventario con motivo obligatorio.
5. Registrar alta o ajuste en `audit_log`.

### Criterio De Listo

- Bodega puede crear existencias sin modificar Excel.
- Todo ajuste tiene motivo, usuario y fecha.

## Fase 7 - Cotizaciones Y Compras

Prioridad: media-alta.

### Tareas

1. Crear pantalla `Cotizaciones`.
2. Generar cotizacion si:
   - No hay stock.
   - Stock esta en otro contrato y no se puede transferir.
   - Activo esta bloqueado.
   - Activo esta en mantencion.
3. Asignar responsable de compra.
4. Estados:
   - Pendiente cotizacion.
   - Cotizado.
   - Compra aprobada.
   - Comprado.
   - Recibido.
   - Cancelado.
5. Enlazar compra recibida con alta de existencia.

### Criterio De Listo

- Una solicitud sin stock genera una accion concreta para compras.
- La compra recibida alimenta inventario.

## Fase 8 - Notificaciones

Prioridad: media.

### Canales

- Panel interno.
- Email.
- Microsoft Teams.
- WhatsApp, si se aprueba integracion.

### Alertas Iniciales

- Solicitud pendiente de aprobacion.
- Solicitud aprobada para bodega.
- Activo listo para despacho.
- Cotizacion requerida.
- Documento por vencer.
- Documento vencido.
- Devolucion atrasada.
- Diferencia de inventario reportada.

### Criterio De Listo

- Cada evento critico genera aviso al rol correcto.

## Fase 9 - Reportes Ejecutivos

Prioridad: media.

### Reportes

- Valor por bodega.
- Valor por contrato/CECO.
- Solicitudes por estado.
- Activos bloqueados.
- Documentos vencidos.
- Cotizaciones pendientes.
- Despachos por periodo.
- Diferencias de inventario.

### Criterio De Listo

- La gerencia puede ver riesgos, valor inmovilizado y cumplimiento sin exportar a Excel.

## Fase 10 - Deploy Y Operacion

Prioridad: critica para salida.

### Tareas

1. Elegir hosting:
   - Vercel.
   - Netlify.
   - Supabase hosting.
2. Configurar variables de entorno.
3. Configurar dominio.
4. Activar CI copiando:

```bash
docs/github-actions-ci.yml
```

a:

```bash
.github/workflows/ci.yml
```

5. Usar token GitHub con permiso `workflow`.
6. Ejecutar pruebas antes de cada deploy:

```bash
npm run lint
npm run test
npm run build
```

### Criterio De Listo

- Deploy publico/privado funcionando.
- Build automatizado.
- Variables seguras.
- Rollback posible desde GitHub.

## Orden Recomendado De Implementacion

1. Supabase real.
2. Usuarios y permisos.
3. Solicitudes con aprobacion.
4. Despacho/recepcion QR.
5. Documentos y bloqueo por cumplimiento.
6. Alta de existencias.
7. Cotizaciones.
8. Notificaciones.
9. Reportes ejecutivos.
10. Deploy final y capacitacion.

## Riesgos

- Usar claves secretas en frontend.
- Inventar fechas de certificados/calibraciones.
- Permitir despachos sin auditoria.
- No definir responsables por contrato/bodega.
- Mantener datos operacionales solo en localStorage.
- No probar el flujo con usuarios reales de bodega.

## Primer Sprint Sugerido

Duracion sugerida: 1 semana.

### Entregables

- Supabase funcionando con inventario real.
- Login operativo.
- Roles base creados.
- Solicitudes guardadas en Supabase.
- Cola de bodega leyendo Supabase.
- Eventos QR leyendo/escribiendo Supabase.
- Checklist de permisos validado con usuarios reales.

### Validacion

- Solicitante crea solicitud.
- Supervisor aprueba.
- Bodega ve cola.
- Bodega prepara despacho.
- QR confirma activo correcto.
- Auditor ve historial.

