# n8n Community autoalojado en Oracle Cloud

Esta guía describe una instalación mínima con Docker. Oracle Always Free puede
tener disponibilidad variable y límites de recursos; el software n8n es gratuito,
pero la infraestructura, el dominio, el correo, Telegram y Google pueden tener
condiciones o costes propios.

## 1. Red y servidor

1. Crea una instancia Ubuntu LTS pequeña en Oracle Cloud.
2. Asigna una IP pública y configura un dominio o subdominio para n8n.
3. En la lista de seguridad abre únicamente SSH desde tu IP y 80/443 desde
   Internet. No expongas directamente el puerto 5678.
4. Usa una clave SSH, desactiva el acceso por contraseña y aplica actualizaciones
   de seguridad.

## 2. Docker

Instala Docker Engine y Docker Compose desde la documentación oficial de Docker.
Clona o copia el directorio `n8n`, crea `.env` a partir de `.env.example` y
genera un `N8N_ENCRYPTION_KEY` aleatorio largo. No lo guardes en Git.

```bash
docker compose -f docker-compose.yml.example up -d
docker compose ps
docker compose logs -f n8n
```

## 3. HTTPS con Caddy

Instala Caddy en el host y configura un reverse proxy para
`https://n8n.example.com` hacia `127.0.0.1:5678`. Caddy obtiene y renueva el
certificado automáticamente. Mantén `N8N_PROTOCOL=https`, `WEBHOOK_URL` y
`N8N_EDITOR_BASE_URL` con la URL HTTPS final.

## 4. Seguridad y credenciales

- Activa la autenticación de usuario de n8n y MFA cuando esté disponible.
- Mantén el puerto n8n ligado a localhost.
- Usa credenciales nativas de n8n para Telegram y Google Sheets.
- Define la variable `LEADPILOT_WEBHOOK_SECRET` en n8n y el mismo valor como
  `N8N_WEBHOOK_SECRET` en LeadPilot.
- Rota secretos si aparecen en logs o repositorios.

## 5. Backup y actualización

Haz backups periódicos del volumen `n8n_data` y prueba su restauración. Antes de
actualizar, guarda una copia de los workflows y revisa las notas de la versión.

```bash
docker compose pull
docker compose up -d
docker compose logs --tail=100 n8n
```

No actives workflows de LeadPilot hasta probar firma, idempotencia, Telegram y
Sheets en un entorno de prueba.
