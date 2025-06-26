// index.js
require("dotenv").config(); // Cargar variables de entorno

const express = require("express");
const path = require("path");
const { spawn } = require("child_process");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Crear pool de conexiones MySQL
const db = mysql.createPool({
  connectionLimit: 10, // Número máximo de conexiones simultáneas
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

});

// Ruta para ejecutar enviar_mensajes.js
app.post("/api/enviar-mensajes", (req, res) => {
  const scriptPath = path.join(__dirname, "scripts", "enviar_mensajes.js");

  const proceso = spawn("node", [scriptPath]);

  proceso.stdout.on("data", (data) => {
    console.log(`📤 stdout: ${data}`);
  });

  proceso.stderr.on("data", (data) => {
    console.error(`⚠️ stderr: ${data}`);
  });

  proceso.on("close", (code) => {
    console.log(`🚪 Proceso finalizado con código ${code}`);
  });

  res.json({ mensaje: "✅ Envío iniciado en segundo plano." });
});

// Ruta para obtener últimos mensajes de ll_envios_whatsapp
app.get("/api/mensajes", (req, res) => {
  const sql = `
    SELECT id, telefono, nombre_destino, mensaje_final, estado, fecha_envio
    FROM ll_envios_whatsapp
    ORDER BY fecha_envio DESC
    LIMIT 50
  `;
  db.query(sql, (err, resultados) => {
    if (err) {
      console.error("❌ Error al consultar ll_envios_whatsapp:", err);
      return res.status(500).json({ error: "Error al consultar los envíos" });
    }
    res.json(resultados);
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
