const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Obtener listado de campañas
router.get('/listado', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM ll_campanias_whatsapp ORDER BY fecha_creacion DESC'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar campañas' });
  }
});

// Alias: /api/campanias → para usar en frontend
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM ll_campanias_whatsapp ORDER BY fecha_creacion DESC'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar campañas' });
  }
});

module.exports = router;
