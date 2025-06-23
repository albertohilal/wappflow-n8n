# WappFlow-n8n

Envío automatizado de mensajes por WhatsApp mediante `whatsapp-web.js`, con integración a base de datos MySQL y control mediante scripts Node.js. Desarrollado como parte del ecosistema de automatización con n8n.

## 🚀 Funcionalidad

- Escanea un código QR para iniciar sesión en WhatsApp Web.
- Extrae destinatarios desde una tabla MySQL (`ll_envios_whatsapp`).
- Envía mensajes personalizados a cada número.
- Actualiza el estado del envío en la base de datos (`enviado`, `error`).
- Scripts separados para envío y generación de campañas.
- Preparado para integrarse a workflows de `n8n`.

## 📦 Estructura del proyecto

