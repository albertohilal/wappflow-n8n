require("dotenv").config();
const express = require("express");
const path = require("path");
const { spawn } = require("child_process");
const mysql = require("mysql2");
const cors = require("cors");
const fs = require("fs");
const client = require("./whatsapp"); // 👈 Cliente WhatsApp centralizado

const app = express();
const PORT = process.env.PORT || 3010;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Pool de conexiones
const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// ▶ Ejecutar envío masivo
app.post("/api/enviar-mensajes", (req, res) => {
  const scriptPath = path.join(__dirname, "scripts", "enviar_mensajes.js");
  const proceso = spawn("node", [scriptPath]);

  proceso.stdout.on("data", (data) => console.log(`📤 stdout: ${data}`));
  proceso.stderr.on("data", (data) => console.error(`⚠️ stderr: ${data}`));
  proceso.on("close", (code) => console.log(`🚪 Proceso finalizado con código ${code}`));

  res.json({ mensaje: "✅ Envío iniciado en segundo plano." });
});

// ▶ Cargar campañas
app.get("/api/campanias", (req, res) => {
  const sql = `SELECT id, nombre FROM ll_campanias_whatsapp ORDER BY fecha_creacion DESC`;
  db.query(sql, (err, resultados) => {
    if (err) {
      console.error("❌ Error al consultar campañas:", err);
      return res.status(500).json({ error: "Error al consultar campañas" });
    }
    res.json(resultados);
  });
});

// ▶ Obtener mensajes con filtros y paginación
app.get("/api/mensajes", (req, res) => {
  const { campania, estado, limit = 10, page = 1 } = req.query;
  const offset = (page - 1) * limit;

  let sql = `
    SELECT SQL_CALC_FOUND_ROWS id, telefono, nombre_destino, mensaje_final, estado, fecha_envio
    FROM ll_envios_whatsapp
    WHERE 1 = 1
  `;
  const valores = [];

  if (campania) {
    sql += " AND campania_id = ?";
    valores.push(campania);
  }

  if (estado) {
    sql += " AND estado = ?";
    valores.push(estado);
  }

  sql += " ORDER BY fecha_envio DESC LIMIT ? OFFSET ?";
  valores.push(parseInt(limit), parseInt(offset));

  db.query(sql, valores, (err, resultados) => {
    if (err) {
      console.error("❌ Error al consultar envíos:", err);
      return res.status(500).json({ error: "Error al consultar mensajes" });
    }

    db.query("SELECT FOUND_ROWS() AS total", (err2, rows) => {
      if (err2) {
        console.error("❌ Error al contar resultados:", err2);
        return res.status(500).json({ error: "Error al contar resultados" });
      }

      res.json({
        mensajes: resultados,
        total: rows[0].total,
        pagina: parseInt(page),
        por_pagina: parseInt(limit),
      });
    });
  });
});

// ▶ Reenviar mensaje individual usando sesión activa
app.post("/api/reenviar/:id", (req, res) => {
  const id = req.params.id;

  const sql = `
    SELECT telefono, mensaje_final
    FROM ll_envios_whatsapp
    WHERE id = ?
  `;

  db.query(sql, [id], async (err, resultados) => {
    if (err || resultados.length === 0) {
      console.error("❌ Error al buscar mensaje:", err);
      return res.status(500).json({ error: "No se pudo reenviar el mensaje." });
    }

    const { telefono, mensaje_final } = resultados[0];
    const chatId = `${telefono}@c.us`;

    try {
      await client.sendMessage(chatId, mensaje_final);
      console.log(`✅ Mensaje reenviado desde cliente activo a ${telefono}`);
      res.json({ mensaje: `Mensaje reenviado a ${telefono}` });
    } catch (error) {
      console.error("❌ Error al reenviar desde cliente activo:", error);
      res.status(500).json({ error: "Falló el reenvío." });
    }
  });
});

// ▶ Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
