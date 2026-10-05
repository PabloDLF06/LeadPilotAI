# Despliegue en Vercel y Supabase

1. Crea el proyecto Supabase y aplica las migraciones obligatorias en orden,
   incluida `007_data_api_grants.sql`.
2. Configura Auth > URL Configuration con el dominio de Vercel y las rutas de
   login/registro.
3. Importa el repositorio en Vercel y añade las variables de `.env.example`.
4. En producción usa `DEMO_MODE=false`, un `NEXT_PUBLIC_APP_URL` HTTPS,
   `RATE_LIMIT_SALT` aleatorio y nunca publiques `SUPABASE_SERVICE_ROLE_KEY`.
5. Verifica `https://tu-dominio/api/health`; solo devuelve estado, modo demo,
   estado booleano de n8n y timestamp, nunca secretos.

OpenAI, Resend y n8n son opcionales. Si faltan, el producto conserva el flujo
principal y muestra/guarda la degradación segura. En esta versión Resend está
reservado como proveedor futuro y el botón de email registra una simulación.
Activa n8n únicamente cuando
los secretos server-only estén configurados y usa la guía de
[`n8n-integration.md`](./n8n-integration.md).

Para despliegues reproducibles, ejecuta migraciones antes de promover la nueva
versión y prueba registro, formulario público y aislamiento entre dos cuentas.
