# PROYECTO MAESTRO: LEADPILOT AI
## Plataforma SaaS de captación, cualificación y seguimiento de leads con IA

====================================================
1. VISIÓN DEL PRODUCTO
====================================================

Nombre del producto:
LeadPilot AI

Tagline:
Convierte cada formulario en una oportunidad atendida, clasificada y seguida automáticamente.

Descripción corta:
LeadPilot AI es una aplicación SaaS para pequeñas y medianas empresas que reciben solicitudes de clientes desde formularios web. La plataforma recibe leads, usa IA para analizarlos y clasificarlos, genera una respuesta personalizada, asigna prioridad, guarda toda la información en una base de datos y activa automatizaciones de seguimiento mediante email, Telegram y/o CRM.

Problema que resuelve:
Muchas pymes pierden clientes potenciales porque:
- Responden tarde o no responden a formularios.
- Los leads llegan a un email sin clasificación ni contexto.
- No saben cuáles son urgentes, valiosos o poco cualificados.
- No tienen CRM o no lo usan correctamente.
- Hacen seguimiento manual y olvidan oportunidades.
- No pueden responder fuera de su horario laboral.
- No disponen de una persona técnica para crear automatizaciones.

Propuesta de valor:
LeadPilot AI transforma un formulario normal en un sistema inteligente de ventas:
1. Recibe la consulta de un posible cliente.
2. Analiza automáticamente intención, servicio solicitado, urgencia, presupuesto, sentimiento y probabilidad de compra.
3. Puntúa el lead de 0 a 100.
4. Lo clasifica como frío, templado, caliente o urgente.
5. Genera una respuesta inicial en el tono de la empresa.
6. Envía la respuesta automática si la empresa ha activado ese modo.
7. Avisa de inmediato al equipo cuando el lead es prioritario.
8. Programa tareas y seguimientos si no hay respuesta.
9. Centraliza los leads y su estado en un dashboard visual.

Usuario objetivo inicial:
- Clínicas dentales y estéticas.
- Inmobiliarias.
- Gestorías.
- Academias.
- Agencias de marketing.
- Empresas de reformas.
- Instaladores de placas solares.
- Talleres y concesionarios.
- Despachos de abogados.
- Empresas de servicios B2B.

Caso de uso demo recomendado:
Una agencia de marketing ficticia llamada “Nova Growth”.
La agencia recibe solicitudes de empresas que quieren captar clientes, mejorar anuncios o automatizar procesos.
LeadPilot AI clasifica los leads, responde con contexto y alerta al equipo si el posible cliente tiene presupuesto alto o urgencia.

Objetivo portfolio:
No construir una plataforma gigante.
Construir una aplicación pequeña, profesional, sólida, desplegada y demostrable en vídeo.

La demo debe demostrar:
- Diseño profesional.
- Formulario público funcional.
- Recepción y almacenamiento de leads.
- Clasificación automática con IA.
- Dashboard privado.
- Detalle de lead.
- Puntuación y prioridad.
- Respuesta sugerida por IA.
- Automatización n8n.
- Notificación por Telegram.
- Seguridad básica real.
- Código organizado y README útil.

====================================================
2. ALCANCE DEL MVP
====================================================

MVP obligatorio:
- Landing page pública.
- Formulario público de captación de leads.
- Registro e inicio de sesión de usuarios.
- Organización o workspace por usuario.
- Dashboard de leads.
- Creación automática de lead al enviar formulario.
- Análisis con IA.
- Score de lead de 0 a 100.
- Prioridad: cold, warm, hot, urgent.
- Estado comercial: new, contacted, qualified, won, lost, archived.
- Generación de respuesta sugerida con IA.
- Edición manual de la respuesta.
- Envío de email real o simulación de envío.
- Webhook hacia n8n.
- Notificación por Telegram para leads calientes o urgentes.
- Filtros y búsqueda.
- Panel de configuración de empresa.
- Panel de automatizaciones.
- Logs de automatización.
- Control de errores.
- Row Level Security en Supabase.
- README completo.
- Datos demo y modo demo.

MVP NO obligatorio:
- Integración real de WhatsApp Business.
- Stripe y cobros.
- Multiusuario con roles muy complejos.
- Integración con HubSpot real.
- Calendario real con Google Calendar.
- Chatbot embebido.
- Facturación.
- Analítica avanzada.
- Campañas de email masivas.
- App móvil nativa.

Estas funciones pueden aparecer en el diseño como “Próximamente”, pero no deben bloquear la entrega del MVP.

====================================================
3. STACK TECNOLÓGICO
====================================================

Frontend:
- Next.js 15+ con App Router.
- TypeScript con modo strict.
- React.
- Tailwind CSS.
- shadcn/ui.
- Lucide React para iconos.
- React Hook Form.
- Zod.
- TanStack Query si es necesario.
- Recharts para gráficos básicos.

Backend:
- Supabase:
  - PostgreSQL.
  - Auth.
  - Row Level Security.
  - Storage opcional.
  - Edge Functions opcionales.
  - Realtime opcional.
- Next.js Route Handlers para endpoints internos.
- Supabase service role únicamente en backend seguro.

IA:
- OpenAI API.
- Usar Responses API o endpoint moderno disponible.
- Respuestas estructuradas con JSON Schema.
- No permitir que la IA devuelva texto no estructurado para la clasificación.
- Validar también la respuesta de IA con Zod en el servidor.
- Modelo configurable mediante variable de entorno.
- Para desarrollo puede usarse un modelo de coste bajo.
- Para producción demo, usar el modelo que ofrezca buena relación calidad/precio.

Automatización:
- n8n autoalojado, n8n Cloud o instancia de prueba.
- Webhook desde la app a n8n.
- n8n envía notificación por Telegram.
- n8n puede enviar email o crear tarea de seguimiento.
- Crear workflow exportable en JSON dentro del repositorio.

Email:
- Resend recomendado.
- Alternativa: Nodemailer con SMTP.
- En modo demo, habilitar simulación de envío y guardar el evento en activity_logs.

Despliegue:
- Vercel para frontend Next.js.
- Supabase para base de datos y autenticación.
- n8n Cloud, Railway, Render, VPS o Docker para n8n.
- Dominio opcional.
- Variables de entorno documentadas en .env.example.

Calidad:
- ESLint.
- Prettier.
- TypeScript strict.
- Vitest para funciones de negocio.
- Playwright opcional para E2E.
- GitHub Actions opcional para lint, typecheck y tests.

====================================================
4. ARQUITECTURA GENERAL
====================================================

Flujo principal:

[Formulario público]
        |
        v
[POST /api/public/leads]
        |
        +--> Validación Zod + protección anti-spam
        |
        +--> Crear lead en Supabase con estado "new"
        |
        +--> Encolar/procesar análisis IA
        |
        +--> Guardar resultado IA
        |
        +--> Crear registro de actividad
        |
        +--> Llamar webhook n8n firmado
        |
        +--> Responder éxito al visitante
        |
        v
[Dashboard privado]
        |
        +--> Usuario ve lead, clasificación, score, respuesta y actividad
        |
        +--> Puede actualizar estado, notas, etiquetas y respuesta
        |
        +--> Puede enviar o simular email

Decisión técnica para MVP:
Procesar el análisis IA en el mismo request del formulario si la respuesta tarda poco.
Añadir estados de procesamiento:
- pending
- processing
- completed
- failed

Si el análisis tarda demasiado o falla:
- Crear el lead igualmente.
- Mostrar al usuario lead pendiente.
- Añadir botón “Reanalizar con IA”.
- Registrar fallo en automation_logs.
- No perder nunca el lead.

Seguridad:
- El formulario público NO debe poder elegir organization_id libremente.
- Usar un formulario_id público de tipo UUID o slug largo.
- Cada formulario pertenece a una organización.
- El endpoint público resuelve el formulario por public_id.
- Usar rate limiting simple.
- Usar campo honeypot invisible.
- Validar email.
- Sanitizar textos mostrados en interfaz.
- Nunca exponer OPENAI_API_KEY ni SUPABASE_SERVICE_ROLE_KEY al cliente.
- Todo acceso privado se protege con Supabase Auth y RLS.
- El webhook hacia n8n contiene firma HMAC compartida.
- n8n valida la firma antes de procesar.

