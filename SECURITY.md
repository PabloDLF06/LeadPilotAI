# Seguridad

LeadPilot AI es un proyecto de portfolio. No envíes secretos ni datos
personales en issues o pull requests.

## Reportar una vulnerabilidad

Para una vulnerabilidad real, contacta de forma privada al mantenedor del
repositorio. Incluye impacto, pasos mínimos para reproducirla y una propuesta
de mitigación, sin adjuntar credenciales ni datos de clientes.

## Si se filtra una credencial

1. Revoca o rota inmediatamente la clave en su proveedor.
2. Comprueba logs y accesos afectados.
3. Elimina el secreto del árbol de trabajo y del historial siguiendo un plan
   revisado; no borres silenciosamente archivos compartidos.
4. Documenta el incidente y confirma la rotación antes de volver a publicar.

Las claves server-only nunca deben usar el prefijo `NEXT_PUBLIC_`.
