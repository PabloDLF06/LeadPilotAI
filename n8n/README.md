# Workflows n8n de LeadPilot AI

La integración n8n es opcional e interna. LeadPilot funciona sin n8n y no
permite a clientes finales crear o editar workflows.

## Workflows

- `LeadPilot — Prioridad de Lead`: webhook firmado, validación, idempotencia,
  alerta Telegram y backup con upsert en Google Sheets.
- `LeadPilot — Recordatorio Diario`: trigger diario a las 09:00
  `Europe/Madrid`, consulta de seguimientos y resumen Telegram.

Ambos quedaron creados inicialmente inactivos porque la instancia no tenía
credenciales Telegram ni Google Sheets disponibles durante la creación.

## Configuración manual

En n8n configura:

1. Credencial `Telegram Bot` y la variable `TELEGRAM_DEFAULT_CHAT_ID`.
2. Credencial `Google Sheets` y el documento/hoja de pruebas.
3. Variable `LEADPILOT_WEBHOOK_SECRET`, igual a `N8N_WEBHOOK_SECRET`.
4. `LEADPILOT_APP_URL`, `INTERNAL_AUTOMATION_SECRET` y, si se activa el callback,
   `N8N_CALLBACK_SECRET`.

No pegues secretos en nodos, exports JSON, commits o logs.

## Activación y pruebas

Configura primero las credenciales, ejecuta una prueba con datos ficticios y
revisa que la Data Table `LeadPilot n8n Idempotency` evita duplicados. Activa el
workflow solo después de confirmar Telegram, Sheets y la firma HMAC.

Para probar sin enviar mensajes reales, mantén los workflows inactivos y usa el
validador de n8n o datos fijados/pinned. Usa una hoja y chat de prueba antes de
la activación.

## Backup

Conserva los JSON de este directorio junto con una copia segura de la
configuración de credenciales. Los JSON no contienen secretos.
