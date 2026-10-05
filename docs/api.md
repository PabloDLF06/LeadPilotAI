# API interna y pública

| Ruta | Método | Acceso | Uso |
|---|---:|---|---|
| `/api/public/leads` | POST | Público validado | Crea lead desde un formulario activo |
| `/api/dashboard/leads/demo` | POST | Sesión | Crea lead sintético y ejecuta análisis demo |
| `/api/dashboard/demo-data` | POST | owner/admin + `DEMO_MODE=true` | Carga dataset demo idempotente en la organización actual |
| `/api/dashboard/leads/[id]/analyze` | POST | Sesión + RLS | Reintenta análisis |
| `/api/integrations/n8n/status` | GET | Sesión | Estado seguro de integración |
| `/api/integrations/n8n/test` | POST | owner/admin | Evento sintético |
| `/api/integrations/n8n/retry/[logId]` | POST | owner/admin | Reintento fallido |
| `/api/webhooks/n8n/callback` | POST | HMAC | Callback de workflow |
| `/api/health` | GET | Público | Health check sin secretos |

Todas las entradas se validan en servidor. Las respuestas de error son
deliberadamente genéricas y no forman una API pública estable todavía.
