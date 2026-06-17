# ToolTrack Next-Gen Product Prompt

Use este prompt para pedir a Codex, Stitch o un equipo de desarrollo que convierta
ToolTrack en una plataforma profesional de control de herramientas, activos,
certificaciones, bodegas y solicitudes operacionales.

## Prompt Maestro

Actua como un equipo senior multiagente de producto, diseno, frontend, backend,
Supabase, seguridad y operaciones industriales. Toma la app ToolTrack existente y
evolucionala desde un inventario valorizado con QR hacia una plataforma
operacional sorprendente, profesional y lista para faena, inspirada en Hilti
ON!Track, pero adaptada a contratos industriales, bodegas, CECO, activos,
herramientas, certificaciones, calibraciones, mantenciones, despachos y
solicitudes internas.

Restricciones obligatorias:

- No inventes datos. Usa solo el Excel real, Supabase o datos creados por usuarios
  autorizados dentro de la app.
- Mantén trazabilidad por código, bodega, CECO, contrato, usuario, fecha y evento.
- No expongas claves `service_role` ni `sb_secret_` en frontend.
- Toda acción relevante debe quedar auditada.
- Toda pantalla debe ser utilitaria, densa, clara y profesional. Evita estética de
  landing page o tarjetas decorativas sin función.
- El diseño debe verse de nivel enterprise industrial: preciso, rápido, confiable,
  con jerarquía fuerte, microinteracciones sobrias, buena lectura móvil y escritorio.

Objetivo visual:

Crear una interfaz sorprendente y premium para operaciones de bodega y terreno:
fondo claro, paneles densos, navegación tipo command center, acentos rojos y
grafito inspirados en herramientas industriales, estados claros, tablas potentes,
timeline de trazabilidad, QR visibles, indicadores de cumplimiento y alertas
priorizadas. El usuario debe sentir que controla el inventario completo de una
faena en tiempo real.

## Roles Y Permisos

Implementa RBAC en Supabase:

- Administrador: configura usuarios, permisos, contratos, bodegas, CECO, reglas de
  aprobacion y tipos de activo.
- Jefe de bodega: crea existencias, recibe solicitudes, aprueba entregas, registra
  despachos, recepciones y devoluciones.
- Solicitante autorizado: busca activos, ve disponibilidad y genera solicitudes.
- Supervisor de contrato: aprueba solicitudes por contrato/CECO y revisa costos.
- Mantenimiento/calidad: registra mantenciones, certificados, calibraciones,
  inspecciones y bloqueos.
- Auditor: solo lectura, reportes y trazabilidad historica.

Cada usuario debe pertenecer a uno o mas contratos, bodegas o centros de costo.

## Modulos Diferenciadores

### 1. Disponibilidad Inteligente

Agregar una pantalla "Solicitar activo" con buscador por codigo, descripcion,
grupo, bodega, contrato, CECO y estado.

Para cada resultado mostrar:

- Existencia disponible.
- Bodega actual.
- Contrato/CECO asociado.
- Si esta disponible, reservado, despachado, en mantencion, vencido, bloqueado o
  pendiente de calibracion.
- Alternativas equivalentes por grupo o descripcion.
- Costo unitario y valor total cuando aplique.
- Boton "Solicitar", "Reservar", "Pedir traslado" o "Requiere compra/cotizacion".

### 2. Flujo De Solicitudes

Crear un workflow formal:

1. Usuario autorizado solicita activo/herramienta/insumo.
2. Sistema valida stock, ubicacion, permiso, contrato y estado documental.
3. Si hay stock en su contrato/bodega, crea solicitud a bodega.
4. Si hay stock en otro contrato, crea solicitud de transferencia con aprobacion.
5. Si no hay stock, genera aviso de cotizacion/compra al responsable designado.
6. Bodega prepara despacho, adjunta certificados requeridos y registra entrega.
7. Receptor confirma con QR y firma/observacion.
8. Al devolver, bodega escanea QR, valida condicion y cierre.

Estados sugeridos:

- Borrador
- Pendiente aprobacion
- Aprobada
- Rechazada
- Preparando despacho
- Despachada
- Recibida
- Devuelta
- Cerrada
- Requiere cotizacion
- Compra solicitada