====================================================
5. ESTRUCTURA DE CARPETAS
====================================================

Usar una estructura limpia, orientada a dominio:

/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── layout.tsx
│   │
│   ├── (marketing)/
│   │   ├── page.tsx
│   │   ├── pricing/page.tsx
│   │   ├── demo/page.tsx
│   │   └── layout.tsx
│   │
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── leads/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── new/page.tsx
│   │   ├── automations/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── embed/page.tsx
│   │   ├── analytics/page.tsx
│   │   └── layout.tsx
│   │
│   ├── f/
│   │   └── [publicId]/
│   │       ├── page.tsx
│   │       └── success/page.tsx
│   │
│   ├── api/
│   │   ├── public/
│   │   │   └── leads/route.ts
│   │   ├── leads/
│   │   │   ├── [id]/analyze/route.ts
│   │   │   ├── [id]/email/route.ts
│   │   │   ├── [id]/status/route.ts
│   │   │   └── [id]/route.ts
│   │   ├── webhooks/
│   │   │   └── n8n/route.ts
│   │   ├── forms/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   └── health/route.ts
│   │
│   ├── layout.tsx
│   ├── globals.css
│   └── not-found.tsx
│
├── components/
│   ├── ui/
│   ├── auth/
│   ├── dashboard/
│   ├── leads/
│   ├── forms/
│   ├── charts/
│   ├── marketing/
│   └── shared/
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── admin.ts
│   │   └── middleware.ts
│   ├── ai/
│   │   ├── openai.ts
│   │   ├── schemas.ts
│   │   ├── analyze-lead.ts
│   │   ├── generate-reply.ts
│   │   └── prompts.ts
│   ├── n8n/
│   │   ├── client.ts
│   │   └── signature.ts
│   ├── email/
│   │   ├── resend.ts
│   │   └── templates.ts
│   ├── validations/
│   │   ├── lead.ts
│   │   ├── form.ts
│   │   ├── organization.ts
│   │   └── auth.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   ├── format.ts
│   │   ├── dates.ts
│   │   ├── score.ts
│   │   ├── constants.ts
│   │   └── security.ts
│   └── types/
│       ├── database.ts
│       ├── lead.ts
│       └── api.ts
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_seed_demo_data.sql
│   │   └── 004_functions.sql
│   ├── seed.sql
│   └── config.toml
│
├── n8n/
│   ├── leadpilot-lead-received-workflow.json
│   ├── README.md
│   └── screenshots/
│
├── public/
│   ├── logo.svg
│   ├── og-image.png
│   └── screenshots/
│
├── docs/
│   ├── architecture.md
│   ├── setup.md
│   ├── demo-script.md
│   ├── security.md
│   └── api.md
│
├── .env.example
├── README.md
├── package.json
└── middleware.ts

====================================================
6. DISEÑO Y EXPERIENCIA DE USUARIO
====================================================

Estilo visual:
- SaaS B2B moderno.
- Profesional, claro y sobrio.
- Fondo claro gris muy suave o blanco.
- Sidebar oscuro azul marino.
- Color de marca principal: azul eléctrico o violeta.
- Verde para success/won.
- Amarillo/ámbar para leads templados.
- Naranja para hot.
- Rojo para urgent.
- Tipografía: Inter o Geist.
- Componentes consistentes.
- Diseño responsive, pero desktop-first para dashboard.
- Modo oscuro opcional, no obligatorio para MVP.

Marca:
- Nombre: LeadPilot AI.
- Logo: icono abstracto de radar, flecha de navegación o rayo de automatización.
- Eslogan: “Cada lead, atendido a tiempo.”

Estados de prioridad:
- cold: gris/azul apagado.
- warm: amarillo.
- hot: naranja.
- urgent: rojo.

Estados comerciales:
- new: gris.
- contacted: azul.
- qualified: violeta.
- won: verde.
- lost: rojo suave.
- archived: gris oscuro.

Componentes a crear:
- AppSidebar.
- MobileSidebar.
- Topbar.
- PageHeader.
- KPIStatCard.
- PriorityBadge.
- LeadStatusBadge.
- ScoreRing.
- LeadTable.
- LeadFilters.
- LeadDetailHeader.
- LeadTimeline.
- AIAnalysisCard.
- SuggestedReplyCard.
- ActivityItem.
- EmptyState.
- LoadingSkeleton.
- ErrorState.
- ConfirmDialog.
- FormBuilderPreview.
- PublicLeadForm.
- CopyEmbedCodeButton.
- AutomationStatusCard.
- NotificationSettingsForm.

====================================================
7. PÁGINAS Y FUNCIONALIDADES
====================================================

7.1 Landing page: "/"

Objetivo:
Presentar producto, mostrar demo y permitir registro.

Secciones:
1. Hero.
   - Título: “No pierdas otro cliente por responder tarde.”
   - Subtítulo: “LeadPilot AI recibe, entiende, clasifica y sigue tus leads automáticamente.”
   - CTA principal: “Ver demo”.
   - CTA secundario: “Crear cuenta gratis”.
   - Mockup visual del dashboard.

2. Problema.
   - “Los leads no esperan.”
   - Tres tarjetas:
     - Formularios sin responder.
     - Oportunidades que se enfrían.
     - Equipos sin CRM ni seguimiento.

3. Cómo funciona.
   - Recibe.
   - Analiza.
   - Prioriza.
   - Responde.
   - Hace seguimiento.

4. Características.
   - Clasificación con IA.
   - Respuesta automática personalizada.
   - Alertas para leads importantes.
   - Dashboard centralizado.
   - Integraciones con n8n.

5. Caso de uso.
   - Para agencias, clínicas, inmobiliarias y negocios de servicios.

6. CTA final.
   - “Convierte consultas en ventas.”
   - Botón de registro.

7. Footer.
   - Demo.
   - Privacidad.
   - GitHub.
   - Contacto.

7.2 Autenticación

Rutas:
- /login
- /register
- /forgot-password

Registro:
- Nombre.
- Email.
- Contraseña.
- Nombre de empresa.
- Industria.
- Idioma preferido.
- Checkbox términos.
- Al registrarse:
  - Crear usuario en Supabase Auth.
  - Crear organization.
  - Crear membership con role owner.
  - Crear formulario por defecto.
  - Crear configuración por defecto.
  - Redirigir a onboarding/dashboard.

Login:
- Email y contraseña.
- Enlace a registro.
- Recuperar contraseña.
- Manejar errores de Supabase claramente.

7.3 Onboarding

Puede ser modal o ruta inicial dentro de dashboard.

Preguntas:
- ¿Cómo se llama tu empresa?
- ¿Qué tipo de negocio tienes?
- ¿Qué servicios vendes?
- ¿Cuál es tu email de contacto?
- ¿Cómo quieres que hable la IA?
  - Profesional.
  - Cercano.
  - Premium.
  - Directo.
- ¿Quieres activar envío automático de respuestas?
  - Desactivado por defecto.
- ¿A qué Telegram/chat quieres recibir leads urgentes?
  - Mostrar “próximamente” si no se configura completamente.

Al terminar:
- Guardar organization settings.
- Crear un formulario inicial “Formulario web principal”.
- Mostrar dashboard con datos demo o estado vacío.

7.4 Dashboard: "/dashboard"

Elementos:
- Saludo con nombre de empresa.
- Selector de rango de fechas.
- Botón “Nuevo lead”.
- Botón “Ver formulario”.
- Botón “Copiar código embed”.

KPIs:
- Leads nuevos.
- Leads calientes/urgentes.
- Tasa de cualificación.
- Leads ganados.
- Tiempo medio de respuesta.
- Automatizaciones correctas/fallidas.

Widgets:
- Gráfico de leads por día.
- Gráfico de distribución por prioridad.
- Tabla de leads recientes.
- Tarjeta de “requieren atención”.
- Tarjeta de actividad reciente.
- Estado de automatizaciones.

