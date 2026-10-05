# Integración n8n

## Arquitectura

n8n es una integración interna, opcional y autoalojada. LeadPilot guarda el
lead, el análisis, la prioridad y la alerta interna antes de intentar cualquier
request externo. El flujo principal no depende de n8n.

El evento activado en este MVP es `lead.priority_detected`, únicamente cuando el
score alcanza `organizations.score_alert_threshold` (70 por defecto). También se
preparan los nombres de eventos `lead.created`, `lead.follow_up_due` y
`lead.status_changed`, pero no se activan todavía.

## Degradación segura

- `N8N_ENABLED` solo activa requests cuando su valor es exactamente `true`.
- Si n8n está desactivado, se registra un log `skipped` y LeadPilot continúa.
- Si falta configuración, hay timeout, error HTTP o error de red, se registra
  `failed`, se crea una notificación interna para owner/admin y el lead conserva
  su análisis y alerta interna.
- El timeout de salida es 5 segundos por defecto.

## Variables del servidor

```env
N8N_ENABLED=false
N8N_WEBHOOK_URL=
N8N_WEBHOOK_SECRET=
N8N_CALLBACK_SECRET=
N8N_TIMEOUT_MS=5000
INTERNAL_AUTOMATION_SECRET=
```

Las tres primeras variables secretas, `INTERNAL_AUTOMATION_SECRET` y la URL no se
envían al navegador ni se guardan en la base de datos. Si `N8N_ENABLED` no es
`true`, la configuración se considera opcional.

## Firma HMAC

LeadPilot firma exactamente `${timestamp}.${rawBody}` con HMAC-SHA256 y envía la
firma hexadecimal en `x-leadpilot-signature`, junto con timestamp, evento y clave
de idempotencia. El callback usa `N8N_CALLBACK_SECRET` y rechaza timestamps con
más de cinco minutos de antigüedad.

## Idempotencia y logs

`automation_logs` conserva el payload seguro, estado, intentos, error limitado y
`idempotency_key`. La clave de prioridad es estable para el mismo lead, score y
prioridad; un cambio de score o prioridad permite un evento nuevo. n8n usa la
Data Table `LeadPilot n8n Idempotency` para evitar repetir Telegram o Sheets.

## Rutas

- `POST /api/integrations/n8n/test`: owner/admin, evento sintético.
- `POST /api/integrations/n8n/retry/[logId]`: owner/admin, solo logs fallidos.
- `GET /api/integrations/n8n/status`: estado seguro sin URL ni secretos.
- `POST /api/webhooks/n8n/callback`: callback firmado y validado con Zod.
- `GET /api/internal/follow-ups/due`: endpoint server-only protegido por Bearer
  `INTERNAL_AUTOMATION_SECRET`; actualmente devuelve lista vacía porque follow-ups
  aún no está activo.

## Workflows

Los workflows se guardan inactivos en la instancia n8n. El primero valida firma,
timestamp y forma del payload, deduplica, y prepara Telegram y Google Sheets. El
segundo consulta el endpoint interno cada día a las 09:00 Europe/Madrid y solo
envía un resumen si hay elementos.

## Test seguro

1. Configura las variables de servidor y las credenciales de n8n.
2. Mantén ambos workflows inactivos durante la configuración.
3. Usa “Enviar evento de prueba” desde Configuración para generar un payload
   sintético.
4. Prueba primero con un chat y hoja de pruebas, nunca con datos de clientes.
5. Comprueba `automation_logs`, el estado de Integraciones y la Data Table de
   idempotencia.

## Solución de problemas

- `not_configured`: revisa las variables server-only y que `N8N_ENABLED=true`.
- `timeout`: comprueba conectividad y mantén el workflow ligero; el límite es
  intencionadamente corto.
- `invalid_signature`: confirma que el secreto y el raw body son idénticos en
  LeadPilot y n8n.
- `failed` repetido: usa el reintento privado tras resolver la causa; no se
  reintenta automáticamente para no duplicar alertas.
