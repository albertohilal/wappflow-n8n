require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const port = 3010;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT
};

// Obtener rubros habilitados para búsqueda
app.get('/api/rubros', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT id, nombre FROM ll_rubros WHERE busqueda = 1');
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener rubros:', err);
    res.status(500).send('Error al obtener rubros');
  }
});

// Obtener campañas existentes
app.get('/api/campanias', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT id, nombre FROM ll_campanias_whatsapp');
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener campañas:', err);
    res.status(500).send('Error al obtener campañas');
  }
});

// Lanzar campaña
app.post('/api/lanzar-campania', async (req, res) => {
  const { campaniaId, rubroId, cantidad } = req.body;

  if (!campaniaId || !rubroId || !cantidad) {
    return res.status(400).send('Faltan datos requeridos');
  }

  try {
    const conn = await mysql.createConnection(dbConfig);

    // Buscar lugares que no hayan sido contactados aún en esta campaña
    const [lugares] = await conn.execute(`
      SELECT l.id, l.nombre, l.telefono_wapp
      FROM ll_lugares l
      WHERE l.rubro_id = ?
        AND l.telefono_wapp IS NOT NULL 
        AND l.telefono_wapp != ''
        AND NOT EXISTS (
          SELECT 1 FROM ll_envios_whatsapp e
          WHERE e.telefono = l.telefono_wapp AND e.campania_id = ?
        )
      LIMIT ?
    `, [rubroId, campaniaId, cantidad]);

    if (lugares.length === 0) {
      return res.status(200).json({ mensaje: 'No hay registros pendientes para esta combinación.' });
    }

    // Plantilla base de mensaje
    const mensajeBase = 'Mensaje generado automáticamente'; // Se puede personalizar

    // Insertar registros en ll_envios_whatsapp
    const insertQuery = `
      INSERT INTO ll_envios_whatsapp (campania_id, telefono, nombre_destino, mensaje_final, estado, fecha_envio)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const now = new Date();

    for (const lugar of lugares) {
      await conn.execute(insertQuery, [
        campaniaId,
        lugar.telefono_wapp || null,
        lugar.nombre || null,
        mensajeBase,
        'pendiente',
        now
      ]);
    }

    res.status(200).json({ mensaje: 'Campaña generada correctamente.' });

  } catch (err) {
    console.error('Error al lanzar campaña:', err);
    res.status(500).send('Error interno del servidor');
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`✔️ Servidor corriendo en http://localhost:${port}`);
});