Comportamiento:
- Si no hay leads: mostrar Empty State elegante con botón “Crear lead de prueba” y “Abrir formulario”.
- El botón de lead de prueba debe crear un lead demo con análisis simulado o real.

7.5 Lista de leads: "/dashboard/leads"

Tabla:
- Nombre.
- Empresa.
- Email.
- Teléfono.
- Servicio/interés.
- Prioridad.
- Score.
- Estado.
- Fecha.
- Acciones.

Filtros:
- Búsqueda por nombre, email, empresa o contenido.
- Prioridad.
- Estado.
- Servicio.
- Fecha.
- Solo no respondidos.
- Solo urgentes.
- Score mínimo.

Acciones masivas no obligatorias para MVP.
Acciones por fila:
- Abrir detalle.
- Cambiar estado.
- Reanalizar.
- Archivar.

Paginación:
- 20 por página.
- Query params en URL.

7.6 Detalle de lead: "/dashboard/leads/[id]"

Diseño:
Dos columnas en escritorio.

Columna izquierda:
- Nombre y empresa.
- Email y teléfono.
- Fecha de entrada.
- Fuente.
- Score y prioridad.
- Estado con selector.
- Etiquetas.
- Información original del formulario.
- Notas internas editables.
- Timeline de actividad.

Columna derecha:
- Tarjeta de análisis IA:
  - Resumen.
  - Intención.
  - Servicio de interés.
  - Presupuesto estimado.
  - Urgencia.
  - Sentimiento.
  - Dolor/problema.
  - Objeciones.
  - Siguiente acción recomendada.
  - Razón del score.
  - Confianza del modelo.
- Tarjeta de respuesta sugerida:
  - Asunto.
  - Cuerpo.
  - Editor editable.
  - Botón “Regenerar”.
  - Botón “Enviar email”.
  - Botón “Copiar”.
  - Toggle para marcar “respuesta enviada”.
- Tarjeta de automatizaciones:
  - Estado de notificación Telegram.
  - Estado de webhook n8n.
  - Estado de email.
  - Botón “Reintentar flujo”.

Acciones:
- Cambiar status.
- Editar lead.
- Añadir nota.
- Añadir etiqueta.
- Reanalizar con IA.
- Generar nueva respuesta.
- Enviar email.
- Archivar.
- Eliminar con confirmación.

7.7 Crear lead manual: "/dashboard/leads/new"

Formulario:
- Nombre completo.
- Empresa.
- Email.
- Teléfono.
- Sitio web.
- Servicio/interés.
- Presupuesto.
- Urgencia.
- Mensaje.
- Fuente.
- Checkbox “Analizar con IA al crear”.
- Botón “Crear lead”.

Uso:
Permite hacer una demo incluso sin formulario público.

7.8 Formularios y embed: "/dashboard/embed"

Objetivo:
Dar al usuario un formulario público que pueda enlazar o insertar.

Mostrar:
- URL pública:
  https://dominio.com/f/[publicId]
- Botón copiar URL.
- Código iframe.
- Código HTML opcional.
- Vista previa.
- Configuración básica:
  - Título del formulario.
  - Subtítulo.
  - Campos activados.
  - Color principal.
  - Mensaje de éxito.
  - Servicio por defecto.
  - Redirect URL opcional.
  - Captura de consentimiento de privacidad.

Para MVP:
No construir un builder complejo.
Permitir editar solo:
- nombre formulario
- título
- subtítulo
- color
- activar/desactivar teléfono
- activar/desactivar empresa
- activar/desactivar presupuesto
- activar/desactivar urgencia
- campos extra opcionales

7.9 Página pública de formulario: "/f/[publicId]"

Debe:
- Cargar datos de formulario por public_id.
- Mostrar branding de la organización.
- Validar inputs.
- Tener honeypot anti-spam.
- Permitir mensaje de consentimiento.
- Enviar a POST /api/public/leads.
- Mostrar loading claro.
- Mostrar éxito sin filtrar datos sensibles.
- Si hay error, permitir reintento.
- Ser responsive y profesional.

Campos sugeridos:
- Nombre completo.
- Email.
- Teléfono.
- Empresa.
- Servicio que te interesa.
- Presupuesto aproximado.
- Cuándo quieres empezar.
- Cuéntanos qué necesitas.
- Campo honeypot invisible: website.

7.10 Automatizaciones: "/dashboard/automations"

Objetivo:
Mostrar de forma visual qué ocurre al llegar un lead.

Tarjetas:
1. “Análisis IA”.
   - Toggle enabled.
   - Estado: activo, error, pendiente.
2. “Notificar leads calientes”.
   - Umbral score configurable.
   - Canales: Telegram, email, webhook.
3. “Respuesta automática por email”.
   - Toggle disabled por defecto.
   - Aviso de revisión humana.
4. “Seguimiento automático”.
   - Mostrar como coming soon o implementar tarea de seguimiento en 24h.
5. “Enviar a CRM”.
   - Coming soon.
6. “Webhook n8n”.
   - URL configurada.
   - Estado de último envío.
   - Botón de prueba.

Cada automatización debe registrar eventos en automation_logs.

7.11 Configuración: "/dashboard/settings"

Tabs:
- Empresa.
- IA.
- Notificaciones.
- Equipo.
- Seguridad.

Empresa:
- Nombre.
- Industria.
- Logo opcional.
- Sitio web.
- Descripción.
- Servicios.
- Email de contacto.
- Zona horaria.
- Idioma.

IA:
- Tono de respuesta.
- Instrucciones personalizadas.
- Score mínimo para alertas.
- Activar análisis automático.
- Activar generación automática de respuesta.
- Modelo configurable solo si es seguro; si no, ocultar del cliente.

Notificaciones:
- Email de alertas.
- Telegram chat ID.
- Activar alertas para:
  - hot.
  - urgent.
  - lead con presupuesto alto.
- Webhook n8n URL.
- Secret del webhook.
- Botón “Enviar prueba”.

Equipo:
- Para MVP, mostrar owner actual.
- Invitaciones como “Próximamente” o implementar posteriormente.

Seguridad:
- Cambiar contraseña.
- Eliminar organización.
- Exportar datos como “Próximamente”.

====================================================
8. MODELO DE DATOS SUPABASE
====================================================

Usar UUIDs como primary keys.
Usar created_at y updated_at en casi todas las tablas.
Usar triggers para updated_at.
Activar RLS en todas las tablas con datos privados.

ENUMS:

create type public.member_role as enum (
  'owner',
  'admin',
  'member'
);

create type public.lead_status as enum (
  'new',
  'contacted',
  'qualified',
  'won',
  'lost',
  'archived'
);

create type public.lead_priority as enum (
  'cold',
  'warm',
  'hot',
  'urgent'
);

create type public.analysis_status as enum (
  'pending',
  'processing',
  'completed',
  'failed'
);

create type public.activity_type as enum (
  'lead_created',
  'lead_updated',
  'lead_analyzed',
  'lead_reanalyzed',
  'note_added',
  'status_changed',
  'email_generated',
  'email_sent',
  'email_simulated',
  'notification_sent',
  'automation_failed',
  'automation_retried',
  'webhook_sent',
  'webhook_failed'
);

create type public.automation_event_status as enum (
  'pending',
  'success',
  'failed',
  'skipped'
);

TABLA: profiles

Propósito:
Datos públicos/operativos básicos de cada usuario autenticado.

Campos:
- id uuid primary key references auth.users(id) on delete cascade
- full_name text
- avatar_url text nullable
- created_at timestamptz default now()
- updated_at timestamptz default now()

TABLA: organizations

Campos:
- id uuid primary key default gen_random_uuid()
- name text not null
- slug text unique not null
- industry text nullable
- website text nullable
- description text nullable
- logo_url text nullable
- contact_email text nullable
- timezone text not null default 'Europe/Madrid'
- locale text not null default 'es'
- ai_tone text not null default 'professional'
- ai_custom_instructions text nullable
- score_alert_threshold integer not null default 70
- auto_analyze_enabled boolean not null default true
- auto_generate_reply_enabled boolean not null default true
- auto_send_reply_enabled boolean not null default false
- notification_email text nullable
- telegram_chat_id text nullable
- n8n_webhook_url text nullable
- n8n_webhook_secret text nullable
- created_at timestamptz default now()
- updated_at timestamptz default now()

