// routes/envios.js
const express = require('express');
const router = express.Router();
const db = require('../db/connection');

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
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
