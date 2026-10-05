# Arquitectura

```text
Formulario público
       |
       v
Next.js Route Handler -- Zod / anti-spam -- Supabase (RLS + Postgres)
       |                                      |
       v                                      v
analyzeLead (OpenAI o mock)              Dashboard / Analítica
       |
       +--> lead_ai_analyses + activities + internal_notifications
       |
       +--> n8n opcional: HMAC + timeout + idempotencia + automation_logs
```

Next.js App Router sirve la landing, dashboard protegido y endpoints. Supabase
mantiene Auth y los datos multi-organización. Las lecturas autenticadas pasan
por RLS; las operaciones internas que necesitan privilegios usan service role
solo en servidor. OpenAI devuelve Structured Outputs validado con Zod. En modo
demo se usa un analizador determinista y el envío de email se marca como
simulado.

Decisiones: n8n es interno y opcional; un fallo externo nunca deshace un lead;
las métricas se calculan desde filas de la organización y muestran vacío cuando
no existe evidencia suficiente.
