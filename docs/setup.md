# Setup local

## Requisitos

Node.js 20+, npm 10+ y un proyecto Supabase. Para una demo local se puede usar
`DEMO_MODE=true` sin OpenAI, Resend ni n8n.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Configura en `.env.local` al menos `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y `SUPABASE_SECRET_KEY`. Como fallback
también se aceptan `NEXT_PUBLIC_SUPABASE_ANON_KEY` y
`SUPABASE_SERVICE_ROLE_KEY`. La secret/service role solo se usa en Route
Handlers del servidor.

## Supabase

Ejecuta las migraciones obligatorias en orden: `001_initial_schema.sql`,
`002_rls_policies.sql`, `004_functions.sql`, `005_public_lead_flow.sql` y
`006_n8n_integration.sql` y `007_data_api_grants.sql`. Después configura Auth
con email/password y añade `http://localhost:3000/**` a las redirect URLs.

`003_seed_demo_data.sql` es opcional y crea una organización fija sin enlazar
usuarios. Para cargar datos en tu organización usa el botón protegido “Cargar
dataset demo” con `DEMO_MODE=true`. En esta sesión no había un proyecto Supabase
accesible, por lo que la aplicación no afirma que las migraciones se hayan
aplicado remotamente.

## Comprobación

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
```
