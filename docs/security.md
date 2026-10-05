# Seguridad y límites

- RLS está activado en tablas de negocio; las políticas se basan en membership
  de organización, no en `user_metadata`.
- No hay políticas anónimas de inserción para leads. El formulario público pasa
  por un Route Handler que valida el formulario, honeypot, tiempo mínimo, tamaño
  y rate limit antes de usar el cliente administrativo en servidor.
- `SUPABASE_SERVICE_ROLE_KEY`, OpenAI, Resend, Telegram y n8n son secretos
  server-only. No deben comenzar por `NEXT_PUBLIC_`.
- Los callbacks n8n requieren timestamp fresco, HMAC y esquema Zod. Los eventos
  llevan idempotency key, timeout y log de resultado.
- Los errores públicos son genéricos y los logs limitan mensajes; no se envían
  stacks ni credenciales al navegador.

Esto es seguridad básica de portfolio, no una certificación ni una garantía de
cumplimiento RGPD. Falta implementar exportación/borrado asistido, retención,
política legal final y un rate limit distribuido para varios nodos.