Validaciones:
- score_alert_threshold entre 0 y 100.
- slug único.
- ai_tone solo valores permitidos, por ejemplo:
  professional, friendly, premium, direct.

TABLA: organization_members

Campos:
- id uuid primary key default gen_random_uuid()
- organization_id uuid references organizations(id) on delete cascade
- user_id uuid references auth.users(id) on delete cascade
- role member_role not null default 'member'
- created_at timestamptz default now()
- unique(organization_id, user_id)

TABLA: forms

Campos:
- id uuid primary key default gen_random_uuid()
- organization_id uuid references organizations(id) on delete cascade
- public_id uuid unique not null default gen_random_uuid()
- name text not null default 'Formulario web principal'
- title text not null default 'Cuéntanos cómo podemos ayudarte'
- subtitle text nullable
- success_title text not null default '¡Gracias por contactarnos!'
- success_message text not null default 'Hemos recibido tu solicitud y te responderemos lo antes posible.'
- primary_color text not null default '#6366F1'
- fields_config jsonb not null default jsonb_build_object(...)
- privacy_text text nullable
- redirect_url text nullable
- is_active boolean not null default true
- created_at timestamptz default now()
- updated_at timestamptz default now()

fields_config ejemplo:
{
  "full_name": { "enabled": true, "required": true },
  "email": { "enabled": true, "required": true },
  "phone": { "enabled": true, "required": false },
  "company": { "enabled": true, "required": false },
  "service": { "enabled": true, "required": false },
  "budget": { "enabled": true, "required": false },
  "urgency": { "enabled": true, "required": false },
  "message": { "enabled": true, "required": true }
}

TABLA: leads

Campos:
- id uuid primary key default gen_random_uuid()
- organization_id uuid references organizations(id) on delete cascade
- form_id uuid nullable references forms(id) on delete set null
- public_reference text unique not null
- full_name text not null
- email text not null
- phone text nullable
- company text nullable
- website text nullable
- service_interest text nullable
- budget_range text nullable
- urgency_input text nullable
- message text nullable
- source text not null default 'form'
- status lead_status not null default 'new'
- priority lead_priority nullable
- score integer nullable
- assigned_to uuid nullable references auth.users(id) on delete set null
- tags text[] not null default '{}'
- internal_notes text nullable
- analysis_status analysis_status not null default 'pending'
- analyzed_at timestamptz nullable
- last_contacted_at timestamptz nullable
- responded_at timestamptz nullable
- metadata jsonb not null default '{}'::jsonb
- created_at timestamptz default now()
- updated_at timestamptz default now()

Validaciones:
- score null o entre 0 y 100.
- email con validación en aplicación.
- source puede ser form, manual, import, api, demo.
- public_reference debe tener formato legible:
  LP-YYYYMMDD-XXXX

TABLA: lead_ai_analyses

Campos:
- id uuid primary key default gen_random_uuid()
- lead_id uuid unique references leads(id) on delete cascade
- organization_id uuid references organizations(id) on delete cascade
- model text not null
- prompt_version text not null default 'v1'
- summary text nullable
- intent text nullable
- service_interest text nullable
- estimated_budget text nullable
- urgency_level text nullable
- sentiment text nullable
- pain_points jsonb not null default '[]'::jsonb
- objections jsonb not null default '[]'::jsonb
- recommended_next_action text nullable
- score_reasoning text nullable
- confidence integer nullable
- structured_data jsonb not null default '{}'::jsonb
- raw_response jsonb nullable
- created_at timestamptz default now()
- updated_at timestamptz default now()

Validaciones:
- confidence entre 0 y 100.

TABLA: lead_messages

Propósito:
Guardar borradores y correos enviados.

Campos:
- id uuid primary key default gen_random_uuid()
- lead_id uuid references leads(id) on delete cascade
- organization_id uuid references organizations(id) on delete cascade
- direction text not null check (direction in ('outbound', 'inbound'))
- channel text not null check (channel in ('email', 'whatsapp', 'manual', 'system'))
- subject text nullable
- body text not null
- status text not null check (status in ('draft', 'sent', 'failed', 'simulated'))
- provider_message_id text nullable
- sent_by uuid nullable references auth.users(id) on delete set null
- sent_at timestamptz nullable
- metadata jsonb not null default '{}'::jsonb
- created_at timestamptz default now()

TABLA: lead_activities

Campos:
- id uuid primary key default gen_random_uuid()
- lead_id uuid references leads(id) on delete cascade
- organization_id uuid references organizations(id) on delete cascade
- actor_user_id uuid nullable references auth.users(id) on delete set null
- type activity_type not null
- title text not null
- description text nullable
- metadata jsonb not null default '{}'::jsonb
- created_at timestamptz default now()

TABLA: automation_logs

Campos:
- id uuid primary key default gen_random_uuid()
- organization_id uuid references organizations(id) on delete cascade
- lead_id uuid nullable references leads(id) on delete cascade
- automation_name text not null
- event_name text not null
- status automation_event_status not null
- request_payload jsonb nullable
- response_payload jsonb nullable
- error_message text nullable
- attempt_count integer not null default 1
- executed_at timestamptz default now()
- created_at timestamptz default now()

TABLA: api_events

Opcional para auditoría de endpoints públicos.

Campos:
- id uuid primary key default gen_random_uuid()
- event_type text not null
- form_id uuid nullable references forms(id) on delete set null
- ip_hash text nullable
- user_agent text nullable
- payload_summary jsonb nullable
- status_code integer nullable
- created_at timestamptz default now()

ÍNDICES RECOMENDADOS:
- leads(organization_id, created_at desc)
- leads(organization_id, status)
- leads(organization_id, priority)
- leads(organization_id, score desc)
- leads(organization_id, email)
- lead_activities(lead_id, created_at desc)
- automation_logs(lead_id, executed_at desc)
- forms(public_id)
- organization_members(user_id, organization_id)

====================================================
9. ROW LEVEL SECURITY
====================================================

Principio:
Un usuario solo puede leer y modificar información de organizaciones de las que sea miembro.

Crear helper SQL:

create or replace function public.is_org_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = target_organization_id
      and om.user_id = auth.uid()
  );
$$;

Crear helper para owner/admin si hace falta:

create or replace function public.has_org_role(
  target_organization_id uuid,
  allowed_roles public.member_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = target_organization_id
      and om.user_id = auth.uid()
      and om.role = any(allowed_roles)
  );
$$;

Políticas mínimas:

profiles:
- User can select own profile.
- User can update own profile.
- User can insert own profile after auth signup via trigger or server.

organizations:
- Members can select their organization.
- Owners/admins can update organization.
- Insert only through secure server action, Edge Function o trigger.
- Delete only owner.

organization_members:
- Members can view memberships of their org.
- Owner/admin can add/remove member.
- User cannot arbitrarily give themselves admin role.

forms:
- Org members can select forms.
- Owner/admin can create/update/delete forms.
- Público no puede consultar tabla directamente.
- Formulario público se obtiene desde endpoint seguro que expone solo campos permitidos.

leads:
- Org members can select leads.
- Org members can create internal leads.
- Org members can update leads.
- Owner/admin can delete leads.
- Público no tiene INSERT directo en tabla leads.
- El formulario público usa backend con service role o Edge Function segura, validando form public_id.

lead_ai_analyses:
- Org members can select.
- Solo backend seguro puede insert/update.
- Nunca permitir insert público desde cliente.

lead_messages:
- Org members can select/create drafts.
- Backend seguro gestiona estado “sent”.
- No permitir que un cliente marque un email como enviado sin pasar por endpoint seguro.

lead_activities:
- Org members can select.
- Backend y usuarios autenticados pueden insertar actividad según reglas.
- Preferible: todas las actividades importantes las escribe servidor.

automation_logs:
- Org members pueden leer logs de su organización.
- Solo backend escribe logs.

