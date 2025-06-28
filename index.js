require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const port = 3010;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT
};

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

app.post('/api/campanias/campania', async (req, res) => {
  const { nombre, mensaje } = req.body;

  if (!nombre || !mensaje) {
    return res.status(400).json({ success: false, error: 'Faltan datos requeridos' });
  }

  try {
    const conn = await mysql.createConnection(dbConfig);
    const [result] = await conn.execute(
      'INSERT INTO ll_campanias_whatsapp (nombre, mensaje) VALUES (?, ?)',
      [nombre, mensaje]
    );
    res.json({ success: true, insertId: result.insertId });
  } catch (err) {
    console.error('Error al guardar campaña:', err);
    res.status(500).json({ success: false, error: 'Error al guardar campaña' });
  }
});

// NUEVA RUTA para ejecutar generar_envios.js desde el frontend
app.post('/api/ejecutar-envios', (req, res) => {
  const { campania_id, cantidad, rubro_id } = req.body;

  if (!campania_id || !cantidad || !rubro_id) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos' });
  }

  const scriptPath = path.join(__dirname, 'scripts/generar_envios.js');
  const comando = `node ${scriptPath} ${campania_id} ${cantidad} ${rubro_id}`;

  exec(comando, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al ejecutar el script: ${error.message}`);
      return res.status(500).json({ error: 'Fallo al ejecutar el script' });
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }

    console.log(`stdout: ${stdout}`);
    res.json({ mensaje: 'Envío iniciado correctamente', salida: stdout });
  });
});

app.listen(port, () => {
  console.log(`✔️ Servidor corriendo en http://localhost:${port}`);
});
