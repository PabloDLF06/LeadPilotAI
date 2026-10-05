# LeadPilot AI

[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Plataforma SaaS de cualificación y seguimiento de leads con IA.

Este repositorio contiene la base de LeadPilot AI, incluyendo autenticación,
workspace multi-organización, formulario público de captación y dashboard inicial.

## Stack

- Next.js 15 con App Router y React 19.
- TypeScript en modo `strict`.
- Tailwind CSS y base compatible con shadcn/ui.
- Supabase para PostgreSQL y autenticación.
- OpenAI para análisis y respuestas estructuradas; sin key se usa el mock demo.
- React Hook Form, Zod, Recharts, Lucide React y Resend (preparado; el flujo actual simula el email).
- Vitest para pruebas de funciones de negocio.

## Requisitos

- Node.js 20 o superior.
- npm 10 o superior.
- Cuenta de Supabase para persistencia, autenticación y ejecución de migraciones.
- API key de OpenAI, o `DEMO_MODE=true` durante el desarrollo.

## Instalación

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

En macOS/Linux, el equivalente de la segunda línea es:

```bash
cp .env.example .env.local
```

Completa las variables necesarias en `.env.local`. Las claves privadas no deben
publicarse ni exponerse en componentes de cliente.

> Nunca hagas commit de `.env.local`, `.env` ni de ninguna clave real. Usa
> `.env.example` como plantilla.

Necesitas configurar `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y `SUPABASE_SECRET_KEY`.
También se aceptan `NEXT_PUBLIC_SUPABASE_ANON_KEY` y
`SUPABASE_SERVICE_ROLE_KEY` como nombres legacy. La secret/service role se usa únicamente en el servidor para
bootstrap de la organización y recepción del formulario público; nunca se envía al
navegador. Configura también `RATE_LIMIT_SALT` con un secreto aleatorio en producción.

Rutas disponibles:

- `/register`: registro y bootstrap del workspace inicial.
- `/login`: inicio de sesión.
- `/dashboard`: ruta protegida por middleware.
- `/f/[publicId]`: formulario público de captación.
- `/f/[publicId]/success`: confirmación de recepción del lead.
- `POST /api/public/leads`: valida, limita y crea leads desde formularios públicos.

## Scripts

```bash
npm run dev          # servidor de desarrollo
npm run build        # compilación de producción
npm run start        # servidor de producción
npm run lint         # ESLint
npm run typecheck    # TypeScript sin emitir archivos
npm run test         # Vitest
npm run format       # Prettier
npm run doctor       # diagnóstico local sin imprimir secretos
npm run check        # lint, typecheck, test y build en secuencia
npm run setup:demo   # crea .env.local solo si no existe
npm run seed         # punto de entrada para datos demo
```

## Estructura

La aplicación usa Next.js App Router como capa web, Route Handlers para las
operaciones de servidor y Supabase para Auth/Postgres/RLS. Las lecturas del
dashboard se filtran por `organization_id`; las escrituras administrativas y
el flujo público pasan por código server-only. La IA se valida con Zod y puede
degradar a un mock cuando `DEMO_MODE=true`. n8n es una integración interna
opcional: no forma parte del camino crítico ni expone workflows al cliente.

## Base de datos

Las migraciones de Supabase están en `supabase/migrations/`:

1. `001_initial_schema.sql`: enums, tablas, índices, triggers y validaciones de integridad.
2. `002_rls_policies.sql`: helpers de autorización y políticas RLS multi-organización.
3. `004_functions.sql`: creación segura de perfil tras signup y helper de organización.
4. `005_public_lead_flow.sql`: índices del flujo público y refuerzo explícito de RLS.
5. `006_n8n_integration.sql`: estado de integración, notificaciones internas, idempotencia y RLS adicional.
6. `007_data_api_grants.sql`: privilegios Data API explícitos sin abrir políticas RLS.
7. `003_seed_demo_data.sql`: dataset fijo opcional; no enlaza usuarios Auth.

Con Supabase CLI:

```bash
supabase db reset
```

El seed no crea ni vincula usuarios artificiales de `auth.users`. Para cargar datos
en la organización actual usa el endpoint protegido “Cargar dataset demo” con
`DEMO_MODE=true`.

## Estado del proyecto

Está configurada la base técnica y la capa funcional inicial: dependencias,
TypeScript estricto, linting, UI responsive, Auth, middleware, esquema Supabase,
RLS, datos demo, formulario público, validación Zod, anti-spam básico, logs y
dashboard con datos reales.

## Verificación

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

El endpoint público aplica honeypot, tiempo mínimo de envío, límite de tamaño,
límite por IP anonimizada y validación de formulario. Las escrituras públicas no
usan una política RLS anónima: pasan por el Route Handler de servidor con
`service_role`, que resuelve la organización exclusivamente desde `form_public_id`.

## Fase 8: analítica, demo y despliegue

`/dashboard/analytics` ofrece rangos de 7, 30 y 90 días, KPIs, evolución diaria,
prioridad, estados y servicios. Las consultas se filtran por organización y los
gráficos muestran estados vacíos honestos. `/dashboard/leads/new` permite crear un
lead sintético o cargar un dataset demo idempotente en la organización actual,
ejecuta el mock IA y genera la alerta interna;
se identifica como `source=demo` y no se carga automáticamente en organizaciones
reales.

La respuesta sugerida se puede copiar o registrar como email simulado desde el
detalle del lead. Con `DEMO_MODE=true` no se requiere OpenAI ni Resend. n8n sigue
siendo opcional: con `N8N_ENABLED=false` se registra `skipped` y el flujo principal
continúa.

Documentación operativa:

- [Setup local](docs/setup.md)
- [Despliegue](docs/deployment.md)
- [Seguridad](docs/security.md)
- [Arquitectura](docs/architecture.md)
- [API](docs/api.md)
- [Guion de demo](docs/demo-script.md)
- [Integración n8n](docs/n8n-integration.md)

### Limitaciones y roadmap

Este proyecto es una demo de portfolio y no una certificación de seguridad ni una
garantía de cumplimiento RGPD. El roadmap contempla exportación y borrado RGPD,
retención configurable, rate limiting distribuido, equipos multiusuario, HubSpot,
WhatsApp Business, Stripe, seguimientos automáticos, scoring configurable y un
agente conversacional.