IMPORTANTE:
No usar service role en navegador.
No guardar n8n_webhook_secret visible en cliente.
Si se guarda secreto en organizations, no devolverlo desde queries normales al frontend.
Opción recomendada:
- Crear tabla organization_integrations separada.
- Protegerla mediante endpoint de servidor.
- En frontend mostrar solo “configurado / no configurado”.

====================================================
10. ESQUEMAS ZOD
====================================================

Crear schemas claros y reutilizables.

10.1 PublicLeadSchema:

Campos:
- formPublicId: z.string().uuid()
- fullName: z.string().min(2).max(100)
- email: z.string().email().max(254)
- phone: z.string().max(30).optional().or(z.literal(''))
- company: z.string().max(150).optional().or(z.literal(''))
- website: z.string().max(200).optional().or(z.literal(''))
- serviceInterest: z.string().max(150).optional().or(z.literal(''))
- budgetRange: z.string().max(100).optional().or(z.literal(''))
- urgencyInput: z.string().max(100).optional().or(z.literal(''))
- message: z.string().min(10).max(5000)
- consent: z.boolean().optional()
- honeypot: z.string().max(0)
- submittedAt: z.number().optional()

Validación adicional:
- Rechazar si honeypot tiene contenido.
- Rechazar si tiempo de rellenado inferior a 1.5 segundos, si se implementa timestamp.
- Limitar origen o usar rate-limit por IP hash.

10.2 CreateManualLeadSchema:
Similar, sin formPublicId y con:
- source: z.enum(['manual', 'demo']).default('manual')
- analyzeWithAI: z.boolean().default(true)

10.3 UpdateLeadSchema:
- status opcional.
- priority opcional.
- score opcional entre 0 y 100.
- tags array máximo 20.
- internalNotes máximo 5000.
- assignedTo UUID opcional.

10.4 LeadAIAnalysisSchema:

La respuesta de IA DEBE cumplir este esquema exacto:
{
  "summary": string,
  "intent": "request_quote" | "book_call" | "information" | "support" | "complaint" | "other",
  "service_interest": string | null,
  "estimated_budget": "low" | "medium" | "high" | "unknown",
  "urgency_level": "low" | "medium" | "high" | "critical",
  "sentiment": "positive" | "neutral" | "negative" | "mixed",
  "pain_points": string[],
  "objections": string[],
  "lead_score": number,
  "priority": "cold" | "warm" | "hot" | "urgent",
  "score_reasoning": string,
  "recommended_next_action": string,
  "suggested_response": {
    "subject": string,
    "body": string
  },
  "confidence": number,
  "requires_human_review": boolean
}

Validar:
- lead_score integer 0..100.
- confidence integer 0..100.
- max pain_points 5.
- max objections 5.
- subject máximo 180 caracteres.
- body máximo 4000 caracteres.

====================================================
11. LÓGICA DE IA
====================================================

Principio:
La IA ayuda a priorizar y redactar, pero no toma decisiones irreversibles sin control.
Nunca debe:
- Inventar servicios, precios, disponibilidad, plazos ni políticas de empresa.
- Hacer promesas comerciales no autorizadas.
- Dar asesoramiento legal, médico o financiero.
- Enviar un email automáticamente si auto_send_reply_enabled es false.
- Marcar un lead como won o lost.
- Eliminar información.
- Exponer instrucciones internas, secretos o datos de otros leads.

Entrada a IA:
- Nombre.
- Empresa.
- Servicio indicado.
- Presupuesto indicado.
- Urgencia indicada.
- Mensaje del cliente.
- Industria de la empresa.
- Servicios de la organización.
- Tono.
- Instrucciones personalizadas de IA.
- Idioma de la organización.
- Fecha/hora contextual si es relevante.

Prompt de sistema recomendado:

“Eres LeadPilot AI, un asistente de cualificación de leads para una empresa de servicios.
Tu trabajo es analizar únicamente la información proporcionada sobre un lead y devolver datos estructurados.
No inventes datos, servicios, precios, disponibilidad ni promesas.
Si una información no existe, usa null, ‘unknown’ o una respuesta prudente.
Clasifica el nivel de interés comercial basándote en urgencia, claridad de necesidad, presupuesto, encaje y disposición de contacto.
La respuesta sugerida debe ser breve, natural, profesional y estar escrita en el idioma indicado.
No debes afirmar que una persona concreta revisará el caso, salvo que esa información aparezca en las instrucciones.
No menciones que eres una IA.
No uses lenguaje manipulador ni exagerado.
Respeta exactamente el JSON Schema solicitado.”

Prompt de usuario recomendado:

“Organización:
Nombre: {organizationName}
Industria: {industry}
Descripción: {organizationDescription}
Servicios: {services}
Idioma: {locale}
Tono: {aiTone}
Instrucciones adicionales: {customInstructions}

Lead:
Nombre: {fullName}
Empresa: {company}
Email: {email}
Teléfono: {phone}
Sitio web: {website}
Servicio seleccionado: {serviceInterest}
Presupuesto declarado: {budgetRange}
Urgencia declarada: {urgencyInput}
Mensaje:
{message}

Analiza el lead y devuelve la respuesta estrictamente conforme al schema solicitado.”

Reglas de score orientativas:
- +25 si solicita presupuesto o presupuesto explícito.
- +20 si quiere empezar pronto.
- +15 si deja teléfono.
- +15 si describe un problema concreto.
- +10 si es una empresa claramente definida.
- +10 si solicita llamada, demo o reunión.
- -20 si parece spam.
- -10 si el mensaje es demasiado genérico.
- -15 si solo pide información sin intención clara.

Estas reglas pueden ser referencia para la IA, no cálculo rígido.
Para máxima consistencia, añadir función local posterior:
- Validar que score y prioridad sean coherentes.
- Ejemplo:
  - 0-29: cold
  - 30-59: warm
  - 60-79: hot
  - 80-100: urgent
- Si IA devuelve prioridad incoherente con score, normalizar con función de servidor.

Uso de Structured Outputs:
- Configurar JSON Schema estricto.
- Validar respuesta con Zod.
- Si falla:
  1. Registrar error.
  2. Reintentar una vez con prompt de corrección.
  3. Si vuelve a fallar, marcar analysis_status = failed.
  4. No bloquear el lead.
- Guardar modelo y prompt_version.
- No guardar secretos en raw_response.

La API de OpenAI permite forzar salidas con forma de JSON Schema mediante Structured Outputs; aun así, valida la salida en servidor y contempla rechazos o errores como flujo normal. [40][42][47]

====================================================
12. ENDPOINTS
====================================================

12.1 POST /api/public/leads

Propósito:
Recibir una solicitud desde formulario público.

Autenticación:
Pública, pero protegida con:
- Rate limit.
- Honeypot.
- Validación de formPublicId.
- Validación Zod.
- Verificación de formulario activo.

Request:
{
  "formPublicId": "uuid",
  "fullName": "Ana García",
  "email": "ana@empresa.com",
  "phone": "+34...",
  "company": "Empresa SL",
  "website": "",
  "serviceInterest": "Automatización de ventas",
  "budgetRange": "1000-3000",
  "urgencyInput": "Este mes",
  "message": "Queremos automatizar...",
  "consent": true,
  "honeypot": ""
}

Proceso:
1. Validar body.
2. Aplicar anti-spam.
3. Buscar form por public_id e is_active = true.
4. Crear lead con analysis_status pending.
5. Crear activity “Lead recibido”.
6. Procesar IA.
7. Guardar análisis y actualizar score, prioridad, analysis_status.
8. Crear activity de análisis.
9. Lanzar webhook n8n sin bloquear respuesta si es posible.
10. Devolver:
{
  "success": true,
  "reference": "LP-20261005-A8K2",
  "message": "Hemos recibido tu solicitud."
}

Errores:
- 400 validación.
- 404 formulario no existe/inactivo.
- 429 límite excedido.
- 500 error inesperado.
Nunca exponer detalles de Supabase, OpenAI ni n8n al visitante.

12.2 POST /api/leads/[id]/analyze

