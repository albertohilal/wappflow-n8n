Excelente. A continuación te doy el contenido actualizado del `README.md` incluyendo la nueva funcionalidad del formulario `lanzar_campania.html`:

---

```markdown
# wappflow-n8n

Este proyecto permite gestionar campañas automatizadas de WhatsApp usando Node.js y MySQL, con posibilidad de extender flujos mediante n8n.

## Estructura del proyecto

```

├── index.js                # Servidor principal Express
├── lanzar\_campania.html   # Formulario web para lanzar campañas
├── scripts/
│   ├── generar.js          # Genera los registros para envío
│   ├── campanias.js        # Consulta campañas disponibles
│   └── envios.js           # Inserta los envíos a la base de datos
├── public/
│   └── ...                 # Archivos estáticos servidos
└── .env                    # Variables de entorno (no versionado)

````

## Base de datos

Se usa MySQL con las siguientes tablas principales:

- `ll_campanias_whatsapp`: campañas creadas manualmente.
- `ll_envios_whatsapp`: envíos programados o realizados.

## Lanzar campaña desde formulario web

Archivo: `lanzar_campania.html`

Permite seleccionar una campaña, un rubro y la cantidad de destinatarios a incluir en una nueva tanda de envíos.

Pasos del flujo:

1. El usuario selecciona los datos desde el formulario.
2. Se realiza una petición POST a `/api/lanzar-campania`.
3. El servidor ejecuta `generar.js` que:
   - Filtra los destinatarios según campaña y rubro.
   - Genera el mensaje automático.
   - Inserta en la tabla `ll_envios_whatsapp` con estado `pendiente`.

## Ejecución local

1. Instalar dependencias:

   ```bash
   npm install
````

2. Crear archivo `.env` con las credenciales MySQL:

   ```
   DB_HOST=localhost
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_DATABASE=iunaorg_dyd
   DB_PORT=3306
   ```

3. Correr el servidor:

   ```bash
   node index.js
   ```

4. Abrir el formulario en el navegador:

   ```
   http://localhost:3010/lanzar_campania.html
   ```

