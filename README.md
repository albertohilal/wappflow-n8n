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

wappflow-n8n/
├── scripts/
│ ├── enviar_mensajes.js # Script principal para envío
│ └── generar_envios.js # (Opcional) Generador de campañas
├── routes/
│ └── envios.js # (Opcional) Rutas API para dashboard u otro cliente
├── public/
│ └── envios.html # Interfaz web (en construcción)
├── .env # Variables de entorno (no versionado)
├── .gitignore
├── package.json
└── README.md

markdown
Copiar
Editar

## 🛠️ Requisitos

- Node.js 18+ recomendado.
- MySQL/MariaDB activo.
- Un navegador instalado (usa Puppeteer/Chromium).
- Cuenta de WhatsApp válida.

## ⚙️ Configuración

1. **Instalar dependencias**:
   ```bash
   npm install
Crear archivo .env con el siguiente formato:

ini
Copiar
Editar
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=nombre_base
DB_PORT=3306
Ejecutar el script de envío:

bash
Copiar
Editar
node scripts/enviar_mensajes.js
Al iniciarse, se abrirá el navegador con el código QR. Escanealo con tu celular.

📄 Estructura de la tabla ll_envios_whatsapp
sql
Copiar
Editar
CREATE TABLE ll_envios_whatsapp (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campania_id INT,
  telefono VARCHAR(20),
  nombre_destinatario VARCHAR(100),
  mensaje_final TEXT,
  estado VARCHAR(20),
  fecha_envio DATETIME
);
📌 Consideraciones
Este sistema usa whatsapp-web.js, que simula WhatsApp Web. Puede requerir escaneo frecuente del QR si no se conserva la sesión.

No se recomienda para envío masivo comercial sin consentimiento (puede infringir Términos de Servicio de WhatsApp).

Se puede integrar con n8n como módulo de envío por WhatsApp.

🧪 Estado del proyecto
✔️ Envío funcional verificado
✔️ Guardado de estado enviado / error
🔜 Panel de control web
🔜 Integración con n8n

📬 Contacto
Proyecto desarrollado por albertohilal.
Consultas y soporte: desarrolloydisenio.com.ar

