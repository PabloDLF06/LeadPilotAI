# Contribuir a LeadPilot AI

Gracias por contribuir. Mantén los cambios pequeños, revisables y alineados
con la especificación del producto.

## Desarrollo local

1. Usa Node.js 20+ y npm 10+.
2. Ejecuta `npm ci` y copia `.env.example` a `.env.local`.
3. Para desarrollo sin servicios externos, usa `DEMO_MODE=true`.
4. Ejecuta `npm run doctor` antes de abrir una incidencia.

## Cambios y commits

- Trabaja en una rama descriptiva basada en `main`.
- Usa mensajes de commit imperativos y con prefijo (`feat:`, `fix:`, `docs:`,
  `chore:`).
- No mezcles refactors no relacionados con una funcionalidad.
- Actualiza la documentación y los tests cuando cambie el comportamiento.

## Calidad y secretos

Antes de abrir un pull request ejecuta `npm run lint`, `npm run typecheck`,
`npm run test` y `npm run build`. Nunca subas `.env.local`, tokens, claves,
backups, exports de Supabase o workflows de n8n con credenciales. Si detectas
una filtración, sigue [SECURITY.md](SECURITY.md) y revoca la credencial.
