// routes/campanias.js
const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Ruta para guardar una campaña (POST /api/campanias/campania)
router.post('/campania', async (req, res) => {
  try {
    const { nombre, mensaje } = req.body;

    if (!nombre || !mensaje) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const [result] = await db.execute(
      'INSERT INTO ll_campanias_whatsapp (nombre, mensaje, fecha_creacion) VALUES (?, ?, NOW())',
      [nombre, mensaje]
    );

    res.json({ success: true, insertId: result.insertId });
  } catch (error) {
    console.error('❌ Error al guardar campaña:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Ruta para listar campañas (GET /api/campanias/listado)
router.get('/listado', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM ll_campanias_whatsapp ORDER BY fecha_creacion DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('❌ Error al listar campañas:', error);
    res.status(500).json({ error: 'Error al consultar campañas' });
  }
});

module.exports = router;