### 3. Trazabilidad Total Del Activo

Cada activo debe tener una ficha tipo "pasaporte":

- Identidad: codigo, descripcion, grupo, bodega, CECO, contrato.
- QR unico versionado.
- Historial de movimientos LMA.
- Eventos QR.
- Despachos, recepciones, devoluciones y transferencias.
- Certificados asociados.
- Calibraciones realizadas y proximas.
- Mantenciones preventivas/correctivas.
- Inspecciones y bloqueos.
- Fotos/documentos adjuntos si existen realmente.
- Auditoria: quien hizo que, cuando, desde donde y por que.

La ficha debe tener un timeline vertical con filtros: movimientos, certificados,
calibraciones, mantenciones, solicitudes, despachos y observaciones.

### 4. Certificaciones, Calibraciones Y Mantenciones

Crear entidad documental por activo:

- Tipo: certificado, calibracion, mantencion, inspeccion, manual, garantia.
- Fecha emision.
- Fecha vencimiento.
- Responsable.
- Proveedor.
- Archivo adjunto.
- Estado: vigente, por vencer, vencido, rechazado, no aplica.

Alertas:

- Vence en 30 dias.
- Vence en 15 dias.
- Vence en 7 dias.
- Vencido.
- Activo bloqueado por documento vencido.

Regla critica:

Un activo que requiere certificacion/calibracion vigente no puede ser despachado
si el documento esta vencido, salvo permiso especial auditado.

### 5. Bodega Profesional

Crear modulo "Bodega":

- Crear nueva existencia desde usuario autorizado.
- Recepcionar compra o traslado.
- Ajustar inventario con motivo obligatorio.
- Escaneo masivo por QR.
- Preparacion de despacho.
- Validacion de salida contra solicitud aprobada.
- Conteo ciclico por bodega/contrato.
- Diferencias fisicas contra sistema.

Pantallas necesarias:

- Cola de solicitudes.
- Preparacion de despacho.
- Recepcion/devolucion.
- Alta de existencia.
- Conteo QR.
- Alertas de documentos.

### 6. Motor De Cotizacion Y Compra

Si un activo solicitado no existe, esta en otra bodega no transferible, esta en
mantencion, esta vencido o esta reservado:

- Crear una "Solicitud de cotizacion".
- Notificar al comprador/responsable designado.
- Adjuntar contexto: descripcion solicitada, contrato, CECO, urgencia, fecha
  requerida, alternativas encontradas y stock en otros contratos.
- Estado: pendiente cotizacion, cotizado, aprobado compra, comprado, recibido,
  cancelado.

### 7. Alertas Y Notificaciones

Centro de alertas:

- Solicitudes pendientes de aprobacion.
- Activos listos para despacho.
- Activos con certificados por vencer.
- Calibraciones vencidas.
- Mantenciones programadas.
- Devoluciones atrasadas.
- Stock critico por grupo/bodega.
- Solicitudes sin stock que requieren cotizacion.
- Diferencias de inventario reportadas en terreno.

Canales futuros:

- Email.
- WhatsApp.
- Microsoft Teams.
- Push mobile.
- Panel interno en la app.

### 8. Integraciones

Preparar APIs para:

- ERP/contabilidad.
- Compras.
- Contratos/CECO.
- Proveedores de calibracion.
- App movil de escaneo.
- Power BI o dashboard ejecutivo.

Crear endpoints/servicios:

- `GET /availability?query=&contract=&warehouse=`
- `POST /requests`
- `POST /dispatches`
- `POST /returns`
- `POST /quote-requests`
- `POST /certifications`
- `POST /maintenance-events`

### 9. Repositorios Sugeridos

Separar cuando el producto crezca:

- `ToolTrack`: web app React/Vite actual.
- `ToolTrack-Mobile`: app movil de escaneo QR, recepcion y despacho.
- `ToolTrack-Backend`: Edge Functions, jobs, integraciones y notificaciones.
- `ToolTrack-Docs`: manuales, procesos operativos y matrices de permisos.
- `ToolTrack-Data`: scripts de importacion, validacion de Excel y migraciones.

Mantener monorepo solo si el equipo sera pequeno y se quiere acelerar la entrega.

