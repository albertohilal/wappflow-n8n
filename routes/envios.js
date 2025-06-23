// routes/envios.js
const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// POST /api/envios/manual → guarda un envío personalizado
router.post('/manual', async (req, res) => {
  try {
    const { campania_id, nombre_destino, telefono, mensaje_final } = req.body;

    if (!campania_id || !nombre_destino || !telefono || !mensaje_final) {
      return res.status(400).json({ error: 'Faltan campos' });
    }

    const [result] = await db.execute(
      'INSERT INTO ll_envios_whatsapp (campania_id, telefono, nombre_destino, mensaje_final, estado) VALUES (?, ?, ?, ?, ?)',
      [campania_id, telefono, nombre_destino, mensaje_final, 'pendiente']
    );

    res.json({ success: true, insertId: result.insertId });
  } catch (error) {
    console.error('❌ Error al guardar envío manual:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/envios/listado → devuelve todos los envíos guardados
router.get('/listado', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM ll_envios_whatsapp ORDER BY id DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('❌ Error al listar envíos:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