Autenticación:
Usuario autenticado y miembro de organización.

Proceso:
- Confirmar acceso al lead por RLS / server-side org check.
- Cambiar status processing.
- Llamar IA.
- Guardar/upsert lead_ai_analyses.
- Actualizar lead score/priority/analysis_status/analyzed_at.
- Crear activity.
- Llamar automatización si corresponde.
- Retornar análisis estructurado.

12.3 PATCH /api/leads/[id]

Propósito:
Actualizar status, notas, tags, assigned user o campos editables.

Seguridad:
- Autenticación.
- Verificar organización.
- Validar schema.
- Registrar cambios en timeline.

12.4 POST /api/leads/[id]/email

Request:
{
  "subject": "Gracias por contactar con Nova Growth",
  "body": "Hola Ana,...",
  "mode": "send" | "simulate"
}

Proceso:
- Validar permisos.
- Crear lead_messages como draft.
- Si mode simulate, marcar simulated y crear activity.
- Si mode send:
  - Comprobar configuración Resend.
  - Enviar email.
  - Guardar provider message id.
  - Marcar sent.
  - Actualizar last_contacted_at.
  - Cambiar lead status de new a contacted si procede.
  - Crear activity.
- Si envío falla:
  - Guardar failed.
  - Crear automation_log failure.
  - Retornar error controlado.

12.5 POST /api/webhooks/n8n

Propósito:
Endpoint opcional para recibir callbacks desde n8n.
Por ejemplo:
- “telegram sent”.
- “crm sync completed”.
- “follow-up email sent”.
- “workflow failed”.

Seguridad:
- Validar firma HMAC.
- Validar timestamp para evitar replay attack.
- No aceptar datos sin signature correcta.

12.6 GET /api/health

Retornar:
{
  "status": "ok",
  "timestamp": "...",
  "services": {
    "database": "ok",
    "app": "ok"
  }
}

No exponer claves, modelos ni configuración interna.

====================================================
13. AUTOMATIZACIÓN N8N
====================================================

Nombre workflow:
LeadPilot — New Qualified Lead

Trigger:
Webhook node.
Método POST.
Path sugerido:
leadpilot-new-lead

Payload recibido:
{
  "event": "lead.analyzed",
  "timestamp": "ISO_DATE",
  "organization": {
    "id": "uuid",
    "name": "Nova Growth",
    "notification_email": "..."
  },
  "lead": {
    "id": "uuid",
    "reference": "LP-...",
    "name": "Ana García",
    "email": "ana@empresa.com",
    "phone": "+34...",
    "company": "Empresa SL",
    "message": "...",
    "score": 82,
    "priority": "urgent",
    "status": "new",
    "service_interest": "Automatización",
    "created_at": "ISO_DATE"
  },
  "analysis": {
    "summary": "...",
    "recommended_next_action": "...",
    "suggested_response_subject": "...",
    "suggested_response_body": "..."
  },
  "signature": "hmac..."
}

Workflow:
1. Webhook.
2. Validar firma HMAC.
3. IF priority es hot o urgent, o score >= threshold.
4. Formatear mensaje.
5. Telegram node: enviar alerta.
6. Opcional: email node con alerta al responsable.
7. HTTP Request node:
   - Callback a LeadPilot /api/webhooks/n8n
   - event: notification.sent
8. Si hay fallo:
   - Callback a LeadPilot /api/webhooks/n8n
   - event: notification.failed
   - Incluir error seguro.

Mensaje Telegram sugerido:

🔥 Nuevo lead prioritario: {{ $json.lead.priority.toUpperCase() }}

Nombre: {{ $json.lead.name }}
Empresa: {{ $json.lead.company || 'No indicada' }}
Score: {{ $json.lead.score }}/100
Interés: {{ $json.lead.service_interest || 'No indicado' }}

Resumen:
{{ $json.analysis.summary }}

Siguiente acción:
{{ $json.analysis.recommended_next_action }}

Email:
{{ $json.lead.email }}
Teléfono:
{{ $json.lead.phone || 'No indicado' }}

Enlace interno:
https://tu-dominio.com/dashboard/leads/{{ $json.lead.id }}

Manejo de errores n8n:
- Configurar Error Trigger si es posible.
- Guardar error en automation_logs mediante callback.
- Mostrar último estado en dashboard.
- Implementar reintento con máximo 3 intentos para webhook saliente.
- No enviar notificaciones duplicadas:
  - Incluir idempotency key en payload.
  - Ejemplo: leadId + eventName + analyzedAt.
  - n8n registra keys procesadas o backend evita reenvíos innecesarios.

Firma HMAC:
- Crear JSON consistente.
- Calcular HMAC SHA-256 con N8N_WEBHOOK_SECRET.
- Enviar headers:
  - x-leadpilot-signature
  - x-leadpilot-timestamp
  - x-leadpilot-event
- n8n verifica firma.
- Para demo se puede documentar una simplificación, pero el código debe dejar claro cómo se securiza en producción.

====================================================
14. VARIABLES DE ENTORNO
====================================================

Crear .env.example:

NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

OPENAI_API_KEY=
OPENAI_MODEL=

RESEND_API_KEY=
RESEND_FROM_EMAIL=

N8N_WEBHOOK_URL=
N8N_WEBHOOK_SECRET=

TELEGRAM_BOT_TOKEN=
TELEGRAM_DEFAULT_CHAT_ID=

RATE_LIMIT_MAX_REQUESTS=5
RATE_LIMIT_WINDOW_SECONDS=60

DEMO_MODE=true

Reglas:
- NEXT_PUBLIC_* solo para datos seguros que deben estar en navegador.
- Nunca exponer service role.
- Nunca exponer OpenAI key.
- Nunca exponer Resend key.
- Nunca exponer secretos n8n.
- Validar todas las variables en startup con Zod server env schema.
- Mostrar errores claros en desarrollo si falta configuración.
- En DEMO_MODE:
  - Permitir simular email.
  - Permitir IA mock si no existe OPENAI_API_KEY.
  - Mantener el producto navegable.

====================================================
15. MODO DEMO
====================================================

Objetivo:
Que el proyecto pueda verse y probarse aunque no estén configuradas todas las APIs de pago.

DEMO_MODE=true:
- Crear organización demo “Nova Growth”.
- Crear usuario demo solo para desarrollo local, o un botón de carga de datos demo.
- Crear 8 leads demo variados.
- 2 cold.
- 3 warm.
- 2 hot.
- 1 urgent.
- Incluir análisis IA guardados.
- Incluir timeline.
- Incluir logs de automatización.
- Envío de email se simula y queda registrado.
- Telegram se muestra como simulado si no hay token.
- Botón “Añadir lead demo” para mostrar actualización de UI.
- Si no hay OpenAI key:
  - Usar una función mock deterministicamente basada en palabras del mensaje.
  - El mock debe devolver exactamente el mismo schema que la IA real.
- Indicar con pequeña etiqueta en UI:
  “Modo demo: algunas acciones se están simulando.”

Datos demo sugeridos:

Lead 1:
- Ana García, Clínica Dental Sonrisa.
- Quiere automatizar respuestas de WhatsApp.
- Presupuesto 2.000–5.000€.
- Quiere empezar este mes.
- Score 88.
- Prioridad urgent.

Lead 2:
- Carlos Martín, Inmobiliaria Horizonte.
- Quiere recibir más información sobre automatización.
- No indica presupuesto.
- Score 54.
- Prioridad warm.

Lead 3:
- Laura Pérez, academia.
- Pide una demo.
- Score 72.
- Prioridad hot.

Lead 4:
- Mensaje genérico y sin teléfono.
- Score 22.
- Prioridad cold.

====================================================
16. FLUJOS PRINCIPALES
====================================================

Flujo A: visitante envía formulario

1. Usuario abre /f/[publicId].
2. Completa formulario.
3. Frontend valida.
4. POST /api/public/leads.
5. Backend verifica formulario activo.
6. Backend aplica anti-spam.
7. Backend crea lead.
8. Backend guarda actividad.
9. Backend analiza con IA.
10. Backend actualiza lead.
11. Backend guarda análisis y respuesta sugerida.
12. Backend envía evento a n8n.
13. Si score supera umbral:
    - n8n avisa por Telegram.