## Diseno De Pantallas Prioritarias

### Command Center

Dashboard inicial para jefatura:

- Stock total valorizado.
- Activos disponibles, despachados, bloqueados y en mantencion.
- Solicitudes pendientes.
- Alertas de vencimiento.
- Stock critico.
- Bodegas con mayores diferencias.
- Valor inmovilizado por contrato.

### Solicitar Activo

Pantalla de busqueda operacional:

- Input principal grande: codigo, descripcion o grupo.
- Filtros laterales: contrato, CECO, bodega, estado documental, disponibilidad.
- Resultados en tabla densa.
- Cada fila con acciones contextuales.
- Panel derecho "resumen de solicitud".

### Ficha De Activo

Pasaporte del activo:

- QR y estado operativo arriba.
- Identidad y disponibilidad.
- Timeline completo.
- Documentos vigentes/vencidos.
- Solicitudes relacionadas.
- Botones: solicitar, reservar, despachar, devolver, bloquear, agregar documento.

### Bodega

Vista para personal de bodega:

- Cola de trabajo por prioridad.
- Solicitudes aprobadas para preparar.
- Escaneo QR para validar item.
- Checklist de documentos antes de despacho.
- Registro de entrega y recepcion.

### Cumplimiento

Vista de certificaciones/calibraciones:

- Calendario de vencimientos.
- Activos bloqueados.
- Proveedores.
- Documentos pendientes.
- Exportable para auditoria.

## Modelo De Datos Propuesto

Tablas:

- `profiles`
- `roles`
- `user_roles`
- `contracts`
- `warehouses`
- `cost_centers`
- `inventory_items`
- `inventory_stock_lots`
- `asset_documents`
- `maintenance_events`
- `calibration_events`
- `asset_requests`
- `request_items`
- `approvals`
- `dispatches`
- `dispatch_items`
- `returns`
- `quote_requests`
- `notifications`
- `audit_log`

Campos criticos:

- `asset_status`
- `availability_status`
- `requires_certification`
- `requires_calibration`
- `next_calibration_at`
- `document_expires_at`
- `blocked_reason`
- `current_contract_id`
- `current_warehouse_id`
- `custodian_user_id`

## Roadmap De Implementacion

### Fase 1: Produccion Base

- Activar Supabase Auth.
- Cargar schema.
- Importar Excel real a Supabase.
- Crear perfiles y roles.
- Mantener fallback local solo para desarrollo.

### Fase 2: Solicitudes Y Disponibilidad

- Crear tablas de solicitudes.
- Pantalla "Solicitar activo".
- Estados de solicitud.
- Aprobaciones por rol.
- Cola de bodega.

### Fase 3: Despacho Y Trazabilidad

- Crear despachos y devoluciones.
- Validar QR en salida/entrada.
- Timeline completo de activo.
- Auditoria de eventos.

### Fase 4: Documentos Y Cumplimiento

- Certificados/calibraciones/mantenciones.
- Alertas de vencimiento.
- Bloqueo por documento vencido.
- Reportes de cumplimiento.

### Fase 5: Cotizacion E Integraciones

- Solicitud automatica de cotizacion.
- Notificaciones a responsables.
- Integracion con compras/ERP.
- API externa.

## Criterios De Calidad

- La app debe cargar rapido aun con miles de filas.
- Todas las tablas grandes deben tener filtros y paginacion/virtualizacion.
- Todo evento operacional debe quedar en `audit_log`.
- Ningun flujo critico debe depender solo de texto libre.
- Todo documento vencido debe ser visible y accionable.
- La app debe funcionar perfecto en mobile para escaneo QR.

## Referencias De Mercado

- Hilti ON!Track comunica control de herramientas, activos, certificaciones,
  mantenimiento y APIs abiertas para integrar sistemas.
- ON!Track funciona en nube, escritorio y app movil, con etiquetas robustas para
  escaneo en terreno.
- La app ON!Track 3 menciona asignacion a empleados/faenas, documentacion,
  mantenimiento, reparaciones, inventarios rapidos, capacitaciones y certificados.
- Plataformas de gestion de equipos destacan mantenimiento preventivo,
  centralizacion documental, barcode/QR, cumplimiento y analitica de uso.

