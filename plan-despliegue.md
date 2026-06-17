# Plan de Despliegue a Producción - ToolTrack

Este documento detalla el plan integral para desplegar ToolTrack a producción, basado en la revisión del repositorio, el documento `docs/implementar-17-06.md` y `docs/plan-revision-100-produccion.md`.

## 1. Configuración de Base de Datos y Autenticación (Supabase)

Esta fase asegura que la aplicación tenga un backend persistente real.

1.  **Crear Proyecto Supabase:** Crear un proyecto de producción en Supabase.
2.  **Esquema SQL:** Ejecutar el archivo `supabase/schema.sql` en el SQL Editor de Supabase para crear las tablas necesarias (`inventory_items`, `inventory_movements`, `qr_scan_events`, `asset_requests`, `quote_requests`, etc.).
3.  **Importación de Datos:**
    *   Ejecutar el script para generar el archivo de base de datos SQL a partir del inventario real en Excel: `npm run supabase:seed` (o `python3 scripts/generate-supabase-seed.py <ruta_al_excel> supabase/seed.generated.sql`).
    *   Revisar e importar `supabase/seed.generated.sql` en la base de datos de producción de Supabase.
4.  **Autenticación y Roles:**
    *   Crear usuarios iniciales reales en Supabase Auth.
    *   Llenar la tabla `profiles` para mapear los usuarios con sus roles operativos: Administrador, Jefe de Bodega, Solicitante autorizado, Supervisor de contrato, Mantenimiento/calidad, y Auditor.
    *   Verificar que las políticas de seguridad (RLS - Row Level Security) en `supabase/schema.sql` limiten correctamente los permisos según el rol.
5.  **Variables de Entorno:**
    *   Configurar las variables requeridas en el entorno de producción (ej: Vercel, Netlify):
        *   `VITE_SUPABASE_URL`: La URL del proyecto Supabase.
        *   `VITE_SUPABASE_ANON_KEY`: La clave pública anónima de Supabase. **(No usar nunca `service_role` ni claves que empiecen con `sb_secret_`)**.

## 2. Validación y Automatización (CI/CD)

1.  **Configurar CI en GitHub Actions:** Ya se copió el archivo `docs/github-actions-ci.yml` a `.github/workflows/ci.yml`. Esto ejecutará las acciones (install, lint, test, build) al realizar un push o pull request a la rama `main`.
2.  **Validación de Entorno Local:** Ejecutar `VITE_SUPABASE_URL="..." VITE_SUPABASE_ANON_KEY="..." npm run check:prod` para comprobar que los scripts de validación pasen correctamente sin secretos.
3.  **Ejecutar Pruebas Funcionales:** Validar que `npm run lint`, `npm run test` y `npm run build` corran exitosamente en modo de producción. (El entorno de test ya se ajustó para solucionar la condición de carrera en los renders asíncronos).

## 3. Despliegue en Plataforma de Hosting (Vercel/Netlify)

1.  **Alojamiento:** Conectar el repositorio de GitHub con el proveedor de hosting seleccionado (Vercel recomendado por los archivos SPA `vercel.json` ya incluidos).
2.  **Configuración de Compilación:**
    *   Framework Preset: Vite
    *   Build Command: `npm run build`
    *   Output Directory: `dist`
3.  **Variables de Entorno en el Hosting:** Añadir `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` generadas en la Fase 1.
4.  **Lanzamiento:** Ejecutar el primer despliegue a producción.

## 4. Pruebas Operativas Post-Despliegue (Smoke Tests)

Una vez en producción, los usuarios reales deben confirmar los siguientes flujos utilizando la URL de producción y la base de datos real en Supabase:

1.  **Autenticación:** Iniciar sesión con diferentes perfiles para comprobar que la UI restringe acciones (un solicitante no debe poder despachar).
2.  **Solicitudes y Aprobación:**
    *   Crear una solicitud como Solicitante.
    *   Aprobar la solicitud como Supervisor.
3.  **Bodega y Despacho:**
    *   Preparar un despacho.
    *   Escanear código QR para validar la herramienta.
    *   Finalizar despacho y visualizar los eventos de QR actualizados.
4.  **Integridad Visual:** Verificar que el entorno de dashboard en `/` cargue las visualizaciones conectadas a la base de datos sin errores de consola.

## 5. Cierre y Capacitación

1.  Hacer un release branch/tag en GitHub (ej. `v1.0.0-prod`).
2.  Desplegar el "Manual solicitante" y otros tutoriales definidos en la documentación (`docs/plan-revision-100-produccion.md`).