14. Usuario visitante recibe mensaje de éxito.
15. Empresa ve el lead inmediatamente en dashboard.

Flujo B: empresa revisa y responde

1. Usuario autenticado abre dashboard.
2. Ve lead hot o urgent.
3. Abre detalle.
4. Lee resumen y recomendación de IA.
5. Edita respuesta sugerida.
6. Pulsa enviar.
7. Aplicación registra email.
8. Cambia estado a contacted.
9. Añade actividad.
10. Muestra confirmación.

Flujo C: error IA

1. Se crea lead correctamente.
2. OpenAI falla o devuelve dato inválido.
3. analysis_status = failed.
4. Se registra automation_log.
5. UI muestra aviso:
   “El lead se guardó, pero el análisis no pudo completarse.”
6. Usuario pulsa “Reintentar análisis”.
7. Sistema vuelve a procesar.
8. Nunca se pierde el lead.

Flujo D: error n8n

1. IA termina correctamente.
2. App intenta enviar webhook.
3. n8n no responde o devuelve error.
4. Registrar automation_logs status failed.
5. No bloquear UI ni creación de lead.
6. Mostrar estado fallido y botón “Reintentar”.
7. Permitir retry manual.
8. Evitar duplicados mediante idempotency key.

====================================================
17. SEGURIDAD Y PRIVACIDAD
====================================================

Este producto manipula datos personales: nombre, email, teléfono, empresa y mensajes.
Implementar medidas mínimas reales.

Obligatorio:
- HTTPS en producción.
- RLS activado.
- Supabase Auth.
- Secretos solo en servidor.
- Zod en todas las entradas.
- Sanitización de contenido al renderizar.
- No usar dangerouslySetInnerHTML con textos de leads.
- Rate limit en endpoint público.
- Honeypot.
- Logs sin exponer datos sensibles innecesarios.
- Validación HMAC webhooks.
- Limitar tamaño de mensajes.
- CORS estricto si se habilita API externa.
- Evitar enumeración de formularios.
- IDs de formularios públicos no secuenciales.
- Tratamiento prudente de errores.
- No mostrar stack traces a usuario.

Privacidad y RGPD:
- Añadir checkbox de consentimiento opcional/configurable al formulario.
- Añadir enlace o placeholder de política de privacidad.
- Indicar que el proyecto es una demo si no se desarrolla política completa.
- Preparar estructura para exportación y borrado de datos.
- Al eliminar lead, borrar análisis, mensajes, logs y actividades mediante cascade.
- Añadir fecha de retención como futura configuración.

La autorización por filas de Supabase está diseñada para limitar el acceso por registros y se integra con Auth; mantén RLS activado para las tablas expuestas, con políticas explícitas de lectura y escritura. [44][46][50]

====================================================
18. ANALÍTICA
====================================================

MVP:
- Leads totales.
- Leads por prioridad.
- Leads por status.
- Leads por día.
- Tasa de leads cualificados:
  qualified + won dividido entre total.
- Tiempo estimado de primera respuesta:
  last_contacted_at - created_at.
- Conversión:
  won dividido entre total.
- Fuente del lead.

Página analytics:
- Rango: últimos 7, 30, 90 días.
- Gráfico lineal: leads por día.
- Donut: prioridad.
- Barras: status.
- Tabla: servicios más solicitados.
- KPI cards.

No inventar métricas:
- Si no existen datos suficientes, mostrar “Aún no hay datos suficientes”.
- No mostrar conversiones como si fueran reales cuando son demo.
- Si es modo demo, etiquetar gráficos como demo.

====================================================
19. ESTADOS VACÍOS, CARGA Y ERRORES
====================================================

Estados vacíos:
- No leads:
  “Aún no has recibido ningún lead.”
  Botones:
  - Abrir formulario.
  - Crear lead de prueba.
- No automatizaciones:
  “Conecta n8n para avisar a tu equipo cuando llegue un lead importante.”
- No análisis:
  “Este lead todavía no tiene análisis.”
  Botón “Analizar ahora”.
- Sin resultados de filtros:
  “No encontramos leads con estos filtros.”
  Botón “Limpiar filtros”.

Loading:
- Skeletons de dashboard.
- Skeleton de tabla.
- Skeleton de detalle.
- Estados de botón:
  - Analizando...
  - Enviando...
  - Guardando...
  - Reintentando...

Errores:
- Toast no técnico.
- Mensaje útil.
- Ejemplo:
  “No se pudo analizar el lead. El lead sigue guardado. Prueba de nuevo.”
- Panel técnico desplegable solo en desarrollo.
- Error boundary por secciones.

====================================================
20. PRUEBAS
====================================================

Pruebas unitarias obligatorias:
- calculatePriorityFromScore.
- validate AI analysis with Zod.
- HMAC signature generation/verification.
- PublicLeadSchema.
- Normalización de score/prioridad.
- Generación de referencia pública.
- Demo AI analyzer.

Pruebas de integración:
- Crear lead desde endpoint público con datos válidos.
- Rechazar honeypot.
- Rechazar formulario inexistente.
- Crear lead y análisis mock.
- Usuario de organización A no puede acceder a lead de organización B.
- Update lead genera activity.
- Envío simulado guarda lead_message.
- Error n8n se registra.

Pruebas manuales de UI:
- Registro.
- Login.
- Crear formulario.
- Abrir URL pública.
- Enviar lead.
- Ver lead en dashboard.
- Filtrar leads.
- Abrir detalle.
- Reanalizar.
- Editar y enviar/simular correo.
- Cambiar estado.
- Revisar actividad.
- Ver logs de automatización.
- Cerrar sesión.

Casos edge:
- Email inválido.
- Mensaje de 5.000 caracteres.
- Duplicado de email.
- Lead sin teléfono.
- IA sin API key.
- Respuesta IA incompleta.
- Webhook caído.
- Usuario sin organización.
- Formulario desactivado.
- Intento de acceso a ID de otra organización.
- Formulario enviado repetidamente.
- n8n reenvía callback duplicado.

====================================================
21. CRITERIOS DE ACEPTACIÓN
====================================================

El proyecto estará completo cuando:

1. Puedo registrarme y se crea una organización automáticamente.
2. Puedo acceder a un dashboard protegido.
3. Puedo crear o configurar un formulario.
4. Puedo abrir la URL pública del formulario sin iniciar sesión.
5. Puedo enviar un lead desde esa página.
6. El lead aparece en el dashboard.
7. Se genera un análisis IA estructurado o un mock consistente en modo demo.
8. El lead recibe score, prioridad y recomendación.
9. Veo una respuesta sugerida editable.
10. Puedo cambiar el status de un lead.
11. Puedo añadir notas y tags.
12. Las acciones quedan en timeline.
13. Puedo enviar o simular un email.
14. Puedo disparar una notificación hacia n8n.
15. El estado del workflow queda registrado.
16. Los datos de una organización no son visibles para otra.
17. No hay claves secretas expuestas en frontend.
18. El README permite instalar y ejecutar el proyecto.
19. El proyecto funciona con DEMO_MODE=true.
20. El sitio se adapta correctamente a móvil y escritorio.
21. Hay datos demo útiles para grabar una presentación.
22. Los errores no rompen la aplicación ni exponen información sensible.

====================================================
22. README OBLIGATORIO
====================================================

El README debe incluir:

1. Título y descripción:
“LeadPilot AI — Plataforma SaaS de cualificación y seguimiento de leads con IA.”

2. Capturas:
- Landing.
- Dashboard.
- Lista de leads.
- Detalle de lead.
- Formulario público.
- Workflow n8n.

3. Funcionalidades principales.

4. Arquitectura:
- Next.js.
- Supabase.
- OpenAI.
- n8n.
- Resend.

5. Requisitos:
- Node 20+.
- Cuenta Supabase.
- API key OpenAI o DEMO_MODE.
- n8n opcional.
- Resend opcional.

