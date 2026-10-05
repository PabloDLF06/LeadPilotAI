> ## Lo que Codex ya ha hecho automáticamente
>
> Ha preparado el código de la aplicación, UI, migraciones, RLS, tests,
> workflows/exportaciones n8n, scripts de comprobación y documentación.
>
> ## Lo que tienes que hacer tú porque requiere tu cuenta o secreto
>
> Crear el proyecto Supabase, copiar URL y claves, configurar Auth y sus URLs,
> ejecutar las migraciones si no tienes CLI/MCP conectado, confirmar el email y
> configurar OpenAI, Resend, n8n, Vercel o credenciales de producción solo si
> quieres activar esas integraciones. No compartas nunca la service role key.

# Primer arranque de LeadPilot AI en Windows

Esta guía está escrita para ejecutar el repositorio desde PowerShell sin asumir
experiencia previa. La aplicación tiene dos niveles: puedes abrir la landing sin
Supabase, pero necesitas Supabase para Auth, dashboard, formularios, leads y
datos demo persistentes.

## 1. Qué necesitas instalar

- **Node.js 20 o superior**. El requisito está confirmado en `package.json`.
  Descárgalo desde [nodejs.org](https://nodejs.org/) usando la versión LTS.
- **PowerShell**, incluido en Windows.
- **Git** solo si vas a clonar o actualizar el repositorio. No es necesario para
  ejecutar una carpeta que ya tienes.
- **VS Code o Cursor** es opcional; sirve para editar archivos.
- **Supabase CLI** no es necesaria para el primer arranque recomendado: esta guía
  usa el SQL Editor de Supabase.
- **Docker** no es necesario para el primer arranque. n8n es opcional y no debe
  instalarse para probar el modo demo.

Comprueba Node y npm:

```powershell
node --version
npm --version
```

Node debe mostrar `v20.x` o superior.

## 2. Abrir PowerShell y entrar al proyecto

Abre el menú Inicio, escribe **PowerShell** y abre Windows PowerShell. Después
usa esta orden sustituyendo la ruta por la real:

```powershell
cd "C:\RUTA\A\TU\CARPETA\leadpilot-ai"
```

En este equipo, por ejemplo:

```powershell
cd "C:\Users\pfs02\OneDrive\Documentos\LeadPilotAI"
```

Comprueba que estás en la carpeta correcta:

```powershell
Get-ChildItem package.json
```

## Primeros tres comandos

Desde PowerShell, en la carpeta del proyecto:

1. `node --version` — debe mostrar Node `20.x` o superior.
2. `npm install` — debe terminar con las dependencias instaladas; puede mostrar
   avisos de auditoría sin impedir la instalación.
3. `npm run setup:demo` — crea `.env.local` desde `.env.example` solo si aún no
   existe; nunca sobrescribe una configuración existente.

Después ejecuta `npm run dev` y abre `http://localhost:3000`.

## 3. Comandos del primer arranque

Ejecuta las órdenes en este orden:

```powershell
node --version
npm --version
npm install
Copy-Item .env.example .env.local
npm run dev
```

Abre normalmente [http://localhost:3000](http://localhost:3000). Para detener
el servidor pulsa `Ctrl + C` en PowerShell.

En el `.env.local` inicial deja explícitamente:

```env
DEMO_MODE=true
N8N_ENABLED=false
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

No pongas claves inventadas en las variables de Supabase. El servidor puede
arrancar y mostrar la landing sin ellas, pero al intentar Auth o dashboard
verás que la configuración está incompleta.

## 4. Dos formas de probar

### A. Arranque visual mínimo

Sí es posible sin Supabase. Con el `.env.local` anterior puedes abrir la
landing, revisar estilos y consultar `/api/health`. No puedes registrar usuario,
entrar al dashboard, cargar el formulario público desde base de datos ni crear
leads: esas rutas dependen de Supabase real.

### B. Demo funcional completa

Requiere un proyecto Supabase gratuito, sus tres variables y las migraciones.
Después podrás registrar una cuenta, crear la organización y formulario inicial,
enviar leads, ejecutar el análisis mock, ver notificaciones y registrar emails
simulados. OpenAI, Resend y n8n no son necesarios para esta demo completa.

## 5. Configuración mínima de Supabase

1. Entra en [supabase.com](https://supabase.com/), crea un proyecto gratuito y
   espera a que la base de datos esté disponible.
2. En **Project Settings > API**, copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`.
   - **Publishable key** → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
   - **Secret key** → `SUPABASE_SECRET_KEY`, solo en `.env.local`.
   - Como fallback legacy se aceptan `NEXT_PUBLIC_SUPABASE_ANON_KEY` y
     `SUPABASE_SERVICE_ROLE_KEY`.
3. Nunca pegues la service role key en GitHub, en un componente de frontend, en
   un chat público ni en capturas de pantalla.
4. En **SQL Editor**, ejecuta los archivos completos, uno por uno y en este
   orden:

   ```text
   supabase/migrations/001_initial_schema.sql
   supabase/migrations/002_rls_policies.sql
   supabase/migrations/004_functions.sql
   supabase/migrations/005_public_lead_flow.sql
   supabase/migrations/006_n8n_integration.sql
   supabase/migrations/007_data_api_grants.sql
   supabase/migrations/003_seed_demo_data.sql   (opcional, dataset fijo)
   ```

   `003` es opcional y debe ejecutarse al final si quieres conservar el dataset
   fijo Nova Growth en un proyecto dedicado. No crea ni enlaza usuarios Auth.
   Para tu organización autenticada utiliza el botón **Cargar dataset demo** de
   `/dashboard/leads/new`, que es idempotente y solo está disponible con
   `DEMO_MODE=true` para owner/admin.
5. `supabase/seed.sql` es el entrypoint para Supabase CLI y usa `\ir`; no lo
   pegues directamente en el SQL Editor. Si usas CLI, descubre los comandos con
   `supabase --help`, enlaza el proyecto y ejecuta `supabase db reset` en un
   entorno local controlado.
6. En **Authentication > URL Configuration** configura:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/**`
   - Si quieres ser más restrictivo, añade también
     `http://localhost:3000/login` y `http://localhost:3000/register`.
7. En **Authentication > Providers**, deja habilitado Email. Si la confirmación
   está activa, tendrás que confirmar el correo antes de iniciar sesión.
8. Comprueba en **Table Editor** que existan `organizations`,
   `organization_members`, `forms`, `leads`, `lead_ai_analyses` y
   `internal_notifications`. En **Authentication > Policies** o desde SQL
   verifica que RLS esté habilitado y que no existan políticas `anon` de
   inserción para leads.

El seed SQL crea una organización fija llamada Nova Growth, pero no enlaza ningún
usuario Auth. Para una cuenta normal, omite `003` y usa “Cargar dataset demo”
después de registrarte.

Después completa `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICA
SUPABASE_SECRET_KEY=TU_SECRET_KEY
DEMO_MODE=true
N8N_ENABLED=false
```

Reinicia `npm run dev` después de modificar `.env.local`.

## 6. Plantilla completa de `.env.local`

### Obligatorias para dashboard/Auth

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICA
SUPABASE_SECRET_KEY=TU_SECRET_KEY
DEMO_MODE=true
```

### Opcionales para desarrollo

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RATE_LIMIT_MAX_REQUESTS=5
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_SALT=cambia-este-valor
TELEGRAM_BOT_TOKEN=
TELEGRAM_DEFAULT_CHAT_ID=
```

OpenAI vacío usa el mock. El email se registra como simulado; el envío real de
Resend no está conectado todavía en esta versión.

### Solo producción

```env
NEXT_PUBLIC_APP_URL=https://tu-dominio.example
DEMO_MODE=false
RATE_LIMIT_SALT=UN_SECRETO_ALEATORIO_LARGO
```

### Solo n8n

```env
N8N_ENABLED=false
N8N_WEBHOOK_URL=
N8N_WEBHOOK_SECRET=
N8N_CALLBACK_SECRET=
N8N_TIMEOUT_MS=5000
INTERNAL_AUTOMATION_SECRET=
```

Mantén `N8N_ENABLED=false` para el primer arranque.

## 7. Crear y probar la primera cuenta

1. Abre `/register`.
2. Introduce nombre, email y una contraseña de al menos 8 caracteres.
3. Si Supabase exige confirmación, abre el email y confirma la cuenta.
4. Abre `/login` e inicia sesión.
5. Comprueba que existe tu organización y el dashboard.
6. Entra en **Formulario y embed** y abre la URL pública.
7. Envía un lead de prueba desde el formulario.
8. Vuelve al dashboard y abre el lead. Con `DEMO_MODE=true` debe aparecer el
   análisis mock, score, prioridad y respuesta sugerida.
9. Pulsa el envío de email y confirma que queda como `simulated`; no se envía
   ningún correo externo.
10. Para varios registros, abre `/dashboard/leads/new` y pulsa **Cargar dataset
    demo**. Si lo repites, no duplica datos.
11. Revisa la actividad, la notificación interna y los logs n8n. Con n8n
    desactivado el estado esperado es `skipped`, no un error bloqueante.

## 8. Diagnóstico

- **“npm no se reconoce”**: instala Node.js LTS, cierra y vuelve a abrir
  PowerShell; comprueba `node --version` y `npm --version`.
- **PowerShell bloquea `npm.ps1`**: usa `npm.cmd run dev` o abre PowerShell
  como usuario y ejecuta `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.
- **“Cannot find module”**: ejecuta `npm install` en la carpeta que contiene
  `package.json`.
- **Puerto 3000 ocupado**: ejecuta `npm run dev -- -p 3001` y abre
  `http://localhost:3001`; actualiza `NEXT_PUBLIC_APP_URL` si necesitas enlaces.
- **Variables Supabase faltantes**: revisa `.env.local`, reinicia el servidor y
  no uses espacios alrededor del `=`.
- **“Invalid API key” de Supabase**: copia de nuevo URL y clave desde Project
  Settings > API; no intercambies la anon key con la service role key.
- **“permission denied” o error RLS**: verifica que el usuario tenga membership,
  que RLS y las políticas de `002` estén aplicadas, y que la consulta filtre la
  organización correcta.
- **“relation/table does not exist”**: ejecuta las migraciones en orden y revisa
  que el SQL Editor haya terminado sin errores.
- **Error de migración**: no sigas ejecutando archivos posteriores; copia el
  mensaje exacto, revisa si ya existe parcialmente el objeto y usa un proyecto
  limpio para repetir el orden.
- **El registro no crea organización**: comprueba `SUPABASE_SERVICE_ROLE_KEY`,
  que el usuario se haya creado en Auth y que `organizations`, `forms` y
  `organization_members` existan.
- **Página en blanco**: mira la consola de PowerShell y la consola del navegador;
  reinicia después de editar `.env.local` y comprueba `/api/health`.
- **Error de OpenAI**: deja `DEMO_MODE=true` y elimina temporalmente
  `OPENAI_API_KEY`; el análisis mock no necesita red ni API key.
- **Error de Resend**: el flujo actual es simulación; no bloquea la demo. No
  esperes envío real aunque rellenes las variables.
- **Error de n8n**: deja `N8N_ENABLED=false`. La app debe registrar `skipped` y
  continuar; para activarlo sigue `docs/n8n-integration.md`.
- **Build falla por env faltante**: la compilación no requiere credenciales,
  pero las rutas de datos sí. Copia `.env.example`, configura Supabase y vuelve
  a ejecutar `npm run build`.
- **Quieres volver al modo demo**: establece `DEMO_MODE=true`,
  `N8N_ENABLED=false`, quita `OPENAI_API_KEY` y reinicia `npm run dev`.

## 9. Checklist de validación manual

- [ ] La landing carga.
- [ ] El registro funciona.
- [ ] El login funciona.
- [ ] El dashboard está protegido.
- [ ] El formulario público recibe un lead.
- [ ] El lead aparece en el dashboard.
- [ ] El análisis demo funciona.
- [ ] Aparecen score y prioridad.
- [ ] Aparece la notificación interna.
- [ ] El email simulado queda registrado.
- [ ] n8n desactivado no rompe nada.
- [ ] `npm run lint` termina correctamente.
- [ ] `npm run typecheck` termina correctamente.
- [ ] `npm run test` termina correctamente.
- [ ] `npm run build` termina correctamente.