6. Instalación:
git clone ...
cd leadpilot-ai
npm install
cp .env.example .env.local
configurar variables
npm run dev

7. Base de datos:
- Crear proyecto Supabase.
- Ejecutar migraciones.
- Ejecutar seed.
- Configurar Auth.
- Configurar redirect URLs.

8. n8n:
- Importar JSON workflow.
- Añadir credenciales Telegram.
- Configurar webhook.
- Añadir secret.
- Probar evento.

9. Seguridad:
- RLS.
- Service role solo en servidor.
- Validación de entradas.
- Firmas webhook.

10. Modo demo:
- Cómo activarlo.
- Qué se simula.
- Cómo cargar datos demo.

11. Scripts:
- npm run dev
- npm run build
- npm run lint
- npm run typecheck
- npm run test
- npm run seed

12. Roadmap:
- HubSpot.
- WhatsApp Business.
- Stripe.
- Multi-equipo.
- Seguimientos automáticos.
- Lead scoring configurable.
- Agente conversacional.

====================================================
23. GUIÓN PARA VÍDEO DEMO
====================================================

Duración:
90 a 150 segundos.

Escena 1:
Abrir landing.
Decir:
“LeadPilot AI evita que una pyme pierda oportunidades por responder tarde a los formularios de su web.”

Escena 2:
Abrir formulario público.
Rellenar ejemplo:
“Somos una clínica dental y queremos automatizar la atención inicial por WhatsApp. Tenemos presupuesto de 3.000 euros y queremos empezar este mes.”

Escena 3:
Enviar formulario.

Escena 4:
Abrir dashboard.
Mostrar que ha entrado lead nuevo.

Escena 5:
Abrir detalle.
Mostrar:
- Score 88/100.
- Prioridad urgente.
- Resumen de IA.
- Dolor detectado.
- Siguiente paso recomendado.
- Respuesta sugerida.

Escena 6:
Mostrar Telegram o log n8n:
“Se ha enviado una alerta automática porque es un lead urgente.”

Escena 7:
Editar respuesta y simular envío de email.

Escena 8:
Cerrar:
“LeadPilot AI conecta formulario, IA, automatización y seguimiento comercial en un único flujo.”

====================================================
24. PLAN DE IMPLEMENTACIÓN PARA CURSOR
====================================================

Instrucciones generales para Cursor:
- No generar todo el proyecto en un único paso.
- Crear primero estructura, configuración y base de datos.
- Implementar en fases.
- Tras cada fase, ejecutar typecheck, lint y corregir errores.
- Nunca usar any salvo casos justificados.
- Crear tipos explícitos.
- Mantener componentes pequeños.
- Validar todo input externo.
- Añadir loading, error y empty states.
- No simular seguridad: aplicar RLS y checks de servidor reales.
- No poner claves en código.
- Escribir README al final.
- Añadir comentarios solo para explicar decisiones complejas.

FASE 0: Inicialización
1. Crear proyecto Next.js con TypeScript y App Router.
2. Instalar dependencias:
   - @supabase/supabase-js
   - @supabase/ssr
   - openai
   - zod
   - react-hook-form
   - @hookform/resolvers
   - lucide-react
   - clsx
   - tailwind-merge
   - date-fns
   - recharts
   - resend
3. Configurar Tailwind y shadcn/ui.
4. Crear estructura de carpetas.
5. Crear .env.example.
6. Implementar lib/env.ts para validar env del servidor.
7. Configurar ESLint, Prettier y TypeScript strict.

FASE 1: Supabase
1. Escribir migración inicial completa.
2. Crear enums y tablas.
3. Crear índices.
4. Crear trigger updated_at.
5. Crear trigger de profile tras signup si se usa.
6. Crear funciones helper RLS.
7. Activar RLS.
8. Crear políticas.
9. Crear seed demo.
10. Generar tipos de base de datos.

FASE 2: Auth y organización
1. Configurar clientes Supabase browser/server.
2. Implementar middleware de sesión.
3. Crear páginas login/register.
4. Crear flujo de onboarding.
5. Crear organization y membership al registro.
6. Crear formulario inicial automáticamente.
7. Proteger rutas dashboard.
8. Probar que usuario sin sesión no accede.

FASE 3: UI base
1. Implementar layout marketing.
2. Implementar layout dashboard.
3. Sidebar.
4. Topbar.
5. Theme visual.
6. Componentes reutilizables.
7. Estados loading/empty/error.
8. Landing page.

FASE 4: Leads internos
1. Crear lista leads.
2. Crear detalle lead.
3. Crear manual lead form.
4. Crear filtros.
5. Implementar status updates.
6. Notas, tags y activity timeline.
7. Crear dashboard con KPIs reales.

FASE 5: Formulario público
1. Página pública /f/[publicId].
2. Obtener configuración de forma segura.
3. Form dinámico según fields_config.
4. Endpoint POST público.
5. Honeypot, rate limit y validación.
6. Crear lead y activity.
7. Success state.
8. Embed page con URL y iframe code.

FASE 6: IA
1. Crear OpenAI client server-only.
2. Definir JSON Schema y Zod schema.
3. Crear prompt versionado.
4. Implementar analyzeLead.
5. Implementar mock analyzer para modo demo.
6. Guardar análisis.
7. Actualizar lead score/priority.
8. Añadir UI de análisis.
9. Añadir reanálisis.
10. Manejar errores robustamente.

FASE 7: Email y automatización
1. Implementar generación de respuesta.
2. Implementar modo simulate.
3. Implementar Resend si hay key.
4. Crear n8n client.
5. Implementar firma HMAC.
6. Enviar evento a n8n.
7. Crear automation logs.
8. Implementar callbacks.
9. Crear página automations.

FASE 8: Analytics, polish y despliegue
1. Implementar gráficas.
2. Mejorar responsive.
3. Optimizar accesibilidad.
4. Añadir metadata y OG.
5. Añadir tests.
6. Crear README.
7. Preparar deploy Vercel.
8. Probar build de producción.
9. Probar toda demo de punta a punta.
10. Crear capturas de pantalla y workflow n8n exportable.

====================================================
25. INSTRUCCIÓN FINAL PARA CURSOR
====================================================

Desarrolla LeadPilot AI como un SaaS B2B moderno, completo y desplegable, no como una maqueta estática.

Prioridades absolutas:
1. Que el flujo formulario -> lead -> IA -> dashboard funcione de verdad.
2. Que sea visualmente profesional.
3. Que esté protegido con autenticación y RLS.
4. Que tenga modo demo funcional.
5. Que la IA devuelva JSON validado y estructurado.
6. Que n8n se integre mediante webhook con firma.
7. Que todos los estados de carga, éxito y error sean claros.
8. Que el código sea mantenible y esté tipado.
9. Que haya documentación para ejecutar y enseñar el proyecto.
10. Que se pueda grabar un vídeo demo convincente en menos de tres minutos.

No recortes los fundamentos:
- No omitir migraciones SQL.
- No omitir políticas RLS.
- No usar datos hardcodeados fuera del modo demo.
- No exponer secretos.
- No dejar acciones con botones que no hacen nada.
- No usar respuestas IA sin validación.
- No dejar errores silenciosos.
- No considerar una feature terminada si no está conectada a UI, backend y base de datos.

====================================================
26. DECISIÓN FINAL: N8N OPCIONAL, INTERNO Y AUTOALOJADO
====================================================

n8n es una integración interna, opcional y autoalojada. LeadPilot AI debe
funcionar correctamente sin n8n, por lo que la ausencia del servicio o de su
configuración nunca puede bloquear la recepción, persistencia, análisis o
visualización de un lead.

Principios de la integración:

- Los clientes no acceden a n8n ni a sus workflows.
- No se exponen workflows, credenciales, URLs internas ni secretos a clientes.
- Los eventos enviados a n8n se firman mediante HMAC.
- Cada envío debe quedar registrado en logs.
- Los eventos deben ser idempotentes para evitar duplicados.
- Las llamadas deben tener un timeout explícito.
- Los fallos deben aplicar degradación segura: registrar el error y continuar el
  flujo principal de LeadPilot sin perder el lead.
